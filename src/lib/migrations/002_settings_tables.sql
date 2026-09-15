-- Separate tables for site and email settings
-- Each table has a single row (id=1) for easy upsert

-- Drop old single settings table if it exists
DROP TABLE IF EXISTS settings;

-- Site Settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id INT PRIMARY KEY DEFAULT 1,
  site_name VARCHAR(255) NOT NULL DEFAULT 'MSJ Global Education Consultancy',
  site_tagline VARCHAR(255) NOT NULL DEFAULT 'Your Gateway to Global Education',
  contact_email VARCHAR(255) NOT NULL DEFAULT 'msjglobaleducationconsultancy@gmail.com',
  contact_phone VARCHAR(50) NOT NULL DEFAULT '+91 9635953116',
  address TEXT NOT NULL DEFAULT 'Kolkata, West Bengal, India',
  timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Kolkata',
  maintenance_mode BOOLEAN NOT NULL DEFAULT false,
  site_icon_url TEXT,
  favicon_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

INSERT INTO site_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Email Settings table
CREATE TABLE IF NOT EXISTS email_settings (
  id INT PRIMARY KEY DEFAULT 1,
  smtp_host VARCHAR(255) NOT NULL DEFAULT 'smtp.gmail.com',
  smtp_port VARCHAR(10) NOT NULL DEFAULT '587',
  smtp_user VARCHAR(255) NOT NULL DEFAULT 'noreply@msjglobal.edu',
  smtp_password VARCHAR(255) NOT NULL DEFAULT '',
  from_name VARCHAR(255) NOT NULL DEFAULT 'MSJ Global Education',
  from_email VARCHAR(255) NOT NULL DEFAULT 'noreply@msjglobal.edu',
  encryption VARCHAR(10) NOT NULL DEFAULT 'TLS',
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

INSERT INTO email_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;
