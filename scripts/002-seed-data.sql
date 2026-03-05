-- Seed roles
INSERT INTO roles (role_name, description) VALUES
  ('Admin', 'Full system access'),
  ('Manager', 'Department management access'),
  ('Officer', 'Basic officer access');

-- Seed permissions
INSERT INTO permission (per_name) VALUES
  ('manage_officers'),
  ('manage_invitations'),
  ('manage_attendance'),
  ('generate_reports'),
  ('manage_users'),
  ('approve_leave'),
  ('approve_mission');

-- Admin gets all permissions
INSERT INTO role_permission (role_id, permission_id) VALUES
  (1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7);

-- Manager gets some
INSERT INTO role_permission (role_id, permission_id) VALUES
  (2, 1), (2, 2), (2, 3), (2, 6), (2, 7);

-- Seed admin user (password: admin123 - bcrypt hash)
INSERT INTO "user" (role_id, full_name, username, password, status, created_at) VALUES
  (1, 'System Admin', 'admin', '$2b$10$dummyhashforadmin123placeholder00', 'active', CURRENT_DATE),
  (2, 'John Manager', 'manager1', '$2b$10$dummyhashformanager1placeholder00', 'active', CURRENT_DATE);

-- Seed shifts
INSERT INTO shift (name, start_time, end_time, is_active) VALUES
  ('Morning', '08:00', '12:00', TRUE),
  ('Afternoon', '13:00', '17:00', TRUE),
  ('Night', '20:00', '04:00', TRUE);

-- Seed officers
INSERT INTO officers (user_id, first_name, last_name, email, position, department, phone, status) VALUES
  (NULL, 'Alice', 'Johnson', 'alice@example.com', 'Senior Officer', 'Operations', '012-345-6789', 'active'),
  (NULL, 'Bob', 'Smith', 'bob@example.com', 'Officer', 'Security', '012-345-6790', 'active'),
  (NULL, 'Charlie', 'Brown', 'charlie@example.com', 'Junior Officer', 'Operations', '012-345-6791', 'active'),
  (NULL, 'Diana', 'Prince', 'diana@example.com', 'Senior Officer', 'Security', '012-345-6792', 'active'),
  (NULL, 'Edward', 'Lee', 'edward@example.com', 'Officer', 'Administration', '012-345-6793', 'active'),
  (NULL, 'Fiona', 'Chen', 'fiona@example.com', 'Junior Officer', 'Operations', '012-345-6794', 'on_leave'),
  (NULL, 'George', 'Wilson', 'george@example.com', 'Officer', 'Security', '012-345-6795', 'active'),
  (NULL, 'Helen', 'Davis', 'helen@example.com', 'Senior Officer', 'Administration', '012-345-6796', 'active');

-- Seed attendance records
INSERT INTO attendance (officer_id, date, total_work_minutes, total_late_minutes, status, approved_by, approved_at) VALUES
  (1, CURRENT_DATE, 480, 0, 'APPROVED', 1, NOW()),
  (2, CURRENT_DATE, 450, 15, 'APPROVED', 1, NOW()),
  (3, CURRENT_DATE, 460, 10, 'PENDING', NULL, NULL),
  (4, CURRENT_DATE, 480, 0, 'APPROVED', 1, NOW()),
  (5, CURRENT_DATE, 0, 0, 'ABSENT', NULL, NULL),
  (1, CURRENT_DATE - INTERVAL '1 day', 480, 0, 'APPROVED', 1, NOW()),
  (2, CURRENT_DATE - INTERVAL '1 day', 470, 5, 'APPROVED', 1, NOW()),
  (3, CURRENT_DATE - INTERVAL '1 day', 480, 0, 'APPROVED', 1, NOW());

-- Seed attendance sessions
INSERT INTO attendance_session (attendance_id, shift_id, check_in, check_out, status) VALUES
  (1, 1, '08:00', '12:00', 'PRESENT'),
  (1, 2, '13:00', '17:00', 'PRESENT'),
  (2, 1, '08:15', '12:00', 'LATE'),
  (2, 2, '13:00', '17:00', 'PRESENT'),
  (3, 1, '08:10', '12:00', 'LATE'),
  (4, 1, '08:00', '12:00', 'PRESENT'),
  (4, 2, '13:00', '17:00', 'PRESENT');

-- Seed invitations
INSERT INTO invitation (title, organizer, date, location, status, image_url) VALUES
  ('Annual Security Conference', 'Ministry of Security', CURRENT_DATE + INTERVAL '14 days', 'Convention Center Hall A', 'active', NULL),
  ('Training Workshop: Cybersecurity', 'IT Department', CURRENT_DATE + INTERVAL '7 days', 'Training Room 201', 'active', NULL),
  ('Monthly Team Meeting', 'Operations Dept', CURRENT_DATE + INTERVAL '3 days', 'Meeting Room B', 'active', NULL),
  ('Community Outreach Event', 'Public Relations', CURRENT_DATE - INTERVAL '5 days', 'City Park', 'completed', NULL);

-- Seed invitation assignments
INSERT INTO invitation_assignment (officer_id, invitation_id, response_status) VALUES
  (1, 1, 'accepted'),
  (2, 1, 'pending'),
  (3, 1, 'declined'),
  (4, 2, 'accepted'),
  (5, 2, 'accepted'),
  (1, 3, 'pending'),
  (2, 3, 'accepted'),
  (1, 4, 'accepted'),
  (4, 4, 'accepted');

-- Seed missions
INSERT INTO mission (officer_id, approved_by, start_date, end_date, purpose, location, status, approved_date) VALUES
  (1, 1, CURRENT_DATE, CURRENT_DATE + INTERVAL '3 days', 'Field investigation in District 5', 'District 5 HQ', 'Approved', CURRENT_DATE),
  (3, NULL, CURRENT_DATE + INTERVAL '5 days', CURRENT_DATE + INTERVAL '8 days', 'Training deployment at northern region', 'Northern Region Base', 'Pending', NULL),
  (5, 1, CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE - INTERVAL '7 days', 'Security assessment at branch office', 'Branch Office East', 'Completed', CURRENT_DATE - INTERVAL '12 days');

-- Seed leave requests
INSERT INTO leave_request (officer_id, approved_by, start_date, end_date, leave_type, total_days, reason, status, approved_at) VALUES
  (6, 1, CURRENT_DATE, CURRENT_DATE + INTERVAL '5 days', 'Annual Leave', 5, 'Family vacation', 'Approved', CURRENT_DATE - INTERVAL '3 days'),
  (2, NULL, CURRENT_DATE + INTERVAL '10 days', CURRENT_DATE + INTERVAL '12 days', 'Sick Leave', 2, 'Medical appointment', 'Pending', NULL),
  (4, 1, CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE - INTERVAL '13 days', 'Personal Leave', 2, 'Personal matters', 'Approved', CURRENT_DATE - INTERVAL '17 days');

-- Seed audit log
INSERT INTO audit_log (user_id, action, table_name, record_id, file_path, timestamp) VALUES
  (1, 'CREATE', 'officers', 1, NULL, NOW() - INTERVAL '10 days'),
  (1, 'UPDATE', 'attendance', 1, NULL, NOW() - INTERVAL '1 day'),
  (1, 'CREATE', 'invitation', 1, NULL, NOW() - INTERVAL '5 days'),
  (1, 'APPROVE', 'leave_request', 1, NULL, NOW() - INTERVAL '3 days');
