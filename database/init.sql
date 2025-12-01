CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    permissions TEXT
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER REFERENCES roles(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id),
    amount DECIMAL(10, 2) NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, PAID, OVERDUE
    file_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER REFERENCES invoices(id),
    type VARCHAR(20) NOT NULL, -- EMAIL, SMS
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'SENT'
);

CREATE TABLE IF NOT EXISTS predictions (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id),
    risk_score DECIMAL(5, 4), -- 0.0 to 1.0
    prediction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default roles
INSERT INTO roles (name, permissions) VALUES ('admin', 'all'), ('user', 'read_only') ON CONFLICT DO NOTHING;

-- Insert default admin user (password: admin123) - Hash should be generated properly in app, but for init we can use a placeholder or pre-calculated hash if we knew the algo. 
-- For now, we will let the backend create the first user or seed it here if we use a known hash. 
-- Let's assume the backend handles user creation or we provide a seed script.
