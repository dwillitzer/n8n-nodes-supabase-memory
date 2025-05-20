import {
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class SupabaseApi implements ICredentialType {
  name = 'supabaseApi';
  displayName = 'Supabase API';
  documentationUrl = 'https://supabase.com/docs/reference/javascript/initializing';
  properties: INodeProperties[] = [
    {
      displayName: 'Supabase URL',
      name: 'supabaseUrl',
      type: 'string',
      default: '',
      required: true,
      description: 'URL of your Supabase project',
    },
    {
      displayName: 'Supabase API Key',
      name: 'supabaseKey',
      type: 'string',
      default: '',
      required: true,
      typeOptions: {
        password: true,
      },
      description: 'API key for your Supabase project (anon or service_role key)',
    },
    {
      displayName: 'Use Service Role Key',
      name: 'useServiceRole',
      type: 'boolean',
      default: false,
      description: 'Whether to use the service_role key (more permissions) or the anon key',
    },
  ];
}
