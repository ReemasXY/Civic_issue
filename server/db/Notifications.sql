CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Stores the notification messages shown on the citizen's Notifications
-- page. Each row is one notification for one citizen, usually generated
-- when one of their reports changes status.
CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Who the notification is for. Notifications are a citizen-facing
    -- feature right now, so this points at citizens specifically.
    user_id UUID NOT NULL
        REFERENCES citizens(user_id) ON DELETE CASCADE,

    -- The report this notification is about, if any. Nullable so the
    -- table can also hold notifications not tied to a specific report
    -- later (e.g. an announcement), without a schema change.
    report_id UUID
        REFERENCES reports(report_id) ON DELETE CASCADE,

    -- What kind of event this is. The frontend maps this to an icon and
    -- color (FiClock/FiShield/FiRefreshCw/FiCheckCircle/FiXCircle) —
    -- keep these values in sync with STATUS_META in Notifications.jsx.
    type VARCHAR(30) NOT NULL
        CHECK (type IN (
            'report_submitted',
            'report_verified',
            'report_in_progress',
            'report_resolved',
            'report_rejected'
        )),

    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,

    is_read BOOLEAN NOT NULL DEFAULT false,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);