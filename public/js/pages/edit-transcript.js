'use strict';

import { $, $$, el } from '../utils/dom.js';
import { getTranscriptData } from '../core/data.js';
import { updateTranscript } from '../api.js';
import { gradeToGPA } from '../utils/grades.js';
import { showSuccess, showError } from '../utils/notifications.js';
import { showConfirm } from '../utils/confirm.js';
import { sanitizeTranscriptData } from '../utils/sanitizer.js';
import { sortTermsChronologically } from '../utils/terms.js';

/**
 * @returns {void}
 */
export function initEditTranscript() {
  const transcriptData = getTranscriptData();
  const noDataMessage = $('#noDataMessage');
  const transcriptEditor = $('#transcriptEditor');

  if (!transcriptData || !transcriptData.terms || transcriptData.terms.length === 0) {
    noDataMessage.classList.remove('hidden');
    transcriptEditor.classList.add('hidden');
    return;
  }

  noDataMessage.classList.add('hidden');
  transcriptEditor.classList.remove('hidden');

  populateStudentInfo(transcriptData);
  populateTerms(transcriptData);
  
  setTimeout(() => {
    transcriptData.terms.forEach((term, index) => {
      recalculateTermTotals(index);
    });
  }, 100);

  $('#addTermBtn').addEventListener('click', () => addNewTerm());
  $('#saveBtn').addEventListener('click', () => saveTranscript());
  $('#cancelBtn').addEventListener('click', async () => {
    const confirmed = await showConfirm(
      'Are you sure you want to cancel? All unsaved changes will be lost.',
      'Cancel Changes'
    );
    if (confirmed) {
      window.location.href = '/html/index.html';
    }
  });
}

function populateStudentInfo(data) {
  const studentInfo = data.studentInfo || {};
  $('#studentDegree').value = studentInfo.degree || '';
}

function populateTerms(data) {
  const container = $('#termsContainer');
  container.innerHTML = '';

  const sortedTerms = sortTermsChronologically(data.terms || []);

  sortedTerms.forEach((term, termIndex) => {
    const termCard = createTermCard(term, termIndex);
    container.appendChild(termCard);
  });
}

function createTermCard(term, termIndex) {
  const card = el('div', { 
    className: 'term-item',
    'data-term-index': termIndex,
    'data-open': 'false'
  });
  
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
  const termNameField = createField('Term Name', `termName_${termIndex}`, term.termName || '', 'e.g., Spring 2024');
  termFields.appendChild(termNameField);
  
  const termNameInput = $(`#termName_${termIndex}`);
  if (termNameInput) {
    termNameInput.addEventListener('input', () => {
      const termCards = $$('#termsContainer > .term-item');
      if (termCards[termIndex]) {
        const termCard = termCards[termIndex];
        const summary = termCard.querySelector('.term-item__summary');
        if (summary) {
          const termName = termNameInput.value || `Term ${termIndex + 1}`;
          const termGPA = $(`#termGPA_${termIndex}`)?.value || '0.00';
          const termCredits = $(`#termCredits_${termIndex}`)?.value || '0.00';
          const courseCount = $$(`#courses_${termIndex} > .card`).length;
          summary.innerHTML = `
            <div style="font-weight: 600; font-size: 1.1rem; margin-bottom: 4px;">${termName}</div>
            <div style="color: var(--color-text-muted); font-size: 0.9rem;">
              GPA: ${termGPA} | Credits: ${termCredits} | Courses: ${courseCount}
            </div>
          `;
        }
      }
    });
  }
  
  termFields.appendChild(createField('Term GPA', `termGPA_${termIndex}`, (term.termGPA || 0).toFixed(2), 'Auto-calculated', 'number', '0', '4', '0.01', true));
  termFields.appendChild(createField('Credits', `termCredits_${termIndex}`, (term.credits || 0).toFixed(2), 'Auto-calculated', 'number', '0', '999', '0.5', true));
  termFields.appendChild(createField('Earned Credits', `termEarnedCredits_${termIndex}`, (term.earnedCredits || 0).toFixed(2), 'Auto-calculated', 'number', '0', '999', '0.5', true));
  termFields.appendChild(createField('Points', `termPoints_${termIndex}`, (term.points || 0).toFixed(2), 'Auto-calculated', 'number', '0', '999', '0.1', true));
  
  const plannedGroup = el('div', { className: 'form__group' });
  const plannedLabel = el('label', {
    className: 'form__label',
    style: 'display: flex; align-items: center; gap: 0.5rem; cursor: pointer;'
  });
  const plannedCheckbox = el('input', {
    type: 'checkbox',
    id: `termIsPlanned_${termIndex}`,
    checked: term.isPlanned || false,
    onchange: () => recalculateTermTotals(termIndex)
  });
  plannedLabel.appendChild(plannedCheckbox);
  plannedLabel.appendChild(el('span', { textContent: 'Planned Term (not yet completed)' }));
  plannedGroup.appendChild(plannedLabel);
  termFields.appendChild(plannedGroup);
  
  contentInner.appendChild(termFields);
  
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
  
  headerBtn.addEventListener('click', () => toggleTerm(termIndex, card, headerBtn, content, chevron));
  
  card.appendChild(headerBtn);
  card.appendChild(content);
  
  return card;
}

