-- Rename role column to privilege and update values
ALTER TABLE club_members RENAME COLUMN role TO privilege;

-- Update values from admin/co-admin to owner/manager
UPDATE club_members SET privilege = 'owner' WHERE privilege = 'admin';
UPDATE club_members SET privilege = 'manager' WHERE privilege = 'co-admin';
