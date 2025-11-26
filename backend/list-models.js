#!/usr/bin/env node
/**
 * List available Gemini models for the API
 */

require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  console.log('📋 Listing Available Gemini Models\n');
  
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not set');
    return;
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  try {
    // Try to list models
    const models = await genAI.listModels();
    
    console.log('✅ Available models:\n');
    for (const model of models) {
      console.log(`  • ${model.name}`);
      console.log(`    Display: ${model.displayName}`);
      console.log(`    Supported methods: ${model.supportedGenerationMethods.join(', ')}`);
      console.log('');
    }
  } catch (error) {
    console.error('❌ Error listing models:', error.message);
    console.log('\n💡 Trying common model names directly...\n');
    
    const commonModels = [
      'gemini-pro',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest',
      'gemini-1.5-flash-001',
      'gemini-1.5-flash-002',
      'gemini-1.0-pro',
      'models/gemini-pro',
      'models/gemini-1.5-pro',
      'models/gemini-1.5-flash'
    ];
    
    for (const modelName of commonModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Say "hello"');
        const response = await result.response;
        const text = response.text();
        console.log(`  ✅ ${modelName} - WORKS (response: "${text.substring(0, 50)}...")`);
      } catch (err) {
        console.log(`  ❌ ${modelName} - ${err.message.split('\n')[0]}`);
      }
    }
  }
}

listModels().catch(console.error);
