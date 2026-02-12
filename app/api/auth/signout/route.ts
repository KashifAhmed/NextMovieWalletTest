import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/features/auth/server/session";

export const runtime = "nodejs";

export async function POST() {
  const response = NextResponse.json({ success: true });
  clearAuthCookie(response);
  return response;
}
