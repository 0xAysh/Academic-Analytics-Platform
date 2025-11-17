'use strict';

import { $, $$, el } from '../utils/dom.js';
import { getTranscriptData } from '../core/data.js';
import { updateTranscript } from '../api/transcripts.js';

/**
 * Initialize edit transcript page
 */
export function initEditTranscript() {
  const transcriptData = getTranscriptData();
  const noDataMessage = $('#noDataMessage');
  const transcriptEditor = $('#transcriptEditor');

  // Check if transcript data exists
  if (!transcriptData || !transcriptData.terms || transcriptData.terms.length === 0) {
    noDataMessage.style.display = 'block';
    transcriptEditor.style.display = 'none';
    return;
  }

  noDataMessage.style.display = 'none';
  transcriptEditor.style.display = 'block';

  // Initialize form with current data
  populateStudentInfo(transcriptData);
  populateTerms(transcriptData);

  // Event listeners
  $('#addTermBtn').addEventListener('click', () => addNewTerm());
  $('#saveBtn').addEventListener('click', () => saveTranscript());
  $('#cancelBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      window.location.href = '/html/index.html';
    }
  });
}

/**
 * Populate student information form
 */
function populateStudentInfo(data) {
  const studentInfo = data.studentInfo || {};
  $('#studentDegree').value = studentInfo.degree || '';
}

/**
 * Populate terms section
 */
function populateTerms(data) {
  const container = $('#termsContainer');
  container.innerHTML = '';

  data.terms.forEach((term, termIndex) => {
    const termCard = createTermCard(term, termIndex);
    container.appendChild(termCard);
  });
}

/**
 * Create a term card with all its courses (accordion style)
 */
function createTermCard(term, termIndex) {
  const card = el('div', { 
    className: 'term-item',
    'data-term-index': termIndex,
    'data-open': 'false'
  });
  
  // Clickable header showing term summary
  const headerBtn = el('button', {
    className: 'term-item__btn',
    type: 'button',
    'aria-expanded': 'false',
    'aria-controls': `term-content-${termIndex}`
  });
  
  const headerContent = el('div', {
    className: 'term-item__header-content',
    style: 'display: flex; justify-content: space-between; align-items: center; width: 100%;'
  });
  
  const termSummary = el('div', { className: 'term-item__summary' });
  const termName = term.termName || `Term ${termIndex + 1}`;
  const termGPA = (term.termGPA || 0).toFixed(2);
  const termCredits = term.credits || 0;
  const courseCount = term.courses ? term.courses.length : 0;
  
  termSummary.innerHTML = `
    <div style="font-weight: 600; font-size: 1.1rem; margin-bottom: 4px;">${termName}</div>
    <div style="color: var(--color-text-muted); font-size: 0.9rem;">
      GPA: ${termGPA} | Credits: ${termCredits} | Courses: ${courseCount}
    </div>
  `;
  
  const headerRight = el('div', {
    style: 'display: flex; align-items: center; gap: 0.75rem;'
  });
  
  const deleteBtn = el('button', {
    className: 'btn btn--secondary',
    textContent: 'Delete',
    style: 'padding: 6px 12px; font-size: 0.85rem;',
    onclick: (e) => {
      e.stopPropagation();
      deleteTerm(termIndex);
    }
  });
  
  const chevron = el('span', {
    className: 'term-item__chevron',
    textContent: '▼',
    style: 'font-size: 0.75rem; transition: transform 0.2s;'
  });
  
  headerRight.appendChild(deleteBtn);
  headerRight.appendChild(chevron);
  headerContent.appendChild(termSummary);
  headerContent.appendChild(headerRight);
  headerBtn.appendChild(headerContent);
  
  // Expandable content (hidden by default)
  const content = el('div', {
    id: `term-content-${termIndex}`,
    className: 'term-item__content',
    style: 'overflow: hidden; height: 0; opacity: 0; transition: height 0.3s ease, opacity 0.2s ease;'
  });
  
  const contentInner = el('div', { className: 'term-item__content-inner' });
  
  // Term fields
  const termFields = el('div', { 
    className: 'grid grid--2cols',
    style: 'margin-bottom: 1.5rem;'
  });
  
  termFields.appendChild(createField('Term Code', `termCode_${termIndex}`, term.term || '', 'e.g., SP2024'));
  termFields.appendChild(createField('Term Name', `termName_${termIndex}`, term.termName || '', 'e.g., Spring 2024'));
  termFields.appendChild(createField('Term GPA', `termGPA_${termIndex}`, term.termGPA || '0', '0.00 - 4.00', 'number', '0', '4', '0.01'));
  termFields.appendChild(createField('Credits', `termCredits_${termIndex}`, term.credits || '0', '', 'number', '0', '999', '0.5'));
  termFields.appendChild(createField('Earned Credits', `termEarnedCredits_${termIndex}`, term.earnedCredits || '0', '', 'number', '0', '999', '0.5'));
  termFields.appendChild(createField('Points', `termPoints_${termIndex}`, term.points || '0', '', 'number', '0', '999', '0.1'));
  
  // Preserve isPlanned flag if it exists
  if (term.isPlanned) {
    const plannedInput = el('input', {
      type: 'hidden',
      id: `termIsPlanned_${termIndex}`,
      value: 'true'
    });
    termFields.appendChild(plannedInput);
  }
  
  contentInner.appendChild(termFields);
  
  // Courses section
  const coursesHeader = el('div', {
    style: 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; margin-top: 1.5rem;'
  });
  coursesHeader.appendChild(el('h4', { 
    textContent: 'Courses',
    style: 'margin: 0; font-size: 1.1rem; font-weight: 600;'
  }));
  coursesHeader.appendChild(el('button', {
    className: 'btn btn--primary',
    textContent: 'Add Course',
    onclick: () => addCourseToTerm(termIndex)
  }));
  
  contentInner.appendChild(coursesHeader);
  
  const coursesContainer = el('div', { 
    id: `courses_${termIndex}`,
    className: 'grid',
    style: 'gap: 1rem;'
  });
  
  if (term.courses && term.courses.length > 0) {
    term.courses.forEach((course, courseIndex) => {
      coursesContainer.appendChild(createCourseCard(termIndex, courseIndex, course));
    });
  }
  
  contentInner.appendChild(coursesContainer);
  content.appendChild(contentInner);
  
  // Toggle functionality
  headerBtn.addEventListener('click', () => toggleTerm(termIndex, card, headerBtn, content, chevron));
  
  card.appendChild(headerBtn);
  card.appendChild(content);
  
  return card;
}

