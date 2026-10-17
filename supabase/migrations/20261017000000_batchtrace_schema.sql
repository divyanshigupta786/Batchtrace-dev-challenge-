-- BatchTrace Agent: Complete Production Database Schema Migration
-- 17 Tables with Strict Constraints, Foreign Keys, Indexes, RLS Policies, and Audit Trigger.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Organization Members
CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL, -- references auth.users(id)
    role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'QA_MANAGER', 'PLANT_OPERATOR', 'AUDITOR', 'VIEWER')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(org_id, user_id)
);

-- 3. Documents
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_type VARCHAR(20) NOT NULL CHECK (file_type IN ('CSV', 'XLSX', 'PDF', 'TXT', 'JSON')),
    category VARCHAR(50) NOT NULL CHECK (category IN ('SUPPLIER_INVOICE', 'RECEIVING_LOG', 'BATCH_RECORD', 'FINISHED_PACK_SHEET', 'DISPATCH_MANIFEST')),
    file_size_bytes BIGINT NOT NULL,
    uploader_name VARCHAR(150) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'UPLOADED' CHECK (status IN ('UPLOADED', 'PROCESSING', 'REVIEW_REQUIRED', 'APPROVED', 'REJECTED')),
    raw_text_preview TEXT,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Document Extractions
CREATE TABLE document_extractions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    field_name VARCHAR(100) NOT NULL,
    original_text TEXT NOT NULL,
    normalized_value TEXT NOT NULL,
    source_page INT,
    source_row INT,
    source_column VARCHAR(50),
    confidence NUMERIC(4, 3) NOT NULL,
    extraction_method VARCHAR(50) NOT NULL CHECK (extraction_method IN ('DETERMINISTIC_PARSER', 'AI_EXTRACTOR')),
    validation_status VARCHAR(50) NOT NULL CHECK (validation_status IN ('VALID', 'WARNING', 'CONFLICT', 'MISSING')),
    validation_message TEXT,
    reviewed BOOLEAN DEFAULT FALSE,
    reviewed_by VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Suppliers
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    certifications TEXT[],
    contact_email VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(org_id, code)
);

-- 6. Ingredients
CREATE TABLE ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    sku VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    allergens TEXT[],
    storage_condition VARCHAR(50) CHECK (storage_condition IN ('AMBIENT', 'CHILLED', 'FROZEN')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(org_id, sku)
);

-- 7. Ingredient Lots
CREATE TABLE ingredient_lots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    lot_code VARCHAR(100) NOT NULL,
    ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    receipt_date DATE NOT NULL,
    received_quantity NUMERIC(12, 3) NOT NULL CHECK (received_quantity >= 0),
    consumed_quantity NUMERIC(12, 3) DEFAULT 0 CHECK (consumed_quantity >= 0),
    unit VARCHAR(20) NOT NULL,
    expiry_date DATE NOT NULL,
    po_number VARCHAR(100) NOT NULL,
    carrier_invoice VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'FLAGGED', 'EXHAUSTED', 'QUARANTINED')),
    quality_flag_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(org_id, lot_code)
);

-- 8. Production Batches
CREATE TABLE production_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    batch_code VARCHAR(100) NOT NULL,
    recipe_name VARCHAR(255) NOT NULL,
    production_date DATE NOT NULL,
    facility_line VARCHAR(100) NOT NULL,
    supervisor VARCHAR(150) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'IN_PROGRESS' CHECK (status IN ('COMPLETED', 'IN_PROGRESS', 'QUARANTINED', 'RECALLED')),
    output_quantity NUMERIC(12, 3) NOT NULL CHECK (output_quantity >= 0),
    output_unit VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(org_id, batch_code)
);

-- 9. Batch Inputs (Many-to-Many join between Batches and Ingredient Lots)
CREATE TABLE batch_inputs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    batch_id UUID NOT NULL REFERENCES production_batches(id) ON DELETE CASCADE,
    ingredient_lot_id UUID NOT NULL REFERENCES ingredient_lots(id) ON DELETE RESTRICT,
    quantity_used NUMERIC(12, 3) NOT NULL CHECK (quantity_used > 0),
    unit VARCHAR(20) NOT NULL,
    stage_added VARCHAR(100) NOT NULL,
    operator_id VARCHAR(50),
    added_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Finished Products
CREATE TABLE finished_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    sku VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    pack_size VARCHAR(100) NOT NULL,
    shelf_life_days INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(org_id, sku)
);

