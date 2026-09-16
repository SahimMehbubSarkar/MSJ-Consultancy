import crypto from 'crypto';
import { query } from '@/lib/db';

export const SESSION_COOKIE_NAME = 'msj_admin_token';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 48; // 48 hours = 2 days

/**
 * Generate a cryptographically secure 64-character random session token
 */
export function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create a new dynamic session in PostgreSQL
 */
export async function createSession(adminId, ip = null, userAgent = null) {
  const token = generateSessionToken();
  const res = await query(
    `INSERT INTO admin_sessions (admin_id, session_token, expires_at, ip_address, user_agent)
     VALUES ($1, $2, NOW() + INTERVAL '48 hours', $3, $4)
     RETURNING id, session_token, expires_at`,
    [adminId, token, ip, userAgent]
  );
  return {
    token,
    expiresAt: res.rows[0].expires_at,
  };
}

/**
 * Validate session token against database.
 * If valid, automatically updates last_active_at and extends expires_at by 48 hours (sliding session).
 * Returns admin payload compatible with legacy { sub, name, email, role } or null.
 */
export async function validateSession(token) {
  if (!token || typeof token !== 'string' || token.trim().length === 0) {
    return null;
  }

  try {
    const res = await query(
      `SELECT s.id as session_id, s.admin_id, s.expires_at, s.is_revoked,
              a.id as admin_id_val, a.name, a.email, a.role, a.is_active
       FROM admin_sessions s
       JOIN admin a ON a.id = s.admin_id
       WHERE s.session_token = $1
         AND s.is_revoked = FALSE
         AND s.expires_at > NOW()
         AND a.is_active = TRUE
       LIMIT 1`,
      [token.trim()]
    );

    if (res.rows.length === 0) {
      return null;
    }

    const row = res.rows[0];

    // Background update: slide expiration and update last_active_at
    query(
      `UPDATE admin_sessions
       SET last_active_at = NOW(),
           expires_at = NOW() + INTERVAL '48 hours'
       WHERE id = $1`,
      [row.session_id]
    ).catch((err) => console.warn('Failed to slide session expiry:', err.message));

    return {
      sub: String(row.admin_id_val),
      name: row.name,
      email: row.email,
      role: row.role,
      sessionId: row.session_id,
    };
  } catch (err) {
    console.error('Session validation error in DB:', err);
    return null;
  }
}

/**
 * Revoke a session immediately upon logout
 */
export async function revokeSession(token) {
  if (!token || typeof token !== 'string') return;
  try {
    await query(
      `UPDATE admin_sessions
       SET is_revoked = TRUE
       WHERE session_token = $1`,
      [token.trim()]
    );
  } catch (err) {
    console.error('Session revocation error:', err);
  }
}

/**
 * Revoke all sessions for a specific admin (e.g. after password change)
 */
export async function revokeAllAdminSessions(adminId) {
  if (!adminId) return;
  try {
    await query(
      `UPDATE admin_sessions
       SET is_revoked = TRUE
       WHERE admin_id = $1`,
      [adminId]
    );
  } catch (err) {
    console.error('Revoke all sessions error:', err);
  }
}
