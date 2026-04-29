/* ============================================================
   PROJECTS PAGE — Dynamic Logic
   Reads ?grade=X&subject=Y from URL, updates hero accordingly,
   and manages the file list display.
   ============================================================ */

(function () {
    'use strict';

    // ---- Subject metadata ----
    const SUBJECTS = {
        mathematics:       { label: 'Mathematics',         icon: 'fa-solid fa-calculator' },
        french:            { label: 'French',              icon: 'fa-solid fa-font' },
        arabic:            { label: 'Arabic',              icon: 'fa-solid fa-book-quran' },
        english:           { label: 'English',             icon: 'fa-solid fa-globe' },
        'phys-ed':         { label: 'Physical Education',  icon: 'fa-solid fa-person-running' },
        'life-skills':     { label: 'Life Skills / Civics',icon: 'fa-solid fa-leaf' },
        'science-tech':    { label: 'Science & Technology', icon: 'fa-solid fa-flask' }
    };

    // ---- Read URL parameters ----
    const params  = new URLSearchParams(window.location.search);
    const grade   = params.get('grade')   || '1';
    const subject = params.get('subject') || 'mathematics';

    const subjectData = SUBJECTS[subject] || SUBJECTS['mathematics'];

    // ---- Update hero ----
    const gradeLabel   = document.getElementById('grade-label-display');
    const subjectTitle = document.getElementById('subject-title-display');
    const subjectIcon  = document.getElementById('subject-icon-display');

    if (gradeLabel)   gradeLabel.textContent   = 'Grade ' + grade;
    if (subjectTitle) subjectTitle.textContent  = subjectData.label;
    if (subjectIcon)  subjectIcon.innerHTML     = '<i class="' + subjectData.icon + '"></i>';

    // Update page title
    document.title = subjectData.label + ' – Grade ' + grade + ' | Ahmed-Reda Salimi';

    // ---- File list management ----
    const filesGrid  = document.getElementById('project-files-grid');
    const emptyState = document.getElementById('projects-empty-state');
    const uploadArea = document.getElementById('upload-area');

    // Check if there are any file cards rendered in the grid
    const fileCards = filesGrid ? filesGrid.querySelectorAll('.file-card') : [];

    if (fileCards.length === 0) {
        // No files — show empty state, hide grid
        if (filesGrid)  filesGrid.style.display  = 'none';
        if (emptyState) emptyState.style.display  = 'block';
    } else {
        // Files exist — show grid, hide empty state
        if (emptyState) emptyState.style.display  = 'none';
        if (uploadArea) uploadArea.style.display   = 'none';
    }

})();
