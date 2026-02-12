import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/features/auth/server/create-movie-auth", () => ({
  isCreateMovieAuthorized: vi.fn().mockResolvedValue(false),
}));

const { POST } = await import("@/app/api/movies/route");

describe("POST /api/movies route", () => {
  it("returns 401 when create is unauthorized", async () => {
    const request = new NextRequest("http://localhost:3000/api/movies", {
      method: "POST",
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });
});
