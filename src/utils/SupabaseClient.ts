import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

export interface ISupabaseClientOptions {
  supabaseUrl: string;
  supabaseKey: string;
  schema?: string;
}

export class SupabaseClientManager {
  private static client: SupabaseClient | null = null;
  private static schema: string = 'dynamictools';

  /**
   * Initialize or return an existing Supabase client
   */
  static getClient(options: ISupabaseClientOptions): SupabaseClient {
    if (this.client === null) {
      this.client = createClient(options.supabaseUrl, options.supabaseKey);
      if (options.schema) {
        this.schema = options.schema;
      }
    }
    return this.client;
  }

  /**
   * Get the schema name
   */
  static getSchema(): string {
    return this.schema;
  }

  /**
   * Store memory in agent_memory table
   */
  static async storeMemory(
    client: SupabaseClient,
    sessionId: string,
    stepIndex: number,
    agentName: string,
    guidance: string,
    agentOutput: string,
    intermediateData: any,
    userId?: string,
  ): Promise<any> {
    const { data, error } = await client
      .from(`${this.schema}.agent_memory`)
      .insert({
        session_id: sessionId,
        step_index: stepIndex,
        agent_name: agentName,
        guidance: guidance,
        agent_output: agentOutput,
        intermediate_data: intermediateData,
        user_id: userId || null,
      })
      .select();

    if (error) throw new Error(`Error storing memory: ${error.message}`);
    return data;
  }

  /**
   * Retrieve memory from agent_memory table
   */
  static async retrieveMemory(
    client: SupabaseClient,
    sessionId: string,
    agentName?: string,
    limit: number = 10,
  ): Promise<any> {
    let query = client
      .from(`${this.schema}.agent_memory`)
      .select('*')
      .eq('session_id', sessionId)
      .order('step_index', { ascending: false })
      .limit(limit);

    if (agentName) {
      query = query.eq('agent_name', agentName);
    }

    const { data, error } = await query;

    if (error) throw new Error(`Error retrieving memory: ${error.message}`);
    return data;
  }

  /**
   * Store workflow execution data
   */
  static async storeWorkflowExecution(
    client: SupabaseClient,
    sessionId: string,
    plannedWorkflowId: number | null,
    originalUserQuery: string,
    plannerOutput: any,
    executionTrace: any,
    status: string,
    finalOutput: any,
    errorMessage: string | null,
    userId?: string,
  ): Promise<any> {
    const { data, error } = await client
      .from(`${this.schema}.workflow_executions`)
      .insert({
        session_id: sessionId,
        planned_workflow_id: plannedWorkflowId,
        original_user_query: originalUserQuery,
        planner_output: plannerOutput,
        execution_trace: executionTrace,
        status: status,
        final_output: finalOutput,
        error_message: errorMessage,
        executed_by_user_id: userId || null,
      })
      .select();

    if (error) throw new Error(`Error storing workflow execution: ${error.message}`);
    return data;
  }

  /**
   * Retrieve workflow execution data
   */
  static async retrieveWorkflowExecution(
    client: SupabaseClient,
    sessionId: string,
  ): Promise<any> {
    const { data, error } = await client
      .from(`${this.schema}.workflow_executions`)
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (error) throw new Error(`Error retrieving workflow execution: ${error.message}`);
    return data;
  }

  /**
   * Update workflow execution status
   */
  static async updateWorkflowExecutionStatus(
    client: SupabaseClient,
    id: number,
    status: string,
    finalOutput?: any,
    errorMessage?: string,
  ): Promise<any> {
    const updateData: any = { status };
    
    if (finalOutput !== undefined) {
      updateData.final_output = finalOutput;
    }
    
    if (errorMessage !== undefined) {
      updateData.error_message = errorMessage;
    }
    
    if (status === 'completed' || status === 'failed') {
      updateData.ended_at = new Date();
    }

    const { data, error } = await client
      .from(`${this.schema}.workflow_executions`)
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw new Error(`Error updating workflow execution: ${error.message}`);
    return data;
  }
}
