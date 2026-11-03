CREATE TABLE IF NOT EXISTS report_supporters (
    report_id  UUID NOT NULL REFERENCES reports(report_id)  ON DELETE CASCADE,
    user_id    UUID NOT NULL REFERENCES citizens(user_id)   ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (report_id, user_id)
);