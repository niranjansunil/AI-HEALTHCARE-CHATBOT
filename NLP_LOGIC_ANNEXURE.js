/**
 * HEAL (Vitalsis) - NLP & Clinical Intelligence Integration
 * Location: server.js (Core Implementation)
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Section 1: Clinical Intelligence Engine Implementation
 * Performs multi-modal inference on laboratory reports.
 */
async function callGeminiVision(base64Image, mimeType) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const systemPrompt = `
        Role: Clinical Diagnostic Intelligence & OCR Validation Engine.
        Task 1: Validation & Recency
        Task 2: Precision Biomarker Extraction (WBC, Hb, Platelets, Glucose, CRP)
        OUTPUT FORMAT: JSON ONLY.
    `;

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
    return sanitizeAndParse(response.text());
}

/**
 * Section 2: Data Sanitization & Structural Parsing
 */
function sanitizeAndParse(text) {
    let cleanText = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    try {
        return JSON.parse(cleanText);
    } catch (parseErr) {
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
        throw new Error('Inference Output Malformed');
    }
}

/**
 * Section 3: NLP Architecture - Tri-Head Transformer Breakdown
 * This architecture processes the 'Patient Narrative' into three distinct clinical streams.
 */
class TriHeadTransformer {
    constructor(apiKey) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    }

    /**
     * Head 1: Entity Extraction (NER)
     * Isolates symptom tokens (e.g., "Severe Dry Cough" -> ["Cough"])
     */
    async entityHead(narrative) {
        const prompt = "Extract medical symptoms from this narrative as a JSON array of strings.";
        const result = await this.model.generateContent([prompt, narrative]);
        return sanitizeAndParse(result.response.text());
    }

    /**
     * Head 2: Regression (Severity Calibration)
     * Maps subjective intensity to a numeric 1-10 scale.
     */
    async regressionHead(narrative) {
        const prompt = "Analyze the intensity of symptoms. Return a JSON object: { \"severity\": 1-10 }.";
        const result = await this.model.generateContent([prompt, narrative]);
        return sanitizeAndParse(result.response.text());
    }

    /**
     * Head 3: Temporal Head (Duration Calibration)
     * Normalizes time-based descriptions into standard clinical timeframes.
     */
    async temporalHead(narrative) {
        const prompt = "Extract the duration of symptoms. Return a JSON object: { \"duration\": \"string\" }.";
        const result = await this.model.generateContent([prompt, narrative]);
        return sanitizeAndParse(result.response.text());
    }

    /**
     * Disease Eval Engine Integration
     * Fuses the output of all three heads for final diagnostic correlation.
     */
    async process(narrative) {
        const [symptoms, severityObj, durationObj] = await Promise.all([
            this.entityHead(narrative),
            this.regressionHead(narrative),
            this.temporalHead(narrative)
        ]);

        return {
            status: "ANALYSIS_COMPLETE",
            clinicalData: {
                symptoms: symptoms,
                severity: severityObj.severity,
                duration: durationObj.duration
            },
            nextStep: "Forwarding to Disease Evaluation Engine..."
        };
    }
}
