-- Roles table
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  role_name VARCHAR(100) NOT NULL,
  description VARCHAR(255)
);

-- Permission table
CREATE TABLE IF NOT EXISTS permission (
  id SERIAL PRIMARY KEY,
  per_name VARCHAR(255) NOT NULL
);

-- Role-Permission junction table
CREATE TABLE IF NOT EXISTS role_permission (
  id SERIAL PRIMARY KEY,
  role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id INT NOT NULL REFERENCES permission(id) ON DELETE CASCADE
);

-- User table
CREATE TABLE IF NOT EXISTS "user" (
  id SERIAL PRIMARY KEY,
  role_id INT REFERENCES roles(id),
  full_name VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  status VARCHAR(100) DEFAULT 'active',
  created_at DATE DEFAULT CURRENT_DATE
);

-- Officers table
CREATE TABLE IF NOT EXISTS officers (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES "user"(id),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  position VARCHAR(100),
  department VARCHAR(100),
  phone VARCHAR(100),
  status VARCHAR(100) DEFAULT 'active'
);

-- Shift table
CREATE TABLE IF NOT EXISTS shift (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  officer_id INT NOT NULL REFERENCES officers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_work_minutes INT DEFAULT 0,
  total_late_minutes INT DEFAULT 0,
  status VARCHAR(30) DEFAULT 'PENDING',
  approved_by INT REFERENCES "user"(id),
  approved_at TIMESTAMP
);

-- Attendance Session table
CREATE TABLE IF NOT EXISTS attendance_session (
  id SERIAL PRIMARY KEY,
  attendance_id INT NOT NULL REFERENCES attendance(id) ON DELETE CASCADE,
  shift_id INT REFERENCES shift(id),
  check_in TIME,
  check_out TIME,
  status VARCHAR(30) DEFAULT 'PRESENT'
);

-- Invitation table
CREATE TABLE IF NOT EXISTS invitation (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  organizer VARCHAR(255),
  date DATE,
  location VARCHAR(255),
  status VARCHAR(255) DEFAULT 'active',
  image_url VARCHAR(255)
);

-- Invitation Assignment table
CREATE TABLE IF NOT EXISTS invitation_assignment (
  id SERIAL PRIMARY KEY,
  officer_id INT NOT NULL REFERENCES officers(id) ON DELETE CASCADE,
  invitation_id INT NOT NULL REFERENCES invitation(id) ON DELETE CASCADE,
  response_status VARCHAR(100) DEFAULT 'pending'
);

-- Mission table
CREATE TABLE IF NOT EXISTS mission (
  id SERIAL PRIMARY KEY,
  officer_id INT NOT NULL REFERENCES officers(id) ON DELETE CASCADE,
  approved_by INT REFERENCES "user"(id),
  start_date DATE,
  end_date DATE,
  purpose TEXT,
  location VARCHAR(255),
  status VARCHAR(255) DEFAULT 'Pending',
  approved_date DATE
);

-- Leave Request table
CREATE TABLE IF NOT EXISTS leave_request (
  id SERIAL PRIMARY KEY,
  officer_id INT NOT NULL REFERENCES officers(id) ON DELETE CASCADE,
  approved_by INT REFERENCES "user"(id),
  start_date DATE,
  end_date DATE,
  leave_type VARCHAR(100),
  total_days INT NOT NULL,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'Pending',
  approved_at DATE
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  report_type VARCHAR(255),
  generated_by INT REFERENCES "user"(id),
  generated_at DATE DEFAULT CURRENT_DATE,
  file_path VARCHAR(255)
);

-- Audit Log table
CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES "user"(id),
  action VARCHAR(255),
  table_name VARCHAR(255),
  record_id INT,
  file_path VARCHAR(255),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
