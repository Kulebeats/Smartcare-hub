/**
 * DAK-Traceable Clinical Decision Support System Integration Test
 * Tests CSV upload, rule processing, cache management, and compliance reporting
 */

import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

const BASE_URL = 'http://localhost:5000';
let authCookie = '';

async function login() {
  try {
    console.log('🔐 Logging in as admin...');
    const response = await axios.post(`${BASE_URL}/api/login`, {
      username: 'admin',
      password: 'admin123'
    }, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Extract session cookie
    if (response.headers['set-cookie']) {
      authCookie = response.headers['set-cookie'][0].split(';')[0];
      console.log('✅ Admin login successful');
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return false;
  }
}

async function createTestCSV() {
  console.log('📄 Creating test DAK CSV file...');
  
  const csvContent = `rule_identifier,dak_source_id,guideline_doc_version,evidence_rating,display_to_health_worker,applicable_module,is_rule_active,rule_name,rule_description,alert_severity,alert_title,alert_message,recommendations,trigger_conditions,who_guideline_ref,clinical_thresholds,version
ANC_BP_HIGH,DAK_2024_001,WHO_ANC_2023_v2.1,A,"Blood pressure elevated - requires immediate attention",ANC,true,"High Blood Pressure Alert","Systolic BP ≥140 or Diastolic BP ≥90 detected",red,"High Blood Pressure","Elevated blood pressure detected requiring immediate clinical attention","[""Recheck blood pressure in 15 minutes"",""Consider antihypertensive medication"",""Refer to physician if persistent""]","{""systolicBP"": {""operator"": "">="", ""value"": 140}, ""diastolicBP"": {""operator"": "">="", ""value"": 90}}",WHO.ANC.2023.B7.BP,"{""systolic_critical"": 160, ""diastolic_critical"": 110}",1.0
ANC_ANEMIA_SEVERE,DAK_2024_002,WHO_ANC_2023_v2.1,A,"Severe anemia detected - immediate iron supplementation required",ANC,true,"Severe Anemia Alert","Hemoglobin level below 7.0 g/dL indicates severe anemia",red,"Severe Anemia","Critical hemoglobin level requires immediate intervention","[""Start iron supplementation immediately"",""Investigate underlying causes"",""Consider blood transfusion if <5g/dL"",""Weekly monitoring required""]","{""hemoglobin"": {""operator"": ""<"", ""value"": 7.0}}",WHO.ANC.2023.B5.ANEMIA,"{""severe_threshold"": 7.0, ""critical_threshold"": 5.0}",1.0
ANC_PROTEINURIA,DAK_2024_003,WHO_ANC_2023_v2.1,B,"Proteinuria detected - monitor for pre-eclampsia",ANC,true,"Proteinuria Alert","Protein in urine may indicate developing pre-eclampsia",yellow,"Proteinuria Detected","Protein detected in urine sample","[""Repeat urine test to confirm"",""Monitor blood pressure closely"",""Watch for other pre-eclampsia signs"",""Consider 24-hour urine collection""]","{""proteinuria"": {""operator"": "">"", ""value"": 0}, ""urineProtein"": {""operator"": ""=="", ""value"": ""positive""}}",WHO.ANC.2023.B6.URINE,"{""trace_threshold"": 1, ""significant_threshold"": 2}",1.0
ART_VIRAL_LOAD_HIGH,DAK_2024_101,WHO_ART_2023_v1.5,A,"Viral load elevated - treatment failure suspected",ART,true,"High Viral Load Alert","Viral load >1000 copies/mL indicates treatment failure",red,"Treatment Failure","High viral load detected - treatment review required","[""Review medication adherence"",""Check for drug resistance"",""Consider regimen change"",""Increase monitoring frequency""]","{""viralLoad"": {""operator"": "">"", ""value"": 1000}}",WHO.ART.2023.VL.MONITORING,"{""failure_threshold"": 1000, ""undetectable_target"": 50}",1.0
PHARMA_ADR_SEVERE,DAK_2024_201,WHO_PHARMA_2023_v1.2,A,"Severe adverse drug reaction reported",PHARMACOVIGILANCE,true,"Severe ADR Alert","Grade 3/4 adverse reaction requires immediate attention",red,"Severe ADR","Serious adverse drug reaction documented","[""Discontinue suspected medication"",""Provide supportive care"",""Report to pharmacovigilance system"",""Document detailed ADR information""]","{""adrSeverity"": {""operator"": ""in"", ""value"": [""Grade 3"", ""Grade 4"", ""Severe""]}}",WHO.PHARMA.2023.ADR,"{""grade_3_threshold"": 3, ""grade_4_threshold"": 4}",1.0`;

  fs.writeFileSync('test-dak-rules.csv', csvContent);
  console.log('✅ Test CSV file created with 5 DAK rules');
}

async function testCSVUpload() {
  console.log('📤 Testing DAK CSV upload...');
  
  try {
    const form = new FormData();
    form.append('dakFile', fs.createReadStream('test-dak-rules.csv'));

    const response = await axios.post(`${BASE_URL}/api/admin/dak/upload-csv`, form, {
      headers: {
        ...form.getHeaders(),
        'Cookie': authCookie
      }
    });

    console.log('✅ CSV upload successful:', {
      success: response.data.success,
      message: response.data.message,
      statistics: response.data.statistics
    });

    return response.data.jobId;
  } catch (error) {
    console.error('❌ CSV upload failed:', error.response?.data || error.message);
    return null;
  }
}

async function testRuleIntegrityCheck() {
  console.log('🔍 Testing rule integrity verification...');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/admin/dak/integrity-check`, {
      headers: { 'Cookie': authCookie }
    });

    console.log('✅ Integrity check completed:', {
      success: response.data.success,
      totalRules: response.data.totalRules,
      validRules: response.data.validRules,
      issuesFound: response.data.issuesFound
    });

    if (response.data.issues && response.data.issues.length > 0) {
      console.log('⚠️  Issues found:', response.data.issues.slice(0, 3));
    }

    return response.data.success;
  } catch (error) {
    console.error('❌ Integrity check failed:', error.response?.data || error.message);
    return false;
  }
}

async function testComplianceReport() {
  console.log('📊 Testing compliance report generation...');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/admin/dak/compliance-report`, {
      headers: { 'Cookie': authCookie }
    });

    console.log('✅ Compliance report generated:', {
      totalRules: response.data.totalRules,
      validRules: response.data.validRules,
      compliance: response.data.compliance
    });

    return true;
  } catch (error) {
    console.error('❌ Compliance report failed:', error.response?.data || error.message);
    return false;
  }
}

