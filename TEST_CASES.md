# 🧪 Test Cases for Symptom Combinations

## How to Test the Dynamic Logic

Follow these test cases to see how the diagnosis changes with different symptom combinations.

---

## Test Suite 1: Respiratory Conditions

### Test 1.1: Common Cold Progression
**Objective**: See how diagnosis evolves from generic to specific

| Step | Add Symptom | Expected Top Match | Confidence Range |
|------|-------------|-------------------|------------------|
| 1 | Cough | Bronchitis/Common Cold | 40-55% |
| 2 | + Sore throat | Common Cold | 60-75% |
| 3 | + Nasal congestion | Common Cold | 80-95% ✅ |
| 4 | + Fatigue | Common Cold | 85-95% ✅ |

**Instructions:**
1. Select "Cough" → Note the results
2. Add "Sore throat" → Watch confidence increase
3. Add "Nasal congestion" → Common Cold should dominate
4. Add "Fatigue" → Confidence should peak

**Expected Behavior**: Each symptom narrows down to Common Cold

---

### Test 1.2: Flu vs Cold Differentiation
**Objective**: Show how fever changes the diagnosis

| Step | Symptoms | Expected Top Match | Why? |
|------|----------|-------------------|------|
| 1 | Cough, Sore throat, Fatigue | Common Cold | No fever |
| 2 | + Fever | Influenza | Fever shifts to viral infection |
| 3 | + Body aches | Influenza | Classic flu cluster |
| 4 | + Chills | Influenza | 85%+ confidence |

**Instructions:**
1. Start with: Cough, Sore throat, Fatigue (Severity: 4)
2. Add "Fever" → Should shift to Influenza
3. Add "Body aches" → Confidence increases
4. Add "Chills" → Flu diagnosis confirmed

**Expected Behavior**: Fever is the key differentiator

---

### Test 1.3: Severe Respiratory Alert
**Objective**: Trigger high-severity pneumonia alert

| Step | Symptoms | Expected Result |
|------|----------|----------------|
| 1 | Cough, Fever, Shortness of breath | Pneumonia/COVID-19 |
| 2 | Set Severity to 8-9 | 🚨 HIGH-RISK ALERT |
| 3 | Set Duration to "1 Week+" | Pneumonia confidence 85%+ |

**Instructions:**
1. Select: Cough, Fever, Shortness of breath
2. Set severity slider to 8 or 9
3. Select duration "1 Week+"
4. Click "Analyze Symptoms"

**Expected Behavior**: Should flag as severe respiratory infection requiring immediate care

---

## Test Suite 2: Gastrointestinal Conditions

### Test 2.1: Stomach Flu
**Objective**: Classic gastroenteritis diagnosis

| Symptoms | Expected Match | Confidence |
|----------|---------------|------------|
| Nausea, Vomiting | Gastroenteritis | 65-75% |
| + Diarrhea | Gastroenteritis | 85-95% ✅ |
| + Abdominal pain | Gastroenteritis | 90%+ ✅ |

**Instructions:**
1. Select: Nausea, Vomiting (Severity: 6)
2. Add "Diarrhea" → Confidence jumps
3. Add "Abdominal pain" → Diagnosis confirmed

---

### Test 2.2: Food Poisoning vs Gastroenteritis
**Objective**: Differentiate based on fever and duration

| Scenario | Symptoms | Duration | Expected Match |
|----------|----------|----------|---------------|
| A | Nausea, Vomiting, Diarrhea | < 24 Hours | Food Poisoning |
| B | Same + Fever | 1-3 Days | Gastroenteritis |

**Instructions:**
1. **Scenario A**: Select symptoms, duration "< 24 Hours", no fever
2. **Scenario B**: Add "Fever", change duration to "1-3 Days"

**Expected Behavior**: Duration and fever differentiate the two

---

## Test Suite 3: Neurological Conditions

### Test 3.1: Headache Type Differentiation

| Symptoms | Expected Match | Type |
|----------|---------------|------|
| Headache only | Tension Headache | Simple |
| Headache + Nausea | Migraine | Moderate |
| Headache + Nausea + Blurred vision | Migraine | High confidence |
| Headache + Dizziness | Vertigo/Tension | Mixed |

**Instructions:**
Test each combination separately and note how the diagnosis changes.

---

### Test 3.2: Dangerous Cluster Detection
**Objective**: Identify serious neurological symptoms

| Symptoms | Severity | Expected Alert |
|----------|----------|---------------|
| Headache + Confusion | 8 | Hypertension/Serious |
| Headache + Blurred vision + Chest pain | 9 | Hypertension Crisis 🚨 |

**Instructions:**
1. Select the symptom combination
2. Set severity to 8-9
3. Should trigger high-priority recommendations

---

## Test Suite 4: Category Shifting

### Test 4.1: Headache → Diabetes
**Objective**: Show how adding "Thirst" changes category

| Step | Symptoms | Category | Top Match |
|------|----------|----------|-----------|
| 1 | Headache, Fatigue | Neurological | Tension Headache |
| 2 | + Blurred vision | Neurological | Migraine |
| 3 | + Thirst | Endocrine | Diabetes ✅ |

