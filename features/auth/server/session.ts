import type { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken, type JwtPayload } from "@/features/auth/server/jwt";

export const AUTH_COOKIE_NAME = "movie_wallet_auth";

function isProduction() {
  return process.env.NODE_ENV === "production";
}

export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function getRequestToken(request: NextRequest): string | null {
  const bearer = request.headers.get("authorization");
  if (bearer?.startsWith("Bearer ")) {
    const token = bearer.slice("Bearer ".length).trim();
    if (token) return token;
  }
  return request.cookies.get(AUTH_COOKIE_NAME)?.value ?? null;
}

export function getRequestUser(request: NextRequest): JwtPayload | null {
  const token = getRequestToken(request);
  if (!token) return null;
  return verifyAuthToken(token);
}
