'use strict';

import { $ } from '../utils/dom.js';
import { getTranscriptData } from '../core/data.js';
import { renderGpaTrend } from '../charts/gpaTrend.js';
import { renderGradePie } from '../charts/gradePie.js';
import { renderCreditsBar } from '../charts/creditsBar.js';
import { gradeToGPA, getGradeColor } from '../utils/grades.js';
import { debounce } from '../utils/dom.js';

// Chart instances for resize handling
let gpaChartInstance = null;
let creditsChartInstance = null;
let gradeChartInstance = null;

/**
 * Load dashboard metrics into the UI
 */
function loadDashboardMetrics() {
  const transcriptData = getTranscriptData();
  if (!transcriptData) return;

  const gpaEl = $('#overallGPA');
  if (gpaEl) {
    gpaEl.textContent = transcriptData.cumulative.overallGPA.toFixed(2);
  }

  const completedTerms = transcriptData.getCompletedTerms();
  const currentGpaEl = $('#currentSemesterGPA');
  if (completedTerms.length > 0 && currentGpaEl) {
    const currentSemester = completedTerms[completedTerms.length - 1];
    currentGpaEl.textContent = currentSemester.termGPA.toFixed(2);
  }

  const creditsEl = $('#creditsCompleted');
  if (creditsEl) {
    creditsEl.textContent = transcriptData.cumulative.totalEarnedCredits;
  }

  const coursesEl = $('#currentSemesterCourses');
  if (coursesEl) {
    const planned = transcriptData.terms.find(t => t.isPlanned);
    const completed = completedTerms[completedTerms.length - 1];
    coursesEl.textContent = planned ? planned.courses.length : (completed ? completed.courses.length : 0);
  }
}

/**
 * Render course breakdown table
 */
function renderCourseBreakdown() {
  const tbody = $('#courseTableBody');
  if (!tbody) return;

  const transcriptData = getTranscriptData();
  if (!transcriptData) return;

  tbody.innerHTML = '';

  const completedTerms = transcriptData.getCompletedTerms();
  const courses = [];
  completedTerms.forEach(term => {
    term.courses.forEach(course => {
      courses.push({ ...course, term: term.termName });
    });
  });

  const termOrder = completedTerms.map(t => t.termName).reverse();
  courses.sort((a, b) => {
    const termDiff = termOrder.indexOf(b.term) - termOrder.indexOf(a.term);
    if (termDiff !== 0) return termDiff;
    return a.code.localeCompare(b.code);
  });

  courses.forEach(course => {
    const tr = document.createElement('tr');
    const gpa = gradeToGPA(course.grade).toFixed(1);
    const gradeLetter = (course.grade || 'F').trim()[0];
    const color = getGradeColor(gradeLetter);
    tr.innerHTML = `
      <td>${course.code}</td>
      <td>${course.name}</td>
      <td>${course.units}</td>
      <td><span class="grade-pill" style="color:${color}; border:1px solid ${color}; background: transparent;">${course.grade}</span></td>
      <td>${gpa}</td>
    `;
    tbody.appendChild(tr);
  });
}

/**
 * Render strength summary (strong and improvement areas)
 */
function renderStrengthSummary() {
  const strongContainer = $('#strongAreas');
  const improvementContainer = $('#improvementAreas');
  if (!strongContainer || !improvementContainer) return;

  const transcriptData = getTranscriptData();
  if (!transcriptData) return;

  strongContainer.innerHTML = '';
  improvementContainer.innerHTML = '';

  const bySubject = {};
  const terms = transcriptData.getCompletedTerms();

  terms.forEach(term => {
    term.courses.forEach(course => {
      const subject = course.code.split(' ')[0];
      bySubject[subject] = bySubject[subject] || { points: 0, units: 0 };
      bySubject[subject].points += course.points;
      bySubject[subject].units += course.units;
    });
  });

  const performance = Object.keys(bySubject).map(subject => ({
    subject: subject,
    gpa: bySubject[subject].points / bySubject[subject].units,
    percentage: ((bySubject[subject].points / bySubject[subject].units) / 4) * 100
  })).sort((a, b) => b.percentage - a.percentage);

  const strong = performance.filter(p => p.percentage >= 85);
  const weak = performance.filter(p => p.percentage < 80);

  function renderItem(container, item, type) {
    const div = document.createElement('div');
    div.className = `strength-item strength-item--${type}`;
    div.innerHTML = `
      <div class="strength-item__icon strength-item__icon--${type === 'strong' ? 'check' : 'warning'}">
        ${type === 'strong' ? '✓' : '!'}
      </div>
      <div class="strength-item__info">
        <div class="strength-item__title">${item.subject}</div>
        <div class="strength-item__performance">Performance: ${Math.round(item.percentage)}%</div>
      </div>
    `;
    container.appendChild(div);
  }

  if (strong.length > 0) {
    strong.forEach(item => renderItem(strongContainer, item, 'strong'));
  } else {
    strongContainer.innerHTML = '<p style="color: var(--text-secondary);">No strong areas identified</p>';
  }

  if (weak.length > 0) {
    weak.forEach(item => renderItem(improvementContainer, item, 'improvement'));
  } else {
    improvementContainer.innerHTML = '<p style="color: var(--text-secondary);">No areas need improvement</p>';
  }
}

/**
 * Render all charts
 */
function renderCharts() {
  const transcriptData = getTranscriptData();
  if (!transcriptData || typeof transcriptData.getCompletedTerms !== 'function') return;

  const terms = transcriptData.getCompletedTerms();
  const filteredTerms = terms.filter(t => t.termGPA > 0 && !t.isPlanned);

  // GPA Trend Chart
  const gpaCanvas = $('#gpaChart');
  if (gpaCanvas) {
    if (gpaChartInstance) {
      gpaChartInstance.destroy();
    }
    gpaChartInstance = renderGpaTrend(gpaCanvas, filteredTerms);
  }

  // Credits Bar Chart
  const creditsCanvas = $('#creditsChart');
  if (creditsCanvas) {
    if (creditsChartInstance) {
      creditsChartInstance.destroy();
    }
    creditsChartInstance = renderCreditsBar(creditsCanvas, terms);
  }

  // Grade Distribution Pie Chart
  const gradeCanvas = $('#gradeChart');
  if (gradeCanvas) {
    const dist = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    terms.forEach(t => {
      t.courses && t.courses.forEach(c => {
        const k = c.grade && c.grade[0];
        if (dist[k] !== undefined) dist[k]++;
      });
    });
    if (gradeChartInstance) {
      gradeChartInstance.destroy();
    }
    gradeChartInstance = renderGradePie(gradeCanvas, dist);
  }
}

/**
 * Handle window resize - redraw charts
 */
const handleResize = debounce(() => {
  renderCharts();
}, 250);

/**
 * Initialize dashboard page
 */
export function initDashboard() {
  // Load metrics
  loadDashboardMetrics();

  // Render charts after a short delay to ensure DOM is ready
  setTimeout(() => {
    renderCharts();
    renderCourseBreakdown();
    renderStrengthSummary();
  }, 100);

  // Handle window resize
  window.addEventListener('resize', handleResize);
}
