-- Initial database setup for Calcetto Manager
-- This file is loaded when the container first starts

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create anon and authenticated roles
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NO LOGIN;
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NO LOGIN;
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NO LOGIN;
  END IF;
END
$$;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE postgres TO anon;
GRANT ALL PRIVILEGES ON DATABASE postgres TO authenticated;
GRANT ALL PRIVILEGES ON DATABASE postgres TO service_role;

-- Switch to postgres database for schema setup
\c postgres;

GRANT ALL ON SCHEMA public TO anon;
GRANT ALL ON SCHEMA public TO authenticated;
GRANT ALL ON SCHEMA public TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;

-- Create auth schema
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS storage;
CREATE SCHEMA IF NOT EXISTS _realtime;
CREATE SCHEMA IF NOT EXISTS graphql_public;

GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO service_role;

GRANT ALL ON SCHEMA storage TO anon;
GRANT ALL ON SCHEMA storage TO authenticated;
GRANT ALL ON SCHEMA storage TO service_role;

-- Storage tables
CREATE TABLE IF NOT EXISTS storage.buckets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  public BOOLEAN NOT NULL DEFAULT true,
  file_size_limit INTEGER,
  allowed_mime_types TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS storage.objects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bucket_id TEXT REFERENCES storage.buckets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_storage_objects_bucket_id ON storage.objects(bucket_id);
CREATE INDEX idx_storage_objects_name ON storage.objects(name);

-- Realtime schema
GRANT USAGE ON SCHEMA _realtime TO anon;
GRANT USAGE ON SCHEMA _realtime TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA _realtime TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA _realtime TO authenticated;

-- Graphql_public schema
GRANT USAGE ON SCHEMA graphql_public TO anon;
GRANT USAGE ON SCHEMA graphql_public TO authenticated;
