# 🚀 Quick Start Guide

## Step 1: Install Dependencies

### Option A: Using the batch file (Recommended for Windows)
Double-click `setup.bat` in the project folder.

### Option B: Manual installation
Open Command Prompt or PowerShell in the project directory and run:
```bash
npm install
```

If you get a PowerShell execution policy error, use Command Prompt instead or run:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

## Step 2: Start the Backend Server

### Option A: Using the batch file
Double-click `start-server.bat`

### Option B: Manual start
```bash
npm start
```

You should see:
```
╔════════════════════════════════════════════════════════════╗
║   🏥  AI Healthcare Assistant - Backend Server            ║
║   Status: Running                                          ║
║   Port: 3000                                              ║
╚════════════════════════════════════════════════════════════╝
```

## Step 3: Open the Frontend

### Option A: Direct file access
Simply open `index.html` in your web browser.

### Option B: Using a local server (Recommended)

**Using Python:**
```bash
python -m http.server 8000
```

**Using Node.js:**
```bash
npx http-server -p 8000
```

Then open: `http://localhost:8000`

## Step 4: Use the Application

1. **Select Symptoms**: Click on symptoms from the dropdown menu
2. **Set Duration**: Choose how long you've had symptoms
3. **Set Severity**: Use the slider (1-10)
4. **Add Details** (Optional): Provide additional information
5. **Click "Analyze Symptoms"**: Get your diagnosis

## 🧪 Testing the System

### Test Case 1: Common Cold
- **Symptoms**: Cough, Sore throat, Nasal congestion, Fatigue
- **Duration**: 1-3 Days
- **Severity**: 4
- **Expected**: Common Cold should be top result

### Test Case 2: Flu
- **Symptoms**: Fever, Cough, Fatigue, Body aches, Headache, Chills
- **Duration**: 1-3 Days
- **Severity**: 7
- **Expected**: Influenza should be top result

### Test Case 3: Gastroenteritis
- **Symptoms**: Nausea, Vomiting, Diarrhea, Abdominal pain
- **Duration**: < 24 Hours
- **Severity**: 6
- **Expected**: Gastroenteritis should be top result

### Test Case 4: Migraine
- **Symptoms**: Headache, Nausea, Blurred vision, Dizziness
- **Duration**: 4-7 Days
- **Severity**: 8
- **Expected**: Migraine should be top result

## 🔧 Troubleshooting

### Backend won't start
- Make sure Node.js is installed: `node --version`
- Check if port 3000 is available
- Try running on a different port: `PORT=3001 npm start`

### Frontend can't connect to backend
- Ensure backend is running on port 3000
- Check browser console for errors
- Verify CORS is enabled (it should be by default)

### No results showing
- Open browser developer tools (F12)
- Check the Console tab for errors
- Verify the API response in the Network tab

## 📱 Browser Compatibility

Works best on:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## 🎯 Next Steps

After testing:
1. Explore different symptom combinations
2. Check the disease combinations feature
3. Review the recommendations
4. Examine the confidence scores

## 💡 Tips

- Select 3-6 symptoms for best results
- Be specific with symptom selection
- Use the search function in the dropdown
- Higher severity increases urgency recommendations
- Check "All Possible Conditions" for differential diagnosis

---

**Need Help?** Check the main README.md for detailed documentation.
