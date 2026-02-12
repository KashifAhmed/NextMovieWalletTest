import { describe, expect, it } from "vitest";
import {
  validateCreateMovie,
  validateUpdateMovie,
} from "@/features/movies/server/validation";

describe("movie validation", () => {
  it("accepts valid create payload", () => {
    const result = validateCreateMovie({ title: "Inception", publishYear: 2010 });
    expect(result.ok).toBe(true);
  });

  it("rejects create payload with invalid year", () => {
    const result = validateCreateMovie({ title: "Inception", publishYear: 1700 });
    expect(result.ok).toBe(false);
  });

  it("requires at least one field for update", () => {
    const result = validateUpdateMovie({});
    expect(result.ok).toBe(false);
  });
});
