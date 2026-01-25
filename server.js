const express = require('express');
const path = require('path');
const fs = require('fs');
const { parse } = require('csv-parse/sync');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Helper: get few-shot examples from CSV
function getFewShotExamples() {
  const csvPath = path.join(__dirname, 'public', 'wavelength.csv');
  const csv = fs.readFileSync(csvPath, 'utf8');
  const records = parse(csv, { columns: true, skip_empty_lines: true });
  // Pick 3 random examples
  const shuffled = records.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
}

// Helper: build prompt for Gemini
function buildPrompt(examples, avoidPairs, category) {
  let prompt = `You are an assistant for the board game Wavelength. Generate a new spectrum pair (opposites) in both English and Chinese. Output as JSON with keys: englishL, englishR, chineseL, chineseR.`;
  
  if (category && category.trim()) {
    prompt += `\n\nCategory: ${category.trim()}. Please generate a spectrum pair related to this category.`;
  }
  
  prompt += `\nHere are some examples:`;
  for (const ex of examples) {
    prompt += `\n- English: ${ex['ENGLISH L']} / ${ex['ENGLISH R']}`;
    prompt += `\n  Chinese: ${ex['CHINESE L']} / ${ex['CHINESE R']}`;
  }
  if (avoidPairs && avoidPairs.length > 0) {
    prompt += `\nDo NOT generate any of these pairs (already used this session):`;
    for (const pairStr of avoidPairs) {
      try {
        const pair = JSON.parse(pairStr);
        prompt += `\n- English: ${pair.englishL} / ${pair.englishR}`;
        prompt += `\n  Chinese: ${pair.chineseL} / ${pair.chineseR}`;
      } catch {}
    }
  }
  prompt += `\nNow generate a new, creative pair that is not in the avoid list above.`;
  if (category && category.trim()) {
    prompt += ` Make sure it relates to the category: ${category.trim()}.`;
  }
  return prompt;
}

// API endpoint: generate card
app.post('/api/generate-card', async (req, res) => {
  console.log('=== API CALLED ===');
  console.log('Method:', req.method);
  console.log('Body:', JSON.stringify(req.body, null, 2));
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    console.log('ERROR: GEMINI_API_KEY not found');
    return res.status(500).json({ error: 'Gemini API key not set in environment variables.' });
  }

  console.log('API key found, length:', GEMINI_API_KEY.length);

  const avoidPairs = req.body.avoidPairs || [];
  const category = req.body.category || '';
  console.log('Avoid pairs count:', avoidPairs.length);
  console.log('Category:', category);

  try {
    console.log('=== GETTING FEW-SHOT EXAMPLES ===');
    const examples = getFewShotExamples();
    console.log('Examples retrieved:', examples.length);
    
    console.log('=== BUILDING PROMPT ===');
    const prompt = buildPrompt(examples, avoidPairs, category);
    console.log('Prompt length:', prompt.length);

    console.log('=== CALLING GEMINI API ===');
    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 1.0 },
    };

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + GEMINI_API_KEY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });
    
    console.log('Gemini response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('=== GEMINI ERROR RESPONSE ===');
      console.log(errorText);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('=== GEMINI RESPONSE ===');
    
    // Parse the LLM output
    let text = '';
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
      text = data.candidates[0].content.parts[0].text;
      console.log('=== EXTRACTED TEXT ===');
      console.log(text);
    } else {
      console.log('ERROR: No valid response from Gemini');
      throw new Error('No valid response from Gemini');
    }
    
    // Try to extract JSON from the response
    console.log('=== EXTRACTING JSON ===');
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      console.log('ERROR: No JSON found in LLM response');
      console.log('Full text:', text);
      throw new Error('No JSON found in LLM response');
    }
    console.log('JSON match:', match[0]);
    const card = JSON.parse(match[0]);
    console.log('=== SUCCESS - RETURNING CARD ===');
    res.json(card);
  } catch (e) {
    console.log('=== ERROR OCCURRED ===');
    console.log('Error message:', e.message);
    console.log('Error stack:', e.stack);
    res.status(500).json({ error: e.message });
  }
});

// Serve CSV file
app.get('/wavelength.csv', (req, res) => {
  const csvPath = path.join(__dirname, 'public', 'wavelength.csv');
  res.sendFile(csvPath);
});

// Serve index.html for all other routes (SPA routing)
// Exclude API routes and static files
app.get(/^(?!\/api|\/wavelength\.csv).*$/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});

