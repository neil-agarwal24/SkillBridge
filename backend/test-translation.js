#!/usr/bin/env node
/**
 * Test script to verify translation API is working
 * This will show us exactly what error we get when calling Gemini
 */

require('dotenv').config();
const { translateText } = require('./utils/translation');

async function testTranslation() {
  console.log('🧪 Testing Translation Service\n');
  console.log('API Key present:', !!process.env.GEMINI_API_KEY);
  console.log('API Key (first 10 chars):', process.env.GEMINI_API_KEY?.substring(0, 10) + '...\n');
  
  const testCases = [
    { text: 'Hello, how are you today?', target: 'zh', source: 'en' },
    { text: 'I would love to connect with you!', target: 'es', source: 'en' },
    { text: '안녕하세요', target: 'en', source: 'ko' }
  ];

  for (const test of testCases) {
    console.log(`\n📝 Test: "${test.text}"`);
    console.log(`   ${test.source} → ${test.target}`);
    console.log('   ---');
    
    try {
      const result = await translateText(test.text, test.target, test.source);
      
      if (result.failed) {
        console.log(`   ❌ FAILED: ${result.error}`);
        console.log(`   Returned: "${result.translatedText}"`);
      } else if (result.skipped) {
        console.log(`   ⏭️  SKIPPED: Same language or too short`);
      } else {
        console.log(`   ✅ SUCCESS: "${result.translatedText}"`);
        console.log(`   Cached: ${result.cached}`);
      }
    } catch (error) {
      console.log(`   💥 EXCEPTION: ${error.message}`);
    }
  }
  
  console.log('\n✅ Test complete\n');
}

testTranslation().catch(console.error);
