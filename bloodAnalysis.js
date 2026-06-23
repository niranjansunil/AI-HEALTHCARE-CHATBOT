// ==========================================
// BLOOD REPORT ANALYSIS — CLIENT MODULE
// ==========================================
// Handles: file reading, base64 encoding, API call, vitals display, re-ranking

// ===========================
// STATE
// ===========================
console.log("--- Blood Analysis Script Loaded (v20240317) ---");
console.log("API Target: http://localhost:3000/api/analyze-report");

let currentLabData = null;
let currentRankings = null; // Set by results-script.js after initial diagnosis

/**
 * Called by results-script.js to pass the initial ranked disease list.
 */
function setCurrentRankings(rankings) {
    currentRankings = rankings;
}

// ===========================
// FILE UPLOAD HANDLER
// ===========================
function initBloodUpload() {
    const dropZone = document.getElementById('lab-drop-zone');
    const fileInput = document.getElementById('bloodReportInput');
    const scanBtn  = document.getElementById('scan-report-btn');

    if (!dropZone || !fileInput || !scanBtn) return;

    // Drag-and-drop events
    dropZone.addEventListener('dragover', e => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', e => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    });

    // Click to browse
    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
        if (fileInput.files[0]) handleFile(fileInput.files[0]);
    });

    // Scan button
    scanBtn.addEventListener('click', processBloodReport);
}

function handleFile(file) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.type)) {
        showLabNotification('Please upload a JPG, PNG, WEBP, or PDF image.', 'warning');
        return;
    }

    const dropZone = document.getElementById('lab-drop-zone');
    const preview  = document.getElementById('lab-file-preview');
    const scanBtn  = document.getElementById('scan-report-btn');

    // Show preview or file name
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = e => {
            preview.innerHTML = `<img src="${e.target.result}" alt="Report preview" class="lab-preview-img">`;
        };
        reader.readAsDataURL(file);
    } else {
        preview.innerHTML = `<div class="lab-pdf-icon">📄 ${file.name}</div>`;
    }

    dropZone.classList.add('file-loaded');
    scanBtn.disabled = false;
    window._selectedFile = file;
}

// ===========================
// PROCESS BLOOD REPORT
// ===========================
async function processBloodReport() {
    const file = window._selectedFile;
    if (!file) {
        showLabNotification('Please upload a blood report first.', 'warning');
        return;
    }

    setLabState('loading');

    try {
        const base64 = await fileToBase64(file);
        const diagnosisData = JSON.parse(sessionStorage.getItem('diagnosisResults') || '{}');
        const primaryAnalysisList = diagnosisData?.results?.allPossibilities || [];

        const response = await fetch('http://localhost:3000/api/analyze-report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                imageBase64: base64,
                mimeType: file.type,
                primaryAnalysisList: primaryAnalysisList
            })
        });

        const data = await response.json();

        if (!data.success) {
            setLabState('idle');
            showLabNotification('Analysis failed: ' + (data.error || 'Unknown error'), 'error');
            return;
        }

        currentLabData = data;
        displayVitalsVerification(data);
        setLabState('verified');

    } catch (err) {
        setLabState('idle');
        showLabNotification('Network error: ' + err.message, 'error');
        console.error('Blood report analysis error:', err);
    }
}


// ===========================
// VITALS VERIFICATION PANEL
// ===========================
function displayVitalsVerification(data) {
    const panel = document.getElementById('vitals-panel');
    const grid  = document.getElementById('vitals-grid');
    const notes = document.getElementById('report-notes');

    // Support both `markers` (backward compat) and `vitalsDisplay`
    const markers = data.markers || data.vitalsDisplay || [];

    if (markers.length === 0) {
        panel.innerHTML = `<p class="no-vitals">No recognized biomarkers found in the report. Please ensure the image is clear and contains CBC or metabolic panel data.</p>`;
        panel.style.display = 'block';
        return;
    }

    grid.innerHTML = markers.map(m => {
        const displayName = m.marker || m.name || 'Unknown';
        const status = m.status || 'Normal';
        return `
        <div class="vital-card">
            <div class="vital-name">${displayName}</div>
            <div class="vital-value">${m.value}</div>
            <div class="vital-status status-${status.toLowerCase()}">${status}</div>
        </div>
    `;
    }).join('');

    notes.textContent = data.notes ? `Report quality: ${data.notes}` : '';
    panel.style.display = 'block';

    // Show apply button
    document.getElementById('apply-labs-btn').style.display = 'inline-flex';
}

