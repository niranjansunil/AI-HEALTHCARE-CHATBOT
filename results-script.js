// ===========================
// RESULTS PAGE SCRIPT
// ===========================

document.addEventListener('DOMContentLoaded', () => {
    loadResults();
});

function loadResults() {
    // Get results from sessionStorage
    const resultsJSON = sessionStorage.getItem('diagnosisResults');

    if (!resultsJSON) {
        // No results found, redirect back
        window.location.href = 'index.html';
        return;
    }

    const data = JSON.parse(resultsJSON);

    // Hide loading, show results
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('results-container').style.display = 'block';

    // Display all sections
    displayInputSummary(data.inputData);
    displayRedFlags(data.results.redFlags);
    displayPrimaryDiagnoses(data.results.primaryDiagnoses);
    displayCombinations(data.results.combinations);
    displayAllPossibilities(data.results.allPossibilities);
    displayRecommendations(data.recommendations);
    displayXaiAudit(data.results.auditLog);

    // Expose rankings to bloodAnalysis.js for lab re-ranking
    if (typeof setCurrentRankings === 'function') {
        setCurrentRankings(data.results.allPossibilities || []);
    }
}


// ===========================
// DISPLAY INPUT SUMMARY
// ===========================
function displayInputSummary(inputData) {
    const symptomsDisplay = document.getElementById('symptoms-display');
    const metadataDisplay = document.getElementById('metadata-display');

    // Display symptoms as chips
    symptomsDisplay.innerHTML = inputData.symptoms.map(symptom => `
        <div class="symptom-chip">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.5 5.5L7.5 14.5L3.5 10.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            ${symptom}
        </div>
    `).join('');

    // Display metadata
    metadataDisplay.innerHTML = `
        <div class="metadata-item">
            <span class="metadata-label">Duration:</span>
            <span class="metadata-value">${inputData.duration}</span>
        </div>
        <div class="metadata-item">
            <span class="metadata-label">Severity:</span>
            <span class="metadata-value severity-${getSeverityClass(inputData.severity)}">${inputData.severity}/10</span>
        </div>
        ${inputData.additionalInfo ? `
        <div class="metadata-item full-width">
            <span class="metadata-label">Additional Info:</span>
            <span class="metadata-value">${inputData.additionalInfo}</span>
        </div>
        ` : ''}
    `;
}

function getSeverityClass(severity) {
    if (severity <= 3) return 'low';
    if (severity <= 7) return 'medium';
    return 'high';
}

// ===========================
// DISPLAY PRIMARY DIAGNOSES
// ===========================
function displayPrimaryDiagnoses(diagnoses) {
    const container = document.getElementById('primary-diagnoses');

    if (!diagnoses || diagnoses.length === 0) {
        container.innerHTML = '<p class="no-results">No matching conditions found.</p>';
        return;
    }

    container.innerHTML = diagnoses.map((disease, index) => `
        <div class="disease-card ${index === 0 ? 'top-match' : ''}">
            <div class="disease-header">
                <div class="disease-rank">#${index + 1}</div>
                <div class="disease-info">
                    <h3 class="disease-name">${disease.name}</h3>
                    <span class="disease-category">${disease.category}</span>
                </div>
            </div>
            
            <p class="disease-description">${disease.description}</p>

            <div class="matched-symptoms">
                <h4 class="section-subtitle">Matched Symptoms:</h4>
                <div class="matched-symptoms-grid">
                    ${disease.matchedSymptoms.map(s => `
                        <div class="matched-symptom">
                            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16.5 5.5L7.5 14.5L3.5 10.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            ${s.symptom}
                        </div>
                    `).join('')}
                </div>
            </div>

            ${disease.unmatchedSymptoms && disease.unmatchedSymptoms.length > 0 ? `
            <div class="unmatched-symptoms">
                <h4 class="section-subtitle">Your Other Symptoms:</h4>
                <div class="unmatched-symptoms-list">
                    ${disease.unmatchedSymptoms.map(s => `<span class="unmatched-symptom">${s}</span>`).join('')}
                </div>
            </div>
            ` : ''}

            <div class="recommendations-section">
                <h4 class="section-subtitle">Recommendations:</h4>
                <ul class="recommendations-list">
                    ${disease.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
        </div>
    `).join('');
}

function getConfidenceClass(confidence) {
    if (confidence >= 70) return 'high';
    if (confidence >= 40) return 'medium';
    return 'low';
}

function getConfidenceLabel(confidence) {
    if (confidence >= 70) return 'High Match';
    if (confidence >= 40) return 'Moderate Match';
    return 'Low Match';
}

