import { INodeType, INodeTypeDescription } from 'n8n-workflow';
import { SupabaseMemory } from './nodes/SupabaseMemory/SupabaseMemory.node';
import { SupabaseApi } from './credentials/SupabaseApi.credentials';

export class SupabaseMemoryNode implements INodeType {
  description: INodeTypeDescription = {
    ...new SupabaseMemory().description,
  };

  // Simply forward execution to the actual implementation
  // @ts-ignore - Ignoring TypeScript errors here as n8n runtime will provide the correct context
  async execute() {
    const instance = new SupabaseMemory();
    // @ts-ignore - This works at runtime even though TypeScript complains
    return instance.execute.apply(this, arguments);
  }
}

export class SupabaseApiCredentials {
  name = 'supabaseApi';
  displayName = 'Supabase API';
  documentationUrl = 'https://supabase.com/docs/reference/javascript/initializing';
  properties = new SupabaseApi().properties;
}
