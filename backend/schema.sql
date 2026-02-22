-- PostgreSQL Database Setup for BOM Converter
-- This file is for reference only. Sequelize will auto-create tables.

-- Create database
CREATE DATABASE bom_converter;

-- Connect to database
\c bom_converter;

-- Create BOMs table (Sequelize will create this automatically)
-- This is just for reference
CREATE TABLE IF NOT EXISTS "boms" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "type" VARCHAR(10) NOT NULL CHECK ("type" IN ('ebom', 'mbom')),
  "data" JSONB NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "boms_type_idx" ON "boms" ("type");
CREATE INDEX IF NOT EXISTS "boms_created_at_idx" ON "boms" ("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "boms_data_idx" ON "boms" USING GIN ("data");
