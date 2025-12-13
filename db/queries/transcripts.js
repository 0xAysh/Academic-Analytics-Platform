'use strict';

const pool = require('../pool');

function truncateString(str, maxLength) {
  if (typeof str !== 'string') {
    return '';
  }
  return str.substring(0, maxLength);
}

/**
 * @param {number} userId
 * @returns {Promise<object|null>}
 */
async function getTranscriptByUserId(userId) {
  const client = await pool.connect();
  
  try {
    const transcriptQuery = 'SELECT * FROM transcripts WHERE user_id = $1';
    const transcriptResult = await client.query(transcriptQuery, [userId]);
    
    if (transcriptResult.rows.length === 0) {
      return null;
    }
    
    const transcript = transcriptResult.rows[0];
    
    const termsQuery = `
      SELECT * FROM terms 
      WHERE transcript_id = $1 
      ORDER BY term_code ASC
    `;
    const termsResult = await client.query(termsQuery, [transcript.id]);
    const terms = termsResult.rows;
    
    for (const term of terms) {
      const coursesQuery = `
        SELECT * FROM courses 
        WHERE term_id = $1 
        ORDER BY id ASC
      `;
      const coursesResult = await client.query(coursesQuery, [term.id]);
      term.courses = coursesResult.rows;
    }
    
    const activeTerms = terms.filter(t => {
      if (t.is_planned && (!t.courses || t.courses.length === 0)) {
        return false;
      }
      return t.courses && t.courses.length > 0;
    });
    
    let totalPoints = 0;
    let totalEarnedCredits = 0;
    let totalCredits = 0;
    let totalPlannedCredits = 0;
    
    activeTerms.forEach(term => {
      totalPoints += parseFloat(term.points || 0);
      totalEarnedCredits += parseFloat(term.earned_credits || 0);
      totalCredits += parseFloat(term.credits || 0);
    });
    
    terms.forEach(term => {
      if (term.is_planned && (!term.courses || term.courses.length === 0)) {
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
        gpaUnits: parseFloat(term.earned_credits || 0),
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
        combinedGPA: parseFloat(overallGPA.toFixed(2)),
        totalCredits: parseFloat(totalCredits.toFixed(2)),
        totalEarnedCredits: parseFloat(totalEarnedCredits.toFixed(2)),
        totalGPAUnits: parseFloat(totalEarnedCredits.toFixed(2)),
        totalPoints: parseFloat(totalPoints.toFixed(2)),
        totalPlannedCredits: parseFloat(totalPlannedCredits.toFixed(2))
      }
    };
  } finally {
    client.release();
  }
}

/**
 * @param {number} userId
 * @param {object} transcriptData
 * @returns {Promise<object>}
 */
async function saveTranscript(userId, transcriptData) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const existingQuery = 'SELECT id FROM transcripts WHERE user_id = $1';
    const existingResult = await client.query(existingQuery, [userId]);
    
    let transcriptId;
    
    if (existingResult.rows.length > 0) {
      transcriptId = existingResult.rows[0].id;
      const updateQuery = 'UPDATE transcripts SET degree = $1 WHERE id = $2';
      const degree = truncateString(transcriptData.studentInfo?.degree || '', 255);
      await client.query(updateQuery, [degree, transcriptId]);
      
      await client.query('DELETE FROM terms WHERE transcript_id = $1', [transcriptId]);
    } else {
      const insertQuery = 'INSERT INTO transcripts (user_id, degree) VALUES ($1, $2) RETURNING id';
      const degree = truncateString(transcriptData.studentInfo?.degree || '', 255);
      const insertResult = await client.query(insertQuery, [userId, degree]);
      transcriptId = insertResult.rows[0].id;
    }
    
    const terms = transcriptData.terms || [];
    
    for (const term of terms) {
      const termQuery = `
        INSERT INTO terms (transcript_id, term_code, term_name, term_gpa, credits, earned_credits, points, is_planned)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `;
      const termResult = await client.query(termQuery, [
        transcriptId,
        truncateString(term.term || term.termCode || '', 50),
        truncateString(term.termName || '', 255),
        parseFloat(term.termGPA) || 0,
        parseFloat(term.credits) || 0,
        parseFloat(term.earnedCredits) || 0,
        parseFloat(term.points) || 0,
        Boolean(term.isPlanned)
      ]);
      
      const termId = termResult.rows[0].id;
      
      const courses = term.courses || [];
      
      for (const course of courses) {
        const courseQuery = `
          INSERT INTO courses (term_id, code, name, units, earned_units, grade, points)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        await client.query(courseQuery, [
          termId,
          truncateString(course.code || '', 50),
          truncateString(course.name || '', 255),
          parseFloat(course.units) || 0,
          parseFloat(course.earnedUnits) || 0,
          truncateString(course.grade || '', 10),
          parseFloat(course.points) || 0
        ]);
      }
    }
    
    await client.query('COMMIT');
    
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