/**
 * Toggle term accordion
 */
function toggleTerm(termIndex, card, btn, content, chevron) {
  const isOpen = card.getAttribute('data-open') === 'true';
  
  if (isOpen) {
    // Collapse
    card.setAttribute('data-open', 'false');
    btn.setAttribute('aria-expanded', 'false');
    content.style.height = '0';
    content.style.opacity = '0';
    chevron.style.transform = 'rotate(0deg)';
  } else {
    // Expand
    card.setAttribute('data-open', 'true');
    btn.setAttribute('aria-expanded', 'true');
    const height = content.scrollHeight;
    content.style.height = height + 'px';
    content.style.opacity = '1';
    chevron.style.transform = 'rotate(180deg)';
    
    // Set to auto after transition
    setTimeout(() => {
      if (card.getAttribute('data-open') === 'true') {
        content.style.height = 'auto';
      }
    }, 300);
  }
}

/**
 * Create a form field
 */
function createField(label, id, value, placeholder = '', type = 'text', min = '', max = '', step = '') {
  const group = el('div', { className: 'form__group' });
  group.appendChild(el('label', {
    className: 'form__label',
    textContent: label,
    htmlFor: id
  }));
  
  const input = el('input', {
    type: type,
    id: id,
    className: 'form__input',
    value: value,
    placeholder: placeholder
  });
  
  if (min !== '') input.min = min;
  if (max !== '') input.max = max;
  if (step !== '') input.step = step;
  
  group.appendChild(input);
  return group;
}

/**
 * Create a course card
 */
function createCourseCard(termIndex, courseIndex, course) {
  const card = el('div', {
    className: 'card card--tight',
    style: 'background: #f9fafb;'
  });
  
  const header = el('div', {
    style: 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;'
  });
  header.appendChild(el('h5', {
    textContent: `Course ${courseIndex + 1}`,
    style: 'margin: 0; font-size: 0.95rem; font-weight: 600;'
  }));
  header.appendChild(el('button', {
    className: 'btn btn--secondary',
    textContent: 'Delete',
    style: 'padding: 4px 8px; font-size: 0.85rem;',
    onclick: () => deleteCourse(termIndex, courseIndex)
  }));
  
  const body = el('div', { className: 'grid grid--2cols', style: 'gap: 0.75rem;' });
  
  const courseId = `course_${termIndex}_${courseIndex}`;
  body.appendChild(createField('Code', `${courseId}_code`, course.code || '', 'e.g., CSC 101'));
  body.appendChild(createField('Name', `${courseId}_name`, course.name || '', 'Course Name'));
  body.appendChild(createField('Units', `${courseId}_units`, course.units || '0', '', 'number', '0', '10', '0.5'));
  body.appendChild(createField('Earned Units', `${courseId}_earnedUnits`, course.earnedUnits || '0', '', 'number', '0', '10', '0.5'));
  body.appendChild(createField('Grade', `${courseId}_grade`, course.grade || '', 'e.g., A, B+, C-'));
  body.appendChild(createField('Points', `${courseId}_points`, course.points || '0', '', 'number', '0', '20', '0.1'));
  
  card.appendChild(header);
  card.appendChild(body);
  
  return card;
}

