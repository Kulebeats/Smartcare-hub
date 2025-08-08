import Anthropic from '@anthropic-ai/sdk';

// The newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Analyzes clinical data using Anthropic Claude to provide treatment recommendations
 * and clinical decision support based on patient symptoms and history.
 * 
 * @param patientData Clinical information about the patient
 * @returns Structured treatment recommendations and clinical guidance
 */
export async function analyzeClinicalData(patientData: any): Promise<any> {
  try {
    const systemPrompt = `You are a clinical decision support AI assistant for healthcare providers in Zambia.
    Analyze the provided patient data and provide evidence-based recommendations.
    Focus on practical guidance that follows Zambian Ministry of Health treatment guidelines.
    Include potential medication interactions, adverse reactions to monitor, and follow-up recommendations.
    Format your response in a structured way with clear sections.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        { 
          role: 'user', 
          content: `Please analyze this patient data and provide clinical recommendations: ${JSON.stringify(patientData)}`
        }
      ],
    });

    return {
      recommendations: response.content[0].type === 'text' ? response.content[0].text : 'No recommendations available',
      status: 'success'
    };
  } catch (error: any) {
    console.error('Error analyzing clinical data:', error);
    return {
      recommendations: 'Unable to generate clinical recommendations at this time.',
      status: 'error',
      error: error.message
    };
  }
}

/**
 * Analyzes adverse drug reactions to determine severity, potential causes,
 * and recommended interventions based on pharmacovigilance data.
 * 
 * @param adrData Information about the adverse drug reaction
 * @returns Assessment of the ADR with guidance for healthcare providers
 */
export async function analyzeAdverseReaction(adrData: any): Promise<any> {
  try {
    const systemPrompt = `You are a pharmacovigilance specialist AI assistant for healthcare providers in Zambia.
    Analyze the provided adverse drug reaction data and provide evidence-based assessment.
    Consider the specific medications involved, patient history, and presenting symptoms.
    Your response should help healthcare providers determine:
    1. The likelihood the reaction is caused by the medication
    2. The severity of the reaction and whether medication should be stopped
    3. Alternative treatment options if available
    4. Required monitoring and follow-up
    Format your response in a structured way with clear sections.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        { 
          role: 'user', 
          content: `Please analyze this adverse drug reaction data and provide assessment: ${JSON.stringify(adrData)}`
        }
      ],
    });

    return {
      assessment: response.content[0].type === 'text' ? response.content[0].text : 'No assessment available',
      status: 'success'
    };
  } catch (error: any) {
    console.error('Error analyzing adverse reaction:', error);
    return {
      assessment: 'Unable to generate adverse reaction assessment at this time.',
      status: 'error',
      error: error.message
    };
  }
}

/**
 * Generates prioritized task recommendations for healthcare providers
 * based on patient data, clinic conditions, and healthcare protocols.
 * 
 * @param clinicData Information about patients, resources, and current tasks
 * @returns Prioritized list of recommended clinical tasks
 */
