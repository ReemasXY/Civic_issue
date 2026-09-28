CREATE TABLE reviews (
    review_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id  UUID NOT NULL UNIQUE REFERENCES reports(report_id) ON DELETE CASCADE,
    citizen_id UUID NOT NULL REFERENCES citizens(user_id) ON DELETE CASCADE,
    officer_id UUID REFERENCES officers(user_id) ON DELETE SET NULL,
    rating     SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    tags       TEXT[] NOT NULL DEFAULT '{}',
    comment    TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);