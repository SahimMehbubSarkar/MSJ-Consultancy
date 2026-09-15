-- Settings table for storing site and email configuration
-- Uses JSONB for flexible key-value storage per category

CREATE TABLE IF NOT EXISTS settings (
  category VARCHAR(50) PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default rows
INSERT INTO settings (category, data)
VALUES
  ('site', '{
    "siteName": "MSJ Global Education Consultancy",
    "siteTagline": "Your Gateway to Global Education",
    "contactEmail": "msjglobaleducationconsultancy@gmail.com",
    "contactPhone": "+880 1700-000000",
    "address": "Dhaka, Bangladesh",
    "timezone": "Asia/Dhaka",
    "maintenanceMode": false,
    "siteIconUrl": null,
    "faviconUrl": null
  }'::jsonb)
ON CONFLICT (category) DO NOTHING;

INSERT INTO settings (category, data)
VALUES
  ('email', '{
    "smtpHost": "smtp.gmail.com",
    "smtpPort": "587",
    "smtpUser": "noreply@msjglobal.edu",
    "smtpPassword": "",
    "fromName": "MSJ Global Education",
    "fromEmail": "noreply@msjglobal.edu",
    "encryption": "TLS",
    "emailEnabled": true
  }'::jsonb)
ON CONFLICT (category) DO NOTHING;
