// Test file for Supabase Memory node
import { SupabaseClientManager } from '../src/utils/SupabaseClient';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn().mockReturnValue({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    then: jest.fn().mockImplementation(callback => {
      return Promise.resolve(callback({ data: [{ id: 1 }], error: null }));
    }),
  }),
}));

describe('SupabaseClientManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize a Supabase client', () => {
    const client = SupabaseClientManager.getClient({
      supabaseUrl: 'https://example.supabase.co',
      supabaseKey: 'test-key',
    });
    
    expect(createClient).toHaveBeenCalledWith('https://example.supabase.co', 'test-key');
    expect(client).toBeDefined();
  });

  it('should store memory in agent_memory table', async () => {
    const client = SupabaseClientManager.getClient({
      supabaseUrl: 'https://example.supabase.co',
      supabaseKey: 'test-key',
    });
    
    const result = await SupabaseClientManager.storeMemory(
      client,
      'test-session-id',
      1,
      'planner',
      'Test guidance',
      'Test output',
      { key: 'value' },
    );
    
    expect(client.from).toHaveBeenCalledWith('dynamictools.agent_memory');
    expect(client.insert).toHaveBeenCalled();
    expect(result).toEqual([{ id: 1 }]);
  });

  it('should retrieve memory from agent_memory table', async () => {
    const client = SupabaseClientManager.getClient({
      supabaseUrl: 'https://example.supabase.co',
      supabaseKey: 'test-key',
    });
    
    const result = await SupabaseClientManager.retrieveMemory(
      client,
      'test-session-id',
      'planner',
      5,
    );
    
    expect(client.from).toHaveBeenCalledWith('dynamictools.agent_memory');
    expect(client.select).toHaveBeenCalledWith('*');
    expect(client.eq).toHaveBeenCalledWith('session_id', 'test-session-id');
    expect(client.eq).toHaveBeenCalledWith('agent_name', 'planner');
    expect(client.order).toHaveBeenCalledWith('step_index', { ascending: false });
    expect(client.limit).toHaveBeenCalledWith(5);
    expect(result).toEqual([{ id: 1 }]);
  });

  it('should store workflow execution', async () => {
    const client = SupabaseClientManager.getClient({
      supabaseUrl: 'https://example.supabase.co',
      supabaseKey: 'test-key',
    });
    
    const result = await SupabaseClientManager.storeWorkflowExecution(
      client,
      'test-session-id',
      1,
      'Test query',
      { plan: 'test plan' },
      { trace: 'test trace' },
      'in_progress',
      { output: 'test output' },
      null,
    );
    
    expect(client.from).toHaveBeenCalledWith('dynamictools.workflow_executions');
    expect(client.insert).toHaveBeenCalled();
    expect(result).toEqual([{ id: 1 }]);
  });

  it('should update workflow execution status', async () => {
    const client = SupabaseClientManager.getClient({
      supabaseUrl: 'https://example.supabase.co',
      supabaseKey: 'test-key',
    });
    
    const result = await SupabaseClientManager.updateWorkflowExecutionStatus(
      client,
      1,
      'completed',
      { output: 'final output' },
      undefined,
    );
    
    expect(client.from).toHaveBeenCalledWith('dynamictools.workflow_executions');
    expect(client.update).toHaveBeenCalled();
    expect(client.eq).toHaveBeenCalledWith('id', 1);
    expect(result).toEqual([{ id: 1 }]);
  });
});
