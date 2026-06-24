// ===========================
// PINPOINT DASHBOARD — RENDERING ENGINE (Centered Layout)
// ===========================

document.addEventListener('DOMContentLoaded', () => {
    renderPinpointDashboard();
    initializeHospitalFinder();
});

// Suggested follow-up tests by disease category/name
const SUGGESTED_TESTS = {
    'Dengue Fever': [
        { icon: '🩸', text: 'NS1 Antigen Test — confirms active Dengue infection' },
        { icon: '🧪', text: 'Dengue IgM/IgG Antibody Test — detects immune response' },
        { icon: '📊', text: 'Serial Platelet Count — monitor every 24h for trends' },
        { icon: '🔬', text: 'Liver Function Test (LFT) — check for hepatic involvement' }
    ],
    'Anemia': [
        { icon: '🩸', text: 'Peripheral Blood Smear — classify the type of anemia' },
        { icon: '🧪', text: 'Serum Iron + Ferritin + TIBC — iron deficiency panel' },
        { icon: '💊', text: 'Vitamin B12 & Folate Levels — rule out megaloblastic anemia' },
        { icon: '📊', text: 'Reticulocyte Count — assess bone marrow response' }
    ],
    'Pneumonia': [
        { icon: '🫁', text: 'Chest X-Ray (PA view) — confirm lung consolidation' },
        { icon: '🧪', text: 'Sputum Culture & Sensitivity — identify pathogen' },
        { icon: '🩸', text: 'Procalcitonin Level — differentiate bacterial vs viral' },
        { icon: '📊', text: 'Pulse Oximetry — monitor oxygen saturation' }
    ],
    'COVID-19': [
        { icon: '🧬', text: 'RT-PCR Test — gold standard for active infection' },
        { icon: '🫁', text: 'HRCT Chest — assess lung involvement severity' },
        { icon: '🩸', text: 'D-Dimer & Ferritin — monitor inflammatory storm markers' },
        { icon: '📊', text: 'SpO2 Monitoring — track oxygen levels continuously' }
    ],
    'Diabetes Complication (Hyperglycemia)': [
        { icon: '🩸', text: 'HbA1c — 3-month average blood glucose measure' },
        { icon: '🧪', text: 'Fasting & Post-Prandial Glucose — confirm diagnosis' },
        { icon: '💊', text: 'Kidney Function Test (KFT) — check diabetic nephropathy' },
        { icon: '👁️', text: 'Fundoscopy — screen for diabetic retinopathy' }
    ],
    'Influenza (Flu)': [
        { icon: '🧬', text: 'Rapid Influenza Diagnostic Test (RIDT)' },
        { icon: '🫁', text: 'Chest X-Ray — if pneumonia is suspected' },
        { icon: '🩸', text: 'CBC with Differential — monitor WBC trends' }
    ],
    '_default': [
        { icon: '🩸', text: 'Complete Blood Count (CBC) with Differential' },
        { icon: '🧪', text: 'Comprehensive Metabolic Panel (CMP)' },
        { icon: '📊', text: 'C-Reactive Protein (CRP) — inflammation marker' },
        { icon: '🔬', text: 'Consult specialist for condition-specific investigations' }
    ]
};

function renderPinpointDashboard() {
    const dataJSON = sessionStorage.getItem('pinpointResults');
    if (!dataJSON) {
        window.location.href = 'index.html';
        return;
    }

    let data;
    try {
        data = JSON.parse(dataJSON);
    } catch (e) {
        window.location.href = 'index.html';
        return;
    }

    if (!data.success || !data.pinpointedResults || data.pinpointedResults.length === 0) {
        window.location.href = 'results.html';
        return;
    }

    const topDisease = data.pinpointedResults[0];
    const vitals = data.vitalsDisplay || [];
    const verification = data.verification || {};

    renderMeta(verification);
    renderHero(topDisease);
    animateConfidence(topDisease.confidence || 0);
    renderPrecautions(topDisease);
    renderSuggestedTests(topDisease);
    renderVitalsTable(vitals, topDisease.logic || '');
}