export async function generateTaskRecommendations(clinicData: any): Promise<any> {
  const { currentTasks, priorities = [], categories = [], clinicContext = '' } = clinicData;

  try {
    const systemPrompt = `You are a healthcare task prioritization AI assistant for SmartCare PRO, a Zambian 
    electronic health record system. Based on the current tasks and clinic context, 
    generate practical, actionable task recommendations for healthcare providers.
    
    Follow these guidelines:
    1. Prioritize urgent clinical matters like pharmacovigilance issues or critical follow-ups
    2. Consider resource constraints in Zambian healthcare settings
    3. Focus on HIV/AIDS treatment monitoring, pharmacovigilance, and PrEP assessments
    4. Generate specific, actionable tasks that can be completed within a clinical workflow
    5. Provide clear reasoning for each recommendation
    6. Format your response as a JSON array of recommendation objects
    
    Each recommendation object must include:
    - title: Concise, specific task title
    - description: Detailed explanation of what needs to be done
    - priority: 'high', 'medium', or 'low'
    - category: One of [pharmacovigilance, art_followup, prep_assessment, medical_records, lab_results, general]
    - reasoning: Brief explanation of why this task is important
    - dueDate: Suggested due date in YYYY-MM-DD format (optional)
    - patientId: Patient identifier if applicable (optional)`;

    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `I need task recommendations for our clinic. Here's the context:
          
          Current Task List:
          ${JSON.stringify(currentTasks, null, 2)}
          
          Clinical Context:
          ${clinicContext || 'Standard operations at a busy HIV/AIDS treatment clinic in Zambia.'}
          
          Priority Areas (if any):
          ${priorities.length > 0 ? priorities.join(', ') : 'All areas equally important'}
          
          Generate 3-5 recommended tasks that would be most valuable to add to our workload,
          based on gaps you identify or opportunities for improved care.`
        }
      ]
    });

    // Extract and parse JSON from the response
    const responseText = typeof response.content[0] === 'object' && 'text' in response.content[0] 
      ? response.content[0].text 
      : '[]';
    
    // Find JSON array in the response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Failed to extract recommendations JSON from Claude response');
    }

    const recommendations = JSON.parse(jsonMatch[0]);
    return { recommendations };
  } catch (error: any) {
    console.error('Error generating task recommendations:', error);
    return {
      recommendations: [],
      status: 'error',
      error: error.message
    };
  }
}

/**
 * Uses Claude to prioritize a list of tasks based on clinical importance,
 * patient needs, and healthcare protocols.
 * 
 * @param data Object containing tasks array and optional clinic context
 * @returns Prioritized tasks and explanation
 */
export async function prioritizeTasks(data: { tasks: any[], clinicContext?: string }): Promise<any> {
  const { tasks, clinicContext = '' } = data;

  try {
    const systemPrompt = `You are a healthcare task prioritization AI assistant for SmartCare PRO, a Zambian 
    electronic health record system. Your job is to analyze and prioritize clinical tasks
    to help healthcare providers optimize their workflow.
    
    Follow these guidelines:
    1. Analyze each task for clinical urgency, patient impact, and resource requirements
    2. Consider the healthcare context in Zambia, including resource constraints
    3. Prioritize tasks related to critical patient care, especially HIV/AIDS treatment
    4. Explain your reasoning clearly, using clinical best practices
    5. Format your response with both a prioritized task list and explanation`;

    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `I need help prioritizing these clinical tasks. Please analyze and rearrange them in order of importance:
          
          Tasks:
          ${JSON.stringify(tasks, null, 2)}
          
          Clinical Context:
          ${clinicContext || 'Standard operations at a busy HIV/AIDS treatment clinic in Zambia.'}
          
          Please provide:
          1. The prioritized list of tasks with any suggested changes to priority levels
          2. A brief explanation of your prioritization strategy`
        }
      ]
    });

    const responseText = typeof response.content[0] === 'object' && 'text' in response.content[0] 
      ? response.content[0].text 
      : '';
    
    // Extract the prioritized tasks and explanation
    // This is a simplified extraction - in a real implementation, 
    // you might want more robust parsing
    let prioritizedTasks;
    let explanation = "";
    
    // Try to find JSON in the response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        prioritizedTasks = JSON.parse(jsonMatch[0]);
      } catch (e) {
        // If JSON parsing fails, use original tasks but preserve Claude's reasoning
        prioritizedTasks = tasks;
      }
    } else {
      prioritizedTasks = tasks;
    }
    
    // Extract explanation (everything after prioritized tasks)
    const explanationMatch = responseText.match(/explanation:\s*([\s\S]*)/i);
    if (explanationMatch) {
      explanation = explanationMatch[1].trim();
    } else {
      explanation = "Task prioritization complete based on clinical importance, urgency, and patient impact.";
    }

    return { 
      prioritizedTasks,
      explanation
    };
  } catch (error: any) {
    console.error('Error prioritizing tasks:', error);
    return {
      prioritizedTasks: tasks,
      explanation: "Unable to generate prioritization at this time due to an error.",
      status: 'error',
      error: error.message
    };
  }
}

