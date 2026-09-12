CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Reports table for storing citizen issue reports
CREATE TABLE reports (
    report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,

    title VARCHAR(255) NOT NULL,

    description TEXT NOT NULL,

    category VARCHAR(100) NOT NULL,

    -- Location information
    location_short_label VARCHAR(255),
    location_full_label TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),

    -- Image URL (stored in filesystem or cloud storage)
    image_url TEXT,

    -- Severity information from assessment
    severity_score INTEGER,
    severity_level VARCHAR(20) CHECK (severity_level IN ('Low', 'Medium', 'High', 'Critical')),

    -- Status tracking
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'verified', 'in-progress', 'resolved')),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


