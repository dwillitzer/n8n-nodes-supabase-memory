CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE SCHEMA IF NOT EXISTS dynamictools;

-- Table: agent_memory
CREATE TABLE IF NOT EXISTS dynamictools.agent_memory (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    session_id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
    step_index INTEGER NOT NULL,
    agent_name TEXT,
    guidance TEXT,
    agent_output TEXT,
    intermediate_data JSONB,
    created_at TIMESTAMPTZ DEFAULT pg_catalog.now(),
    user_id UUID,
    CONSTRAINT unique_agent_session_step UNIQUE (session_id, agent_name, step_index)
);
CREATE INDEX IF NOT EXISTS idx_agent_memory_session_agent ON dynamictools.agent_memory(session_id, agent_name);
CREATE INDEX IF NOT EXISTS idx_agent_memory_user_id ON dynamictools.agent_memory(user_id);

-- Table: workflow_executions
CREATE TABLE IF NOT EXISTS dynamictools.workflow_executions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    session_id UUID DEFAULT extensions.uuid_generate_v4(),
    planned_workflow_id BIGINT,
    original_user_query TEXT NOT NULL,
    user_query_embedding VECTOR(1536),
    planner_output JSONB,
    execution_trace JSONB,
    status TEXT NOT NULL,
    final_output JSONB,
    error_message TEXT,
    started_at TIMESTAMPTZ DEFAULT pg_catalog.now(),
    ended_at TIMESTAMPTZ,
    planner_rating SMALLINT CHECK (planner_rating >= 1 AND planner_rating <= 5),
    execution_rating SMALLINT CHECK (execution_rating >= 1 AND execution_rating <= 5),
    executed_by_user_id UUID
);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_session_id ON dynamictools.workflow_executions(session_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON dynamictools.workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_embedding ON dynamictools.workflow_executions USING hnsw (user_query_embedding vector_ip_ops);

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA dynamictools TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA dynamictools TO service_role;
GRANT SELECT, INSERT, UPDATE ON dynamictools.agent_memory TO authenticated;
GRANT SELECT, INSERT, UPDATE ON dynamictools.workflow_executions TO authenticated;

-- Row Level Security
ALTER TABLE dynamictools.workflow_executions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage their own workflow executions"
ON dynamictools.workflow_executions FOR ALL TO authenticated
USING (auth.uid() = executed_by_user_id);
CREATE POLICY "Service role can access all workflow executions"
ON dynamictools.workflow_executions FOR ALL TO service_role USING (true);

ALTER TABLE dynamictools.agent_memory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage their own agent memory"
ON dynamictools.agent_memory FOR ALL TO authenticated
USING (auth.uid() = user_id);
CREATE POLICY "Service role can access all agent memory"
ON dynamictools.agent_memory FOR ALL TO service_role USING (true);