// ===========================
// META TAGS
// ===========================
function renderMeta(verification) {
    document.getElementById('lab-name-tag').innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
        ${verification.labName || 'Private Laboratory'}
    `;
    document.getElementById('report-date-tag').innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        ${formatDate(verification.dateFound)}
    `;
    if (verification.isRecent === false) {
        const tag = document.getElementById('recency-tag');
        tag.textContent = verification.recencyNote || 'Historical Data';
        tag.style.display = 'flex';
    }
}

// ===========================
// HERO SECTION
// ===========================
function renderHero(disease) {
    document.getElementById('disease-name').textContent = (disease.disease || 'Unknown').toUpperCase();
    document.getElementById('disease-category').textContent = disease.category || 'Clinical Finding';

    const urgencyBadge = document.getElementById('urgency-badge');
    const urgency = (disease.urgency || 'Low').toLowerCase();
    urgencyBadge.textContent = urgency.toUpperCase();
    urgencyBadge.className = `urgency-badge urgency-${urgency}`;

    // Change gradient color based on urgency
    const svg = document.getElementById('confidence-svg');
    const gradient = svg.querySelector('#progressGradient');
    const ring = document.getElementById('confidence-bar');

    if (urgency === 'high') {
        gradient.innerHTML = `<stop offset="0%" style="stop-color:#E74C3C;stop-opacity:1"/><stop offset="100%" style="stop-color:#c0392b;stop-opacity:1"/>`;
        ring.style.filter = 'drop-shadow(0 0 14px rgba(231, 76, 60, 0.4))';
    } else if (urgency === 'medium') {
        gradient.innerHTML = `<stop offset="0%" style="stop-color:#F39C12;stop-opacity:1"/><stop offset="100%" style="stop-color:#e67e22;stop-opacity:1"/>`;
        ring.style.filter = 'drop-shadow(0 0 14px rgba(243, 156, 18, 0.4))';
    }

    // Why box
    const whyText = disease.logic
        ? `The engine increased confidence in ${disease.disease} to ${disease.confidence}% because: ${disease.logic}`
        : 'No specific clinical reasoning available.';
    document.getElementById('logic-text').textContent = whyText;
}

