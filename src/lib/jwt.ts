import { SignJWT, jwtVerify } from "jose";
import { validateSession } from "@/lib/session";

/**
 * MSJ Authentication Utility
 * Bridges database-backed dynamic sessions with legacy JWT interfaces.
 */

const SECRET_KEY = process.env.JWT_SECRET || "msj-global-secret-key-change-in-production-2026";
const key = new TextEncoder().encode(SECRET_KEY);

const ISSUER = "msj-global-education";
const AUDIENCE = "msj-admin-portal";

/** 2 days in seconds */
export const TOKEN_EXPIRY_SECONDS = 60 * 60 * 48;

/** Refresh threshold: 1 day */
const REFRESH_THRESHOLD_MS = 24 * 60 * 60 * 1000;

export interface JwtPayload {
  sub: string;
  name: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

/** Sign a new JWT with admin data */
export async function signToken(payload: {
  id: string;
  name: string;
  email: string;
  role: string;
}): Promise<string> {
  return new SignJWT({
    name: payload.name,
    email: payload.email,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.id)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_EXPIRY_SECONDS}s`)
    .sign(key);
}

/**
 * Verify token:
 * 1. Checks PostgreSQL admin_sessions (primary, revocable, sliding expiration)
 * 2. Falls back to jwtVerify with 30s clock tolerance for backward compatibility
 */
export async function verifyToken(token: string): Promise<JwtPayload | null> {
  if (!token || typeof token !== "string") return null;

  try {
    // 1. Check database session
    const sessionPayload = await validateSession(token);
    if (sessionPayload) {
      return {
        sub: sessionPayload.sub,
        name: sessionPayload.name,
        email: sessionPayload.email,
        role: sessionPayload.role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + TOKEN_EXPIRY_SECONDS,
      };
    }
  } catch (err) {
    console.warn("Session check fallback to JWT:", err);
  }

  // 2. Legacy JWT fallback with clock tolerance
  try {
    const { payload } = await jwtVerify(token, key, {
      issuer: ISSUER,
      audience: AUDIENCE,
      clockTolerance: 30, // 30s clock tolerance to prevent clock skew errors
    });
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Check if token should be refreshed.
 */
export function shouldRefresh(payload: JwtPayload): boolean {
  if (!payload.exp) return false;
  const expMs = payload.exp * 1000;
  const remaining = expMs - Date.now();
  return remaining < REFRESH_THRESHOLD_MS;
}

/** Refresh: create a new token from an existing valid payload */
export async function refreshToken(payload: JwtPayload): Promise<string> {
  return signToken({
    id: payload.sub,
    name: payload.name,
    email: payload.email,
    role: payload.role,
  });
}
