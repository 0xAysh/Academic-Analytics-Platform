const transcriptData = {
  studentInfo: {
    name: "",
    studentId: "",
    degree: "Computer Science Major",
    institution: "SF State"
  },
  
  terms: [
    {
      term: "SP2024",
      termName: "Spring 2024",
      termGPA: 3.83,
      credits: 13.00,
      earnedCredits: 13.00,
      gpaUnits: 13.00,
      points: 49.90,
      honor: "Dean's List",
      courses: [
        { code: "AA S 101", name: "FIRST-YEAR EXPERIENCE", units: 3.00, earnedUnits: 3.00, grade: "A", points: 12.00 },
        { code: "CSC 101", name: "INTRODUCTION TO COMPUTING", units: 3.00, earnedUnits: 3.00, grade: "A", points: 12.00 },
        { code: "MATH 226", name: "CALCULUS I", units: 4.00, earnedUnits: 4.00, grade: "A", points: 16.00 },
        { code: "PHIL 110", name: "INTRO TO CRITICAL THINKING I", units: 3.00, earnedUnits: 3.00, grade: "B+", points: 9.90 }
      ]
    },
    {
      term: "FA2024",
      termName: "Fall 2024",
      termGPA: 3.23,
      credits: 18.00,
      earnedCredits: 18.00,
      gpaUnits: 18.00,
      points: 58.30,
      honor: null,
      courses: [
        { code: "CINE 102", name: "INTRO TO CONTEMPORARY CINEMA", units: 3.00, earnedUnits: 3.00, grade: "B", points: 9.00 },
        { code: "CSC 215", name: "INTERMED COMPUTER PROGRAMMING", units: 4.00, earnedUnits: 4.00, grade: "A", points: 16.00 },
        { code: "ENG 209", name: "WRITING FIRST YR ML", units: 3.00, earnedUnits: 3.00, grade: "A-", points: 11.10 },
        { code: "MATH 227", name: "CALCULUS II", units: 4.00, earnedUnits: 4.00, grade: "C+", points: 9.20 },
        { code: "PHYS 220", name: "GEN PHYS WITH CALC I", units: 3.00, earnedUnits: 3.00, grade: "B", points: 9.00 },
        { code: "PHYS 222", name: "GEN PHYS WITH CALC I LAB", units: 1.00, earnedUnits: 1.00, grade: "A", points: 4.00 }
      ]
    },
    {
      term: "SP2025",
      termName: "Spring 2025",
      termGPA: 3.45,
      credits: 16.00,
      earnedCredits: 16.00,
      gpaUnits: 16.00,
      points: 55.30,
      honor: "Dean's List",
      courses: [
        { code: "CSC 220", name: "DATA STRUCTURES", units: 3.00, earnedUnits: 3.00, grade: "B", points: 9.00 },
        { code: "CSC 230", name: "DISCRETE MATH STRUCTURES", units: 3.00, earnedUnits: 3.00, grade: "A-", points: 11.10 },
        { code: "HIST 114", name: "WORLD HISTORY TO 1500", units: 3.00, earnedUnits: 3.00, grade: "A", points: 12.00 },
        { code: "MATH 324", name: "PROB & STATS WITH COMPUTING", units: 3.00, earnedUnits: 3.00, grade: "A-", points: 11.10 },
        { code: "PHYS 230", name: "GEN PHYS WITH CALC II", units: 3.00, earnedUnits: 3.00, grade: "B-", points: 8.10 },
        { code: "PHYS 232", name: "GEN PHYS WITH CALC II LAB", units: 1.00, earnedUnits: 1.00, grade: "A", points: 4.00 }
      ]
    },
    {
      term: "FA2025",
      termName: "Fall 2025",
      termGPA: 0.00,
      credits: 15.00,
      earnedCredits: 0.00,
      gpaUnits: 0.00,
      points: 0.00,
      honor: null,
      isPlanned: true,
      courses: [
        { code: "ANTH 100", name: "INTRO BIOLOGICAL ANTHROPOLOGY", units: 3.00, earnedUnits: 0.00, grade: null, points: 0.00 },
        { code: "CSC 256", name: "MACHINE STRUCTURES", units: 3.00, earnedUnits: 0.00, grade: null, points: 0.00 },
        { code: "CSC 317", name: "INTRO TO WEB SOFTWARE DEV", units: 3.00, earnedUnits: 0.00, grade: null, points: 0.00 },
        { code: "CSC 340", name: "PROGRAMMING METHODOLOGY", units: 3.00, earnedUnits: 0.00, grade: null, points: 0.00 },
        { code: "MATH 225", name: "INTRODUCTION TO LINEAR ALGEBRA", units: 3.00, earnedUnits: 0.00, grade: null, points: 0.00 }
      ]
    }
  ],
  
  cumulative: {
    overallGPA: 3.47,
    combinedGPA: 3.47,
    totalCredits: 47.00,
    totalEarnedCredits: 47.00,
    totalGPAUnits: 47.00,
    totalPoints: 163.50,
    totalPlannedCredits: 62.00
  },
  
  getCompletedTerms: function() {
    return this.terms.filter(term => !term.isPlanned);
  },
  
  getCoursesBySubject: function(subjectPrefix) {
    const allCourses = [];
    this.getCompletedTerms().forEach(term => {
      term.courses.forEach(course => {
        if (course.code.startsWith(subjectPrefix)) {
          allCourses.push({...course, term: term.term, termName: term.termName});
        }
      });
    });
    return allCourses;
  },
  
  getGPABySubject: function(subjectPrefix) {
    const courses = this.getCoursesBySubject(subjectPrefix);
    if (courses.length === 0) return null;
    
    const totalPoints = courses.reduce((sum, course) => sum + course.points, 0);
    const totalUnits = courses.reduce((sum, course) => sum + course.units, 0);
    return totalUnits > 0 ? (totalPoints / totalUnits).toFixed(2) : null;
  }
};