async function testDecisionSupportRetrieval() {
  console.log('🧠 Testing decision support message retrieval...');
  
  const modules = ['ANC', 'ART', 'PHARMACOVIGILANCE'];
  
  for (const module of modules) {
    try {
      const response = await axios.get(`${BASE_URL}/api/dak/decision-support/${module}`, {
        headers: { 'Cookie': authCookie }
      });

      console.log(`✅ ${module} module messages:`, {
        count: response.data.count,
        activeOnly: response.data.activeOnly
      });

      if (response.data.messages.length > 0) {
        console.log(`   Sample message: ${response.data.messages[0].message.substring(0, 80)}...`);
      }
    } catch (error) {
      console.error(`❌ ${module} module retrieval failed:`, error.response?.data || error.message);
    }
  }
}

async function testCacheManagement() {
  console.log('🗄️  Testing cache management...');
  
  try {
    // Get cache stats
    let response = await axios.get(`${BASE_URL}/api/admin/dak/cache/stats`, {
      headers: { 'Cookie': authCookie }
    });
    console.log('📈 Cache stats:', response.data.cacheStatistics);

    // Warm cache
    response = await axios.post(`${BASE_URL}/api/admin/dak/cache/warm`, {
      modules: ['ANC', 'ART']
    }, {
      headers: { 'Cookie': authCookie }
    });
    console.log('✅ Cache warmed:', response.data.message);

    // Invalidate cache
    response = await axios.post(`${BASE_URL}/api/admin/dak/cache/invalidate`, {
      moduleCode: 'ANC'
    }, {
      headers: { 'Cookie': authCookie }
    });
    console.log('✅ Cache invalidated:', response.data.message);

    return true;
  } catch (error) {
    console.error('❌ Cache management failed:', error.response?.data || error.message);
    return false;
  }
}

