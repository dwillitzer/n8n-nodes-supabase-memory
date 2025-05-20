# n8n-nodes-supabase-memory

This is an n8n community node for AI tool agent memory with Supabase integration. It provides functionality to store and retrieve agent memory and workflow execution data using Supabase as the backend.

## Features

- Store and retrieve agent memory in Supabase
- Track workflow executions with detailed metadata
- Support for session management across workflow runs
- Integration with AI agent tools in n8n workflows

## Prerequisites

- n8n instance (v0.147.0 or later recommended)
- Supabase project with the following setup:
  - PostgreSQL extensions: `uuid-ossp`, `vector`, `pg_net`
  - Database schema as provided in the setup instructions

## Installation

Follow these steps to install this community node:

1. Open your n8n instance
2. Go to Settings > Community Nodes
3. Click on "Install"
4. Enter `n8n-nodes-supabase-memory` in the "npm package name" field
5. Click "Install"

Alternatively, you can install it manually:

```bash
cd ~/.n8n/custom
npm install n8n-nodes-supabase-memory
```

## Supabase Setup

This node requires a specific database schema in your Supabase project. The schema includes tables for agent memory and workflow executions.

### Required Tables

1. `dynamictools.agent_memory` - Stores agent memory entries
2. `dynamictools.workflow_executions` - Tracks workflow execution data

### Database Schema Setup

The complete database schema is available in the `schema.sql` file in this repository. You can run this SQL script in your Supabase SQL editor to set up the required tables and functions.

## Node Configuration

### Credentials

To use this node, you need to set up Supabase API credentials:

1. Supabase URL - The URL of your Supabase project
2. Supabase API Key - Either the anon key or service_role key
3. Use Service Role Key - Toggle to use the service_role key for elevated permissions

### Node Operations

#### Agent Memory

- **Store** - Store agent memory entries
  - Session ID (optional, generates UUID if empty)
  - Step Index
  - Agent Name
  - Guidance
  - Agent Output
  - Intermediate Data (JSON)
  - User ID (optional)

- **Retrieve** - Retrieve agent memory entries
  - Session ID
  - Agent Name (optional)
  - Limit

#### Workflow Execution

- **Store** - Store workflow execution data
  - Session ID (optional, generates UUID if empty)
  - Planned Workflow ID
  - Original User Query
  - Planner Output (JSON)
  - Execution Trace (JSON)
  - Status
  - Final Output (JSON)
  - Error Message (optional)
  - User ID (optional)

- **Retrieve** - Retrieve workflow execution data
  - Session ID

- **Update Status** - Update workflow execution status
  - Workflow Execution ID
  - Status
  - Final Output (JSON)
  - Error Message (optional)

## Example Usage

### Storing Agent Memory

1. Add the "Supabase Memory" node to your workflow
2. Select "Agent Memory" as the resource
3. Select "Store" as the operation
4. Configure the required fields
5. Connect to your workflow

### Retrieving Agent Memory

1. Add the "Supabase Memory" node to your workflow
2. Select "Agent Memory" as the resource
3. Select "Retrieve" as the operation
4. Enter the Session ID
5. Optionally filter by Agent Name
6. Connect to your workflow

## License

[MIT](LICENSE)
