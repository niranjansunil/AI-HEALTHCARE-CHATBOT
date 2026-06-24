// ===========================
// EXPRESS SERVER
// ===========================
// Backend API for AI Healthcare Assistant

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const https = require('https');
const DiagnosisEngine = require('./diagnosisEngine');
const diseaseDatabase = require('./diseaseDatabase');

const app = express();
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// Initialize diagnosis engine
const diagnosisEngine = new DiagnosisEngine();

// ===========================
// BIOMARKER ALIAS MAPPING
// ===========================
// Canonical name → list of aliases found in lab reports
const BIOMARKER_ALIASES = {
    'Hemoglobin':    ['hgb', 'hb', 'haemoglobin', 'hemoglobin', 'hgb.', 'h.g.b'],
    'WBC Count':     ['wbc', 'white blood cells', 'leukocytes', 'white blood count', 'wbc count', 'total wbc', 'total leucocyte count', 'tlc'],
    'Blood Glucose': ['glucose', 'blood glucose', 'fasting glucose', 'rbs', 'fbs', 'blood sugar', 'plasma glucose', 'random glucose'],
    'Platelets':     ['plt', 'platelet', 'platelets', 'thrombocytes', 'platelet count'],
    'CRP':           ['crp', 'c-reactive protein', 'c reactive protein', 'hs-crp', 'hscrp'],
    'Neutrophils':   ['neutrophils', 'neutrophil', 'neut', 'neutro', 'segmented neutrophils', 'polymorphs'],
    'Lymphocytes':   ['lymphocytes', 'lymphocyte', 'lymph', 'lympho']
};

// Standard reference ranges for normalization
const REFERENCE_RANGES = {
    'Hemoglobin':    { low: 12.0, high: 17.5, unit: 'g/dL' },
    'WBC Count':     { low: 4000, high: 11000, unit: '/cumm' },
    'Blood Glucose': { low: 70,   high: 140,   unit: 'mg/dL' },
    'Platelets':     { low: 150000, high: 410000, unit: '/cumm' },
    'CRP':           { low: 0,    high: 10,    unit: 'mg/L' },
    'Neutrophils':   { low: 40,   high: 75,    unit: '%' },
    'Lymphocytes':   { low: 20,   high: 45,    unit: '%' }
};

/**
 * Normalize a raw marker name from an OCR/API result to a canonical name.
 */
function normalizeMarkerName(rawName) {
    const lower = rawName.toLowerCase().trim();
    for (const [canonical, aliases] of Object.entries(BIOMARKER_ALIASES)) {
        if (aliases.some(alias => lower.includes(alias) || alias.includes(lower))) {
            return canonical;
        }
    }
    return null; // Unknown marker — skip it
}

/**
 * Determine High/Low/Normal status from value and reference range.
 */
function determineStatus(canonicalName, value) {
    const range = REFERENCE_RANGES[canonicalName];
    if (!range) return 'Normal';
    if (value < range.low) return 'Low';
    if (value > range.high) return 'High';
    return 'Normal';
}

const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Call Gemini Vision API — Clinical Diagnostic Intelligence & OCR Validation Engine.
 */
async function callGeminiVision(base64Image, mimeType) {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const systemPrompt = `Role: You are a Clinical Diagnostic Intelligence & OCR Validation Engine.

Task 1: Validation & Recency
- Confirm the document is a professional laboratory report.
- Extract the laboratory name and the date of the report.

Task 2: Precision Extraction
Extract the following values and determine status based on the report's reference ranges:
- WBC (Total Leucocyte Count) — output as "WBC Count"
- Hemoglobin (Hb) — output as "Hemoglobin"  
- Platelets — output as "Platelets"
- Blood Glucose (Fasting/Random) — output as "Blood Glucose"
- CRP (C-Reactive Protein) — output as "CRP"
- Neutrophils — output as "Neutrophils"
- Lymphocytes — output as "Lymphocytes"

For WBC/Platelets: use absolute count (e.g., 8500, 150000). Do NOT use thousands notation.
For each marker, provide the numeric value, the unit, the reference range from the report, and status (High/Low/Normal).
Only include markers that are actually present in the report.

OUTPUT FORMAT (JSON ONLY — no markdown, no explanation):
{
  "verification": {
    "isValid": true,
    "labName": "Lab Name Here",
    "reportDate": "YYYY-MM-DD"
  },
  "markers": [
    { "name": "WBC Count", "value": 8500, "unit": "/cumm", "range": "4000 - 11000", "status": "Normal" },
    { "name": "Hemoglobin", "value": 10.2, "unit": "g/dL", "range": "12.0 - 17.5", "status": "Low" }
  ],
  "notes": "Any relevant clinical notes from the report"
}`;

    const result = await model.generateContent([
        systemPrompt,
        {
            inlineData: {
                data: base64Image,
                mimeType: mimeType
            }
        }
    ]);

    const response = await result.response;
    let text = response.text();
    
    // Clean markdown wrappers if present
    text = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    
    console.log('--- GEMINI CLINICAL ENGINE RESULT ---');
    console.log(text);
    console.log('-------------------------------------');

    try {
        return JSON.parse(text);
    } catch (parseErr) {
        console.error('JSON parse failed. Raw text:', text);
        // Try to extract JSON from the text
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error('Gemini returned non-JSON response: ' + text.substring(0, 200));
    }
}


// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Serve static files
app.use(express.static(__dirname));

// ===========================
// API ROUTES
// ===========================

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        message: 'AI Healthcare Assistant API is running',
        timestamp: new Date().toISOString()
    });
});

// Get all available symptoms
app.get('/api/symptoms', (req, res) => {
    const allSymptoms = new Set();

    diseaseDatabase.forEach(disease => {
        Object.keys(disease.symptoms).forEach(symptom => {
            allSymptoms.add(symptom);
        });
    });

    res.json({
        success: true,
        symptoms: Array.from(allSymptoms).sort(),
        count: allSymptoms.size
    });
});

// Get all diseases
app.get('/api/diseases', (req, res) => {

    const diseases = diseaseDatabase.map(disease => ({
        id: disease.id,
        name: disease.name,
        category: disease.category,
        description: disease.description,
        severity: disease.severity
    }));

    res.json({
        success: true,
        diseases: diseases,
        count: diseases.length
    });
});

// Main diagnosis endpoint
app.post('/api/diagnose', (req, res) => {
    try {
        const { symptoms, duration, severity, additionalInfo } = req.body;

        // Validation
        if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Symptoms array is required and must not be empty'
            });
        }

        if (!duration) {
            return res.status(400).json({
                success: false,
                error: 'Duration is required'
            });
        }

        if (severity === undefined || severity < 1 || severity > 10) {
            return res.status(400).json({
                success: false,
                error: 'Severity must be between 1 and 10'
            });
        }

        // Perform diagnosis
        const result = diagnosisEngine.diagnose(
            symptoms,
            duration,
            severity,
            additionalInfo || ''
        );

        res.json(result);

    } catch (error) {
        console.error('Diagnosis error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during diagnosis',
            message: error.message
        });
    }
});

// Get disease details by ID
app.get('/api/disease/:id', (req, res) => {
    const diseaseId = parseInt(req.params.id);

    const disease = diseaseDatabase.find(d => d.id === diseaseId);

    if (!disease) {
        return res.status(404).json({
            success: false,
            error: 'Disease not found'
        });
    }

    res.json({
        success: true,
        disease: disease
    });
});

// ===========================
// BLOOD REPORT ANALYSIS & CLINICAL PINPOINTING ENDPOINT
// ===========================

