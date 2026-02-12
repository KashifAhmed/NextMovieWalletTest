import { NextRequest } from "next/server";
import { getRequestUser } from "@/features/auth/server/session";

export async function isCreateMovieAuthorized(request: NextRequest): Promise<boolean> {
  return Boolean(getRequestUser(request));
}
