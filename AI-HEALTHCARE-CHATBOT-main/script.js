/* ============================================================
   HEAL – Main Application Script
   Handles: symptom dropdown, chip selection, severity slider,
            duration buttons, NLP textarea, form submission,
            hospital finder, and diagnosis routing.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

    /* ----------------------------------------------------------
       ELEMENT REFERENCES
    ---------------------------------------------------------- */
    const searchInput     = document.getElementById('symptom-search');
    const dropdown        = document.getElementById('symptom-dropdown');
    const chipsContainer  = document.getElementById('selected-chips');
    const severitySlider  = document.getElementById('severity-slider');
    const severityValue   = document.getElementById('severity-value');
    const analyzeBtn      = document.getElementById('analyze-btn');
    const textarea        = document.getElementById('additional-info');
    const clearBtn        = document.getElementById('reset-paths');
    const nlpPath         = document.getElementById('nlp-path');
    const manualPath      = document.getElementById('manual-path');
    const durationBtns    = document.querySelectorAll('.duration-btn');
    const symptomOptions  = document.querySelectorAll('.symptom-option');

    /* State */
    let selectedSymptoms  = [];
    let selectedDuration  = '';

    /* ----------------------------------------------------------
       MUTUAL EXCLUSIVITY (NLP vs Manual)
       ---------------------------------------------------------- */
    const symptomsSection = document.getElementById('symptoms-section');
    const durationSection = document.getElementById('duration-section');
    const severitySection = document.getElementById('severity-section');

    function setPath(active) {
        if (active === 'nlp') {
            // Disable manual symptoms section
            if (symptomsSection) {
                symptomsSection.style.opacity = '0.2';
                symptomsSection.style.pointerEvents = 'none';
                const lock = document.getElementById('manual-lock');
                if (lock) lock.classList.add('visible');
            }
            if (searchInput) searchInput.disabled = true;

            const nlpLock = document.getElementById('nlp-lock');
            if (nlpLock) nlpLock.classList.remove('visible');

            // Keep severity section enabled (user needs it for NLP path too)
            if (severitySection) {
                severitySection.style.opacity = '1';
                severitySection.style.pointerEvents = 'auto';
            }
            if (severitySlider) severitySlider.disabled = false;

            // Keep duration enabled
            if (durationSection) {
                durationSection.style.opacity = '1';
                durationSection.style.pointerEvents = 'auto';
            }

            // Enable NLP
            if (nlpPath) {
                nlpPath.style.opacity = '1';
                nlpPath.style.pointerEvents = 'auto';
            }
            if (textarea) textarea.disabled = false;

            // Clear manual symptom selections to prevent mix-up
            selectedSymptoms = [];
            symptomOptions.forEach(o => o.classList.remove('selected'));
            if (chipsContainer) chipsContainer.innerHTML = '';
            if (searchInput) searchInput.value = '';
            // Severity value is preserved (user may set it before choosing a path)

        } else if (active === 'manual') {
            // Disable NLP
            if (nlpPath) {
                nlpPath.style.opacity = '0.2';
                nlpPath.style.pointerEvents = 'none';
                const lock = document.getElementById('nlp-lock');
                if (lock) lock.classList.add('visible');
            }
            if (textarea) {
                textarea.disabled = true;
                textarea.value = '';
            }

            const manualLock = document.getElementById('manual-lock');
            if (manualLock) manualLock.classList.remove('visible');

            // Enable manual inputs
            if (symptomsSection) {
                symptomsSection.style.opacity = '1';
                symptomsSection.style.pointerEvents = 'auto';
            }
            if (searchInput) searchInput.disabled = false;

            if (severitySection) {
                severitySection.style.opacity = '1';
                severitySection.style.pointerEvents = 'auto';
            }
            if (severitySlider) severitySlider.disabled = false;

            if (durationSection) {
                durationSection.style.opacity = '1';
                durationSection.style.pointerEvents = 'auto';
            }

        } else {
            // Re-enable both when both empty
            if (nlpPath) {
                nlpPath.style.opacity = '1';
                nlpPath.style.pointerEvents = 'auto';
            }
            if (textarea) textarea.disabled = false;
            const nlpLock = document.getElementById('nlp-lock');
            if (nlpLock) nlpLock.classList.remove('visible');

            if (symptomsSection) {
                symptomsSection.style.opacity = '1';
                symptomsSection.style.pointerEvents = 'auto';
            }
            if (searchInput) searchInput.disabled = false;
            const manualLock = document.getElementById('manual-lock');
            if (manualLock) manualLock.classList.remove('visible');

            if (severitySection) {
                severitySection.style.opacity = '1';
                severitySection.style.pointerEvents = 'auto';
            }
            if (severitySlider) severitySlider.disabled = false;

            if (durationSection) {
                durationSection.style.opacity = '1';
                durationSection.style.pointerEvents = 'auto';
            }
        }
    }

    if (textarea) {
        textarea.addEventListener('focus', () => setPath('nlp'));
        textarea.addEventListener('input', () => {
            if (textarea.value.trim().length === 0 && selectedSymptoms.length === 0) {
                setPath(null);
            } else if (textarea.value.trim().length > 0) {
                setPath('nlp');
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('focus', () => setPath('manual'));
    }
    if (severitySlider) {
        severitySlider.addEventListener('mousedown', () => setPath('manual'));
        severitySlider.addEventListener('touchstart', () => setPath('manual'));
    }

    /* ----------------------------------------------------------
       SYMPTOM DROPDOWN — open / close / filter
    ---------------------------------------------------------- */

    // Open dropdown on input focus / typing
    searchInput.addEventListener('click', (e) => {
        e.stopPropagation();
        openDropdown();
    });
    
    searchInput.addEventListener('input', () => {
        openDropdown();
        filterOptions(searchInput.value.trim().toLowerCase());
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        const wrapper = searchInput.closest('.custom-dropdown');
        if (wrapper && !wrapper.contains(e.target)) {
            closeDropdown();
        }
    });

    // Keyboard nav
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeDropdown();
    });

    function openDropdown() {
        if (dropdown) dropdown.classList.add('active');
    }

    function closeDropdown() {
        if (dropdown) dropdown.classList.remove('active');
    }

    function filterOptions(query) {
        let anyVisible = false;
        symptomOptions.forEach(opt => {
            const text = opt.querySelector('span').textContent.toLowerCase();
            const cat  = opt.closest('.dropdown-category');
            const match = !query || text.includes(query);
            opt.style.display = match ? '' : 'none';
            if (match) anyVisible = true;
            // hide category header if no children visible
            if (cat) {
                const visibleChildren = [...cat.querySelectorAll('.symptom-option')]
                    .filter(o => o.style.display !== 'none');
                cat.style.display = visibleChildren.length ? '' : 'none';
            }
        });
    }

    /* ----------------------------------------------------------
       SYMPTOM SELECTION — toggle chips
    ---------------------------------------------------------- */
    symptomOptions.forEach(opt => {
        opt.addEventListener('click', (e) => {
            e.stopPropagation();     // don't bubble to document
            const symptom = opt.dataset.symptom;
            if (!symptom) return;

            if (opt.classList.contains('selected')) {
                // Deselect
                opt.classList.remove('selected');
                selectedSymptoms = selectedSymptoms.filter(s => s !== symptom);
                removeChip(symptom);
            } else {
                // Select
                opt.classList.add('selected');
                selectedSymptoms.push(symptom);
                addChip(symptom);
            }

            // Clear search filter after selection (dropdown stays open for multi-select)
            searchInput.value = '';
            filterOptions('');
            setPath('manual');
        });
    });

    function addChip(symptom) {
        if (!chipsContainer) return;
        const chip = document.createElement('div');
        chip.className = 'chip';
        chip.dataset.symptom = symptom;
        chip.innerHTML = `
            <span>${symptom}</span>
            <button class="chip-remove" aria-label="Remove ${symptom}" title="Remove">×</button>
        `;
        chip.querySelector('.chip-remove').addEventListener('click', () => {
            deselectSymptom(symptom);
        });
        chipsContainer.appendChild(chip);
    }

    function removeChip(symptom) {
        if (!chipsContainer) return;
        const chip = chipsContainer.querySelector(`.chip[data-symptom="${CSS.escape(symptom)}"]`);
        if (chip) chip.remove();
    }

    function deselectSymptom(symptom) {
        selectedSymptoms = selectedSymptoms.filter(s => s !== symptom);
        removeChip(symptom);
        // Un-highlight the option in the dropdown
        const opt = document.querySelector(`.symptom-option[data-symptom="${CSS.escape(symptom)}"]`);
        if (opt) opt.classList.remove('selected');
        
        // Revert to null path if no manual sign is selected and textarea is empty
        if (selectedSymptoms.length === 0 && (!textarea || textarea.value.trim().length === 0)) {
            setPath(null);
        }
    }

    /* ----------------------------------------------------------
       DURATION BUTTONS
    ---------------------------------------------------------- */
    durationBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            durationBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedDuration = btn.dataset.duration || btn.textContent.trim();
        });
    });

    /* ----------------------------------------------------------
       SEVERITY SLIDER
    ---------------------------------------------------------- */
    if (severitySlider && severityValue) {
        severitySlider.addEventListener('input', () => {
            severityValue.textContent = severitySlider.value;
        });
        // initialise display
        severityValue.textContent = severitySlider.value;
    }

    /* ----------------------------------------------------------
       CLEAR BUTTON
    ---------------------------------------------------------- */
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            // Clear NLP path
            if (textarea) textarea.value = '';

            // Clear manual path
            if (searchInput) searchInput.value = '';
            filterOptions('');
            closeDropdown();

            // Remove all chips and deselect options
            if (chipsContainer) chipsContainer.innerHTML = '';
            selectedSymptoms = [];
            symptomOptions.forEach(o => o.classList.remove('selected'));

            // Reset duration
            durationBtns.forEach(b => b.classList.remove('active'));
            selectedDuration = '';

            // Reset severity
            if (severitySlider) { severitySlider.value = 5; }
            if (severityValue)  { severityValue.textContent = 5; }

            setPath(null);
        });
    }

    /* ----------------------------------------------------------
       FORM SUBMISSION — Analyze Button
    ---------------------------------------------------------- */
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', handleSubmit);
    }

    async function handleSubmit() {
        const nlpText       = textarea ? textarea.value.trim() : '';
        const severity      = severitySlider ? parseInt(severitySlider.value, 10) : 5;
        const durationLabel = selectedDuration || 'Unknown';

        // Decide input mode
        const nlpActive = nlpText.length > 0 && !nlpPath.classList.contains('dimmed');

        let symptomsForDiagnosis = [];

        if (nlpActive) {
            // Parse symptoms from free text
            symptomsForDiagnosis = extractSymptomsFromText(nlpText);
        } else {
            symptomsForDiagnosis = [...selectedSymptoms];
        }

        if (symptomsForDiagnosis.length === 0 && nlpText.length === 0) {
            showError('Please select at least one symptom or describe your condition.');
            return;
        }

        if (!selectedDuration) {
            showError('Please specify the duration of your symptoms before proceeding.');
            return;
        }

        // Show loading state on button
        const originalBtnText = analyzeBtn.innerHTML;
        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML = '<span class="loading-spinner"></span> Analyzing...';

        try {
            // API Call for Weighted Ranking Algorithm
            const response = await fetch('http://localhost:3000/api/diagnose', {
                // Ensure this matches your server port
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    symptoms: symptomsForDiagnosis,
                    severity: severity,
                    duration: durationLabel,
                    additionalInfo: nlpText
                })
            });

            if (!response.ok) throw new Error('Diagnosis failed');

            const diagnosisResults = await response.json();

            // Store results correctly for results-script.js
            sessionStorage.setItem('diagnosisResults', JSON.stringify(diagnosisResults));
            
            // Also store raw input for summary display
            sessionStorage.setItem('healPatientData', JSON.stringify({
                symptoms: symptomsForDiagnosis,
                severity: severity,
                duration: durationLabel,
                nlpText: nlpText,
                timestamp: new Date().toISOString()
            }));

            // Navigate to results page
            window.location.href = 'results.html';

        } catch (err) {
            console.error('Diagnosis Error:', err);
            showError('Connection to diagnosis engine failed. Please ensure the backend server is running.');
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = originalBtnText;
        }
    }

    /* Simple keyword-based NLP extractor */
    function extractSymptomsFromText(text) {
        const knownSymptoms = [
            'Cough', 'Shortness of breath', 'Sore throat', 'Wheezing',
            'Nasal congestion', 'Phlegm production', 'Coughing blood',
            'Fever', 'Fatigue', 'Body aches', 'Chills', 'Night sweats',
            'Weight loss', 'Thirst', 'Sweating', 'Loss of appetite',
            'Nausea', 'Vomiting', 'Diarrhea', 'Abdominal pain', 'Bloating',
            'Constipation', 'Heartburn', 'Difficulty swallowing',
            'Muscle stiffness', 'Joint pain', 'Back pain', 'Muscle cramps',
            'Joint swelling', 'Limited range of motion',
            'Headache', 'Dizziness', 'Numbness', 'Confusion', 'Tremors',
            'Tingling sensation', 'Loss of balance', 'Blurred vision',
            'Loss of taste/smell', 'Stiff neck', 'Light sensitivity',
            'Facial droop', 'Arm weakness', 'Speech difficulty',
            'Rash', 'Itching', 'Swelling', 'Skin redness', 'Hives', 'Dry skin',
            'Chest pain', 'Palpitations', 'Irregular heartbeat', 'Fainting',
            'Radiating pain'
        ];
        const lowerText = text.toLowerCase();
        return knownSymptoms.filter(s => lowerText.includes(s.toLowerCase()));
    }

    /* Show a brief inline error */
    function showError(msg) {
        let err = document.getElementById('heal-error-msg');
        if (!err) {
            err = document.createElement('p');
            err.id = 'heal-error-msg';
            err.style.cssText = 'color:#e74c3c;font-size:0.85rem;margin-top:0.5rem;text-align:center;font-weight:600;';
            if (analyzeBtn) analyzeBtn.parentNode.insertBefore(err, analyzeBtn);
        }
        err.textContent = msg;
        setTimeout(() => { if (err) err.textContent = ''; }, 4000);
    }

    /* ----------------------------------------------------------
       HOSPITAL FINDER (if on this page)
    ---------------------------------------------------------- */
    const districtSelect = document.getElementById('districtSelect');
    if (districtSelect) {
        districtSelect.addEventListener('change', () => {
            loadHospitals(districtSelect.value);
        });
    }

    function loadHospitals(district) {
        const container = document.getElementById('hospitalCardsContainer');
        if (!container) return;
        if (!district) {
            container.innerHTML = '<div class="hospital-placeholder"><p>Please select a district to view hospitals.</p></div>';
            return;
        }

        const hospitals = KERALA_HOSPITALS[district] || [];
        if (hospitals.length === 0) {
            container.innerHTML = '<div class="hospital-placeholder"><p>No hospitals found for this district.</p></div>';
            return;
        }

        container.innerHTML = hospitals.map((h, i) => `
            <div class="hospital-card" style="animation-delay:${i * 0.06}s">
                <div class="hospital-rank">#${i + 1}</div>
                <h3 class="hospital-name">${h.name}</h3>
                <p class="hospital-type">${h.type}</p>
                <p class="hospital-address">${h.address}</p>
                <div class="hospital-specialties">
                    ${(h.specialties || []).map(s => `<span class="specialty-badge">${s}</span>`).join('')}
                </div>
                <div class="hospital-actions">
                    ${h.website ? `<a href="${h.website}" target="_blank" rel="noopener" class="hospital-action-btn" title="Website">🌐</a>` : ''}
                    ${h.phone    ? `<a href="tel:${h.phone}" class="hospital-action-btn" title="Call">📞</a>` : ''}
                    ${h.maps     ? `<a href="${h.maps}" target="_blank" rel="noopener" class="hospital-action-btn" title="Directions">📍</a>` : ''}
                </div>
            </div>
        `).join('');
    }

    /* ----------------------------------------------------------
       KERALA HOSPITALS DATA
    ---------------------------------------------------------- */
    const KERALA_HOSPITALS = {
        'Thiruvananthapuram': [
            { name: 'Government Medical College Thiruvananthapuram', type: 'Government', address: 'Medical College Road, Thiruvananthapuram', specialties: ['General Medicine', 'Surgery', 'Cardiology'], phone: '0471-2528386', maps: 'https://maps.google.com/?q=Government+Medical+College+Thiruvananthapuram' },
            { name: 'KIMS Hospital', type: 'Private', address: 'Anayara, Thiruvananthapuram', specialties: ['Oncology', 'Neurology', 'Orthopaedics'], phone: '0471-2940000', website: 'https://www.kimshealth.org', maps: 'https://maps.google.com/?q=KIMS+Hospital+Thiruvananthapuram' },
            { name: 'Sree Chitra Tirunal Institute', type: 'Central Government', address: 'Medical College PO, Thiruvananthapuram', specialties: ['Cardiothoracic', 'Neurosciences'], phone: '0471-2524422', maps: 'https://maps.google.com/?q=Sree+Chitra+Tirunal+Thiruvananthapuram' },
            { name: 'Thiruvananthapuram Medical College', type: 'Government', address: 'Ulloor, Thiruvananthapuram', specialties: ['Multi-speciality'], phone: '0471-2443152', maps: 'https://maps.google.com/?q=Thiruvananthapuram+Medical+College' }
        ],
        'Ernakulam': [
            { name: 'Amrita Institute of Medical Sciences', type: 'Private', address: 'AIMS Ponekkara, Kochi', specialties: ['Cardiology', 'Oncology', 'Transplant'], phone: '0484-2801234', website: 'https://www.amritahospitals.org', maps: 'https://maps.google.com/?q=Amrita+Institute+Kochi' },
            { name: 'Lakeshore Hospital', type: 'Private', address: 'NH Byepass, Ernakulam', specialties: ['Neurology', 'Orthopaedics', 'Cardiology'], phone: '0484-2701032', maps: 'https://maps.google.com/?q=Lakeshore+Hospital+Kochi' },
            { name: 'Government Medical College Ernakulam', type: 'Government', address: 'Kalamassery, Ernakulam', specialties: ['General Medicine', 'Surgery'], phone: '0484-2412100', maps: 'https://maps.google.com/?q=Government+Medical+College+Ernakulam' },
            { name: 'Aster Medcity', type: 'Private', address: 'Cheranalloor, Kochi', specialties: ['Cardiac Surgery', 'Oncology', 'Robotic Surgery'], phone: '0484-6699999', website: 'https://astermedcity.com', maps: 'https://maps.google.com/?q=Aster+Medcity+Kochi' }
        ],
        'Kozhikode': [
            { name: 'Government Medical College Kozhikode', type: 'Government', address: 'Medical College Road, Kozhikode', specialties: ['Multi-speciality'], phone: '0495-2350216', maps: 'https://maps.google.com/?q=Government+Medical+College+Kozhikode' },
            { name: 'Baby Memorial Hospital', type: 'Private', address: 'Indira Gandhi Road, Kozhikode', specialties: ['Paediatrics', 'Cardiology', 'Neurosurgery'], phone: '0495-2723272', maps: 'https://maps.google.com/?q=Baby+Memorial+Hospital+Kozhikode' },
            { name: 'MIMS Hospital', type: 'Private', address: 'Govindapuram, Kozhikode', specialties: ['Orthopaedics', 'Oncology'], phone: '0495-2892000', maps: 'https://maps.google.com/?q=MIMS+Hospital+Kozhikode' },
            { name: 'Pariyaram Medical College', type: 'Government-aided', address: 'Kannur (near Kozhikode region)', specialties: ['General Surgery', 'Medicine'], phone: '0460-2212222', maps: 'https://maps.google.com/?q=Pariyaram+Medical+College' }
        ],
        'Thrissur': [
            { name: 'Government Medical College Thrissur', type: 'Government', address: 'Thrissur', specialties: ['Multi-speciality'], phone: '0487-2361616', maps: 'https://maps.google.com/?q=Government+Medical+College+Thrissur' },
            { name: 'Jubilee Mission Medical College', type: 'Private', address: 'Thrissur', specialties: ['General Surgery', 'OBG', 'Paediatrics'], phone: '0487-2435000', maps: 'https://maps.google.com/?q=Jubilee+Mission+Thrissur' },
            { name: 'Amala Institute of Medical Sciences', type: 'Private', address: 'Amala Nagar, Thrissur', specialties: ['Oncology', 'Cardiology'], phone: '0487-2304000', maps: 'https://maps.google.com/?q=Amala+Institute+Thrissur' }
        ],
        'Kannur': [
            { name: 'Government Medical College Kannur', type: 'Government', address: 'Pariyaram, Kannur', specialties: ['General Medicine', 'Surgery'], phone: '0460-2212288', maps: 'https://maps.google.com/?q=Government+Medical+College+Kannur' },
            { name: 'MIMS Kannur', type: 'Private', address: 'Kannur', specialties: ['Cardiology', 'Neurology'], phone: '0497-2712000', maps: 'https://maps.google.com/?q=MIMS+Kannur' }
        ],
        'Palakkad': [
            { name: 'Government Medical College Palakkad', type: 'Government', address: 'Palakkad', specialties: ['Multi-speciality'], phone: '0491-2505005', maps: 'https://maps.google.com/?q=Government+Medical+College+Palakkad' },
            { name: 'Vinayaka Mission Hospital', type: 'Private', address: 'Palakkad', specialties: ['General Surgery', 'OBG'], phone: '0491-2510000', maps: 'https://maps.google.com/?q=Vinayaka+Mission+Hospital+Palakkad' }
        ],
        'Malappuram': [
            { name: 'Government Medical College Malappuram', type: 'Government', address: 'Manjeri, Malappuram', specialties: ['Multi-speciality'], phone: '0483-2762100', maps: 'https://maps.google.com/?q=Government+Medical+College+Malappuram' },
            { name: 'MES Medical College', type: 'Private', address: 'Perinthalmanna, Malappuram', specialties: ['General Medicine'], phone: '04933-224400', maps: 'https://maps.google.com/?q=MES+Medical+College+Malappuram' }
        ],
        'Kottayam': [
            { name: 'Government Medical College Kottayam', type: 'Government', address: 'Gandhinagar, Kottayam', specialties: ['Multi-speciality'], phone: '0481-2597755', maps: 'https://maps.google.com/?q=Government+Medical+College+Kottayam' },
            { name: 'Pushpagiri Medical College', type: 'Private', address: 'Tiruvalla, Kottayam', specialties: ['Cardiology', 'Gastroenterology'], phone: '0469-2700099', maps: 'https://maps.google.com/?q=Pushpagiri+Medical+College+Tiruvalla' }
        ],
        'Kollam': [
            { name: 'Government District Hospital Kollam', type: 'Government', address: 'Kollam', specialties: ['General Medicine'], phone: '0474-2745454', maps: 'https://maps.google.com/?q=Government+District+Hospital+Kollam' },
            { name: 'Travancore Medical College', type: 'Private', address: 'Kollam', specialties: ['Multi-speciality'], phone: '0474-2706000', maps: 'https://maps.google.com/?q=Travancore+Medical+College+Kollam' }
        ],
        'Alappuzha': [
            { name: 'Government Medical College Alappuzha', type: 'Government', address: 'Alappuzha', specialties: ['Multi-speciality'], phone: '0477-2272010', maps: 'https://maps.google.com/?q=Government+Medical+College+Alappuzha' },
            { name: 'SUT Hospital Alappuzha', type: 'Private', address: 'Alappuzha', specialties: ['Cardiology', 'Orthopaedics'], phone: '0477-2239090', maps: 'https://maps.google.com/?q=SUT+Hospital+Alappuzha' }
        ],
        'Idukki': [
            { name: 'Government District Hospital Idukki', type: 'Government', address: 'Painavu, Idukki', specialties: ['General Medicine'], phone: '04862-232275', maps: 'https://maps.google.com/?q=Government+District+Hospital+Idukki' }
        ],
        'Pathanamthitta': [
            { name: 'Government District Hospital Pathanamthitta', type: 'Government', address: 'Pathanamthitta', specialties: ['General Medicine'], phone: '0468-2222223', maps: 'https://maps.google.com/?q=Government+District+Hospital+Pathanamthitta' }
        ],
        'Wayanad': [
            { name: 'Government Medical College Wayanad', type: 'Government', address: 'Mananthavady, Wayanad', specialties: ['General Medicine', 'Surgery'], phone: '04935-240300', maps: 'https://maps.google.com/?q=Government+Medical+College+Wayanad' }
        ],
        'Kasaragod': [
            { name: 'Government District Hospital Kasaragod', type: 'Government', address: 'Kasaragod', specialties: ['General Medicine'], phone: '04994-222151', maps: 'https://maps.google.com/?q=Government+District+Hospital+Kasaragod' }
        ]
    };

    /* ----------------------------------------------------------
       INIT — set default severity display
    ---------------------------------------------------------- */
    if (severityValue && severitySlider) {
        severityValue.textContent = severitySlider.value;
    }

});