/**
 * Add a new term
 */
function addNewTerm() {
  const transcriptData = getTranscriptData();
  if (!transcriptData) return;
  
  const newTerm = {
    term: '',
    termName: '',
    termGPA: 0,
    credits: 0,
    earnedCredits: 0,
    gpaUnits: 0,
    points: 0,
    honor: null,
    isPlanned: false,
    courses: []
  };
  
  // Add to data structure
  transcriptData.terms.push(newTerm);
  
  // Re-render to update UI
  populateTerms(transcriptData);
  
  // Scroll to new term and expand it
  const container = $('#termsContainer');
  const newTermIndex = container.children.length - 1;
  if (newTermIndex >= 0) {
    const newTermCard = container.children[newTermIndex];
    newTermCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Auto-expand the new term
    setTimeout(() => {
      const btn = newTermCard.querySelector('.term-item__btn');
      const content = newTermCard.querySelector('.term-item__content');
      const chevron = newTermCard.querySelector('.term-item__chevron');
      if (btn && content && chevron) {
        toggleTerm(newTermIndex, newTermCard, btn, content, chevron);
      }
    }, 100);
  }
}

/**
 * Add a course to a term
 */
function addCourseToTerm(termIndex) {
  const transcriptData = getTranscriptData();
  if (!transcriptData || !transcriptData.terms[termIndex]) return;
  
  const newCourse = {
    code: '',
    name: '',
    units: 0,
    earnedUnits: 0,
    grade: '',
    points: 0
  };
  
  // Add to data structure
  transcriptData.terms[termIndex].courses.push(newCourse);
  
  // Re-render to update UI
  populateTerms(transcriptData);
  
  // Expand the term and scroll to new course
  const container = $('#termsContainer');
  const termCard = container.children[termIndex];
  if (termCard) {
    // Auto-expand the term if it's not already open
    const isOpen = termCard.getAttribute('data-open') === 'true';
    if (!isOpen) {
      setTimeout(() => {
        const btn = termCard.querySelector('.term-item__btn');
        const content = termCard.querySelector('.term-item__content');
        const chevron = termCard.querySelector('.term-item__chevron');
        if (btn && content && chevron) {
          toggleTerm(termIndex, termCard, btn, content, chevron);
        }
      }, 100);
    }
    
    // Scroll to new course
    setTimeout(() => {
      const coursesContainer = $(`#courses_${termIndex}`);
      if (coursesContainer) {
        const newCourseIndex = coursesContainer.children.length - 1;
        if (newCourseIndex >= 0) {
          coursesContainer.children[newCourseIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    }, 400);
  }
}

/**
 * Delete a term
 */
function deleteTerm(termIndex) {
  if (!confirm('Are you sure you want to delete this term? All courses in this term will also be deleted.')) {
    return;
  }
  
  // Update data first
  const transcriptData = getTranscriptData();
  if (transcriptData && transcriptData.terms[termIndex]) {
    transcriptData.terms.splice(termIndex, 1);
    // Re-render to update indices
    populateTerms(transcriptData);
  }
}

/**
 * Delete a course from a term
 */
function deleteCourse(termIndex, courseIndex) {
  if (!confirm('Are you sure you want to delete this course?')) {
    return;
  }
  
  // Update data first
  const transcriptData = getTranscriptData();
  if (transcriptData && transcriptData.terms[termIndex] && transcriptData.terms[termIndex].courses[courseIndex]) {
    transcriptData.terms[termIndex].courses.splice(courseIndex, 1);
    // Re-render to update indices
    populateTerms(transcriptData);
  }
}

/**
 * Collect form data and update transcriptData
 */
function collectFormData() {
  const transcriptData = getTranscriptData();
  if (!transcriptData) return null;

  // Update student info
  transcriptData.studentInfo = {
    name: transcriptData.studentInfo?.name || '',
    studentId: transcriptData.studentInfo?.studentId || '',
    degree: $('#studentDegree').value.trim(),
    institution: 'SF State' // Always SF State for now
  };

  // Collect terms
  const terms = [];
  const termCards = $$('#termsContainer > .term-item');
  
  termCards.forEach((card, termIndex) => {
    const isPlannedInput = $(`#termIsPlanned_${termIndex}`);
    const term = {
      term: $(`#termCode_${termIndex}`)?.value.trim() || '',
      termName: $(`#termName_${termIndex}`)?.value.trim() || '',
      termGPA: parseFloat($(`#termGPA_${termIndex}`)?.value || 0),
      credits: parseFloat($(`#termCredits_${termIndex}`)?.value || 0),
      earnedCredits: parseFloat($(`#termEarnedCredits_${termIndex}`)?.value || 0),
      gpaUnits: parseFloat($(`#termEarnedCredits_${termIndex}`)?.value || 0), // Use earnedCredits as gpaUnits
      points: parseFloat($(`#termPoints_${termIndex}`)?.value || 0),
      honor: null,
      isPlanned: isPlannedInput ? isPlannedInput.value === 'true' : false,
      courses: []
    };

    // Collect courses for this term
    const courseCards = $$(`#courses_${termIndex} > .card`);
    courseCards.forEach((courseCard, courseIndex) => {
      const courseId = `course_${termIndex}_${courseIndex}`;
      const course = {
        code: $(`#${courseId}_code`)?.value.trim() || '',
        name: $(`#${courseId}_name`)?.value.trim() || '',
        units: parseFloat($(`#${courseId}_units`)?.value || 0),
        earnedUnits: parseFloat($(`#${courseId}_earnedUnits`)?.value || 0),
        grade: $(`#${courseId}_grade`)?.value.trim() || '',
        points: parseFloat($(`#${courseId}_points`)?.value || 0)
      };
      term.courses.push(course);
    });

    terms.push(term);
  });

  transcriptData.terms = terms;

  // Recalculate cumulative data
  recalculateCumulative(transcriptData);

  return transcriptData;
}

/**
 * Recalculate cumulative GPA and credits
 */
function recalculateCumulative(data) {
  const completedTerms = data.terms.filter(t => !t.isPlanned);
  
  let totalPoints = 0;
  let totalGPAUnits = 0;
  let totalCredits = 0;
  let totalEarnedCredits = 0;
  
  completedTerms.forEach(term => {
    totalPoints += term.points || 0;
    totalGPAUnits += term.gpaUnits || term.earnedCredits || 0;
    totalCredits += term.credits || 0;
    totalEarnedCredits += term.earnedCredits || 0;
  });
  
  const overallGPA = totalGPAUnits > 0 ? totalPoints / totalGPAUnits : 0;
  
  data.cumulative = {
    overallGPA: parseFloat(overallGPA.toFixed(2)),
    combinedGPA: parseFloat(overallGPA.toFixed(2)),
    totalCredits: totalCredits,
    totalEarnedCredits: totalEarnedCredits,
    totalGPAUnits: totalGPAUnits,
    totalPoints: totalPoints,
    totalPlannedCredits: data.cumulative?.totalPlannedCredits || 0
  };
}

/**
 * Save transcript data
 */
async function saveTranscript() {
  const updatedData = collectFormData();
  if (!updatedData) {
    alert('Error: Could not collect form data.');
    return;
  }

  // Validate data
  if (!validateData(updatedData)) {
    return;
  }

  // Show saving indicator
  const saveBtn = $('#saveBtn');
  const originalText = saveBtn.textContent;
  saveBtn.textContent = 'Saving...';
  saveBtn.disabled = true;

  try {
    // Save via API
    const savedTranscript = await updateTranscript(updatedData);
    
    // Update global transcriptData
    if (window.transcriptData && savedTranscript) {
      Object.assign(window.transcriptData, savedTranscript);
    }

    alert('Transcript data saved successfully!');
    window.location.href = '/html/index.html';
  } catch (error) {
    alert('Error saving transcript: ' + error.message);
    saveBtn.textContent = originalText;
    saveBtn.disabled = false;
  }
}

/**
 * Validate transcript data
 */
function validateData(data) {
  // Check terms
  if (!data.terms || data.terms.length === 0) {
    alert('Please add at least one term.');
    return false;
  }

  // Validate each term
  for (let i = 0; i < data.terms.length; i++) {
    const term = data.terms[i];
    if (!term.termName.trim()) {
      alert(`Term ${i + 1}: Please enter a term name.`);
      return false;
    }
    if (term.termGPA < 0 || term.termGPA > 4) {
      alert(`Term ${i + 1}: GPA must be between 0 and 4.`);
      return false;
    }
  }

  return true;
}