app.post('/api/analyze-report', async (req, res) => {
    try {
        const { imageBase64, mimeType, primaryAnalysisList } = req.body;

        if (!imageBase64) {
            return res.status(400).json({ success: false, error: 'No image data provided' });
        }

        if (!GEMINI_API_KEY) {
            return res.status(503).json({
                success: false,
                error: 'Gemini API key not configured. Set GEMINI_API_KEY environment variable.'
            });
        }

        // 1. Call Gemini Vision API — Clinical Engine
        console.log('--- CALLING GEMINI CLINICAL ENGINE ---');
        const rawResult = await callGeminiVision(imageBase64, mimeType || 'image/jpeg');

        if (!rawResult || !Array.isArray(rawResult.markers)) {
            return res.status(422).json({ success: false, error: 'Could not extract markers from report' });
        }

        // 2. Verification — Non-blocking recency check
        const referenceDate = new Date('2026-03-15');
        let verification = { isValid: true, isRecent: true, labName: 'Private Laboratory', dateFound: 'Unknown' };

        if (rawResult.verification) {
            const reportDate = new Date(rawResult.verification.reportDate);
            let isRecent = true;
            let recencyNote = 'Recent report';

            if (!isNaN(reportDate.getTime())) {
                const diffMonths = (referenceDate.getFullYear() - reportDate.getFullYear()) * 12 
                                 + (referenceDate.getMonth() - reportDate.getMonth());
                isRecent = diffMonths <= 6;
                if (!isRecent) {
                    recencyNote = `Report is ${Math.abs(diffMonths)} months old — Historical data (still processed)`;
                }
            }

            verification = {
                isValid: rawResult.verification.isValid !== false,
                isRecent: isRecent,
                recencyNote: recencyNote,
                labName: rawResult.verification.labName || 'Private Laboratory',
                dateFound: rawResult.verification.reportDate || 'Unknown'
            };
        }

        // 3. Normalize markers using alias mapping
        const normalizedMarkers = [];
        for (const marker of rawResult.markers) {
            const canonical = normalizeMarkerName(marker.name);
            if (!canonical) continue;

            const value = parseFloat(marker.value);
            const status = ['High', 'Low', 'Normal'].includes(marker.status)
                ? marker.status
                : determineStatus(canonical, value);
            const refRange = REFERENCE_RANGES[canonical];
            const range = marker.range || `${refRange.low} - ${refRange.high}`;

            normalizedMarkers.push({
                marker: canonical,
                value: marker.value,
                status: status,
                range: range,
                unit: marker.unit || refRange.unit
            });
        }

        // 4. Build marker value lookup for pinpointing logic
        const mv = {};
        normalizedMarkers.forEach(m => { mv[m.marker] = parseFloat(m.value); });

        console.log('--- MARKER VALUES FOR PINPOINTING ---');
        console.log(mv);

        // 5. *** logicEngine.refine() — The Clinical Pinpointing Boosters ***
        const pinpointedResults = [];

        if (Array.isArray(primaryAnalysisList) && primaryAnalysisList.length > 0) {
            primaryAnalysisList.forEach(disease => {
                let boostedConfidence = disease.confidence || 50;
                let logicNote = '';
                let category = disease.category || 'Clinical Finding';

                // --- DENGUE BOOSTER: Platelets < 150,000 ---
                if (disease.name === 'Dengue Fever' && mv['Platelets'] !== undefined && mv['Platelets'] < 150000) {
                    boostedConfidence = Math.max(90, boostedConfidence + 25);
                    logicNote = `Low platelet count (${mv['Platelets'].toLocaleString()}) confirmed the initial suspicion of Dengue.`;
                }

                // --- BACTERIAL INFECTION BOOSTER: WBC > 11,000 AND Neutrophils > 75% ---
                const bacterialDiseases = ['Pneumonia', 'UTI (Urinary Tract Infection)', 'Strep Throat', 'Appendicitis', 'Meningitis'];
                if (bacterialDiseases.includes(disease.name)) {
                    if (mv['WBC Count'] > 11000 && mv['Neutrophils'] > 75) {
                        boostedConfidence = Math.min(98, boostedConfidence + 25);
                        logicNote = `Elevated WBC (${mv['WBC Count'].toLocaleString()}) and high Neutrophils (${mv['Neutrophils']}%) point strongly towards a Bacterial Infection like ${disease.name}.`;
                    } else if (mv['WBC Count'] > 11000) {
                        boostedConfidence = Math.min(90, boostedConfidence + 15);
                        logicNote = `Elevated WBC (${mv['WBC Count'].toLocaleString()}) supports a bacterial etiology for ${disease.name}.`;
                    }
                }

                // --- VIRAL INFECTION BOOSTER: WBC < 4,000 OR Lymphocytes elevated ---
                const viralDiseases = ['Influenza (Flu)', 'Common Cold', 'COVID-19', 'Dengue Fever'];
                if (viralDiseases.includes(disease.name)) {
                    if (mv['WBC Count'] < 4000 || mv['Lymphocytes'] > 45) {
                        if (!logicNote) { // Don't override a higher-priority booster like Dengue platelet
                            boostedConfidence = Math.min(95, boostedConfidence + 15);
                            logicNote = `Marker profile (${mv['WBC Count'] < 4000 ? 'Low WBC' : 'Elevated Lymphocytes'}) is characteristically seen in Viral Infections like ${disease.name}.`;
                        }
                    }
                }

                // --- ANEMIA PIN: Hb < 12.0 (F) or 13.0 (M) — Using 12.0 as universal threshold ---
                if (disease.name === 'Anemia' && mv['Hemoglobin'] !== undefined && mv['Hemoglobin'] < 12.0) {
                    boostedConfidence = 98;
                    logicNote = `Critically low Hemoglobin level (${mv['Hemoglobin']} g/dL) confirms Anemia as a primary finding.`;
                }

                // --- CRP BOOSTER: Systemic Inflammation ---
                if (mv['CRP'] !== undefined && mv['CRP'] > 10) {
                    if (!logicNote) {
                        logicNote = `Elevated CRP (${mv['CRP']} mg/L) indicates active systemic inflammation.`;
                        boostedConfidence = Math.min(95, boostedConfidence + 10);
                    } else {
                        logicNote += ` Additionally supported by elevated CRP (${mv['CRP']} mg/L).`;
                        boostedConfidence = Math.min(98, boostedConfidence + 5);
                    }
                }

                // --- GLUCOSE BOOSTER: Diabetes/Hyperglycemia ---
                if (disease.name === 'Diabetes Complication (Hyperglycemia)' && mv['Blood Glucose'] !== undefined && mv['Blood Glucose'] > 140) {
                    boostedConfidence = Math.max(92, boostedConfidence + 20);
                    logicNote = `Elevated blood glucose (${mv['Blood Glucose']} mg/dL) directly supports a Diabetes-related complication.`;
                }

                // --- NORMAL LAB PENALTY: If markers are all normal, penalize slightly ---
                if (!logicNote && normalizedMarkers.length > 0) {
                    const allNormal = normalizedMarkers.filter(m => m.marker !== 'Neutrophils' && m.marker !== 'Lymphocytes').every(m => m.status === 'Normal');
                    if (allNormal) {
                        boostedConfidence = Math.max(20, boostedConfidence - 10);
                        logicNote = `Blood markers are within normal ranges. Clinical suspicion for ${disease.name} is reduced but not excluded.`;
                    }
                }

                // Determine urgency
                let urgency = 'Low';
                if (boostedConfidence > 90) urgency = 'High';
                else if (boostedConfidence > 70) urgency = 'Medium';

                // Build precautions from the database or fallback
                const precautions = disease.precautions || disease.recommendations || [
                    'Consult a healthcare professional',
                    'Follow up with additional tests if needed',
                    'Monitor symptoms closely'
                ];

                pinpointedResults.push({
                    disease: disease.name,
                    confidence: Math.min(100, Math.round(boostedConfidence)),
                    logic: logicNote || `Refined based on blood report analysis. No specific biomarker trigger detected.`,
                    precautions: precautions,
                    urgency: urgency,
                    category: category
                });
            });
        }

        // Sort by confidence descending
        pinpointedResults.sort((a, b) => b.confidence - a.confidence);

        // 6. Build vitalsDisplay for dashboard
        const vitalsDisplay = normalizedMarkers.map(m => ({
            marker: m.marker,
            value: m.value,
            status: m.status,
            range: m.range,
            unit: m.unit
        }));

        console.log('--- PINPOINTING COMPLETE ---');
        console.log(`Top Result: ${pinpointedResults[0]?.disease} at ${pinpointedResults[0]?.confidence}%`);

        res.json({
            success: true,
            verification,
            pinpointedResults: pinpointedResults.slice(0, 5),
            vitalsDisplay,
            markers: normalizedMarkers, // Also include for backward compatibility with preview
            notes: rawResult.notes || '',
            markerCount: normalizedMarkers.length
        });

    } catch (error) {
        console.error('--- BLOOD ANALYSIS ERROR ---');
        console.error('Error Details:', error.message);
        console.error('Stack Trace:', error.stack);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to analyze blood report',
            details: error.message 
        });
    }
});


// ===========================
// ERROR HANDLING
// ===========================

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: err.message
    });
});

// ===========================
// START SERVER
// ===========================

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🏥  AI Healthcare Assistant - Backend Server            ║
║                                                            ║
║   Status: Running                                          ║
║   Port: ${PORT}                                              ║
║   URL: http://localhost:${PORT}                              ║
║                                                            ║
║   API Endpoints:                                           ║
║   - POST /api/diagnose         (Main diagnosis)            ║
║   - POST /api/analyze-report   (Blood report scan) ★NEW   ║
║   - GET  /api/symptoms         (Get all symptoms)          ║
║   - GET  /api/diseases         (Get all diseases)          ║
║   - GET  /api/disease/:id      (Get disease details)       ║
║   - GET  /api/health           (Health check)              ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `);
});

module.exports = app;

