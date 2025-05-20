import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
} from 'n8n-workflow';

import { SupabaseClientManager } from '../../utils/SupabaseClient';
import { v4 as uuidv4 } from 'uuid';

export class SupabaseMemory implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Supabase Memory',
    name: 'supabaseMemory',
    icon: 'file:supabase.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'AI Tool Agent Memory with Supabase',
    defaults: {
      name: 'Supabase Memory',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'supabaseApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Agent Memory',
            value: 'agentMemory',
          },
          {
            name: 'Workflow Execution',
            value: 'workflowExecution',
          },
        ],
        default: 'agentMemory',
        required: true,
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['agentMemory'],
          },
        },
        options: [
          {
            name: 'Store',
            value: 'store',
            description: 'Store agent memory',
            action: 'Store agent memory',
          },
          {
            name: 'Retrieve',
            value: 'retrieve',
            description: 'Retrieve agent memory',
            action: 'Retrieve agent memory',
          },
        ],
        default: 'store',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['workflowExecution'],
          },
        },
        options: [
          {
            name: 'Store',
            value: 'store',
            description: 'Store workflow execution',
            action: 'Store workflow execution',
          },
          {
            name: 'Retrieve',
            value: 'retrieve',
            description: 'Retrieve workflow execution',
            action: 'Retrieve workflow execution',
          },
          {
            name: 'Update Status',
            value: 'updateStatus',
            description: 'Update workflow execution status',
            action: 'Update workflow execution status',
          },
        ],
        default: 'store',
      },
      // Session ID Field
      {
        displayName: 'Session ID',
        name: 'sessionId',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            operation: ['store', 'retrieve'],
          },
        },
        description: 'Session ID to store/retrieve memory (leave empty to generate new UUID for store operations)',
      },
      // Agent Memory - Store Operation Fields
      {
        displayName: 'Step Index',
        name: 'stepIndex',
        type: 'number',
        default: 0,
        displayOptions: {
          show: {
            resource: ['agentMemory'],
            operation: ['store'],
          },
        },
        description: 'Step index in the agent execution sequence',
      },
      {
        displayName: 'Agent Name',
        name: 'agentName',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['agentMemory'],
            operation: ['store', 'retrieve'],
          },
        },
        description: 'Name of the agent (e.g., "planner", "executor")',
      },
      {
        displayName: 'Guidance',
        name: 'guidance',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['agentMemory'],
            operation: ['store'],
          },
        },
        description: 'Guidance provided to the agent',
      },
      {
        displayName: 'Agent Output',
        name: 'agentOutput',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['agentMemory'],
            operation: ['store'],
          },
        },
        description: 'Output from the agent',
      },
      {
        displayName: 'Intermediate Data',
        name: 'intermediateData',
        type: 'json',
        default: '{}',
        displayOptions: {
          show: {
            resource: ['agentMemory'],
            operation: ['store'],
          },
        },
        description: 'Intermediate data from agent execution (JSON format)',
      },
      // Agent Memory - Retrieve Operation Fields
      {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        default: 10,
        displayOptions: {
          show: {
            resource: ['agentMemory'],
            operation: ['retrieve'],
          },
        },
        description: 'Maximum number of memory entries to retrieve',
      },
      // Workflow Execution - Store Operation Fields
      {
        displayName: 'Planned Workflow ID',
        name: 'plannedWorkflowId',
        type: 'number',
        default: 0,
        displayOptions: {
          show: {
            resource: ['workflowExecution'],
            operation: ['store'],
          },
        },
        description: 'ID of the planned workflow (0 for none)',
      },
      {
        displayName: 'Original User Query',
        name: 'originalUserQuery',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['workflowExecution'],
            operation: ['store'],
          },
        },
        description: 'Original query from the user',
      },
      {
        displayName: 'Planner Output',
        name: 'plannerOutput',
        type: 'json',
        default: '{}',
        displayOptions: {
          show: {
            resource: ['workflowExecution'],
            operation: ['store'],
          },
        },
        description: 'Output from the planner agent (JSON format)',
      },
      {
        displayName: 'Execution Trace',
        name: 'executionTrace',
        type: 'json',
        default: '{}',
        displayOptions: {
          show: {
            resource: ['workflowExecution'],
            operation: ['store'],
          },
        },
        description: 'Trace of the execution (JSON format)',
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'string',
        default: 'in_progress',
        displayOptions: {
          show: {
            resource: ['workflowExecution'],
            operation: ['store', 'updateStatus'],
          },
        },
        description: 'Status of the workflow execution (e.g., "in_progress", "completed", "failed")',
      },
      {
        displayName: 'Final Output',
        name: 'finalOutput',
        type: 'json',
        default: '{}',
        displayOptions: {
          show: {
            resource: ['workflowExecution'],
            operation: ['store', 'updateStatus'],
          },
        },
        description: 'Final output of the workflow execution (JSON format)',
      },
      {
        displayName: 'Error Message',
        name: 'errorMessage',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['workflowExecution'],
            operation: ['store', 'updateStatus'],
          },
        },
        description: 'Error message if the workflow execution failed',
      },
      // Workflow Execution - Update Status Operation Fields
      {
        displayName: 'Workflow Execution ID',
        name: 'workflowExecutionId',
        type: 'number',
        default: 0,
        displayOptions: {
          show: {
            resource: ['workflowExecution'],
            operation: ['updateStatus'],
          },
        },
        description: 'ID of the workflow execution to update',
      },
      // User ID Field (optional for both resources)
      {
        displayName: 'User ID',
        name: 'userId',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            operation: ['store'],
          },
        },
        description: 'ID of the user (optional)',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    
    // Get credentials
    const credentials = await this.getCredentials('supabaseApi');
    const supabaseUrl = credentials.supabaseUrl as string;
    const supabaseKey = credentials.supabaseKey as string;
    const useServiceRole = credentials.useServiceRole as boolean;
    
    // Initialize Supabase client
    const client = SupabaseClientManager.getClient({
      supabaseUrl,
      supabaseKey,
    });

    // Process each item
    for (let i = 0; i < items.length; i++) {
      try {
        const resource = this.getNodeParameter('resource', i) as string;
        const operation = this.getNodeParameter('operation', i) as string;
        
        // Get or generate session ID
        let sessionId = this.getNodeParameter('sessionId', i, '') as string;
        if (!sessionId && operation === 'store') {
          sessionId = uuidv4();
        } else if (!sessionId && operation === 'retrieve') {
          throw new NodeOperationError(this.getNode(), 'Session ID is required for retrieve operations', { itemIndex: i });
        }

        let result;
        
        // Handle Agent Memory operations
        if (resource === 'agentMemory') {
          if (operation === 'store') {
            const stepIndex = this.getNodeParameter('stepIndex', i) as number;
            const agentName = this.getNodeParameter('agentName', i) as string;
            const guidance = this.getNodeParameter('guidance', i) as string;
            const agentOutput = this.getNodeParameter('agentOutput', i) as string;
            const intermediateData = JSON.parse(this.getNodeParameter('intermediateData', i) as string);
            const userId = this.getNodeParameter('userId', i, '') as string;
            
            result = await SupabaseClientManager.storeMemory(
              client,
              sessionId,
              stepIndex,
              agentName,
              guidance,
              agentOutput,
              intermediateData,
              userId || undefined,
            );
          } else if (operation === 'retrieve') {
            const agentName = this.getNodeParameter('agentName', i, '') as string;
            const limit = this.getNodeParameter('limit', i) as number;
            
            result = await SupabaseClientManager.retrieveMemory(
              client,
              sessionId,
              agentName || undefined,
              limit,
            );
          }
        }
        // Handle Workflow Execution operations
        else if (resource === 'workflowExecution') {
          if (operation === 'store') {
            const plannedWorkflowId = this.getNodeParameter('plannedWorkflowId', i) as number;
            const originalUserQuery = this.getNodeParameter('originalUserQuery', i) as string;
            const plannerOutput = JSON.parse(this.getNodeParameter('plannerOutput', i) as string);
            const executionTrace = JSON.parse(this.getNodeParameter('executionTrace', i) as string);
            const status = this.getNodeParameter('status', i) as string;
            const finalOutput = JSON.parse(this.getNodeParameter('finalOutput', i) as string);
            const errorMessage = this.getNodeParameter('errorMessage', i, '') as string;
            const userId = this.getNodeParameter('userId', i, '') as string;
            
            result = await SupabaseClientManager.storeWorkflowExecution(
              client,
              sessionId,
              plannedWorkflowId || null,
              originalUserQuery,
              plannerOutput,
              executionTrace,
              status,
              finalOutput,
              errorMessage || null,
              userId || undefined,
            );
          } else if (operation === 'retrieve') {
            result = await SupabaseClientManager.retrieveWorkflowExecution(
              client,
              sessionId,
            );
          } else if (operation === 'updateStatus') {
            const workflowExecutionId = this.getNodeParameter('workflowExecutionId', i) as number;
            const status = this.getNodeParameter('status', i) as string;
            const finalOutput = JSON.parse(this.getNodeParameter('finalOutput', i) as string);
            const errorMessage = this.getNodeParameter('errorMessage', i, '') as string;
            
            result = await SupabaseClientManager.updateWorkflowExecutionStatus(
              client,
              workflowExecutionId,
              status,
              finalOutput,
              errorMessage || undefined,
            );
          }
        }

        // Add session ID to the result for reference
        const resultWithSession = {
          sessionId,
          ...result,
        };
        
        returnData.push({
          json: resultWithSession,
          pairedItem: { item: i },
        });
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: error instanceof Error ? error.message : String(error),
            },
            pairedItem: { item: i },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
