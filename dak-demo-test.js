/**
 * DAK-Traceable System Demonstration
 * Shows comprehensive clinical decision support with CSV upload and rule management
 */

import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

const BASE_URL = 'http://localhost:5000';

async function loginAsAdmin() {
  try {
    const response = await axios.post(`${BASE_URL}/api/login`, {
      username: 'superadmin',
      password: 'smartcare2024'
    }, {
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.headers['set-cookie']) {
      return response.headers['set-cookie'][0].split(';')[0];
    }
    return null;
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    return null;
  }
}

async function createSampleDAKRules() {
  console.log('Creating sample DAK clinical rules CSV...');
  
  const csvContent = `rule_identifier,dak_source_id,guideline_doc_version,evidence_rating,display_to_health_worker,applicable_module,is_rule_active,rule_name,rule_description,alert_severity,alert_title,alert_message,recommendations,trigger_conditions,who_guideline_ref,clinical_thresholds,version
ANC_HYPERTENSION_SEVERE,DAK_ANC_001,WHO_ANC_2024_v3.0,A,"Severe hypertension detected - immediate intervention required",ANC,true,"Severe Hypertension Alert","Blood pressure readings indicate severe hypertension requiring urgent care",red,"URGENT: Severe Hypertension","BP ≥160/110 mmHg - Immediate medical attention required","[""Administer antihypertensive medication"",""Monitor every 15 minutes"",""Prepare for emergency referral"",""Check for pre-eclampsia signs""]","{""systolicBP"":{""operator"":"">="",""value"":160},""diastolicBP"":{""operator"":"">="",""value"":110}}",WHO.ANC.2024.HTN.SEVERE,"{""critical_systolic"":180,""critical_diastolic"":120}",1.0
ANC_ANEMIA_MODERATE,DAK_ANC_002,WHO_ANC_2024_v3.0,A,"Moderate anemia requires iron supplementation",ANC,true,"Moderate Anemia","Hemoglobin levels indicate moderate anemia",yellow,"Moderate Anemia Detected","Hb 7-10 g/dL - Start iron therapy","[""Start iron supplementation 60mg daily"",""Dietary counseling on iron-rich foods"",""Follow-up in 4 weeks"",""Screen for underlying causes""]","{""hemoglobin"":{""operator"":""<"",""value"":10.0,""operator2"":"">="",""value2"":7.0}}",WHO.ANC.2024.ANEMIA.MOD,"{""mild_threshold"":11.0,""severe_threshold"":7.0}",1.0
ANC_PROTEINURIA_SIGNIFICANT,DAK_ANC_003,WHO_ANC_2024_v3.0,B,"Significant proteinuria may indicate pre-eclampsia",ANC,true,"Proteinuria Detection","Protein levels in urine suggest possible pre-eclampsia development",yellow,"Proteinuria Found","2+ protein or >300mg/24h detected","[""Confirm with 24-hour urine collection"",""Monitor blood pressure closely"",""Watch for pre-eclampsia symptoms"",""Consider specialist referral""]","{""urineProtein"":{""operator"":"">="",""value"":2},""protein24h"":{""operator"":"">="",""value"":300}}",WHO.ANC.2024.PREECLAMPSIA,"{""trace_level"":1,""significant_level"":2}",1.0
ART_VIRAL_SUPPRESSION_FAILURE,DAK_ART_001,WHO_ART_2024_v2.3,A,"Viral load indicates treatment failure",ART,true,"Treatment Failure Alert","Elevated viral load suggests ART regimen failure",red,"Treatment Failure","VL >1000 copies/mL after 6 months","[""Review adherence counseling"",""Check for drug resistance"",""Consider regimen switch"",""Intensify monitoring""]","{""viralLoad"":{""operator"":"">="",""value"":1000},""treatmentDuration"":{""operator"":"">="",""value"":6}}",WHO.ART.2024.VL.FAILURE,"{""suppression_target"":50,""failure_threshold"":1000}",1.0
PHARMA_SEVERE_ADR,DAK_PHARMA_001,WHO_PHARMA_2024_v1.4,A,"Severe adverse drug reaction documented",PHARMACOVIGILANCE,true,"Severe ADR Alert","Life-threatening or disabling adverse reaction",red,"Severe ADR Reported","Grade 4 ADR requiring immediate action","[""Discontinue suspected medication immediately"",""Provide supportive treatment"",""Report to national pharmacovigilance center"",""Document detailed ADR information""]","{""adrGrade"":{""operator"":"">="",""value"":4},""severity"":{""operator"":""in"",""value"":[""Severe"",""Life-threatening""]}}",WHO.PHARMA.2024.ADR.SEVERE,"{""mild_grade"":1,""severe_grade"":4}",1.0`;

  fs.writeFileSync('sample-dak-rules.csv', csvContent);
  console.log('Sample DAK rules CSV created with 5 clinical decision rules');
}

async function uploadDAKRules(authCookie) {
  console.log('\nUploading DAK rules via CSV...');
  
  try {
    const form = new FormData();
    form.append('dakFile', fs.createReadStream('sample-dak-rules.csv'));

    const response = await axios.post(`${BASE_URL}/api/admin/dak/upload-csv`, form, {
      headers: {
        ...form.getHeaders(),
        'Cookie': authCookie
      }
    });

    console.log('CSV Upload Result:', {
      success: response.data.success,
      message: response.data.message,
      statistics: response.data.statistics
    });

    return response.data.jobId;
  } catch (error) {
    console.error('Upload failed:', error.response?.data || error.message);
    return null;
  }
}

async function checkIntegrity(authCookie) {
  console.log('\nChecking rule integrity and compliance...');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/admin/dak/integrity-check`, {
      headers: { 'Cookie': authCookie }
    });

    console.log('Integrity Check Results:', {
      totalRules: response.data.totalRules,
      validRules: response.data.validRules,
      issuesFound: response.data.issuesFound,
      summary: response.data.summary
    });

    return response.data.success;
  } catch (error) {
    console.error('Integrity check failed:', error.response?.data || error.message);
    return false;
  }
}

async function testDecisionSupport(authCookie) {
  console.log('\nTesting decision support retrieval...');
  
  const modules = ['ANC', 'ART', 'PHARMACOVIGILANCE'];
  
  for (const module of modules) {
    try {
      const response = await axios.get(`${BASE_URL}/api/dak/decision-support/${module}`, {
        headers: { 'Cookie': authCookie }
      });

      console.log(`${module} Decision Support:`, {
        activeRules: response.data.count,
        sampleRule: response.data.messages[0] ? {
          code: response.data.messages[0].ruleCode,
          message: response.data.messages[0].message.substring(0, 80) + '...',
          severity: response.data.messages[0].severity,
          dakReference: response.data.messages[0].dakReference
        } : 'No rules found'
      });
    } catch (error) {
      console.error(`${module} retrieval failed:`, error.response?.data || error.message);
    }
  }
}

async function demonstrateCacheManagement(authCookie) {
  console.log('\nDemonstrating cache management...');
  
  try {
    // Get cache statistics
    let response = await axios.get(`${BASE_URL}/api/admin/dak/cache/stats`, {
      headers: { 'Cookie': authCookie }
    });
    console.log('Cache Statistics:', response.data.cacheStatistics);

    // Warm cache for performance
    response = await axios.post(`${BASE_URL}/api/admin/dak/cache/warm`, {
      modules: ['ANC', 'ART', 'PHARMACOVIGILANCE']
    }, {
      headers: { 'Cookie': authCookie }
    });
    console.log('Cache Warming:', response.data.message);

    // Show updated statistics
    response = await axios.get(`${BASE_URL}/api/admin/dak/cache/stats`, {
      headers: { 'Cookie': authCookie }
    });
    console.log('Updated Cache Stats:', response.data.cacheStatistics);

  } catch (error) {
    console.error('Cache management failed:', error.response?.data || error.message);
  }
}

async function showRulesManagement(authCookie) {
  console.log('\nDemonstrating clinical decision rules management...');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/admin/dak/rules?limit=5&activeOnly=true`, {
      headers: { 'Cookie': authCookie }
    });

    console.log('Clinical Decision Rules:', {
      totalRetrieved: response.data.count,
      sampleRules: response.data.rules.slice(0, 2).map(rule => ({
        id: rule.id,
        code: rule.ruleCode,
        module: rule.moduleCode,
        severity: rule.alertSeverity,
        dakReference: rule.dakReference,
        evidenceQuality: rule.evidenceQuality,
        isActive: rule.isActive
      }))
    });

  } catch (error) {
    console.error('Rules management failed:', error.response?.data || error.message);
  }
}