**Instructions:**
1. Start with: Headache, Fatigue
2. Add "Blurred vision" → Still neurological
3. Add "Thirst" → Should shift to Diabetes

**Expected Behavior**: Complete category shift from neurological to metabolic

---

### Test 4.2: Chest Pain → Anxiety vs Heart
**Objective**: Differentiate cardiac from anxiety

| Symptoms | Expected Match | Category |
|----------|---------------|----------|
| Chest pain, Palpitations | Anxiety/Cardiac | Mixed |
| + Shortness of breath | Anxiety Disorder | Mental Health |
| + Dizziness, Tremors | Anxiety Disorder | 75%+ |

**Instructions:**
1. Select: Chest pain, Palpitations
2. Add: Shortness of breath, Dizziness, Tremors
3. Should lean toward Anxiety Disorder

---

## Test Suite 5: Co-occurring Conditions

### Test 5.1: Flu + Dehydration
**Objective**: Detect multiple conditions

| Symptoms | Expected Result |
|----------|----------------|
| Fever, Cough, Fatigue, Body aches, Thirst, Dizziness | Influenza (primary) + Dehydration (secondary) |

**Instructions:**
1. Select flu symptoms: Fever, Cough, Fatigue, Body aches
2. Add dehydration symptoms: Thirst, Dizziness
3. Check "Possible Combinations" section in results

**Expected Behavior**: Should show both conditions with combined confidence

---

## Test Suite 6: The "X" Button Logic

### Test 6.1: Correcting Mistakes
**Objective**: Show how removing symptoms changes diagnosis

| Step | Action | Active Symptoms | Top Match |
|------|--------|----------------|-----------|
| 1 | Select | Nausea, Chest pain, Dizziness | Anxiety/Cardiac |
| 2 | Remove "Chest pain" | Nausea, Dizziness | Vertigo |
| 3 | Add "Abdominal pain" | Nausea, Dizziness, Abdominal pain | Gastroenteritis ✅ |

**Instructions:**
1. Select: Nausea, Chest pain, Dizziness
2. Click "X" on "Chest pain" chip
3. Add "Abdominal pain"
4. Watch diagnosis shift from cardiac to GI

**Expected Behavior**: Instant recalculation with each change

---

## Test Suite 7: Severity Impact

### Test 7.1: Same Symptoms, Different Severity

| Symptoms | Severity | Expected Recommendations |
|----------|----------|------------------------|
| Cough, Fever, Fatigue | 3 | "Monitor symptoms" |
| Same symptoms | 7 | "Consider consulting healthcare provider" |
| Same symptoms | 9 | "🚨 Seek immediate medical attention" |

**Instructions:**
1. Select: Cough, Fever, Fatigue
2. Test with severity 3, then 7, then 9
3. Note how recommendations change

---

## Test Suite 8: Duration Impact

### Test 8.1: Acute vs Chronic

| Symptoms | Duration | Expected Match |
|----------|----------|---------------|
| Fatigue, Joint pain | < 24 Hours | Muscle Strain |
| Same symptoms | 1 Week+ | Fibromyalgia/Arthritis |

**Instructions:**
1. Select: Fatigue, Joint pain, Muscle stiffness
2. Test with "< 24 Hours" vs "1 Week+"
3. Note how chronic duration favors chronic conditions

---

## Expected System Behaviors

### ✅ Correct Behaviors:
1. **Progressive Refinement**: Confidence increases with more symptoms
2. **Category Shifting**: Diagnosis category changes with key symptoms
3. **Instant Recalculation**: Every chip add/remove triggers reanalysis
4. **Severity Alerts**: High severity triggers urgent recommendations
5. **Combination Detection**: Identifies co-occurring conditions
6. **Fuzzy Matching**: Handles symptom variations
7. **No False Positives**: Can remove accidental selections

### 🎯 Testing Checklist:
- [ ] Test single symptom (broad results)
- [ ] Test 2-3 symptoms (narrowing down)
- [ ] Test 4+ symptoms (high confidence)
- [ ] Test category shifting (add key symptom)
- [ ] Test severity impact (1 vs 10)
- [ ] Test duration impact (acute vs chronic)
- [ ] Test "X" button (remove symptom)
- [ ] Test co-occurring conditions
- [ ] Test dangerous clusters (high severity)
- [ ] Test all 7 symptom categories

---

## Performance Metrics

**Good Results:**
- Single symptom: 30-50% confidence
- 2-3 symptoms: 60-80% confidence
- 4+ symptoms: 80-95% confidence
- Dangerous clusters: Immediate high-priority alerts

**The system should:**
- Return results in < 1 second
- Show 3-5 primary diagnoses
- Display 10-15 total possibilities
- Generate 2-4 combinations (when applicable)
- Provide 3-5 recommendations

---

## Troubleshooting

**If results seem off:**
1. Check backend is running (port 3000)
2. Verify symptoms are being sent correctly
3. Check browser console for errors
4. Ensure database has all 25 diseases
5. Verify diagnosis engine is calculating scores

**Debug Mode:**
Open browser console and check:
```javascript
// Should show diagnosis request
console.log('Sending to backend:', resultsData);

// Should show diagnosis response
console.log('Diagnosis results:', data);
```

---

Start with Test Suite 1 and work your way through to see the full power of the dynamic combination logic! 🚀
