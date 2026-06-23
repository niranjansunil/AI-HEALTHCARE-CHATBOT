# AI Healthcare Assistant - Using NLP

A comprehensive healthcare diagnosis system that uses Natural Language Processing (NLP) to analyze symptoms and generate different combinations of possible illnesses/diseases.

## 🎯 Features

### Frontend
- **Modern UI** with clean, professional design
- **Comprehensive Symptom Selection** across 7 categories:
  - Respiratory & Throat
  - General & Systemic
  - Digestive & Gastrointestinal
  - Muscular & Skeletal
  - Neurological & Sensory
  - Skin & Allergic
  - Cardiovascular
- **Interactive Symptom Picker** with search functionality
- **Duration & Severity Selection**
- **Additional Information** input

### Backend
- **NLP-Based Diagnosis Engine** with fuzzy symptom matching
- **25+ Disease Database** with detailed symptom mappings
- **Confidence Scoring Algorithm** based on:
  - Symptom match weights
  - Number of matched symptoms
  - Severity correlation
- **Differential Diagnosis** generation
- **Disease Combinations** detection
- **RESTful API** for diagnosis requests

### Results Page
- **Primary Diagnoses** ranked by confidence
- **Matched Symptoms** visualization
- **Disease Combinations** and co-occurring conditions
- **All Possible Conditions** grid view
- **Personalized Recommendations** based on severity
- **Detailed Disease Information** with descriptions and recommendations

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Navigate to the project directory:**
   ```bash
   cd C:\Users\angel\.gemini\antigravity\scratch\healthcare-chatbot
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the backend server:**
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

4. **Open the frontend:**
   - Open `index.html` in your browser
   - Or use a local server (recommended):
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js http-server
     npx http-server -p 8000
     ```

5. **Access the application:**
   - Frontend: `http://localhost:8000`
   - Backend API: `http://localhost:3000`

## 📁 Project Structure

```
healthcare-chatbot/
├── index.html              # Main symptom input page
├── results.html            # Diagnosis results page
├── styles.css              # Main stylesheet
├── results-styles.css      # Results page stylesheet
├── script.js               # Frontend logic
├── results-script.js       # Results page logic
├── server.js               # Express backend server
├── diagnosisEngine.js      # NLP diagnosis algorithm
├── diseaseDatabase.js      # Disease knowledge base
├── package.json            # Node.js dependencies
└── README.md               # This file
```

## 🔌 API Endpoints

### POST /api/diagnose
Analyze symptoms and return possible diagnoses.

**Request Body:**
```json
{
  "symptoms": ["Fever", "Cough", "Fatigue"],
  "duration": "1-3 Days",
  "severity": 7,
  "additionalInfo": "Optional additional information"
}
```

**Response:**
```json
{
  "success": true,
  "inputData": { ... },
  "results": {
    "primaryDiagnoses": [ ... ],
    "allPossibilities": [ ... ],
    "combinations": [ ... ],
    "totalMatches": 5
  },
  "recommendations": [ ... ],
  "timestamp": "2026-01-30T10:00:00.000Z"
}
```

### GET /api/symptoms
Get all available symptoms in the database.

### GET /api/diseases
Get all diseases in the database.

### GET /api/disease/:id
Get detailed information about a specific disease.

### GET /api/health
Health check endpoint.

## 🧠 How It Works

### 1. Symptom Collection
Users select symptoms from categorized lists with search functionality.

### 2. NLP Processing
The diagnosis engine:
- Normalizes symptom strings
- Performs fuzzy matching against disease database
- Applies synonym recognition
- Calculates weighted match scores

### 3. Confidence Scoring
Each disease receives a confidence score based on:
- **Symptom Weight Matching**: Each symptom has a relevance weight (0-1)
- **Match Ratio**: Percentage of user symptoms that match
- **Severity Correlation**: Alignment with expected severity levels

### 4. Differential Diagnosis
The system generates:
- **Category Groups**: Multiple conditions in the same category
- **Co-occurring Conditions**: Possible combinations of diseases
- **Ranked Results**: Ordered by confidence score

### 5. Recommendations
Personalized recommendations based on:
- Severity level
- Top diagnosed conditions
- General health guidelines

## 🎨 Design Features

- **Glassmorphism** effects
- **Smooth animations** and transitions
- **Responsive design** for all devices
- **Color-coded severity** indicators
- **Confidence badges** for quick assessment
- **Interactive elements** with hover effects

## ⚠️ Important Disclaimer

**This tool is for educational and informational purposes only.**

- NOT a substitute for professional medical advice
- NOT for emergency situations
- Always consult qualified healthcare professionals
- Results are preliminary analysis only

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Algorithm**: Custom NLP-based matching
- **Data**: JSON-based disease knowledge base

## 📊 Disease Database

The system includes 25+ diseases across categories:
- Respiratory Infections
- Gastrointestinal Conditions
- Neurological Disorders
- Musculoskeletal Issues
- Cardiovascular Conditions
- Dermatological Problems
- Endocrine Disorders
- Mental Health Conditions

Each disease includes:
- Symptom mappings with weights
- Severity classification
- Detailed descriptions
- Medical recommendations

## 🔮 Future Enhancements

- Machine learning integration
- User history tracking
- Multi-language support
- Mobile app version
- Integration with medical databases
- Telemedicine consultation booking

## 📝 License

This project is for educational purposes.

## 👨‍💻 Development

To contribute or modify:

1. Fork the repository
2. Make your changes
3. Test thoroughly
4. Submit a pull request

---

**Built with ❤️ for better healthcare accessibility**
