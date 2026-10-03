-- Update notification type constraint to include officer_deactivated
ALTER TABLE notifications
DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notifications
ADD CONSTRAINT notifications_type_check
CHECK (type IN (
    'report_verified',
    'report_in_progress',
    'report_resolved',
    'report_rejected',
    'officer_deactivated'
));
