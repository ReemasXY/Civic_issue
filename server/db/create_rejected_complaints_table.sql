CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Stores only complaints that officers have rejected, along with the
-- reason. The report itself stays in `reports` with status = 'rejected';
-- this table is the audit trail of *why*.
CREATE TABLE rejected_complaints (
    rejection_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    report_id UUID NOT NULL UNIQUE
        REFERENCES reports(report_id) ON DELETE CASCADE,

    rejected_by UUID
        REFERENCES officers(user_id) ON DELETE SET NULL,

    reason TEXT NOT NULL,

    rejected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);