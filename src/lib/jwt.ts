import { SignJWT, jwtVerify } from "jose";

/**
 * MSJ JWT Utility — Dynamic token generation, verification & refresh
 * Uses jose (edge-compatible) so it works in both API routes and middleware.
 */

const SECRET_KEY = process.env.JWT_SECRET || "msj-global-secret-key-change-in-production-2026";
const key = new TextEncoder().encode(SECRET_KEY);

const ISSUER = "msj-global-education";
const AUDIENCE = "msj-admin-portal";

/** 3 days in seconds */
export const TOKEN_EXPIRY_SECONDS = 60 * 60 * 24 * 3;

/** Refresh threshold: if less than 1 day remains, issue a new token */
const REFRESH_THRESHOLD_MS = 24 * 60 * 60 * 1000;

export interface JwtPayload {
  sub: string;
  name: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
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

/** Verify a JWT and return its payload, or null if invalid/expired */
export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key, {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Check if token should be refreshed.
 * Returns true if less than 1 day remains before expiry.
 */
export function shouldRefresh(payload: JwtPayload): boolean {
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
