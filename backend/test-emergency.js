#!/usr/bin/env node
/**
 * Test emergency response system end-to-end
 * Uses mock users with IDs: '1', '2', '3', '4', '5'
 */

const http = require('http');

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5001,
      path: `/api${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ data });
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(data)}`));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function testEmergencySystem() {
  console.log('🧪 Testing Emergency Response System\n');

  try {
    // Test 1: Create emergency
    console.log('1️⃣ Creating medical emergency...');
    const emergencyResponse = await makeRequest('POST', '/emergencies', {
      type: 'medical',
      severity: 4,
      description: 'Elderly neighbor fell and can\'t get up. Possible hip injury. Need immediate help!',
      requesterId: '1764022532946' // Mock user ID
    });

    console.log('   ✅ Emergency created!');
    console.log('   Emergency ID:', emergencyResponse.data.emergency._id);
    console.log('   Matched neighbors:', emergencyResponse.data.matches.length);
    console.log('   Message:', emergencyResponse.data.message);
    
    // Show matched users
    console.log('\n   📍 Nearby responders found:');
    emergencyResponse.data.matches.slice(0, 3).forEach((match, index) => {
      console.log(`   ${index + 1}. ${match.user.name}`);
      console.log(`      - Distance: ${match.distance.toFixed(2)} km`);
      console.log(`      - Score: ${match.score.toFixed(1)}/100`);
      console.log(`      - Skills: ${match.user.skills.join(', ')}`);
      console.log(`      - Reasons: ${match.reasons.join(', ')}`);
    });

    const emergencyId = emergencyResponse.data.emergency._id;

    // Test 2: Respond to emergency
    console.log('\n2️⃣ Simulating responder joining...');
    const respondResponse = await makeRequest('PATCH', `/emergencies/${emergencyId}/respond`, {
      userId: emergencyResponse.data.matches[0].userId
    });

    console.log('   ✅ Responder joined!');
    console.log('   Responders:', respondResponse.data.emergency.responders.length);
    console.log('   Status:', respondResponse.data.emergency.status);

    // Test 3: Get emergency details
    console.log('\n3️⃣ Fetching emergency details...');
    const detailsResponse = await makeRequest('GET', `/emergencies/${emergencyId}`);
    
    console.log('   ✅ Emergency details retrieved!');
    console.log('   Type:', detailsResponse.data.emergency.type);
    console.log('   Severity:', detailsResponse.data.emergency.severity, '/5');
    console.log('   Status:', detailsResponse.data.emergency.status);
    console.log('   Required skills:', detailsResponse.data.emergency.requiredSkills.join(', '));

    // Test 4: Update responder status
    console.log('\n4️⃣ Updating responder status to "arrived"...');
    await makeRequest('PATCH', `/emergencies/${emergencyId}/status`, {
      userId: emergencyResponse.data.matches[0].userId,
      status: 'arrived'
    });
    console.log('   ✅ Status updated to "arrived"!');

    // Test 5: Resolve emergency
    console.log('\n5️⃣ Resolving emergency...');
    const resolveResponse = await makeRequest('PATCH', `/emergencies/${emergencyId}/resolve`, {
      userId: '1764022532946' // Requester resolves
    });

    console.log('   ✅ Emergency resolved!');
    console.log('   Final status:', resolveResponse.data.emergency.status);

    // Test 6: Get active emergencies
    console.log('\n6️⃣ Fetching active emergencies...');
    const activeResponse = await makeRequest('GET', '/emergencies/active');
    console.log('   ✅ Active emergencies:', activeResponse.data.count);

    console.log('\n🎉 All tests passed! Emergency system is working correctly.\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

testEmergencySystem();
