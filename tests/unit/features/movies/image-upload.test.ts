import { describe, expect, it } from "vitest";
import { validateImageFile } from "@/features/movies/server/image-upload";

describe("image upload validation", () => {
  it("accepts empty image input", () => {
    const result = validateImageFile(null);
    expect(result.ok).toBe(true);
  });

  it("rejects unsupported mime type", () => {
    const badFile = new File(["x"], "sample.txt", { type: "text/plain" });
    const result = validateImageFile(badFile);
    expect(result.ok).toBe(false);
  });
});
