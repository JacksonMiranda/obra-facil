// Testa modelos Gemini disponíveis para a API key
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'REMOVED_EXPOSED_KEY';
const genAI = new GoogleGenerativeAI(API_KEY);

const MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.0-flash-001',
  'gemini-2.0-flash-lite-001',
];

const prompt = 'Preciso de um encanador para consertar uma torneira que está pingando na cozinha.';

for (const modelName of MODELS) {
  process.stdout.write(`Testing ${modelName}... `);
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().slice(0, 80);
    console.log(`✅ OK: ${text}`);
    break; // para no primeiro que funcionar
  } catch (e) {
    console.log(`❌ status=${e.status} ${e.message.slice(0, 300)}`);
  }
}
// lista todos modelos disponíveis
console.log('\nListando modelos disponíveis:');
const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
const json = await resp.json();
if (json.models) {
  json.models.forEach(m => console.log(' -', m.name));
} else {
  console.log(JSON.stringify(json).slice(0, 500));
}