// ===========================
// APPLY LAB REFINEMENT → REDIRECT TO PINPOINT DASHBOARD
// ===========================
async function applyLabRefinement() {
    if (!currentLabData) {
        showLabNotification('No lab data found. Please scan a report first.', 'warning');
        return;
    }

    const applyBtn = document.getElementById('apply-labs-btn');
    applyBtn.disabled = true;
    applyBtn.innerHTML = '🧬 Pinpointing Diagnosis...';

    try {
        // If pinpointedResults already exist from the scan, use them directly
        if (currentLabData.pinpointedResults && currentLabData.pinpointedResults.length > 0) {
            // Data is already complete from the backend — save and redirect
            sessionStorage.setItem('pinpointResults', JSON.stringify(currentLabData));

            showLabNotification('✅ Diagnosis Pinpointed! Redirecting to dashboard...', 'success');

            setTimeout(() => {
                window.location.href = 'pinpoint.html';
            }, 1200);
            return;
        }

        // Fallback: Re-call the backend if pinpointed data wasn't included
        const file = window._selectedFile;
        if (!file) {
            showLabNotification('Original report file not found. Please re-upload.', 'error');
            applyBtn.disabled = false;
            applyBtn.innerHTML = '🧬 Apply Lab Results & Re-Rank Diseases';
            return;
        }

        const base64 = await fileToBase64(file);
        const stored = JSON.parse(sessionStorage.getItem('diagnosisResults') || '{}');
        const primaryAnalysisList = stored.results?.allPossibilities || [];

        const response = await fetch('http://localhost:3000/api/analyze-report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                imageBase64: base64,
                mimeType: file.type,
                primaryAnalysisList: primaryAnalysisList
            })
        });

        const data = await response.json();

        if (!data.success) {
            showLabNotification('Pinpointing failed: ' + (data.error || 'Unknown error'), 'error');
            applyBtn.disabled = false;
            applyBtn.innerHTML = '🧬 Apply Lab Results & Re-Rank Diseases';
            return;
        }

        // Save and redirect
        sessionStorage.setItem('pinpointResults', JSON.stringify(data));
        showLabNotification('✅ Diagnosis Pinpointed! Redirecting to dashboard...', 'success');

        setTimeout(() => {
            window.location.href = 'pinpoint.html';
        }, 1200);

    } catch (err) {
        console.error('Pinpointing error:', err);
        showLabNotification('Connection error during pinpointing.', 'error');
        applyBtn.disabled = false;
        applyBtn.innerHTML = '🧬 Apply Lab Results & Re-Rank Diseases';
    }
}


/**
 * Core re-ranking algorithm.
 * Applies +0.5 boost per matching biomarker, -0.3 penalty per contradiction.
 * Hard rule: if disease has a "must-have" biomarker that contradicts lab → push to bottom.
 */
function refineRankingsWithLabs(currentRankings, extractedLabs) {
    const MUST_HAVE_MARKERS = { 'Anemia': 'Hemoglobin' }; // disease → critical biomarker

    return currentRankings.map(disease => {
        let labBoost = 1.0;
        let matchCount = 0;
        let penaltyCount = 0;

        // Check must-have hard rule
        const criticalMarkerName = MUST_HAVE_MARKERS[disease.name];
        if (criticalMarkerName) {
            const criticalLab = extractedLabs.markers.find(m => m.name === criticalMarkerName);
            const expected = disease.biomarkers && disease.biomarkers[criticalMarkerName];
            if (criticalLab && expected && criticalLab.status !== expected) {
                // Hard drop: contradict critical marker → push to bottom
                return { ...disease, confidence: Math.max(disease.confidence * 0.1, 1), labPenalized: true };
            }
        }

        // Apply per-marker boost/penalty
        if (extractedLabs.markers && disease.biomarkers) {
            extractedLabs.markers.forEach(lab => {
                if (disease.biomarkers[lab.name]) {
                    if (disease.biomarkers[lab.name] === lab.status) {
                        labBoost += 0.5;
                        matchCount++;
                    } else {
                        labBoost -= 0.3;
                        penaltyCount++;
                    }
                }
            });
        }

        const newConfidence = Math.min(Math.round(disease.confidence * labBoost), 100);
        return {
            ...disease,
            confidence: Math.max(newConfidence, 1),
            labBoost: labBoost.toFixed(2),
            labMatchCount: matchCount,
            labPenaltyCount: penaltyCount
        };
    }).sort((a, b) => b.confidence - a.confidence);
}

// ===========================
// HELPERS
// ===========================
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // Strip data:*;base64, prefix
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
    });
}

function setLabState(state) {
    const loadingOverlay = document.getElementById('lab-loading');
    const scanBtn = document.getElementById('scan-report-btn');

    if (state === 'loading') {
        if (loadingOverlay) loadingOverlay.style.display = 'flex';
        if (scanBtn) { scanBtn.disabled = true; scanBtn.textContent = 'Processing...'; }
    } else {
        if (loadingOverlay) loadingOverlay.style.display = 'none';
        if (scanBtn) { scanBtn.disabled = false; scanBtn.textContent = 'Scan & Re-Analyze'; }
    }
}

function showLabNotification(message, type = 'info') {
    const colors = { success: '#22c55e', warning: '#f59e0b', error: '#ef4444', info: '#3b82f6' };
    const notif = document.createElement('div');
    notif.style.cssText = `
        position: fixed; bottom: 24px; right: 24px; padding: 1rem 1.5rem;
        background: #1e293b; color: white; border-radius: 12px;
        border-left: 4px solid ${colors[type] || colors.info};
        font-size: 0.9rem; font-weight: 500; z-index: 9999;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease-out;
    `;
    notif.textContent = message;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 4000);
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initBloodUpload);
