(function() {
  if (!window.App) window.App = {};
  
  let plotChartInstance = null;
  
  function initPlotControls() {
    const xAxis = document.getElementById('xAxis');
    const yAxis = document.getElementById('yAxis');
    const pieData = document.getElementById('pieData');
    const chartTypes = document.querySelectorAll('input[name="chartType"]');
    const axesConfig = document.getElementById('axesConfig');
    const pieDataConfig = document.getElementById('pieDataConfig');
    const resetBtn = document.getElementById('resetBtn');
    const generateBtn = document.getElementById('generateBtn');
    
    // Get available options for axis selects
    function getAxisOptions(select) {
      return Array.from(select.options).map(opt => opt.value);
    }
    
    // Prevent X and Y axis from being the same
    function preventSameAxis(changedAxis, otherAxis) {
      if (changedAxis.value === otherAxis.value) {
        const options = getAxisOptions(otherAxis);
        const currentIndex = options.indexOf(otherAxis.value);
        const nextIndex = (currentIndex + 1) % options.length;
        otherAxis.value = options[nextIndex];
      }
    }
    
    // Handle chart type change
    function handleChartTypeChange() {
      const selectedType = Array.from(chartTypes).find(radio => radio.checked);
      if (!selectedType) return;
      
      if (selectedType.value === 'pie') {
        axesConfig.style.display = 'none';
        pieDataConfig.style.display = 'block';
      } else {
        axesConfig.style.display = 'block';
        pieDataConfig.style.display = 'none';
      }
      updateSummary();
    }
    
    // Update configuration summary when inputs change
    function updateSummary() {
      const selectedChartType = Array.from(chartTypes).find(radio => radio.checked);
      const chartType = selectedChartType ? selectedChartType.value : 'line';

      const itemXAxis = document.getElementById('summaryItemXAxis');
      const itemYAxis = document.getElementById('summaryItemYAxis');
      const itemPieData = document.getElementById('summaryItemPieData');
      const summaryXAxis = document.getElementById('summaryXAxis');
      const summaryYAxis = document.getElementById('summaryYAxis');
      const summaryPieData = document.getElementById('summaryPieData');
      const summaryChartTypes = document.getElementById('summaryChartTypes');

      if (chartType === 'pie') {
        const pieValue = pieData ? pieData.value : 'grades';
        if (itemXAxis) itemXAxis.style.display = 'none';
        if (itemYAxis) itemYAxis.style.display = 'none';
        if (itemPieData) itemPieData.style.display = 'block';
        if (summaryPieData) summaryPieData.textContent = pieValue;
        if (summaryChartTypes) summaryChartTypes.textContent = 'pie';
      } else {
        const xValue = xAxis ? xAxis.value : 'semester';
        const yValue = yAxis ? yAxis.value : 'gpa';
        if (itemXAxis) itemXAxis.style.display = 'block';
        if (itemYAxis) itemYAxis.style.display = 'block';
        if (itemPieData) itemPieData.style.display = 'none';
        if (summaryXAxis) summaryXAxis.textContent = xValue;
        if (summaryYAxis) summaryYAxis.textContent = yValue;
        if (summaryChartTypes) summaryChartTypes.textContent = chartType;
      }
    }
    
    // Add event listeners
    if (xAxis) {
      xAxis.addEventListener('change', function() {
        if (yAxis) preventSameAxis(xAxis, yAxis);
        updateSummary();
      });
    }
    
    if (yAxis) {
      yAxis.addEventListener('change', function() {
        if (xAxis) preventSameAxis(yAxis, xAxis);
        updateSummary();
      });
    }
    
    if (pieData) {
      pieData.addEventListener('change', updateSummary);
    }
    
    chartTypes.forEach(radio => {
      radio.addEventListener('change', function() {
        handleChartTypeChange();
      });
    });
    
    // Reset button
    if (resetBtn) {
      resetBtn.addEventListener('click', function() {
        // Reset to defaults
        if (xAxis) xAxis.value = 'semester';
        if (yAxis) yAxis.value = 'gpa';
        if (pieData) pieData.value = 'grades';
        
        // Reset chart type to line
        chartTypes.forEach(radio => {
          radio.checked = radio.value === 'line';
        });
        
        handleChartTypeChange();
        clearPreview();
      });
    }
    
    // Generate button
    if (generateBtn) {
      generateBtn.addEventListener('click', function() {
        generatePlot();
      });
    }
    
    // Initial setup
    handleChartTypeChange();
  }
  
  function getConfiguration() {
    const xAxis = document.getElementById('xAxis');
    const yAxis = document.getElementById('yAxis');
    const pieData = document.getElementById('pieData');
    const selectedChartType = Array.from(document.querySelectorAll('input[name="chartType"]')).find(radio => radio.checked);
    
    return {
      xAxis: xAxis ? xAxis.value : 'semester',
      yAxis: yAxis ? yAxis.value : 'gpa',
      pieData: pieData ? pieData.value : 'grades',
      chartTypes: selectedChartType ? [selectedChartType.value] : ['line']
    };
  }
  
  function generatePlot() {
    const config = getConfiguration();
    const canvas = document.getElementById('plotPreview');
    const placeholder = canvas ? canvas.parentElement.querySelector('.plot-controls__preview-placeholder') : null;
    
    if (!canvas || !config.chartTypes || config.chartTypes.length === 0) {
      console.warn('No chart type selected');
      return;
    }
    
    // Hide placeholder, show canvas
    if (placeholder) placeholder.style.display = 'none';
    canvas.style.display = 'block';
    
    // Destroy existing chart if any
    if (plotChartInstance) {
      plotChartInstance.destroy();
    }
    
    // Get data (using transcriptData if available)
    const data = getPlotData(config);
    
    // For now, use the first selected chart type
    const chartType = config.chartTypes[0];
    
    const ctx = canvas.getContext('2d');
    
    // Create chart based on type with consistent styling
    const chartConfig = {
      type: chartType === 'pie' ? 'pie' : chartType,
      data: data,
      options: getChartOptions(chartType, config, data)
    };
    
    // Add vertical guide plugin for line charts (matching existing charts)
    if (chartType === 'line') {
      const verticalGuidePlugin = {
        id: 'verticalGuide',
        afterDraw: (chart) => {
          const activeElements = chart.getActiveElements();
          if (activeElements.length > 0) {
            const ctx = chart.ctx;
            const x = activeElements[0].element.x;
            const yAxis = chart.scales.y;
            
            ctx.save();
            ctx.strokeStyle = '#e5e7eb';
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(x, yAxis.top);
            ctx.lineTo(x, yAxis.bottom);
            ctx.stroke();
            ctx.restore();
          }
        }
      };
      chartConfig.plugins = [verticalGuidePlugin];
    }
    
    plotChartInstance = new Chart(ctx, chartConfig);
  }
  
  function getPlotData(config) {
    if (typeof transcriptData === 'undefined' || !transcriptData.getCompletedTerms) {
      console.warn('Transcript data not available');
      return getFallbackData();
    }
    
    const terms = transcriptData.getCompletedTerms();
    if (!terms || terms.length === 0) {
      return getFallbackData();
    }
    
    const chartType = config.chartTypes[0];
    
    // Handle pie charts separately
    if (chartType === 'pie') {
      return getPieChartData(terms, config.pieData || 'grades');
    }
    
    // Handle different X-axis options
    let labels = [];
    let data = [];
    let label = '';
    
    if (config.xAxis === 'semester') {
      labels = terms.map(t => t.termName);
      data = getYAxisData(terms, config.yAxis);
      label = getYAxisLabel(config.yAxis);
    } else if (config.xAxis === 'subject') {
      // Group by subject (e.g., CSC, MATH, PHYS)
      const subjectMap = {};
      terms.forEach(term => {
        term.courses.forEach(course => {
          const subject = course.code.split(' ')[0];
          if (!subjectMap[subject]) {
            subjectMap[subject] = {
              courses: [],
              totalCredits: 0,
              totalPoints: 0,
              totalCourses: 0
            };
          }
          subjectMap[subject].courses.push(course);
          subjectMap[subject].totalCredits += course.units || 0;
          subjectMap[subject].totalPoints += course.points || 0;
          subjectMap[subject].totalCourses += 1;
        });
      });
      
      labels = Object.keys(subjectMap).sort();
      if (config.yAxis === 'gpa') {
        data = labels.map(subject => {
          const subj = subjectMap[subject];
          return subj.totalCredits > 0 ? subj.totalPoints / subj.totalCredits : 0;
        });
      } else if (config.yAxis === 'credits') {
        data = labels.map(subject => subjectMap[subject].totalCredits);
      } else if (config.yAxis === 'courses') {
        data = labels.map(subject => subjectMap[subject].totalCourses);
      }
      label = getYAxisLabel(config.yAxis);
    } else if (config.xAxis === 'year') {
      // Group by year
      const yearMap = {};
      terms.forEach(term => {
        const year = term.termName.split(' ')[1]; // Extract year from "Spring 2024"
        if (!yearMap[year]) yearMap[year] = [];
        yearMap[year].push(term);
      });
      labels = Object.keys(yearMap).sort();
      data = labels.map(year => {
        const yearTerms = yearMap[year];
        return getYAxisData(yearTerms, config.yAxis).reduce((a, b) => a + b, 0) / yearTerms.length;
      });
      label = getYAxisLabel(config.yAxis);
    } else {
      // Default to semester
      labels = terms.map(t => t.termName);
      data = getYAxisData(terms, config.yAxis);
      label = getYAxisLabel(config.yAxis);
    }
    
    // Filter out zero/invalid data (but keep GPA even if 0)
    const validData = labels.map((label, i) => ({ label, value: data[i] }))
      .filter(item => item.value > 0 || config.yAxis === 'gpa' || item.value === 0);
    labels = validData.map(item => item.label);
    data = validData.map(item => item.value);
    
    // Build dataset based on chart type
    let dataset = {
      label: label
    };
    
    // Line and bar charts use array format
    dataset.data = data;
    
    if (chartType === 'line') {
      Object.assign(dataset, {
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#3B82F6',
        pointBorderWidth: 2.5,
        pointRadius: 6,
        fill: false,
        tension: 0.3
      });
    } else if (chartType === 'bar') {
      Object.assign(dataset, {
        backgroundColor: '#3B82F6',
        borderRadius: 6
      });
    }
    
    return {
      labels: labels,
      datasets: [dataset]
    };
  }
  
  function getPieChartData(terms, pieDataOption) {
    if (pieDataOption === 'grades') {
      // Grade distribution
      const buckets = { A: 0, B: 0, C: 0, D: 0, F: 0 };
      terms.forEach(term => {
        term.courses.forEach(course => {
          if (course.grade) {
            const g = course.grade.trim()[0];
            if (buckets[g] !== undefined) buckets[g] += 1;
          }
        });
      });
      
      const labels = ['A', 'B', 'C', 'D', 'F'];
      const counts = labels.map(l => buckets[l] || 0);
      const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#B91C1C'];
      
      // Filter out zero counts
      const filtered = labels.map((l, i) => ({ label: l, count: counts[i], color: colors[i] }))
        .filter(item => item.count > 0);
      
      return {
        labels: filtered.map(f => f.label),
        datasets: [{
          data: filtered.map(f => f.count),
          backgroundColor: filtered.map(f => f.color),
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      };
    } else if (pieDataOption === 'semester') {
      // By semester credits
      const semesterData = terms.map(term => ({
        label: term.termName,
        value: term.credits || 0
      })).filter(item => item.value > 0);
      
      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
      
      return {
        labels: semesterData.map(d => d.label),
        datasets: [{
          data: semesterData.map(d => d.value),
          backgroundColor: semesterData.map((d, i) => colors[i % colors.length]),
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      };
    } else if (pieDataOption === 'subject') {
      // By subject (course count per subject)
      const subjectMap = {};
      terms.forEach(term => {
        term.courses.forEach(course => {
          const subject = course.code.split(' ')[0];
          subjectMap[subject] = (subjectMap[subject] || 0) + 1;
        });
      });
      
      const subjectData = Object.entries(subjectMap).map(([label, value]) => ({
        label,
        value
      })).sort((a, b) => b.value - a.value);
      
      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
      
      return {
        labels: subjectData.map(d => d.label),
        datasets: [{
          data: subjectData.map(d => d.value),
          backgroundColor: subjectData.map((d, i) => colors[i % colors.length]),
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      };
    }
    
    // Default to grades
    return getPieChartData(terms, 'grades');
  }
  
  function getYAxisData(terms, yAxis) {
    if (yAxis === 'gpa') {
      return terms.map(t => t.termGPA || 0);
    } else if (yAxis === 'credits') {
      return terms.map(t => t.credits || 0);
    } else if (yAxis === 'courses') {
      return terms.map(t => t.courses.length);
    }
    return terms.map(() => 0);
  }
  
  function getYAxisLabel(yAxis) {
    const labels = {
      'gpa': 'GPA',
      'credits': 'Credits',
      'courses': 'Courses'
    };
    return labels[yAxis] || yAxis.toUpperCase();
  }
  
  function getFallbackData() {
    return {
      labels: ['Fall 2023', 'Spring 2024', 'Fall 2024'],
      datasets: [{
        label: 'Sample Data',
        data: [3.5, 3.7, 3.8],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)'
      }]
    };
  }
  
  function calculateDynamicStep(maxValue, isGPA = false) {
    if (isGPA) {
      // For GPA, always use 0-5 range with step of 1
      return 1;
    }
    
    // Calculate appropriate step size based on data range
    let step;
    
    if (maxValue <= 5) {
      step = 1;
    } else if (maxValue <= 10) {
      step = 2;
    } else if (maxValue <= 20) {
      step = 5;
    } else if (maxValue <= 50) {
      step = 10;
    } else if (maxValue <= 100) {
      step = 20;
    } else if (maxValue <= 200) {
      step = 50;
    } else {
      // For very large values, round to nearest power of 10 and divide by 5
      const magnitude = Math.pow(10, Math.floor(Math.log10(maxValue)));
      step = magnitude / 2;
    }
    
    return step;
  }
  
  function getChartOptions(chartType, config, data) {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: chartType === 'pie' ? 'bottom' : 'top'
        },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          callbacks: {
            label: (context) => {
              if (chartType === 'pie') {
                const label = context.label || '';
                const value = context.raw || 0;
                return `${label}: ${value}`;
              } else {
                const label = context.dataset.label || '';
                const value = context.raw || 0;
                return `${label.toLowerCase()}: ${value}`;
              }
            }
          }
        }
      },
      interaction: {
        intersect: chartType === 'line' ? false : true,
        mode: chartType === 'line' ? 'index' : 'point'
      },
      animation: {
        animateRotate: chartType === 'pie',
        animateScale: true
      }
    };
    
    if (chartType !== 'pie') {
      // Calculate max value from data
      const dataset = data.datasets && data.datasets[0];
      const dataValues = dataset ? dataset.data : [];
      const maxValue = dataValues.length > 0 ? Math.max(...dataValues) : 0;
      
      // Determine if this is GPA data
      const isGPA = config.yAxis === 'gpa';
      const isCredits = config.yAxis === 'credits';
      
      // Calculate step size
      let stepSize;
      let yMax;
      
      if (isGPA) {
        // GPA: 0 to 5 range with step of 1
        yMax = 5;
        stepSize = 1;
      } else if (isCredits) {
        // Credits: step by 5
        stepSize = 5;
        // Round max up to nearest multiple of 5, add padding
        yMax = Math.ceil((maxValue + 5) / 5) * 5;
      } else {
        // Other data (courses): dynamic step based on range
        stepSize = calculateDynamicStep(maxValue);
        // Round max up to nearest step, add one more step for padding
        yMax = Math.ceil((maxValue + stepSize) / stepSize) * stepSize;
      }
      
      // Line and bar charts use category x-axis
      baseOptions.scales = {
        x: {
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        y: {
          beginAtZero: true,
          max: yMax,
          ticks: {
            stepSize: stepSize
          },
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.05)'
          }
        }
      };
    }
    
    return baseOptions;
  }
  
  function clearPreview() {
    const canvas = document.getElementById('plotPreview');
    const placeholder = canvas ? canvas.parentElement.querySelector('.plot-controls__preview-placeholder') : null;
    
    if (plotChartInstance) {
      plotChartInstance.destroy();
      plotChartInstance = null;
    }
    
    if (canvas) canvas.style.display = 'none';
    if (placeholder) placeholder.style.display = 'block';
  }
  
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPlotControls);
  } else {
    initPlotControls();
  }
  
  window.App.initPlotControls = initPlotControls;
  window.App.generatePlot = generatePlot;
})();

