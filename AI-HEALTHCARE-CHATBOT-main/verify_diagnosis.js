
const symptoms = ["Cough", "Fever"];
const payload = {
    symptoms: symptoms,
    duration: "1-3 Days",
    severity: 7,
    additionalInfo: "Test diagnosis"
};

console.log("Testing diagnosis for:", symptoms);

fetch('http://localhost:3000/api/diagnose', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
})
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            console.log("Diagnosis Successful!");
            console.log("Primary Diagnosis:", data.results.primaryDiagnoses[0].name);
            console.log("Confidence:", data.results.primaryDiagnoses[0].confidence);
            console.log("Total Matches:", data.results.totalMatches);
        } else {
            console.error("Diagnosis Failed:", data);
        }
    })
    .catch(err => console.error("Error:", err));
