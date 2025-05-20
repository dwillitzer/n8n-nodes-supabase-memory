import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription, NodeExecutionWithMetadata } from 'n8n-workflow';
import { SupabaseMemory } from './nodes/SupabaseMemory/SupabaseMemory.node';
import { SupabaseApi } from './credentials/SupabaseApi.credentials';

export class SupabaseMemoryNode implements INodeType {
  description: INodeTypeDescription = {
    ...new SupabaseMemory().description,
  };

  // Simply forward execution to the actual implementation
  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][] | NodeExecutionWithMetadata[][] | null> {
    const instance = new SupabaseMemory();
    return instance.execute.call(this);
  }
}

export class SupabaseApiCredentials {
  name = 'supabaseApi';
  displayName = 'Supabase API';
  documentationUrl = 'https://supabase.com/docs/reference/javascript/initializing';
  properties = new SupabaseApi().properties;
}
