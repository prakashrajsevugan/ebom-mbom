-- Drop old tables if they exist
DROP TABLE IF EXISTS bom_items CASCADE;
DROP TABLE IF EXISTS boms CASCADE;
DROP TABLE IF EXISTS ebom_items CASCADE;
DROP TABLE IF EXISTS eboms CASCADE;
DROP TABLE IF EXISTS mbom_items CASCADE;
DROP TABLE IF EXISTS mboms CASCADE;

-- Create eboms table (Engineering BOM)
CREATE TABLE eboms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  total_parts INTEGER,
  unique_parts INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create ebom_items table
CREATE TABLE ebom_items (
  id SERIAL PRIMARY KEY,
  ebom_id INTEGER NOT NULL,
  level INTEGER NOT NULL,
  parent_part_number VARCHAR(255),
  part_number VARCHAR(255) NOT NULL,
  part_name VARCHAR(255) NOT NULL,
  part_description TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  uom VARCHAR(50) DEFAULT 'Nos',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ebom_id) REFERENCES eboms(id) ON DELETE CASCADE
);

-- Create mboms table (Manufacturing BOM)
CREATE TABLE mboms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  total_parts INTEGER,
  unique_parts INTEGER,
  total_stations INTEGER,
  total_time INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create mbom_items table
CREATE TABLE mbom_items (
  id SERIAL PRIMARY KEY,
  mbom_id INTEGER NOT NULL,
  level INTEGER NOT NULL,
  parent_part_number VARCHAR(255),
  part_number VARCHAR(255) NOT NULL,
  part_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  workstation_no VARCHAR(50),
  workstation_name VARCHAR(200),
  operation VARCHAR(200),
  operation_time INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mbom_id) REFERENCES mboms(id) ON DELETE CASCADE
);

-- Create indexes for ebom_items
CREATE INDEX idx_ebom_items_ebom_id ON ebom_items(ebom_id);
CREATE INDEX idx_ebom_items_part_number ON ebom_items(part_number);

-- Create indexes for mbom_items
CREATE INDEX idx_mbom_items_mbom_id ON mbom_items(mbom_id);
CREATE INDEX idx_mbom_items_part_number ON mbom_items(part_number);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_eboms_updated_at BEFORE UPDATE ON eboms
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ebom_items_updated_at BEFORE UPDATE ON ebom_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mboms_updated_at BEFORE UPDATE ON mboms
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mbom_items_updated_at BEFORE UPDATE ON mbom_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
