import { apiRequest } from "./queryClient";

export type TaskRecommendation = {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  dueDate?: string;
  patientId?: string;
  reasoning?: string;
};

export async function getTaskRecommendations(
  clinicData: {
    currentTasks: any[];
    priorities?: string[];
    categories?: string[];
    clinicContext?: string;
  }
): Promise<TaskRecommendation[]> {
  try {
    const response = await apiRequest("POST", "/api/task-recommendations", clinicData);
    
    if (!response.ok) {
      throw new Error(`Failed to get task recommendations: ${response.status}`);
    }
    
    const data = await response.json();
    return data.recommendations;
  } catch (error) {
    console.error("Error fetching task recommendations:", error);
    throw error;
  }
}

export async function getClaudeTaskPrioritization(
  tasks: any[], 
  clinicContext?: string
): Promise<{
  prioritizedTasks: any[];
  explanation: string;
}> {
  try {
    const response = await apiRequest("POST", "/api/prioritize-tasks", {
      tasks,
      clinicContext
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get task prioritization: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching task prioritization:", error);
    throw error;
  }
}

export async function analyzeTaskPerformance(
  completedTasks: any[],
  pendingTasks: any[],
  timespan: string
): Promise<{
  completionRate: string;
  averageTimeToComplete: string;
  bottlenecks: string[];
  recommendations: string[];
  summary: string;
}> {
  try {
    const response = await apiRequest("POST", "/api/analyze-performance", {
      completedTasks,
      pendingTasks,
      timespan
    });
    
    if (!response.ok) {
      throw new Error(`Failed to analyze task performance: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error analyzing task performance:", error);
    throw error;
  }
}