// ===========================
// DISPLAY COMBINATIONS
// ===========================
function displayCombinations(combinations) {
    const section = document.getElementById('combinations-section');
    const container = document.getElementById('combinations-display');

    if (!combinations || combinations.length === 0) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';

    container.innerHTML = combinations.map(combo => {
        if (combo.type === 'category_group') {
            return `
                <div class="combination-card category-group">
                    <div class="combination-header">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 2v16M2 10h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        <h4>${combo.category} Conditions</h4>
                    </div>
                    <p class="combination-description">${combo.description}</p>
                    <div class="combination-diseases">
                        ${combo.diseases.map(d => `
                            <div class="combo-disease">
                                <span class="combo-disease-name">${d.name}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } else if (combo.type === 'co_occurrence') {
            return `
                <div class="combination-card co-occurrence">
                    <div class="combination-header">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="7" cy="10" r="5" stroke="currentColor" stroke-width="2" fill="none"/>
                            <circle cx="13" cy="10" r="5" stroke="currentColor" stroke-width="2" fill="none"/>
                        </svg>
                        <h4>Co-occurring Conditions</h4>
                    </div>
                    <p class="combination-description">${combo.description}</p>
                    <div class="co-occurrence-details">
                        <span class="primary-label">Primary: <strong>${combo.primary}</strong></span>
                        <span class="secondary-label">Secondary: <strong>${combo.secondary}</strong></span>
                    </div>
                </div>
            `;
        }
        return '';
    }).join('');
}

// ===========================
// DISPLAY ALL POSSIBILITIES
// ===========================
function displayAllPossibilities(possibilities) {
    const container = document.getElementById('all-possibilities');

    if (!possibilities || possibilities.length === 0) {
        container.innerHTML = '<p class="no-results">No additional conditions found.</p>';
        return;
    }

    container.innerHTML = possibilities.map(disease => `
        <div class="possibility-card">
            <div class="possibility-header">
                <h4 class="possibility-name">${disease.name}</h4>
            </div>
            <p class="possibility-category">${disease.category}</p>
        </div>
    `).join('');
}

// ===========================
// DISPLAY RECOMMENDATIONS
// ===========================
function displayRecommendations(recommendations) {
    const container = document.getElementById('recommendations-display');

    if (!recommendations || recommendations.length === 0) {
        container.innerHTML = '<p class="no-results">No specific recommendations available.</p>';
        return;
    }

    container.innerHTML = recommendations.map(rec => `
        <div class="recommendation-item priority-${rec.priority.toLowerCase().replace('_', '-')}">
            <span class="recommendation-icon">${rec.icon}</span>
            <div class="recommendation-content">
                <span class="recommendation-priority">${rec.priority.replace('_', ' ')}</span>
                <p class="recommendation-text">${rec.text}</p>
            </div>
        </div>
    `).join('');
}

// ===========================
// DISPLAY RED FLAGS
// ===========================
function displayRedFlags(redFlags) {
    const container = document.getElementById('red-flags-container');

    if (!redFlags || redFlags.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = redFlags.map(flag => `
        <div class="red-flag-alert">
            <div class="alert-header">
                <div class="alert-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L1 21h22L12 2z" fill="white" stroke="white" stroke-width="2" stroke-linejoin="round"/>
                        <path d="M12 9v4M12 17h.01" stroke="var(--danger-red)" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </div>
                <div class="alert-info">
                    <span class="alert-type">${flag.type} ALERT</span>
                    <h3 class="alert-message">${flag.message}</h3>
                </div>
            </div>
            <div class="alert-details">
                <p>Identified Warning Symptoms:</p>
                <div class="alert-symptoms">
                    ${flag.symptoms.map(s => `<span class="alert-symptom-tag">${s}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

// ===========================
// DISPLAY XAI CLINICAL AUDIT
// ===========================
function displayXaiAudit(auditLog) {
    const section = document.getElementById('xai-audit-section');
    const container = document.getElementById('xai-audit-display');

    if (!auditLog || auditLog.length === 0) {
        if (section) section.style.display = 'none';
        return;
    }

    if (section) section.style.display = 'block';

    if (container) {
        container.innerHTML = auditLog.map(auditLine => {
            const cleanMessage = auditLine.replace('[XAI Audit]: ', '');
            return `
                <div class="xai-entry">
                    <div class="xai-indicator">
                        <div class="xai-pulse"></div>
                        <span class="xai-tag">CLINICAL AUDIT SOURCE</span>
                    </div>
                    <div class="xai-content">
                        <p class="xai-reasoning">${cleanMessage}</p>
                    </div>
                </div>
            `;
        }).join('');
    }
}