function toggleTerm(termIndex, card, btn, content, chevron) {
  const isOpen = card.getAttribute('data-open') === 'true';
  
  if (isOpen) {
    card.setAttribute('data-open', 'false');
    btn.setAttribute('aria-expanded', 'false');
    content.style.height = '0';
    content.style.opacity = '0';
    chevron.style.transform = 'rotate(0deg)';
  } else {
    card.setAttribute('data-open', 'true');
    btn.setAttribute('aria-expanded', 'true');
    const height = content.scrollHeight;
    content.style.height = height + 'px';
    content.style.opacity = '1';
    chevron.style.transform = 'rotate(180deg)';
    
    setTimeout(() => {
      if (card.getAttribute('data-open') === 'true') {
        content.style.height = 'auto';
      }
    }, 300);
  }
}

function createField(label, id, value, placeholder = '', type = 'text', min = '', max = '', step = '', readOnly = false) {
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
    placeholder: placeholder,
    readOnly: readOnly,
    style: readOnly ? 'background-color: #f3f4f6; cursor: not-allowed;' : ''
  });
  
  if (min !== '') input.min = min;
  if (max !== '') input.max = max;
  if (step !== '') input.step = step;
  
  group.appendChild(input);
  return group;
}

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
  body.appendChild(createField('Points', `${courseId}_points`, (course.points || 0).toFixed(2), 'Auto-calculated', 'number', '0', '20', '0.1', true));
  
  const codeInput = $(`#${courseId}_code`);
  const nameInput = $(`#${courseId}_name`);
  const unitsInput = $(`#${courseId}_units`);
  const earnedUnitsInput = $(`#${courseId}_earnedUnits`);
  const gradeInput = $(`#${courseId}_grade`);
  const pointsInput = $(`#${courseId}_points`);
  
  const updateCoursePoints = () => {
    const grade = gradeInput.value.trim();
    const earnedUnits = parseFloat(earnedUnitsInput.value) || 0;
    
    if (grade && earnedUnits > 0) {
      const gpaValue = gradeToGPA(grade);
      const points = gpaValue * earnedUnits;
      pointsInput.value = points.toFixed(2);
    } else {
      pointsInput.value = '0.00';
    }
    
    recalculateTermTotals(termIndex);
  };
  
  if (gradeInput) gradeInput.addEventListener('input', updateCoursePoints);
  if (earnedUnitsInput) earnedUnitsInput.addEventListener('input', updateCoursePoints);
  if (unitsInput) unitsInput.addEventListener('input', () => recalculateTermTotals(termIndex));
  
  card.appendChild(header);
  card.appendChild(body);
  
  return card;
}

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
  
  transcriptData.terms.push(newTerm);
  
  populateTerms(transcriptData);
  
  const container = $('#termsContainer');
  const newTermIndex = container.children.length - 1;
  if (newTermIndex >= 0) {
    const newTermCard = container.children[newTermIndex];
    newTermCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
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
  
  transcriptData.terms[termIndex].courses.push(newCourse);
  
  populateTerms(transcriptData);
  
  setTimeout(() => recalculateTermTotals(termIndex), 100);
  
  const container = $('#termsContainer');
  const termCard = container.children[termIndex];
  if (termCard) {
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

async function deleteTerm(termIndex) {
  const confirmed = await showConfirm(
    'Are you sure you want to delete this term? All courses in this term will also be deleted.',
    'Delete Term'
  );
  if (!confirmed) {
    return;
  }
  
  const transcriptData = getTranscriptData();
  if (transcriptData && transcriptData.terms[termIndex]) {
    transcriptData.terms.splice(termIndex, 1);
    populateTerms(transcriptData);
    setTimeout(() => {
      transcriptData.terms.forEach((term, index) => {
        recalculateTermTotals(index);
      });
    }, 100);
  }
}

async function deleteCourse(termIndex, courseIndex) {
  const confirmed = await showConfirm(
    'Are you sure you want to delete this course?',
    'Delete Course'
  );
  if (!confirmed) {
    return;
  }
  
  const transcriptData = getTranscriptData();
  if (transcriptData && transcriptData.terms[termIndex] && transcriptData.terms[termIndex].courses[courseIndex]) {
    transcriptData.terms[termIndex].courses.splice(courseIndex, 1);
    populateTerms(transcriptData);
    setTimeout(() => recalculateTermTotals(termIndex), 100);
  }
}

function recalculateTermTotals(termIndex) {
  const transcriptData = getTranscriptData();
  if (!transcriptData || !transcriptData.terms[termIndex]) return;
  
  const coursesContainer = $(`#courses_${termIndex}`);
  if (!coursesContainer) return;
  
  const courseCards = $$(`#courses_${termIndex} > .card`);
  let totalCredits = 0;
  let totalEarnedCredits = 0;
  let totalPoints = 0;
  
  courseCards.forEach((courseCard, courseIndex) => {
    const courseId = `course_${termIndex}_${courseIndex}`;
    const units = parseFloat($(`#${courseId}_units`)?.value || 0);
    const earnedUnits = parseFloat($(`#${courseId}_earnedUnits`)?.value || 0);
    const grade = $(`#${courseId}_grade`)?.value.trim();
    
    let points = 0;
    if (grade && earnedUnits > 0) {
      const gpaValue = gradeToGPA(grade);
      points = gpaValue * earnedUnits;
      const pointsInput = $(`#${courseId}_points`);
      if (pointsInput) {
        pointsInput.value = points.toFixed(2);
      }
    }
    
    totalCredits += units;
    totalEarnedCredits += earnedUnits;
    totalPoints += points;
  });
  
  const termCreditsInput = $(`#termCredits_${termIndex}`);
  const termEarnedCreditsInput = $(`#termEarnedCredits_${termIndex}`);
  const termPointsInput = $(`#termPoints_${termIndex}`);
  const termGPAInput = $(`#termGPA_${termIndex}`);
  
  if (termCreditsInput) termCreditsInput.value = totalCredits.toFixed(2);
  if (termEarnedCreditsInput) termEarnedCreditsInput.value = totalEarnedCredits.toFixed(2);
  if (termPointsInput) termPointsInput.value = totalPoints.toFixed(2);
  
  const termGPA = totalEarnedCredits > 0 ? totalPoints / totalEarnedCredits : 0;
  if (termGPAInput) termGPAInput.value = termGPA.toFixed(2);
  
  const termCards = $$('#termsContainer > .term-item');
  if (termCards[termIndex]) {
    const termCard = termCards[termIndex];
    const summary = termCard.querySelector('.term-item__summary');
    if (summary) {
      const termName = $(`#termName_${termIndex}`)?.value || `Term ${termIndex + 1}`;
      const courseCount = courseCards.length;
      summary.innerHTML = `
        <div style="font-weight: 600; font-size: 1.1rem; margin-bottom: 4px;">${termName}</div>
        <div style="color: var(--color-text-muted); font-size: 0.9rem;">
          GPA: ${termGPA.toFixed(2)} | Credits: ${totalCredits.toFixed(2)} | Courses: ${courseCount}
        </div>
      `;
    }
  }
}

function collectFormData() {
  const transcriptData = getTranscriptData();
  if (!transcriptData) return null;

  transcriptData.studentInfo = {
    name: transcriptData.studentInfo?.name || '',
    studentId: transcriptData.studentInfo?.studentId || '',
    degree: $('#studentDegree').value.trim(),
    institution: 'SF State'
  };

  const terms = [];
  const termCards = $$('#termsContainer > .term-item');
  
  termCards.forEach((card, termIndex) => {
    const isPlannedInput = $(`#termIsPlanned_${termIndex}`);
    recalculateTermTotals(termIndex);
    
    const term = {
      term: $(`#termCode_${termIndex}`)?.value.trim() || '',
      termName: $(`#termName_${termIndex}`)?.value.trim() || '',
      termGPA: parseFloat($(`#termGPA_${termIndex}`)?.value || 0),
      credits: parseFloat($(`#termCredits_${termIndex}`)?.value || 0),
      earnedCredits: parseFloat($(`#termEarnedCredits_${termIndex}`)?.value || 0),
      gpaUnits: parseFloat($(`#termEarnedCredits_${termIndex}`)?.value || 0),
      points: parseFloat($(`#termPoints_${termIndex}`)?.value || 0),
      honor: null,
      isPlanned: isPlannedInput ? isPlannedInput.checked : false,
      courses: []
    };

    const courseCards = $$(`#courses_${termIndex} > .card`);
    courseCards.forEach((courseCard, courseIndex) => {
      const courseId = `course_${termIndex}_${courseIndex}`;
      let points = parseFloat($(`#${courseId}_points`)?.value || 0);
      const grade = $(`#${courseId}_grade`)?.value.trim() || '';
      const earnedUnits = parseFloat($(`#${courseId}_earnedUnits`)?.value || 0);
      
      if (grade && earnedUnits > 0 && points === 0) {
        const gpaValue = gradeToGPA(grade);
        points = gpaValue * earnedUnits;
      }
      
      const course = {
        code: $(`#${courseId}_code`)?.value.trim() || '',
        name: $(`#${courseId}_name`)?.value.trim() || '',
        units: parseFloat($(`#${courseId}_units`)?.value || 0),
        earnedUnits: earnedUnits,
        grade: grade,
        points: parseFloat(points.toFixed(2))
      };
      term.courses.push(course);
    });

    terms.push(term);
  });

  const sortedTerms = sortTermsChronologically(terms);
  transcriptData.terms = sortedTerms;

  recalculateCumulative(transcriptData);

  return transcriptData;
}

function recalculateCumulative(data) {
  const activeTerms = data.terms.filter(t => {
    if (t.isPlanned && (!t.courses || t.courses.length === 0)) {
      return false;
    }
    return t.courses && t.courses.length > 0;
  });
  
  let totalPoints = 0;
  let totalGPAUnits = 0;
  let totalCredits = 0;
  let totalEarnedCredits = 0;
  let totalPlannedCredits = 0;
  
  activeTerms.forEach(term => {
    totalPoints += term.points || 0;
    totalGPAUnits += term.gpaUnits || term.earnedCredits || 0;
    totalCredits += term.credits || 0;
    totalEarnedCredits += term.earnedCredits || 0;
  });
  
  data.terms.forEach(term => {
    if (term.isPlanned && (!term.courses || term.courses.length === 0)) {
      totalPlannedCredits += term.credits || 0;
    }
  });
  
  const overallGPA = totalGPAUnits > 0 ? totalPoints / totalGPAUnits : 0;
  
  data.cumulative = {
    overallGPA: parseFloat(overallGPA.toFixed(2)),
    combinedGPA: parseFloat(overallGPA.toFixed(2)),
    totalCredits: parseFloat(totalCredits.toFixed(2)),
    totalEarnedCredits: parseFloat(totalEarnedCredits.toFixed(2)),
    totalGPAUnits: parseFloat(totalGPAUnits.toFixed(2)),
    totalPoints: parseFloat(totalPoints.toFixed(2)),
    totalPlannedCredits: parseFloat(totalPlannedCredits.toFixed(2))
  };
}

async function saveTranscript() {
  const updatedData = collectFormData();
  if (!updatedData) {
    showError('Error: Could not collect form data.');
    return;
  }

  if (!validateData(updatedData)) {
    return;
  }

  const saveBtn = $('#saveBtn');
  const originalText = saveBtn.textContent;
  saveBtn.textContent = 'Saving...';
  saveBtn.disabled = true;

  try {
    const sanitizedData = sanitizeTranscriptData(updatedData);
    
    const savedTranscript = await updateTranscript(sanitizedData);
    
    const transcriptData = getTranscriptData();
    if (transcriptData && savedTranscript) {
      Object.assign(transcriptData, savedTranscript);
    }

    showSuccess('Transcript data saved successfully!');
    setTimeout(() => {
      window.location.href = '/html/index.html';
    }, 1500);
  } catch (error) {
    showError('Error saving transcript: ' + error.message);
    saveBtn.textContent = originalText;
    saveBtn.disabled = false;
  }
}

function validateData(data) {
  if (!data.terms || data.terms.length === 0) {
    showError('Please add at least one term.');
    return false;
  }

  for (let i = 0; i < data.terms.length; i++) {
    const term = data.terms[i];
    if (!term.termName.trim()) {
      showError(`Term ${i + 1}: Please enter a term name.`);
      return false;
    }
    if (term.termGPA < 0 || term.termGPA > 4) {
      showError(`Term ${i + 1}: GPA must be between 0 and 4.`);
      return false;
    }
  }

  return true;
}