/**
 * Analyzes task performance metrics to identify patterns,
 * bottlenecks, and areas for improvement in clinical workflows.
 * 
 * @param data Object containing completed tasks, pending tasks, and timespan
 * @returns Analysis with metrics, bottlenecks, and recommendations
 */
export async function analyzeTaskPerformance(data: {
  completedTasks: any[],
  pendingTasks: any[],
  timespan: string
}): Promise<any> {
  const { completedTasks, pendingTasks, timespan } = data;

  try {
    const systemPrompt = `You are a healthcare analytics AI for SmartCare PRO, a Zambian electronic health
    record system. Your role is to analyze task performance data and provide insights to
    improve clinical workflows and patient care.
    
    Follow these guidelines:
    1. Calculate key performance metrics from the provided task data
    2. Identify bottlenecks and inefficiencies in the clinical workflow
    3. Provide specific, actionable recommendations for improvement
    4. Consider the Zambian healthcare context and resource constraints
    5. Format your response as a structured analysis with metrics, bottlenecks, and recommendations`;

    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `I need an analysis of our clinic's task performance for the past ${timespan}.
          
          Completed Tasks:
          ${JSON.stringify(completedTasks, null, 2)}
          
          Pending Tasks:
          ${JSON.stringify(pendingTasks, null, 2)}
          
          Please provide:
          1. Key performance metrics (completion rate, average time to complete, etc.)
          2. Identified bottlenecks or inefficiencies
          3. Specific recommendations for improvement
          4. A brief summary of the analysis`
        }
      ]
    });

    const responseText = typeof response.content[0] === 'object' && 'text' in response.content[0] 
      ? response.content[0].text 
      : '';
    
    // Parse the response to extract structured data
    // This is a simplified extraction - in a real implementation, 
    // you might want more robust parsing
    const completionRateMatch = responseText.match(/completion rate:?\s*([\d.]+%)/i);
    const avgTimeMatch = responseText.match(/average time to complete:?\s*([^,\n.]+)/i);
    
    // Extract bottlenecks
    const bottlenecksSection = responseText.match(/bottlenecks[^:]*:([^#]*)/i);
    const bottlenecks = bottlenecksSection ? 
      bottlenecksSection[1].split(/\n\s*-\s*/)
        .filter((item: string) => item.trim().length > 0)
        .map((item: string) => item.trim()) :
      ["No specific bottlenecks identified"];
    
    // Extract recommendations
    const recommendationsSection = responseText.match(/recommendations[^:]*:([^#]*)/i);
    const recommendations = recommendationsSection ?
      recommendationsSection[1].split(/\n\s*-\s*/)
        .filter((item: string) => item.trim().length > 0)
        .map((item: string) => item.trim()) :
      ["No specific recommendations identified"];
    
    // Extract or create summary
    const summarySection = responseText.match(/summary[^:]*:([^#]*)/i);
    const summary = summarySection ? 
      summarySection[1].trim() :
      "Analysis complete. Review metrics and recommendations to improve clinical workflow efficiency.";
    
    return {
      completionRate: completionRateMatch ? completionRateMatch[1] : "N/A",
      averageTimeToComplete: avgTimeMatch ? avgTimeMatch[1] : "N/A",
      bottlenecks,
      recommendations,
      summary
    };
  } catch (error: any) {
    console.error('Error analyzing task performance:', error);
    return {
      completionRate: "N/A",
      averageTimeToComplete: "N/A",
      bottlenecks: ["Unable to analyze bottlenecks at this time."],
      recommendations: ["Unable to generate recommendations at this time."],
      summary: "Error analyzing task performance data.",
      status: 'error',
      error: error.message
    };
  }
}

export default {
  analyzeClinicalData,
  analyzeAdverseReaction,
  generateTaskRecommendations
};