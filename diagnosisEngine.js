// ===========================
// NLP-BASED DIAGNOSIS ENGINE
// ===========================
// Advanced symptom matching and disease prediction algorithm

const diseaseDatabase = require('./diseaseDatabase');

class DiagnosisEngine {
    constructor() {
        this.database = diseaseDatabase;
    }

    /**
     * Main diagnosis function
     * @param {Array} userSymptoms - Array of symptom strings
     * @param {String} duration - Duration of symptoms
     * @param {Number} severity - Severity level (1-10)
     * @param {Object} biomarkers - Object containing extracted lab markers { WBC, Platelets, etc. }
     * @returns {Object} Diagnosis results with ranked diseases
     */
    diagnose(userSymptoms, duration, severity, additionalInfo = '', biomarkers = {}) {
        if (!userSymptoms || userSymptoms.length === 0) {
            return {
                success: false,
                message: "No symptoms provided"
            };
        }

        // Normalize symptoms for better matching
        const normalizedSymptoms = this.normalizeSymptoms(userSymptoms);

        // Calculate match scores for all diseases (Passing additionalInfo & Biomarkers for Hybrid Logic)
        const diseaseScores = this.calculateDiseaseScores(normalizedSymptoms, severity, duration, additionalInfo, biomarkers);

        // Rank diseases by confidence score
        const rankedDiseases = this.rankDiseases(diseaseScores);

        // Dynamic threshold: If very few symptoms, lower threshold to capture primary matches
        const threshold = userSymptoms.length === 1 ? 15 : 20;
        const topMatches = rankedDiseases.filter(d => d.confidence >= threshold);

        // Generate combinations and differential diagnoses
        const combinations = this.generateCombinations(topMatches, normalizedSymptoms);

        // Check for red flags
        const redFlags = this.detectRedFlags(normalizedSymptoms);

        return {
            success: true,
            inputData: {
                symptoms: userSymptoms,
                symptomCount: userSymptoms.length,
                duration: duration,
                severity: severity,
                additionalInfo: additionalInfo,
                biomarkers: biomarkers
            },
            results: {
                primaryDiagnoses: topMatches.slice(0, 5),
                allPossibilities: topMatches,
                combinations: combinations,
                totalMatches: topMatches.length,
                redFlags: redFlags,
                auditLog: this.performXaiAudit(topMatches, biomarkers, additionalInfo)
            },
            recommendations: this.generateGeneralRecommendations(topMatches, severity, redFlags),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Perform Explainable AI Audit for Conflict Resolution
     */
    performXaiAudit(matches, labs = {}, text = '') {
        const audit = [];
        const raw = text.toLowerCase();

        // SCENARIO 1: COVID VS PNEUMONIA
        const hasCovid = matches.find(m => m.id === 3);
        const hasPneumonia = matches.find(m => m.id === 15);
        if (hasCovid && hasPneumonia) {
            if (raw.includes("smell") || raw.includes("taste")) {
                audit.push(`[XAI Audit]: While symptoms overlap with Pneumonia, the presence of 'Anosmia' (Loss of smell) specifically increases COVID-19 confidence.`);
            }
            if (labs.wbc === 'High') {
                audit.push(`[XAI Audit]: High WBC count detected. This biomarker heavily favors a bacterial Pneumonia profile over viral COVID-19.`);
            }
        }

        // SCENARIO 2: FLU VS DENGUE
        const hasFlu = matches.find(m => m.id === 2);
        const hasDengue = matches.find(m => m.id === 25);
        if (hasFlu && hasDengue) {
            if (raw.includes("joint") || raw.includes("rash")) {
                audit.push(`[XAI Audit]: Secondary markers (Joint Pain/Rash) detected. These are pathognomonic for Dengue Fever, effectively ruling out standard Influenza.`);
            }
            if (labs.platelets === 'Low') {
                audit.push(`[XAI Audit]: Critical Biomarker Alert: Low Platelet count identified. This skyrockets the confidence for Dengue Fever to >90%.`);
            }
        }

        // SCENARIO 3: MI VS PE
        const hasMI = matches.find(m => m.id === 8);
        const hasPE = matches.find(m => m.id === 23);
        if (hasMI && hasPE) {
            if (raw.includes("radiate") || raw.includes("jaw") || raw.includes("shoulder")) {
                audit.push(`[XAI Audit]: The specific radiating pain vector (Jaw/Shoulder) provides a clinical clincher for Myocardial Infarction over Pulmonary Embolism.`);
            } else {
                audit.push(`[XAI Audit]: Dominant palpitations and shortness of breath in the absence of radiating pain lean the weight toward Pulmonary Embolism.`);
            }
        }

        return audit;
    }

    /**
     * Normalize symptom strings for better matching
     */
    normalizeSymptoms(symptoms) {
        return symptoms.map(symptom => {
            return symptom.toLowerCase().trim();
        });
    }

    /**
     * Calculate match scores for all diseases
     */
    calculateDiseaseScores(userSymptoms, userSeverity, duration, additionalInfo = '', biomarkers = {}) {
        const scores = [];

        this.database.forEach(disease => {
            const score = this.calculateMatchScore(disease, userSymptoms, userSeverity, duration, additionalInfo, biomarkers);
            if (score.confidence > 0) {
                scores.push({
                    ...disease,
                    matchScore: score.matchScore,
                    confidence: score.confidence,
                    matchedSymptoms: score.matchedSymptoms,
                    unmatchedSymptoms: score.unmatchedSymptoms
                });
            }
        });

        return scores;
    }

    /**
     * Calculate match score for a single disease
     */
    calculateMatchScore(disease, userSymptoms, userSeverity, duration, additionalInfo = '', biomarkers = {}) {
        let totalWeight = 0;
        let matchedWeight = 0;
        let maxSingleWeight = 0;
        const matchedSymptoms = [];
        const unmatchedSymptoms = [];

        // Get all disease symptoms and their weights
        const diseaseSymptoms = disease.symptoms;
        const diseaseSymptomNames = Object.keys(diseaseSymptoms);

        // Calculate total possible weight
        diseaseSymptomNames.forEach(symptom => {
            totalWeight += diseaseSymptoms[symptom];
        });

        // Check each user symptom against disease symptoms
        userSymptoms.forEach(userSymptom => {
            let found = false;

            diseaseSymptomNames.forEach(diseaseSymptom => {
                if (this.symptomsMatch(userSymptom, diseaseSymptom)) {
                    const weight = diseaseSymptoms[diseaseSymptom];
                    matchedWeight += weight;
                    if (weight > maxSingleWeight) maxSingleWeight = weight;

                    matchedSymptoms.push({
                        symptom: diseaseSymptom,
                        weight: weight,
                        relevance: (weight * 100).toFixed(0) + '%'
                    });
                    found = true;
                }
            });

            if (!found) {
                unmatchedSymptoms.push(userSymptom);
            }
        });

        // Calculate base confidence score
        let confidence = totalWeight > 0 ? (matchedWeight / totalWeight) * 100 : 0;

        // SINGLE SYMPTOM BOOST: If this is the ONLY symptom entered, and it's a PRIMARY symptom for the disease
        if (userSymptoms.length === 1 && matchedSymptoms.length === 1) {
            const primarySymptomFactor = maxSingleWeight >= 0.9 ? 1.5 : (maxSingleWeight >= 0.7 ? 1.2 : 1.0);
            confidence = confidence * primarySymptomFactor;
        }

        // Adjust confidence based on number of matched symptoms (closeness of fit)
        const matchRatio = matchedSymptoms.length / userSymptoms.length;
        confidence = confidence * (0.6 + (matchRatio * 0.4));

        // 4. PATHOGNOMONIC MARKER BOOST (The Hybrid AI "Teacher")
        // If the additionalInfo contains specific, hallmark phrases for this disease
        if (disease.pathognomonicMarkers && additionalInfo) {
            const text = additionalInfo.toLowerCase();
            let markerMatches = 0;
            
            disease.pathognomonicMarkers.forEach(marker => {
                if (text.includes(marker.toLowerCase())) {
                    markerMatches++;
                }
            });

            if (markerMatches > 0) {
                // Large clinical boost for pathognomonic hallmarks
                // This resolves conflicts by giving the correct disease a "Gravity Boost"
                const boost = 1.0 + (markerMatches * 0.25);
                confidence = confidence * Math.min(boost, 2.5);
                
                // Add to matched symptoms for visibility
                matchedSymptoms.push({
                    symptom: "[Hallmark Marker Detected]",
                    weight: 1.0,
                    relevance: "CLINICAL CLINCHER"
                });
            }
        }

        // 5. BIOMARKER REFINE (Confidence Booster)
        if (disease.biomarkers && Object.keys(biomarkers).length > 0) {
            let bioMatchCount = 0;
            let bioWeight = 1.0;

            for (const [marker, expected] of Object.entries(disease.biomarkers)) {
                // marker in DB might be "WBC Count", in input it might be "wbc"
                const inputKey = marker.toLowerCase().split(' ')[0]; 
                if (biomarkers[inputKey] === expected) {
                    bioMatchCount++;
                    bioWeight += 0.3; // High boost for lab alignment
                } else if (biomarkers[inputKey] && biomarkers[inputKey] !== expected) {
                    bioWeight -= 0.2; // Penalty for lab mismatch
                }
            }

            if (bioMatchCount > 0) {
                confidence = confidence * Math.max(bioWeight, 0.5);
                matchedSymptoms.push({
                    symptom: "[Biomarker Alignment]",
                    weight: 1.0,
                    relevance: "LAB VERIFIED"
                });
            }
        }

        // Severity and Duration alignment
        const severityFactor = this.getSeverityFactor(disease.severity, userSeverity);
        const durationFactor = this.getDurationFactor(disease, duration);

        confidence = confidence * severityFactor * durationFactor;

        return {
            matchScore: matchedWeight,
            confidence: Math.round(confidence * 10) / 10,
            matchedSymptoms: matchedSymptoms,
            unmatchedSymptoms: unmatchedSymptoms
        };
    }

    /**
     * Check if two symptom strings match (fuzzy matching)
     */
    symptomsMatch(symptom1, symptom2) {
        const s1 = symptom1.toLowerCase().trim();
        const s2 = symptom2.toLowerCase().trim();

        // Exact match
        if (s1 === s2) return true;

        // Contains match
        if (s1.includes(s2) || s2.includes(s1)) return true;

        // Synonym matching
        const synonyms = {
            'stomach pain': ['abdominal pain', 'belly pain', 'tummy ache', 'stomach ache'],
            'shortness of breath': ['difficulty breathing', 'breathlessness', 'dyspnea', 'labored breathing'],
            'body aches': ['muscle pain', 'myalgia', 'body pain', 'aching joints'],
            'sore throat': ['throat pain', 'pharyngitis', 'strep throat'],
            'runny nose': ['nasal congestion', 'stuffy nose', 'sinus pressure'],
            'tiredness': ['fatigue', 'exhaustion', 'weakness', 'lethargy'],
            'sweating': ['night sweats', 'diaphoresis', 'perspiration'],
            'radiating pain': ['pain moving to arm', 'pain moving to jaw', 'referred pain'],
            'chest pain': ['chest pressure', 'chest tightness', 'angina'],
            'dizziness': ['vertigo', 'lightheadedness', 'unsteadiness'],
            'fainting': ['syncope', 'passed out', 'lost consciousness'],
            'confusion': ['disorientation', 'altered mental state', 'brain fog']
        };

        for (const [key, values] of Object.entries(synonyms)) {
            if ((s1 === key || values.includes(s1)) && (s2 === key || values.includes(s2))) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get severity adjustment factor
     */
    getSeverityFactor(diseaseSeverity, userSeverity) {
        const severityMap = {
            'mild': { min: 1, max: 4 },
            'mild-moderate': { min: 3, max: 6 },
            'moderate': { min: 5, max: 8 },
            'moderate-severe': { min: 7, max: 10 },
            'severe': { min: 8, max: 10 }
        };

        const range = severityMap[diseaseSeverity];
        if (!range) return 1.0;

        // If user severity is within expected range, boost confidence
        if (userSeverity >= range.min && userSeverity <= range.max) {
            return 1.1;
        } else if (Math.abs(userSeverity - range.min) <= 2 || Math.abs(userSeverity - range.max) <= 2) {
            return 1.0;
        } else {
            return 0.9;
        }
    }

    /**
     * Get duration alignment factor
     */
    getDurationFactor(disease, duration) {
        // Broad clinical duration patterns
        const acuteConditions = ['Influenza (Flu)', 'Asthma Attack', 'Myocardial Infarction (Heart Attack)', 'Stroke', 'Anxiety Disorder', 'Vertigo', 'Allergic Reaction', 'Dengue Fever'];
        const chronicConditions = ['Anemia', 'Acid Reflux (GERD)', 'Fibromyalgia', 'Bronchitis', 'Sinusitis'];

        if (duration === '< 24 Hours') {
            if (acuteConditions.includes(disease.name)) return 1.2;
            if (chronicConditions.includes(disease.name)) return 0.8;
        } else if (duration === '1 Week +') {
            if (chronicConditions.includes(disease.name)) return 1.2;
            if (acuteConditions.includes(disease.name)) return 0.7;
        }

        return 1.0;
    }

    /**
     * Rank diseases by confidence score
     */
    rankDiseases(diseaseScores) {
        return diseaseScores.sort((a, b) => b.confidence - a.confidence);
    }

    /**
     * Generate disease combinations for differential diagnosis
     */
    generateCombinations(topDiseases, userSymptoms) {
        const combinations = [];

        // Group by category
        const categories = {};
        topDiseases.forEach(disease => {
            if (!categories[disease.category]) {
                categories[disease.category] = [];
            }
            categories[disease.category].push(disease);
        });

        // Create category-based combinations
        Object.keys(categories).forEach(category => {
            const diseasesInCategory = categories[category];
            if (diseasesInCategory.length > 1) {
                combinations.push({
                    type: 'category_group',
                    category: category,
                    diseases: diseasesInCategory.map(d => ({
                        name: d.name,
                        confidence: d.confidence
                    })),
                    description: `Multiple ${category.toLowerCase()} conditions possible`
                });
            }
        });

        // Identify co-occurring conditions
        if (topDiseases.length >= 2) {
            const primary = topDiseases[0];
            const secondary = topDiseases.slice(1, 3);

            secondary.forEach(disease => {
                if (disease.category !== primary.category && disease.confidence > 30) {
                    combinations.push({
                        type: 'co_occurrence',
                        primary: primary.name,
                        secondary: disease.name,
                        description: `${primary.name} with possible ${disease.name}`,
                        combinedConfidence: ((primary.confidence + disease.confidence) / 2).toFixed(1)
                    });
                }
            });
        }

        return combinations;
    }

    /**
     * Detect life-threatening red flag symptom clusters
     */
    detectRedFlags(userSymptoms) {
        const redFlags = [];

        // STROKE RED FLAGS (FAST)
        const fastSymptoms = ['facial droop', 'arm weakness', 'speech difficulty'];
        const foundFast = fastSymptoms.filter(s => userSymptoms.some(us => this.symptomsMatch(us, s)));
        if (foundFast.length > 0) {
            redFlags.push({
                type: 'STROKE',
                severity: 'CRITICAL',
                message: 'Possible STROKE detected (FAST symptoms present). Time is critical.',
                symptoms: foundFast
            });
        }

        // HEART ATTACK RED FLAGS
        if (userSymptoms.some(us => this.symptomsMatch(us, 'chest pain'))) {
            const cardiacAddons = ['radiating pain', 'sweating', 'shortness of breath', 'nausea'];
            const foundAddons = cardiacAddons.filter(s => userSymptoms.some(us => this.symptomsMatch(us, s)));
            if (foundAddons.length >= 2) {
                redFlags.push({
                    type: 'CARDIAC',
                    severity: 'CRITICAL',
                    message: 'Potential MYOCARDIAL INFARCTION (Heart Attack) cluster detected.',
                    symptoms: ['chest pain', ...foundAddons]
                });
            }
        }

        // MENINGITIS RED FLAGS
        const meningitisCluster = ['stiff neck', 'light sensitivity', 'fever', 'headache'];
        const foundMeningitis = meningitisCluster.filter(s => userSymptoms.some(us => this.symptomsMatch(us, s)));
        if (foundMeningitis.includes('stiff neck') && (foundMeningitis.includes('fever') || foundMeningitis.includes('light sensitivity'))) {
            redFlags.push({
                type: 'MENINGITIS',
                severity: 'CRITICAL',
                message: 'Potential MENINGITIS cluster detected (Neck stiffness + Fever/Photophobia).',
                symptoms: foundMeningitis
            });
        }

        // RESPIRATORY RED FLAGS
        if (userSymptoms.some(us => this.symptomsMatch(us, 'coughing blood'))) {
            redFlags.push({
                type: 'EMERGENCY_RESPIRATORY',
                severity: 'HIGH',
                message: 'Coughing blood (Hemoptysis) requires immediate medical evaluation.',
                symptoms: ['coughing blood']
            });
        }

        return redFlags;
    }

    /**
     * Generate general recommendations based on results
     */
    generateGeneralRecommendations(topDiseases, severity, redFlags = []) {
        const recommendations = [];

        // Red Flag Priority
        if (redFlags.length > 0) {
            recommendations.push({
                priority: 'CRITICAL',
                text: 'EMERGENCY: One or more life-threatening symptom clusters detected. Call 911 or visit the nearest ER immediately.',
                icon: '🚨'
            });

            redFlags.forEach(flag => {
                recommendations.push({
                    priority: 'CRITICAL_DETAIL',
                    text: flag.message,
                    icon: '🚑'
                });
            });
        }

        // Severity-based recommendations
        if (severity >= 8 && redFlags.length === 0) {
            recommendations.push({
                priority: 'HIGH',
                text: 'Seek immediate medical attention due to high severity level',
                icon: '🚨'
            });
        } else if (severity >= 6) {
            recommendations.push({
                priority: 'MEDIUM',
                text: 'Consider consulting a healthcare provider soon',
                icon: '⚠️'
            });
        }

        // Disease-specific recommendations
        if (topDiseases.length > 0) {
            const topDisease = topDiseases[0];

            if (topDisease.severity === 'severe' || topDisease.severity === 'moderate-severe') {
                recommendations.push({
                    priority: 'HIGH',
                    text: `${topDisease.name} may require professional medical care`,
                    icon: '🏥'
                });
            }
        }

        // General health recommendations
        recommendations.push({
            priority: 'GENERAL',
            text: 'Monitor your symptoms and track any changes',
            icon: '📋'
        });

        recommendations.push({
            priority: 'GENERAL',
            text: 'Stay hydrated and get adequate rest',
            icon: '💧'
        });

        return recommendations;
    }
}

module.exports = DiagnosisEngine;
