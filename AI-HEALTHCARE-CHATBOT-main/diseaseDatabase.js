// ===========================
// DISEASE KNOWLEDGE BASE
// ===========================
// Each disease includes:
//   symptoms: { symptomName: weight (0-1) }
//   biomarkers: { markerName: expectedStatus } — used to boost/penalize diagnosis confidence

const diseaseDatabase = [
    {
        id: 1,
        name: "Common Cold",
        category: "Respiratory Infection",
        description: "A viral infection of the upper respiratory tract. Typically mild and self-limiting with gradual onset.",
        symptoms: {
            "Nasal congestion": 0.95,
            "Sore throat": 0.85,
            "Cough": 0.75,
            "Phlegm production": 0.6,
            "Fatigue": 0.5,
            "Headache": 0.4,
            "Body aches": 0.3
        },
        biomarkers: {
            "WBC Count": "Normal",
            "CRP": "Normal"
        },
        severity: "mild",
        recommendations: [
            "Rest and stay hydrated",
            "Over-the-counter cold medications",
            "Warm fluids and throat lozenges",
            "Consult doctor if symptoms persist beyond 10 days"
        ]
    },
    {
        id: 2,
        name: "Influenza (Flu)",
        category: "Respiratory Infection",
        description: "Contagious respiratory illness with sudden onset of high fever, severe myalgia, and profound exhaustion.",
        symptoms: {
            "Fever": 0.95,
            "Body aches": 0.95,
            "Fatigue": 0.9,
            "Chills": 0.85,
            "Cough": 0.8,
            "Headache": 0.8,
            "Sore throat": 0.6,
            "Sweating": 0.5
        },
        pathognomonicMarkers: ["chills", "gradual onset flu", "shivering"],
        biomarkers: {
            "WBC Count": "Low",
            "CRP": "High"
        },
        severity: "moderate",
        recommendations: [
            "Rest and isolate from others",
            "Antiviral medications if prescribed early",
            "Stay hydrated and manage fever",
            "Seek immediate care if breathing difficulty occurs"
        ]
    },
    {
        id: 3,
        name: "COVID-19",
        category: "Respiratory Infection",
        description: "Coronavirus disease known for a wide range of symptoms, uniquely featuring anosmia and systemic inflammation.",
        symptoms: {
            "Loss of taste/smell": 0.9,
            "Fatigue": 0.85,
            "Fever": 0.8,
            "Cough": 0.8,
            "Shortness of breath": 0.7,
            "Body aches": 0.65,
            "Headache": 0.6,
            "Sore throat": 0.5,
            "Diarrhea": 0.4
        },
        pathognomonicMarkers: ["loss of smell", "loss of taste", "anosmia"],
        biomarkers: {
            "WBC Count": "Low",
            "CRP": "High",
            "Blood Glucose": "High"
        },
        severity: "moderate-severe",
        recommendations: [
            "Get tested immediately",
            "Isolate from others",
            "Monitor oxygen levels",
            "Seek emergency care if severe breathing difficulty"
        ]
    },
    {
        id: 4,
        name: "Gastroenteritis (Stomach Flu)",
        category: "Gastrointestinal",
        description: "Inflammation of the GI tract causing acute watery diarrhea and vomiting, often viral.",
        symptoms: {
            "Diarrhea": 0.95,
            "Nausea": 0.9,
            "Vomiting": 0.85,
            "Abdominal pain": 0.85,
            "Loss of appetite": 0.8,
            "Fatigue": 0.6,
            "Fever": 0.5,
            "Chills": 0.4
        },
        biomarkers: {
            "WBC Count": "Normal",
            "CRP": "Normal"
        },
        severity: "mild-moderate",
        recommendations: [
            "Stay hydrated with electrolyte solutions",
            "Eat bland foods (BRAT diet)",
            "Rest and avoid solid foods initially",
            "Seek care if dehydration symptoms appear"
        ]
    },
    {
        id: 5,
        name: "Migraine",
        category: "Neurological",
        description: "Severe throbbing headache, often unilateral, with sensory sensitivity and gastrointestinal symptoms.",
        symptoms: {
            "Headache": 0.95,
            "Light sensitivity": 0.9,
            "Nausea": 0.85,
            "Blurred vision": 0.65,
            "Dizziness": 0.5,
            "Vomiting": 0.45,
            "Fatigue": 0.4
        },
        biomarkers: {},
        severity: "moderate",
        recommendations: [
            "Rest in a dark, quiet room",
            "Apply cold compress to forehead",
            "Take prescribed migraine medication",
            "Identify and avoid triggers"
        ]
    },
    {
        id: 6,
        name: "Asthma Attack",
        category: "Respiratory",
        description: "Acute airway restriction resulting in audible wheezing, chest tightness, and dyspnea.",
        symptoms: {
            "Wheezing": 0.95,
            "Shortness of breath": 0.95,
            "Chest pain": 0.7,
            "Cough": 0.65,
            "Palpitations": 0.5
        },
        biomarkers: {
            "WBC Count": "Normal",
            "CRP": "Normal"
        },
        severity: "moderate-severe",
        recommendations: [
            "Use rescue inhaler immediately",
            "Sit upright and stay calm",
            "Seek emergency care if no improvement",
            "Avoid known triggers"
        ]
    },
    {
        id: 7,
        name: "Allergic Reaction",
        category: "Allergic/Immune",
        description: "Systemic immune response characterized by rapid onset of cutaneous signs and possible mucosal swelling.",
        symptoms: {
            "Hives": 0.95,
            "Itching": 0.95,
            "Rash": 0.85,
            "Swelling": 0.8,
            "Skin redness": 0.8,
            "Nasal congestion": 0.6,
            "Shortness of breath": 0.5
        },
        biomarkers: {
            "WBC Count": "High",
            "CRP": "High"
        },
        severity: "mild-severe",
        recommendations: [
            "Take antihistamine medication",
            "Avoid allergen exposure",
            "Apply cool compress to affected areas",
            "Seek emergency care if breathing difficulty or severe swelling"
        ]
    },
    {
        id: 8,
        name: "Myocardial Infarction (Heart Attack)",
        category: "Cardiovascular",
        description: "Ischemia of the heart muscle. Classic presentation involves crushing retrosternal pain radiating to the left arm/jaw.",
        symptoms: {
            "Chest pain": 0.95,
            "Radiating pain": 0.9,
            "Sweating": 0.85,
            "Shortness of breath": 0.8,
            "Nausea": 0.6,
            "Dizziness": 0.5,
            "Palpitations": 0.5
        },
        pathognomonicMarkers: ["crushing pressure", "radiating to jaw", "radiating to shoulder", "cold sweat"],
        biomarkers: {
            "WBC Count": "High",
            "CRP": "High",
            "Blood Glucose": "High"
        },
        severity: "severe",
        recommendations: [
            "CALL EMERGENCY SERVICES (911) IMMEDIATELY",
            "Chew an aspirin if not allergic",
            "Sit or lie down and try to stay calm",
            "Unlock front door for paramedics"
        ]
    },
    {
        id: 9,
        name: "Stroke",
        category: "Neurological",
        description: "Acute focal neurological deficit due to interruption of cerebral blood flow.",
        symptoms: {
            "Facial droop": 0.95,
            "Arm weakness": 0.95,
            "Speech difficulty": 0.95,
            "Loss of balance": 0.8,
            "Numbness": 0.8,
            "Confusion": 0.7,
            "Blurred vision": 0.6,
            "Headache": 0.5
        },
        pathognomonicMarkers: ["facial weakness", "heavy speech", "localized numbness", "facial numbness"],
        biomarkers: {
            "Blood Glucose": "High",
            "CRP": "High"
        },
        severity: "severe",
        recommendations: [
            "CALL EMERGENCY SERVICES (911) IMMEDIATELY",
            "Note the time when symptoms first started",
            "Do not give the person food or drink",
            "Stay with the person until help arrives"
        ]
    },
    {
        id: 10,
        name: "Appendicitis",
        category: "Gastrointestinal",
        description: "Acute inflammation of the appendix, typically starting periumbilical before migrating to the RLQ.",
        symptoms: {
            "Abdominal pain": 0.95,
            "Loss of appetite": 0.9,
            "Nausea": 0.85,
            "Vomiting": 0.65,
            "Fever": 0.6,
            "Constipation": 0.4
        },
        pathognomonicMarkers: ["right side pain", "lower stomach pain", "pain spikes on movement", "anorexia", "no appetite"],
        biomarkers: {
            "WBC Count": "High",
            "CRP": "High"
        },
        severity: "moderate-severe",
        recommendations: [
            "Consult a healthcare professional immediately",
            "Do not eat, drink, or use laxatives",
            "Seek emergency care if pain is severe",
            "Lying down with knees drawn to chest may help"
        ]
    },
    {
        id: 11,
        name: "Meningitis",
        category: "Neurological Infection",
        description: "Inflammation of meninges. Classic triad: fever, nuchal rigidity, and altered mental status.",
        symptoms: {
            "Stiff neck": 0.95,
            "Fever": 0.95,
            "Headache": 0.9,
            "Light sensitivity": 0.85,
            "Confusion": 0.75,
            "Nausea": 0.65,
            "Vomiting": 0.55
        },
        biomarkers: {
            "WBC Count": "High",
            "CRP": "High"
        },
        severity: "severe",
        recommendations: [
            "SEEK EMERGENCY MEDICAL CARE IMMEDIATELY",
            "Meningitis can be life-threatening",
            "Note use of recent antibiotics",
            "Identify anyone else who might have been exposed"
        ]
    },
    {
        id: 12,
        name: "Strep Throat",
        category: "Respiratory Infection",
        description: "Group A Streptococcus infection, lacking cough, causing severe sudden throat pain and fever.",
        symptoms: {
            "Sore throat": 0.95,
            "Difficulty swallowing": 0.9,
            "Fever": 0.85,
            "Headache": 0.6,
            "Body aches": 0.5,
            "Nausea": 0.45
        },
        biomarkers: {
            "WBC Count": "High",
            "CRP": "High"
        },
        severity: "moderate",
        recommendations: [
            "Consult doctor for strep test",
            "Antibiotics are required if bacterial",
            "Gargle with warm salt water",
            "Stay hydrated and rest"
        ]
    },
    {
        id: 13,
        name: "Anxiety Disorder",
        category: "Mental Health",
        description: "Intense autonomic arousal, often mimicking cardiac emergencies (Panic Attack).",
        symptoms: {
            "Palpitations": 0.9,
            "Shortness of breath": 0.85,
            "Sweating": 0.8,
            "Tremors": 0.8,
            "Dizziness": 0.75,
            "Chest pain": 0.7,
            "Nausea": 0.5
        },
        biomarkers: {
            "CRP": "Normal",
            "WBC Count": "Normal"
        },
        severity: "mild-moderate",
        recommendations: [
            "Practice deep breathing exercises",
            "Consider cognitive behavioral therapy",
            "Consult mental health professional",
            "Differentiate from heart issues if chest pain is new"
        ]
    },
    {
        id: 14,
        name: "Dehydration",
        category: "General/Systemic",
        description: "Insufficient fluid volume leading to orthostasis and compensatory tachycardia.",
        symptoms: {
            "Thirst": 0.95,
            "Dizziness": 0.9,
            "Fatigue": 0.85,
            "Dry skin": 0.8,
            "Headache": 0.75,
            "Palpitations": 0.6,
            "Confusion": 0.5
        },
        biomarkers: {
            "Blood Glucose": "Normal"
        },
        severity: "mild-moderate",
        recommendations: [
            "Drink water or electrolyte solutions immediately",
            "Rest in cool environment",
            "Seek medical care if severe or persistent",
            "Monitor urine color (should be light yellow)"
        ]
    },
    {
        id: 15,
        name: "Pneumonia",
        category: "Respiratory Infection",
        description: "Lower respiratory tract infection causing alveolar consolidation and productive cough.",
        symptoms: {
            "Cough": 0.95,
            "Phlegm production": 0.9,
            "Fever": 0.85,
            "Shortness of breath": 0.85,
            "Chest pain": 0.8,
            "Chills": 0.75,
            "Fatigue": 0.7,
            "Sweating": 0.6
        },
        pathognomonicMarkers: ["yellowish phlegm", "thick phlegm", "sharp chest pain on breath", "pleuritic pain"],
        biomarkers: {
            "WBC Count": "High",
            "CRP": "High"
        },
        severity: "moderate-severe",
        recommendations: [
            "Seek medical attention immediately",
            "Antibiotics if bacterial",
            "Use humidifier and stay hydrated",
            "Monitor breathing and oxygen levels"
        ]
    },
    {
        id: 16,
        name: "Bronchitis",
        category: "Respiratory",
        description: "Inflammation of major airways with persistent cough that may linger for weeks.",
        symptoms: {
            "Cough": 0.95,
            "Phlegm production": 0.85,
            "Chest pain": 0.65,
            "Wheezing": 0.6,
            "Fatigue": 0.6,
            "Shortness of breath": 0.5
        },
        biomarkers: {
            "WBC Count": "Normal",
            "CRP": "Normal"
        },
        severity: "moderate",
        recommendations: [
            "Rest and drink plenty of fluids",
            "Use humidifier",
            "Avoid smoke and other irritants",
            "Consult doctor if cough persists beyond 3 weeks"
        ]
    },
    {
        id: 17,
        name: "Sinusitis",
        category: "Respiratory",
        description: "Inflammation of paranasal sinuses causing facial pain, pressure, and discharge.",
        symptoms: {
            "Nasal congestion": 0.95,
            "Headache": 0.9,
            "Phlegm production": 0.75,
            "Loss of taste/smell": 0.65,
            "Cough": 0.6,
            "Fatigue": 0.5,
            "Fever": 0.4
        },
        biomarkers: {
            "WBC Count": "Normal",
            "CRP": "Normal"
        },
        severity: "mild-moderate",
        recommendations: [
            "Use saline nasal spray",
            "Apply warm compress to face",
            "Stay hydrated",
            "Decongestants as directed"
        ]
    },
    {
        id: 18,
        name: "Acid Reflux (GERD)",
        category: "Gastrointestinal",
        description: "Retrograde acid flow into the esophagus causing mucosal irritation and burning pain.",
        symptoms: {
            "Heartburn": 0.95,
            "Chest pain": 0.75,
            "Difficulty swallowing": 0.65,
            "Cough": 0.6,
            "Sore throat": 0.55,
            "Bloating": 0.5
        },
        biomarkers: {
            "CRP": "Normal",
            "WBC Count": "Normal"
        },
        severity: "mild-moderate",
        recommendations: [
            "Avoid trigger foods (spicy, fatty)",
            "Eat smaller meals",
            "Avoid lying down after meals",
            "Maintain a healthy weight"
        ]
    },
    {
        id: 19,
        name: "Vertigo",
        category: "Neurological",
        description: "Illusion of movement or spinning, commonly benign paroxysmal positional vertigo (BPPV).",
        symptoms: {
            "Dizziness": 0.95,
            "Loss of balance": 0.9,
            "Nausea": 0.85,
            "Vomiting": 0.7,
            "Blurred vision": 0.6,
            "Headache": 0.4
        },
        biomarkers: {},
        severity: "moderate",
        recommendations: [
            "Sit or lie down immediately during an attack",
            "Avoid sudden movements",
            "Consult doctor for Epley maneuver or medication",
            "Avoid driving during episodes"
        ]
    },
    {
        id: 20,
        name: "Anemia",
        category: "Hematological",
        description: "Reduced oxygen-carrying capacity of blood leading to tissue hypoxia and compensatory tachycardia.",
        symptoms: {
            "Fatigue": 0.95,
            "Dizziness": 0.85,
            "Shortness of breath": 0.75,
            "Palpitations": 0.7,
            "Chest pain": 0.6,
            "Headache": 0.6,
            "Numbness": 0.4
        },
        biomarkers: {
            "Hemoglobin": "Low",
            "Platelets": "Low",
            "WBC Count": "Low"
        },
        severity: "mild-moderate",
        recommendations: [
            "Consult doctor for blood tests",
            "Increase iron-rich foods in diet",
            "Vitamin supplements as recommended",
            "Determine the underlying cause"
        ]
    },
    {
        id: 21,
        name: "UTI (Urinary Tract Infection)",
        category: "Urinary",
        description: "Bacterial infection of the urinary tract. Often presents atypically in the elderly.",
        symptoms: {
            "Abdominal pain": 0.85,
            "Back pain": 0.65,
            "Fever": 0.6,
            "Confusion": 0.75,
            "Fatigue": 0.6,
            "Nausea": 0.45
        },
        biomarkers: {
            "WBC Count": "High",
            "CRP": "High"
        },
        severity: "moderate",
        recommendations: [
            "Drink plenty of water",
            "Antibiotics are required to clear infection",
            "Avoid irritants (caffeine, alcohol)",
            "Seek care immediately if high fever and back pain occur"
        ]
    },
    {
        id: 22,
        name: "Diabetes Complication (Hyperglycemia)",
        category: "Endocrine",
        description: "Osmotic diuresis and cellular starvation secondary to high serum glucose levels.",
        symptoms: {
            "Thirst": 0.95,
            "Fatigue": 0.85,
            "Blurred vision": 0.8,
            "Weight loss": 0.75,
            "Nausea": 0.6,
            "Confusion": 0.55,
            "Abdominal pain": 0.5
        },
        biomarkers: {
            "Blood Glucose": "High",
            "WBC Count": "Normal"
        },
        severity: "moderate-severe",
        recommendations: [
            "Check blood glucose levels immediately",
            "Follow your diabetes management plan",
            "Stay hydrated (water)",
            "Seek emergency care if confusion or vomiting occurs"
        ]
    },
    {
        id: 23,
        name: "Pulmonary Embolism",
        category: "Cardiovascular/Respiratory",
        description: "Thrombus lodging in pulmonary arterial tree, resulting in acute V/Q mismatch.",
        symptoms: {
            "Shortness of breath": 0.95,
            "Chest pain": 0.9,
            "Palpitations": 0.85,
            "Coughing blood": 0.65,
            "Sweating": 0.7,
            "Dizziness": 0.65,
            "Fainting": 0.6
        },
        pathognomonicMarkers: ["terrifying dizziness", "cold sweat breath", "sudden breathlessness"],
        biomarkers: {
            "CRP": "High",
            "Blood Glucose": "High"
        },
        severity: "severe",
        recommendations: [
            "CALL EMERGENCY SERVICES (911) IMMEDIATELY",
            "Do not drive yourself",
            "A blood clot in the lung is life-threatening",
            "Keep movement to a minimum while waiting"
        ]
    },
    {
        id: 24,
        name: "Fibromyalgia",
        category: "Musculoskeletal",
        description: "Central sensitization disorder creating amplified pain, sleep disturbance, and cognitive dysfunction.",
        symptoms: {
            "Body aches": 0.95,
            "Fatigue": 0.95,
            "Muscle stiffness": 0.85,
            "Joint pain": 0.7,
            "Headache": 0.65,
            "Confusion": 0.65,
            "Tingling sensation": 0.6
        },
        biomarkers: {
            "CRP": "Normal",
            "WBC Count": "Normal",
            "Hemoglobin": "Normal"
        },
        severity: "moderate",
        recommendations: [
            "Establish a regular sleep routine",
            "Gentle regular exercise (walking, swimming)",
            "Stress reduction techniques",
            "Consult a specialist for pain management"
        ]
    },
    {
        id: 25,
        name: "Dengue Fever",
        category: "Systemic Infection",
        description: "Mosquito-borne arbovirus causing severe arthralgia/myalgia and hemorrhagic risk.",
        symptoms: {
            "Fever": 0.95,
            "Body aches": 0.95,
            "Joint pain": 0.95,
            "Headache": 0.9,
            "Rash": 0.8,
            "Nausea": 0.75,
            "Vomiting": 0.65,
            "Sweating": 0.6
        },
        pathognomonicMarkers: ["joint pain", "bone breaking pain", "red rash", "faint rash"],
        biomarkers: {
            "WBC Count": "Low",
            "Platelets": "Low",
            "CRP": "High"
        },
        severity: "moderate-severe",
        recommendations: [
            "Maintain high fluid intake",
            "Take paracetamol for fever/pain (avoid aspirin/ibuprofen)",
            "Consult doctor for blood count monitoring",
            "Seek emergency care if bleeding symptoms occur"
        ]
    }
];

module.exports = diseaseDatabase;
