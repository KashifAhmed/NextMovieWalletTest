import { describe, expect, it, beforeEach } from "vitest";
import { signAuthToken, verifyAuthToken } from "@/features/auth/server/jwt";

describe("JWT helpers", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "unit-test-secret";
  });

  it("signs and verifies a valid token", () => {
    const token = signAuthToken({ sub: "user_1", email: "user@example.com" });
    const payload = verifyAuthToken(token);

    expect(payload).not.toBeNull();
    expect(payload?.sub).toBe("user_1");
    expect(payload?.email).toBe("user@example.com");
  });

  it("returns null for an invalid token", () => {
    const payload = verifyAuthToken("invalid-token");
    expect(payload).toBeNull();
  });
});