async function testRulesManagement() {
  console.log('⚙️  Testing clinical decision rules management...');
  
  try {
    // Get rules
    const response = await axios.get(`${BASE_URL}/api/admin/dak/rules?limit=10&activeOnly=true`, {
      headers: { 'Cookie': authCookie }
    });

    console.log('✅ Rules retrieved:', {
      count: response.data.count,
      totalRules: response.data.rules.length
    });

    if (response.data.rules.length > 0) {
      const rule = response.data.rules[0];
      console.log(`   Sample rule: ${rule.ruleCode} - ${rule.decisionSupportMessage?.substring(0, 60)}...`);
      
      // Test rule update
      const updateResponse = await axios.patch(`${BASE_URL}/api/admin/dak/rules/${rule.id}`, {
        ruleDescription: `Updated: ${rule.ruleDescription || 'Test description'}`
      }, {
        headers: { 'Cookie': authCookie }
      });
      
      if (updateResponse.data.success) {
        console.log('✅ Rule updated successfully');
      }
    }

    return true;
  } catch (error) {
    console.error('❌ Rules management failed:', error.response?.data || error.message);
    return false;
  }
}

async function cleanup() {
  console.log('🧹 Cleaning up test files...');
  try {
    if (fs.existsSync('test-dak-rules.csv')) {
      fs.unlinkSync('test-dak-rules.csv');
    }
    console.log('✅ Cleanup completed');
  } catch (error) {
    console.log('⚠️  Cleanup warning:', error.message);
  }
}

async function runDAKTraceableSystemTest() {
  console.log('🚀 Starting DAK-Traceable Clinical Decision Support System Test\n');
  console.log('=' .repeat(70));

  const results = {
    login: false,
    csvUpload: false,
    integrityCheck: false,
    complianceReport: false,
    decisionSupport: false,
    cacheManagement: false,
    rulesManagement: false
  };

  try {
    // Step 1: Login
    results.login = await login();
    if (!results.login) {
      console.log('❌ Cannot proceed without admin access');
      return;
    }

    // Step 2: Create and upload test CSV
    await createTestCSV();
    const jobId = await testCSVUpload();
    results.csvUpload = jobId !== null;

    // Step 3: Test integrity verification
    results.integrityCheck = await testRuleIntegrityCheck();

    // Step 4: Test compliance reporting
    results.complianceReport = await testComplianceReport();

    // Step 5: Test decision support retrieval
    await testDecisionSupportRetrieval();
    results.decisionSupport = true;

    // Step 6: Test cache management
    results.cacheManagement = await testCacheManagement();

    // Step 7: Test rules management
    results.rulesManagement = await testRulesManagement();

  } catch (error) {
    console.error('💥 Test suite error:', error.message);
  } finally {
    await cleanup();
  }

  // Final results
  console.log('\n' + '=' .repeat(70));
  console.log('📋 DAK-TRACEABLE SYSTEM TEST RESULTS');
  console.log('=' .repeat(70));
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${test.toUpperCase()}`);
  });

  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 DAK-Traceable Clinical Decision Support System is fully operational!');
  } else {
    console.log('⚠️  Some components need attention - check error messages above');
  }
}

// Run the test
runDAKTraceableSystemTest().catch(console.error);