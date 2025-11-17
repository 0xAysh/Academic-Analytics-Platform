'use strict';

const pool = require('../../config/database');

/**
 * Get transcript by user ID with nested terms and courses
 * @param {number} userId - User ID
 * @returns {Promise<object|null>} Transcript object with terms and courses
 */
async function getTranscriptByUserId(userId) {
  const client = await pool.connect();
  
  try {
    // Get transcript
    const transcriptQuery = 'SELECT * FROM transcripts WHERE user_id = $1';
    const transcriptResult = await client.query(transcriptQuery, [userId]);
    
    if (transcriptResult.rows.length === 0) {
      return null;
    }
    
    const transcript = transcriptResult.rows[0];
    
    // Get terms for this transcript
    const termsQuery = `
      SELECT * FROM terms 
      WHERE transcript_id = $1 
      ORDER BY term_code ASC
    `;
    const termsResult = await client.query(termsQuery, [transcript.id]);
    const terms = termsResult.rows;
    
    // Get courses for each term
    for (const term of terms) {
      const coursesQuery = `
        SELECT * FROM courses 
        WHERE term_id = $1 
        ORDER BY id ASC
      `;
      const coursesResult = await client.query(coursesQuery, [term.id]);
      term.courses = coursesResult.rows;
    }
    
    // Calculate cumulative stats
    const completedTerms = terms.filter(t => !t.is_planned);
    let totalPoints = 0;
    let totalEarnedCredits = 0;
    let totalCredits = 0;
    let totalPlannedCredits = 0;
    
    completedTerms.forEach(term => {
      totalPoints += parseFloat(term.points || 0);
      totalEarnedCredits += parseFloat(term.earned_credits || 0);
      totalCredits += parseFloat(term.credits || 0);
    });
    
    terms.forEach(term => {
      if (term.is_planned) {
        totalPlannedCredits += parseFloat(term.credits || 0);
      }
    });
    
    const overallGPA = totalEarnedCredits > 0 ? totalPoints / totalEarnedCredits : 0;
    
    return {
      id: transcript.id,
      user_id: transcript.user_id,
      studentInfo: {
        degree: transcript.degree || '',
        institution: 'SF State'
      },
      terms: terms.map(term => ({
        id: term.id,
        term: term.term_code,
        termName: term.term_name,
        termGPA: parseFloat(term.term_gpa || 0),
        credits: parseFloat(term.credits || 0),
        earnedCredits: parseFloat(term.earned_credits || 0),
        gpaUnits: parseFloat(term.earned_credits || 0), // Same as earnedCredits
        points: parseFloat(term.points || 0),
        isPlanned: term.is_planned || false,
        courses: term.courses.map(course => ({
          id: course.id,
          code: course.code || '',
          name: course.name || '',
          units: parseFloat(course.units || 0),
          earnedUnits: parseFloat(course.earned_units || 0),
          grade: course.grade || '',
          points: parseFloat(course.points || 0)
        }))
      })),
      cumulative: {
        overallGPA: parseFloat(overallGPA.toFixed(2)),
        combinedGPA: parseFloat(overallGPA.toFixed(2)), // Same as overallGPA
        totalCredits: parseFloat(totalCredits.toFixed(2)),
        totalEarnedCredits: parseFloat(totalEarnedCredits.toFixed(2)),
        totalGPAUnits: parseFloat(totalEarnedCredits.toFixed(2)), // Same as totalEarnedCredits
        totalPoints: parseFloat(totalPoints.toFixed(2)),
        totalPlannedCredits: parseFloat(totalPlannedCredits.toFixed(2))
      }
    };
  } finally {
    client.release();
  }
}

/**
 * Save or update transcript with nested terms and courses
 * @param {number} userId - User ID
 * @param {object} transcriptData - Transcript data object
 * @returns {Promise<object>} Saved transcript
 */
async function saveTranscript(userId, transcriptData) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Check if transcript exists
    const existingQuery = 'SELECT id FROM transcripts WHERE user_id = $1';
    const existingResult = await client.query(existingQuery, [userId]);
    
    let transcriptId;
    
    if (existingResult.rows.length > 0) {
      // Update existing transcript
      transcriptId = existingResult.rows[0].id;
      const updateQuery = 'UPDATE transcripts SET degree = $1 WHERE id = $2';
      await client.query(updateQuery, [transcriptData.studentInfo?.degree || '', transcriptId]);
      
      // Delete existing terms and courses (cascade will handle courses)
      await client.query('DELETE FROM terms WHERE transcript_id = $1', [transcriptId]);
    } else {
      // Create new transcript
      const insertQuery = 'INSERT INTO transcripts (user_id, degree) VALUES ($1, $2) RETURNING id';
      const insertResult = await client.query(insertQuery, [userId, transcriptData.studentInfo?.degree || '']);
      transcriptId = insertResult.rows[0].id;
    }
    
    // Insert terms and courses
    const terms = transcriptData.terms || [];
    for (const term of terms) {
      const termQuery = `
        INSERT INTO terms (transcript_id, term_code, term_name, term_gpa, credits, earned_credits, points, is_planned)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `;
      const termResult = await client.query(termQuery, [
        transcriptId,
        term.term || term.termCode || '',
        term.termName || '',
        term.termGPA || 0,
        term.credits || 0,
        term.earnedCredits || 0,
        term.points || 0,
        term.isPlanned || false
      ]);
      
      const termId = termResult.rows[0].id;
      
      // Insert courses for this term
      const courses = term.courses || [];
      for (const course of courses) {
        const courseQuery = `
          INSERT INTO courses (term_id, code, name, units, earned_units, grade, points)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        await client.query(courseQuery, [
          termId,
          course.code || '',
          course.name || '',
          course.units || 0,
          course.earnedUnits || 0,
          course.grade || '',
          course.points || 0
        ]);
      }
    }
    
    await client.query('COMMIT');
    
    // Return the saved transcript
    return await getTranscriptByUserId(userId);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  getTranscriptByUserId,
  saveTranscript
};