// ===========================
// SVG CIRCULAR PROGRESS
// ===========================
function animateConfidence(targetPct) {
    const circle = document.getElementById('confidence-bar');
    const text = document.getElementById('confidence-pct');
    const circumference = 2 * Math.PI * 52;
    const offset = circumference - (targetPct / 100) * circumference;

    setTimeout(() => { circle.style.strokeDashoffset = offset; }, 150);

    const duration = 1800;
    const startTime = performance.now();

    function tick(now) {
        const p = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        text.textContent = Math.floor(eased * targetPct);
        if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}

// ===========================
// PRECAUTIONS (LARGE)
// ===========================
function renderPrecautions(disease) {
    const list = document.getElementById('precautions-list');
    const precautions = disease.precautions || ['Consult a healthcare professional'];
    const icons = ['💧', '🩺', '⚠️', '🛏️', '💊', '🍎'];

    list.innerHTML = precautions.map((p, i) => `
        <li>
            <span class="precaution-icon">${icons[i % icons.length]}</span>
            <span>${p}</span>
        </li>
    `).join('');
}

// ===========================
// SUGGESTED TESTS
// ===========================
function renderSuggestedTests(disease) {
    const list = document.getElementById('tests-list');
    const tests = SUGGESTED_TESTS[disease.disease] || SUGGESTED_TESTS['_default'];

    list.innerHTML = tests.map(t => `
        <li>
            <span class="test-icon">${t.icon}</span>
            <span>${t.text}</span>
        </li>
    `).join('');
}

// ===========================
// VITALS TABLE + RED HIGHLIGHTING
// ===========================
function renderVitalsTable(vitals, logicText) {
    const tbody = document.getElementById('vitals-body');

    if (!vitals || vitals.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="loading-cell">No biomarkers extracted.</td></tr>`;
        return;
    }

    const logicLower = logicText.toLowerCase();

    tbody.innerHTML = vitals.map(v => {
        const markerLower = v.marker.toLowerCase();
        const isPinpointer = logicLower.includes(markerLower) ||
                             (v.status !== 'Normal' && logicLower.includes(v.status.toLowerCase()));

        return `
            <tr class="${isPinpointer ? 'pinpoint-row' : ''}">
                <td><span class="${isPinpointer ? 'marker-name pinpoint-marker' : 'marker-name'}">${v.marker}</span></td>
                <td><span class="${isPinpointer ? 'marker-val pinpoint-val' : 'marker-val'}">${v.value} ${v.unit || ''}</span></td>
                <td><span class="marker-range">${v.range || 'N/A'}</span></td>
                <td><span class="status-tag status-${v.status.toLowerCase()}">${v.status}</span></td>
            </tr>
        `;
    }).join('');
}

// ===========================
// HELPERS
// ===========================
function formatDate(dateStr) {
    if (!dateStr || dateStr === 'Unknown') return 'Unknown Date';
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
        return dateStr;
    }
}

// ===========================
// KERALA HOSPITAL DATABASE
// ===========================
const KERALA_HOSPITALS = {
    thiruvananthapuram: [
        {
            name: "Sree Chitra Tirunal Institute (SCTIMST)",
            type: "govt",
            address: "Medical College P.O., Thiruvananthapuram, Kerala 695011",
            phone: "+914712524600",
            phoneDisplay: "0471-2524600",
            website: "https://www.sctimst.ac.in",
            lat: 8.5241, lng: 76.9366,
            specialties: ["Cardiology", "Neurology", "Imaging"]
        },
        {
            name: "KIMS Hospital",
            type: "private",
            address: "1, Anayara P.O., Thiruvananthapuram, Kerala 695029",
            phone: "+914713041000",
            phoneDisplay: "0471-3041000",
            website: "https://www.kimsglobal.com",
            lat: 8.4875, lng: 76.9525,
            specialties: ["Multi-Specialty", "Oncology", "Transplants"]
        },
        {
            name: "Government Medical College Hospital",
            type: "govt",
            address: "Medical College P.O., Thiruvananthapuram, Kerala 695011",
            phone: "+914712528386",
            phoneDisplay: "0471-2528386",
            website: "https://www.tvmmedcol.ac.in",
            lat: 8.5232, lng: 76.9360,
            specialties: ["General Medicine", "Surgery", "Emergency"]
        },
        {
            name: "SUT Royal Hospital",
            type: "private",
            address: "Pattom, Thiruvananthapuram, Kerala 695004",
            phone: "+914712447575",
            phoneDisplay: "0471-2447575",
            website: "https://www.suthospital.com",
            lat: 8.5189, lng: 76.9563,
            specialties: ["Ortho", "Cardiology", "Nephrology"]
        }
    ],
    kollam: [
        {
            name: "Bishop Benziger Hospital",
            type: "charitable",
            address: "Beach Road, Kollam, Kerala 691001",
            phone: "+914742743000",
            phoneDisplay: "0474-2743000",
            website: "https://www.bbhkollam.com",
            lat: 8.8884, lng: 76.5999,
            specialties: ["Cardiology", "Oncology", "Orthopaedics"]
        },
        {
            name: "District Hospital Kollam",
            type: "govt",
            address: "Chinnakada, Kollam, Kerala 691001",
            phone: "+914742794500",
            phoneDisplay: "0474-2794500",
            website: "https://kollam.nic.in",
            lat: 8.8880, lng: 76.5832,
            specialties: ["General Medicine", "Emergency", "Surgery"]
        },
        {
            name: "Holy Cross Hospital",
            type: "charitable",
            address: "Kottiyam, Kollam, Kerala 691571",
            phone: "+914742452340",
            phoneDisplay: "0474-2452340",
            website: "https://www.holycrosskollam.com",
            lat: 8.8593, lng: 76.6262,
            specialties: ["Gynecology", "Pediatrics", "General Medicine"]
        },
        {
            name: "Azeezia Medical College Hospital",
            type: "private",
            address: "Meeyannoor, Kollam, Kerala 691537",
            phone: "+914742814200",
            phoneDisplay: "0474-2814200",
            website: "https://www.azeeziamedicalcollege.com",
            lat: 8.8667, lng: 76.6478,
            specialties: ["Multi-Specialty", "Neurology", "Cardiology"]
        }
    ],
    pathanamthitta: [
        {
            name: "General Hospital Pathanamthitta",
            type: "govt",
            address: "Pathanamthitta, Kerala 689645",
            phone: "+914682222340",
            phoneDisplay: "0468-2222340",
            website: "https://pathanamthitta.nic.in",
            lat: 9.2648, lng: 76.7870,
            specialties: ["General Medicine", "Surgery", "Emergency"]
        },
        {
            name: "Pushpagiri Medical College Hospital",
            type: "private",
            address: "Thiruvalla, Pathanamthitta, Kerala 689107",
            phone: "+914692572100",
            phoneDisplay: "0469-2572100",
            website: "https://www.pushpagiri.in",
            lat: 9.3831, lng: 76.5746,
            specialties: ["Cardiology", "Neurosurgery", "Ortho"]
        },
        {
            name: "Believers Church Medical College",
            type: "private",
            address: "Thiruvalla, Pathanamthitta, Kerala 689103",
            phone: "+914692631100",
            phoneDisplay: "0469-2631100",
            website: "https://www.bcmch.ac.in",
            lat: 9.3859, lng: 76.5750,
            specialties: ["Multi-Specialty", "Oncology", "Pediatrics"]
        },
        {
            name: "Malankara Orthodox Syrian Church Hospital",
            type: "charitable",
            address: "Kolenchery, Pathanamthitta, Kerala 682311",
            phone: "+914842763000",
            phoneDisplay: "0484-2763000",
            website: "https://www.moschospital.org",
            lat: 9.3862, lng: 76.5803,
            specialties: ["General Medicine", "Gynecology", "Dermatology"]
        }
    ],
    alappuzha: [
        {
            name: "Vandanam Medical College Hospital",
            type: "govt",
            address: "Vandanam, Alappuzha, Kerala 688003",
            phone: "+914772282458",
            phoneDisplay: "0477-2282458",
            website: "https://alappuzha.nic.in",
            lat: 9.4900, lng: 76.3385,
            specialties: ["General Medicine", "Surgery", "Pediatrics"]
        },
        {
            name: "Lourdes Hospital",
            type: "charitable",
            address: "Mararikulam, Alappuzha, Kerala 688522",
            phone: "+914782863100",
            phoneDisplay: "0478-2863100",
            website: "https://www.lourdeshospitalalp.com",
            lat: 9.5256, lng: 76.3503,
            specialties: ["Cardiology", "Orthopaedics", "Neurology"]
        },
        {
            name: "District Hospital Alappuzha",
            type: "govt",
            address: "SMSM Road, Alappuzha, Kerala 688001",
            phone: "+914772253944",
            phoneDisplay: "0477-2253944",
            website: "https://alappuzha.nic.in",
            lat: 9.4940, lng: 76.3380,
            specialties: ["Emergency", "General Medicine", "Surgery"]
        },
        {
            name: "St. George Hospital",
            type: "private",
            address: "Alappuzha Town, Kerala 688001",
            phone: "+914772251189",
            phoneDisplay: "0477-2251189",
            website: "https://www.stgeorgealp.com",
            lat: 9.4981, lng: 76.3383,
            specialties: ["Multi-Specialty", "Gynecology", "ENT"]
        }
    ],
    kottayam: [
        {
            name: "Government Medical College Kottayam",
            type: "govt",
            address: "Gandhinagar P.O., Kottayam, Kerala 686008",
            phone: "+914812597311",
            phoneDisplay: "0481-2597311",
            website: "https://www.gmcktm.ac.in",
            lat: 9.5760, lng: 76.5260,
            specialties: ["General Medicine", "Surgery", "Neurology"]
        },
        {
            name: "Caritas Hospital",
            type: "charitable",
            address: "Thellakom, Kottayam, Kerala 686016",
            phone: "+914812790025",
            phoneDisplay: "0481-2790025",
            website: "https://www.caritashospital.org",
            lat: 9.5599, lng: 76.5314,
            specialties: ["Cardiology", "Oncology", "Nephrology"]
        },
        {
            name: "Kottayam Medical Center",
            type: "private",
            address: "Nagampadam, Kottayam, Kerala 686001",
            phone: "+914812560424",
            phoneDisplay: "0481-2560424",
            website: "https://www.kmchospital.in",
            lat: 9.5813, lng: 76.5214,
            specialties: ["Multi-Specialty", "Orthopaedics", "ENT"]
        },
        {
            name: "Mar Sleeva Medicity",
            type: "private",
            address: "Cherpunkal, Pala, Kottayam, Kerala 686584",
            phone: "+914822296800",
            phoneDisplay: "0482-2296800",
            website: "https://www.marsleeva.com",
            lat: 9.6982, lng: 76.6862,
            specialties: ["Cardiology", "Neurosurgery", "Transplants"]
        }
    ],
    idukki: [
        {
            name: "District Hospital Thodupuzha",
            type: "govt",
            address: "Thodupuzha, Idukki, Kerala 685584",
            phone: "+914862222538",
            phoneDisplay: "0486-2222538",
            website: "https://idukki.nic.in",
            lat: 9.8953, lng: 76.7112,
            specialties: ["General Medicine", "Emergency", "Surgery"]
        },
        {
            name: "St. John's Hospital Kattappana",
            type: "charitable",
            address: "Kattappana, Idukki, Kerala 685515",
            phone: "+914868272173",
            phoneDisplay: "0486-8272173",
            website: "https://www.stjohnskattappana.com",
            lat: 9.7580, lng: 77.0805,
            specialties: ["Multi-Specialty", "Orthopaedics", "Pediatrics"]
        },
        {
            name: "Mount Zion Medical College",
            type: "private",
            address: "Chayalode, Adoor, Idukki, Kerala 685602",
            phone: "+914862235456",
            phoneDisplay: "0486-2235456",
            website: "https://www.mountzionmedicalcollege.com",
            lat: 9.9210, lng: 76.7350,
            specialties: ["General Medicine", "Surgery", "Gynecology"]
        },
        {
            name: "Tata Tea General Hospital",
            type: "private",
            address: "Munnar, Idukki, Kerala 685612",
            phone: "+914868230228",
            phoneDisplay: "0486-8230228",
            website: "https://www.tatateaplantations.com",
            lat: 10.0889, lng: 77.0595,
            specialties: ["Occupational Health", "General Medicine", "Emergency"]
        }
    ],
    ernakulam: [
        {
            name: "Amrita Hospital (AIMS)",
            type: "private",
            address: "AIMS Ponekkara P.O., Kochi, Kerala 682041",
            phone: "+914842851234",
            phoneDisplay: "0484-2851234",
            website: "https://www.amritahospitals.org",
            lat: 10.0300, lng: 76.3100,
            specialties: ["Multi-Specialty", "Transplants", "Oncology"]
        },
        {
            name: "Lakeshore Hospital",
            type: "private",
            address: "Nettoor, Maradu, Kochi, Kerala 682040",
            phone: "+914842701032",
            phoneDisplay: "0484-2701032",
            website: "https://www.lakeshorehospital.com",
            lat: 9.9450, lng: 76.3127,
            specialties: ["Cardiology", "Neurology", "Nephrology"]
        },
        {
            name: "Government Medical College Ernakulam",
            type: "govt",
            address: "HMT Colony, Kalamassery, Kerala 683503",
            phone: "+914842532386",
            phoneDisplay: "0484-2532386",
            website: "https://gmcernakulam.in",
            lat: 10.0536, lng: 76.3180,
            specialties: ["General Medicine", "Surgery", "Emergency"]
        },
        {
            name: "Lisie Hospital",
            type: "charitable",
            address: "Lisie Junction, Kochi, Kerala 682018",
            phone: "+914842402044",
            phoneDisplay: "0484-2402044",
            website: "https://www.lisiehospital.org",
            lat: 9.9918, lng: 76.2932,
            specialties: ["Cardiology", "Orthopaedics", "Gastroenterology"]
        }
    ],
    thrissur: [
        {
            name: "Amala Institute of Medical Sciences",
            type: "charitable",
            address: "Amala Nagar, Thrissur, Kerala 680555",
            phone: "+914872304170",
            phoneDisplay: "0487-2304170",
            website: "https://www.amalahospital.com",
            lat: 10.5497, lng: 76.1908,
            specialties: ["Oncology", "Cardiology", "Gastroenterology"]
        },
        {
            name: "Government Medical College Thrissur",
            type: "govt",
            address: "Mulamkunnathukavu, Thrissur, Kerala 680596",
            phone: "+914872200310",
            phoneDisplay: "0487-2200310",
            website: "https://www.gmcthrissur.in",
            lat: 10.5403, lng: 76.1884,
            specialties: ["General Medicine", "Surgery", "Pediatrics"]
        },
        {
            name: "Jubilee Mission Medical College",
            type: "charitable",
            address: "Bishop Alappatt Road, Thrissur, Kerala 680005",
            phone: "+914872432370",
            phoneDisplay: "0487-2432370",
            website: "https://www.jubileemission.org",
            lat: 10.5241, lng: 76.2091,
            specialties: ["Multi-Specialty", "Nephrology", "Neurology"]
        },
        {
            name: "Elite Mission Hospital",
            type: "private",
            address: "Shornur Road, Thrissur, Kerala 680001",
            phone: "+914872440640",
            phoneDisplay: "0487-2440640",
            website: "https://www.elitemissionhospital.com",
            lat: 10.5220, lng: 76.2150,
            specialties: ["Orthopaedics", "Cardiology", "Urology"]
        }
    ],
    palakkad: [
        {
            name: "District Hospital Palakkad",
            type: "govt",
            address: "Nannucode, Palakkad, Kerala 678001",
            phone: "+914912522640",
            phoneDisplay: "0491-2522640",
            website: "https://palakkad.nic.in",
            lat: 10.7781, lng: 76.6496,
            specialties: ["General Medicine", "Emergency", "Surgery"]
        },
        {
            name: "Karuna Medical College Hospital",
            type: "private",
            address: "Vilayodi, Chittur, Palakkad, Kerala 678103",
            phone: "+914922262444",
            phoneDisplay: "0492-2262444",
            website: "https://www.karunamedicalcollege.com",
            lat: 10.6892, lng: 76.7402,
            specialties: ["Multi-Specialty", "Oncology", "Pediatrics"]
        },
        {
            name: "NIMS Hospital Palakkad",
            type: "private",
            address: "Chandranagar, Palakkad, Kerala 678007",
            phone: "+914912532300",
            phoneDisplay: "0491-2532300",
            website: "https://nimspalakkad.com",
            lat: 10.7780, lng: 76.6532,
            specialties: ["Cardiology", "Neurology", "Nephrology"]
        },
        {
            name: "EMS Memorial Co-operative Hospital",
            type: "charitable",
            address: "Perinthalmanna Road, Palakkad, Kerala 678001",
            phone: "+914912534600",
            phoneDisplay: "0491-2534600",
            website: "https://www.emshospital.com",
            lat: 10.7756, lng: 76.6510,
            specialties: ["General Medicine", "Surgery", "Gynaecology"]
        }
    ],
    malappuram: [
        {
            name: "MES Medical College Hospital",
            type: "private",
            address: "Palachode, Perinthalmanna, Malappuram, Kerala 679322",
            phone: "+914933227600",
            phoneDisplay: "0493-3227600",
            website: "https://www.mesmedicalcollege.com",
            lat: 10.9649, lng: 76.2298,
            specialties: ["Multi-Specialty", "Cardiology", "Surgery"]
        },
        {
            name: "District Hospital Manjeri",
            type: "govt",
            address: "Manjeri, Malappuram, Kerala 676121",
            phone: "+914832763314",
            phoneDisplay: "0483-2763314",
            website: "https://malappuram.nic.in",
            lat: 11.1193, lng: 76.1155,
            specialties: ["General Medicine", "Emergency", "Pediatrics"]
        },
        {
            name: "Al Shifa Hospital",
            type: "private",
            address: "Kizhuparamba, Perinthalmanna, Malappuram, Kerala 679322",
            phone: "+914933226300",
            phoneDisplay: "0493-3226300",
            website: "https://www.alshifahospital.com",
            lat: 10.9764, lng: 76.2180,
            specialties: ["Orthopaedics", "Neurosurgery", "Oncology"]
        },
        {
            name: "IQRAA International Hospital",
            type: "private",
            address: "Calicut Road, Tirur, Malappuram, Kerala 676101",
            phone: "+914942430400",
            phoneDisplay: "0494-2430400",
            website: "https://www.iqraahospitals.com",
            lat: 10.9128, lng: 75.9215,
            specialties: ["Cardiology", "Gastroenterology", "Nephrology"]
        }
    ],
    kozhikode: [
        {
            name: "Government Medical College Kozhikode",
            type: "govt",
            address: "Medical College P.O., Kozhikode, Kerala 673008",
            phone: "+914952350216",
            phoneDisplay: "0495-2350216",
            website: "https://www.govtmedicalcollegecalicut.ac.in",
            lat: 11.2588, lng: 75.7804,
            specialties: ["General Medicine", "Surgery", "Emergency"]
        },
        {
            name: "Baby Memorial Hospital",
            type: "private",
            address: "Indira Gandhi Road, Kozhikode, Kerala 673004",
            phone: "+914952723272",
            phoneDisplay: "0495-2723272",
            website: "https://www.babymemorial.org",
            lat: 11.2560, lng: 75.7804,
            specialties: ["Multi-Specialty", "Oncology", "Transplants"]
        },
        {
            name: "MIMS Hospital",
            type: "private",
            address: "Mini Bypass Road, Govindapuram, Kozhikode, Kerala 673016",
            phone: "+914952410410",
            phoneDisplay: "0495-2410410",
            website: "https://www.mimshospital.com",
            lat: 11.2700, lng: 75.8160,
            specialties: ["Cardiology", "Neurology", "Nephrology"]
        },
        {
            name: "Aster MIMS Calicut",
            type: "private",
            address: "Govindapuram, Kozhikode, Kerala 673016",
            phone: "+914952410415",
            phoneDisplay: "0495-2410415",
            website: "https://www.asterhospitals.in",
            lat: 11.2700, lng: 75.8165,
            specialties: ["Orthopaedics", "Gastroenterology", "Urology"]
        }
    ],
    wayanad: [
        {
            name: "District Hospital Kalpetta",
            type: "govt",
            address: "Kalpetta, Wayanad, Kerala 673121",
            phone: "+914936202340",
            phoneDisplay: "0493-6202340",
            website: "https://wayanad.nic.in",
            lat: 11.6180, lng: 76.0829,
            specialties: ["General Medicine", "Emergency", "Surgery"]
        },
        {
            name: "Wayanad Institute of Medical Sciences (WIMS)",
            type: "private",
            address: "Naseera Nagar, Meppadi, Wayanad, Kerala 673577",
            phone: "+914936287287",
            phoneDisplay: "0493-6287287",
            website: "https://www.wimsindia.com",
            lat: 11.5700, lng: 76.1209,
            specialties: ["Multi-Specialty", "Cardiology", "Orthopaedics"]
        },
        {
            name: "DM Wayanad Institute of Medical Sciences",
            type: "private",
            address: "Meppadi, Wayanad, Kerala 673577",
            phone: "+914936286100",
            phoneDisplay: "0493-6286100",
            website: "https://www.dmwims.com",
            lat: 11.5588, lng: 76.1030,
            specialties: ["Neurology", "Oncology", "Nephrology"]
        },
        {
            name: "Co-operative Hospital Kalpetta",
            type: "charitable",
            address: "Kalpetta, Wayanad, Kerala 673121",
            phone: "+914936204234",
            phoneDisplay: "0493-6204234",
            website: "https://www.coophospitalkalpetta.com",
            lat: 11.6160, lng: 76.0810,
            specialties: ["General Medicine", "Pediatrics", "Gynecology"]
        }
    ],
    kannur: [
        {
            name: "Government Medical College Kannur (Pariyaram)",
            type: "govt",
            address: "Pariyaram, Kannur, Kerala 670503",
            phone: "+914972808200",
            phoneDisplay: "0497-2808200",
            website: "https://www.pariyarammedicalcollege.ac.in",
            lat: 11.9270, lng: 75.3690,
            specialties: ["General Medicine", "Surgery", "Neurology"]
        },
        {
            name: "AKG Memorial Hospital",
            type: "charitable",
            address: "Thalassery Road, Kannur, Kerala 670002",
            phone: "+914972700300",
            phoneDisplay: "0497-2700300",
            website: "https://www.akgmemorial.com",
            lat: 11.8685, lng: 75.3705,
            specialties: ["Cardiology", "Orthopaedics", "Gastroenterology"]
        },
        {
            name: "Aster MIMS Kannur",
            type: "private",
            address: "Chala, Kannur, Kerala 670621",
            phone: "+914972841233",
            phoneDisplay: "0497-2841233",
            website: "https://www.asterhospitals.in",
            lat: 11.8684, lng: 75.3700,
            specialties: ["Multi-Specialty", "Oncology", "Transplants"]
        },
        {
            name: "Indira Gandhi Co-operative Hospital",
            type: "charitable",
            address: "South Bazaar, Thalassery, Kannur, Kerala 670101",
            phone: "+914902344311",
            phoneDisplay: "0490-2344311",
            website: "https://www.igcoophospital.com",
            lat: 11.7489, lng: 75.4923,
            specialties: ["General Medicine", "Nephrology", "Pediatrics"]
        }
    ],
    kasaragod: [
        {
            name: "District Hospital Kasaragod",
            type: "govt",
            address: "Vidyanagar, Kasaragod, Kerala 671121",
            phone: "+914994256220",
            phoneDisplay: "0499-4256220",
            website: "https://kasaragod.nic.in",
            lat: 12.4996, lng: 74.9869,
            specialties: ["General Medicine", "Emergency", "Surgery"]
        },
        {
            name: "Mercy Hospital Kasaragod",
            type: "charitable",
            address: "Kasaragod Town, Kerala 671121",
            phone: "+914994220780",
            phoneDisplay: "0499-4220780",
            website: "https://www.mercyhospitalksd.com",
            lat: 12.5005, lng: 74.9872,
            specialties: ["Multi-Specialty", "Cardiology", "Orthopaedics"]
        },
        {
            name: "Al Arif Hospital",
            type: "private",
            address: "Kanhangad, Kasaragod, Kerala 671315",
            phone: "+914672206667",
            phoneDisplay: "0467-2206667",
            website: "https://www.alarifhospital.com",
            lat: 12.3086, lng: 75.0841,
            specialties: ["General Medicine", "Gynecology", "Pediatrics"]
        },
        {
            name: "SNR District Co-operative Hospital",
            type: "charitable",
            address: "Kanhangad, Kasaragod, Kerala 671315",
            phone: "+914672203555",
            phoneDisplay: "0467-2203555",
            website: "https://www.snrhospital.com",
            lat: 12.3140, lng: 75.0870,
            specialties: ["Surgery", "ENT", "Dermatology"]
        }
    ]
};

// ===========================
// HOSPITAL FINDER LOGIC
// ===========================
function initializeHospitalFinder() {
    const districtSelect = document.getElementById('district-select');
    if (!districtSelect) return;

    districtSelect.addEventListener('change', (e) => {
        const district = e.target.value;
        renderHospitalCards(district);
    });
}

function renderHospitalCards(district) {
    const container = document.getElementById('hospital-cards');
    if (!container) return;

    container.innerHTML = '';

    if (!district || !KERALA_HOSPITALS[district]) {
        container.innerHTML = `
            <div class="hospital-placeholder" id="hospital-placeholder">
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="opacity:0.3">
                    <path d="M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 7v4M10 9h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                <p>Select a district above to view top hospitals</p>
            </div>
        `;
        return;
    }

    const hospitals = KERALA_HOSPITALS[district];

    hospitals.forEach((hospital, index) => {
        const card = document.createElement('div');
        card.className = 'hospital-card';

        const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}`;
        const callUrl = `tel:${hospital.phone}`;
        const websiteUrl = hospital.website;

        card.innerHTML = `
            <div class="hospital-rank">${index + 1}</div>
            <div class="hospital-name">${hospital.name}</div>
            <span class="hospital-type ${hospital.type}">${hospital.type === 'govt' ? 'Government' : hospital.type === 'private' ? 'Private' : 'Charitable'}</span>
            <div class="hospital-address">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="9" r="2" stroke="currentColor" stroke-width="2"/></svg>
                <span>${hospital.address}</span>
            </div>
            <div class="hospital-specialties">
                ${hospital.specialties.map(s => `<span class="specialty-badge">${s}</span>`).join('')}
            </div>
            <div class="hospital-actions">
                <a href="${websiteUrl}" target="_blank" rel="noopener noreferrer" class="action-btn website-btn" title="Visit Website">
                    <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z" stroke="currentColor" stroke-width="2"/></svg>
                    <span class="action-label">Website</span>
                </a>
                <a href="${callUrl}" class="action-btn call-btn" title="Call ${hospital.phoneDisplay}">
                    <svg viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    <span class="action-label">${hospital.phoneDisplay}</span>
                </a>
                <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="action-btn directions-btn" title="Get Directions">
                    <svg viewBox="0 0 24 24" fill="none"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    <span class="action-label">Directions</span>
                </a>
            </div>
        `;

        container.appendChild(card);
    });
}