async function cleanup() {
  try {
    if (fs.existsSync('sample-dak-rules.csv')) {
      fs.unlinkSync('sample-dak-rules.csv');
    }
    console.log('\nCleanup completed');
  } catch (error) {
    console.log('Cleanup warning:', error.message);
  }
}

async function demonstrateDAKSystem() {
  console.log('='.repeat(80));
  console.log('DAK-TRACEABLE CLINICAL DECISION SUPPORT SYSTEM DEMONSTRATION');
  console.log('='.repeat(80));

  try {
    // Step 1: Login as admin
    console.log('\n1. Authenticating as admin...');
    const authCookie = await loginAsAdmin();
    if (!authCookie) {
      console.log('Cannot proceed without admin authentication');
      return;
    }
    console.log('Admin authentication successful');

    // Step 2: Create and upload sample DAK rules
    console.log('\n2. Creating and uploading sample clinical decision rules...');
    await createSampleDAKRules();
    const jobId = await uploadDAKRules(authCookie);
    if (jobId) {
      console.log(`Processing job created: ${jobId}`);
    }

    // Step 3: Verify rule integrity
    console.log('\n3. Verifying rule integrity and compliance...');
    await checkIntegrity(authCookie);

    // Step 4: Test decision support retrieval
    console.log('\n4. Testing decision support message retrieval...');
    await testDecisionSupport(authCookie);

    // Step 5: Demonstrate cache management
    console.log('\n5. Demonstrating intelligent caching system...');
    await demonstrateCacheManagement(authCookie);

    // Step 6: Show rules management capabilities
    console.log('\n6. Showing clinical decision rules management...');
    await showRulesManagement(authCookie);

    console.log('\n' + '='.repeat(80));
    console.log('DAK-TRACEABLE SYSTEM DEMONSTRATION COMPLETED SUCCESSFULLY');
    console.log('='.repeat(80));
    console.log('\nKey Features Demonstrated:');
    console.log('• CSV-based bulk rule management with streaming processing');
    console.log('• DAK reference tracking for full governance and traceability');
    console.log('• Automated rule integrity verification and compliance monitoring');
    console.log('• Intelligent caching system for optimal performance');
    console.log('• Administrative controls for rule management');
    console.log('• Evidence quality grading (A-D rating system)');
    console.log('• Module-specific decision support message retrieval');

  } catch (error) {
    console.error('Demonstration error:', error.message);
  } finally {
    await cleanup();
  }
}

// Run the demonstration
demonstrateDAKSystem().catch(console.error);