const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('ERROR: GEMINI_API_KEY not found in .env');
        return;
    }

    console.log('Testing Gemini API with key:', apiKey.substring(0, 10) + '...');
    
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // Trying the current model name
        const modelName = "gemini-flash-latest"; 
        console.log(`Using model: ${modelName}`);
        
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello, are you working?");
        const response = await result.response;
        console.log('SUCCESS!');
        console.log('Response:', response.text());
    } catch (error) {
        console.error('FAILED!');
        console.error('Error Message:', error.message);
        if (error.stack) console.error('Stack Trace:', error.stack);
        
        console.log('\n--- Attempting with alternative model name: gemini-1.5-flash ---');
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent("Hello, are you working?");
            const response = await result.response;
            console.log('SUCCESS with gemini-1.5-flash!');
            console.log('Response:', response.text());
        } catch (error2) {
            console.error('FAILED with gemini-1.5-flash too!');
            console.error('Error Message:', error2.message);
        }
    }
}

testGemini();