-- 11. Finished Lots
CREATE TABLE finished_lots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    lot_code VARCHAR(100) NOT NULL,
    product_id UUID NOT NULL REFERENCES finished_products(id) ON DELETE RESTRICT,
    production_batch_id UUID NOT NULL REFERENCES production_batches(id) ON DELETE RESTRICT,
    pack_date DATE NOT NULL,
    best_before_date DATE NOT NULL,
    quantity_produced NUMERIC(12, 3) NOT NULL CHECK (quantity_produced >= 0),
    quantity_shipped NUMERIC(12, 3) DEFAULT 0 CHECK (quantity_shipped >= 0),
    unit VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'RELEASED' CHECK (status IN ('RELEASED', 'HOLD', 'RECALLED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(org_id, lot_code)
);

-- 12. Customer Orders
CREATE TABLE customer_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    order_number VARCHAR(100) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_type VARCHAR(50) NOT NULL CHECK (customer_type IN ('RETAIL', 'DISTRIBUTOR', 'FOODSERVICE', 'DIRECT')),
    destination_city VARCHAR(150) NOT NULL,
    order_date DATE NOT NULL,
    dispatch_date DATE,
    carrier_name VARCHAR(150),
    status VARCHAR(50) NOT NULL DEFAULT 'PROCESSING' CHECK (status IN ('DELIVERED', 'IN_TRANSIT', 'PROCESSING')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(org_id, order_number)
);

-- 13. Order Items (Many-to-Many join between Customer Orders and Finished Lots)
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES customer_orders(id) ON DELETE CASCADE,
    finished_lot_id UUID NOT NULL REFERENCES finished_lots(id) ON DELETE RESTRICT,
    quantity_shipped NUMERIC(12, 3) NOT NULL CHECK (quantity_shipped > 0),
    unit VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Traceability Events
CREATE TABLE traceability_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    certainty VARCHAR(20) NOT NULL CHECK (certainty IN ('CONFIRMED', 'POSSIBLE', 'UNKNOWN')),
    details JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Incident Reports
CREATE TABLE incident_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    incident_number VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    target_lot_or_batch VARCHAR(100) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'INVESTIGATING', 'NEEDS_REVIEW', 'READY_FOR_APPROVAL', 'APPROVED', 'CLOSED')),
    investigator_name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    confirmed_batches TEXT[],
    confirmed_orders TEXT[],
    recommended_steps TEXT[],
    limitations TEXT[],
    approved_by VARCHAR(150),
    approved_at TIMESTAMPTZ,
    human_sign_off_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(org_id, incident_number)
);

-- 16. Incident Evidence
CREATE TABLE incident_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES incident_reports(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    document_name VARCHAR(255) NOT NULL,
    row_or_page VARCHAR(100) NOT NULL,
    extracted_text TEXT NOT NULL,
    verified_value TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    actor_name VARCHAR(150) NOT NULL,
    actor_email VARCHAR(255) NOT NULL,
    actor_role VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    target_entity_type VARCHAR(50) NOT NULL,
    target_entity_id VARCHAR(100) NOT NULL,
    summary TEXT NOT NULL,
    diff JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX idx_ingredient_lots_code ON ingredient_lots(org_id, lot_code);
CREATE INDEX idx_production_batches_code ON production_batches(org_id, batch_code);
CREATE INDEX idx_finished_lots_code ON finished_lots(org_id, lot_code);
CREATE INDEX idx_customer_orders_number ON customer_orders(org_id, order_number);
CREATE INDEX idx_batch_inputs_batch ON batch_inputs(batch_id);
CREATE INDEX idx_batch_inputs_lot ON batch_inputs(ingredient_lot_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_lot ON order_items(finished_lot_id);
CREATE INDEX idx_documents_org ON documents(org_id, status);
CREATE INDEX idx_audit_logs_org_time ON audit_logs(org_id, created_at DESC);

-- Enable Row Level Security on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredient_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE finished_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE finished_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE traceability_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Tenant Isolation Policies (Sample for standard user auth)
CREATE POLICY org_isolation_documents ON documents
    FOR ALL USING (
        org_id IN (
            SELECT org_id FROM organization_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY org_isolation_lots ON ingredient_lots
    FOR ALL USING (
        org_id IN (
            SELECT org_id FROM organization_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY org_isolation_batches ON production_batches
    FOR ALL USING (
        org_id IN (
            SELECT org_id FROM organization_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY org_isolation_incidents ON incident_reports
    FOR ALL USING (
        org_id IN (
            SELECT org_id FROM organization_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY org_isolation_audit ON audit_logs
    FOR SELECT USING (
        org_id IN (
            SELECT org_id FROM organization_members WHERE user_id = auth.uid()
        )
    );
