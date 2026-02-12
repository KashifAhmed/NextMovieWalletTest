import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createMovie,
  listMovies,
} from "@/features/movies/server/store";

const prismaMocks = vi.hoisted(() => ({
  movie: {
    count: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
  },
}));

const cloudinaryMocks = vi.hoisted(() => ({
  uploadImageToCloudinary: vi.fn(),
  deleteImageFromCloudinary: vi.fn(),
}));

vi.mock("@/lib/server/prisma", () => ({
  prisma: prismaMocks,
}));

vi.mock("@/lib/server/cloudinary", () => cloudinaryMocks);

describe("movies store", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated movie list metadata", async () => {
    prismaMocks.movie.count.mockResolvedValue(1);
    prismaMocks.movie.findMany.mockResolvedValue([
      {
        id: "m1",
        title: "Inception",
        publishYear: 2010,
        image: "https://image.test/inception.jpg",
        imagePublicId: "p1",
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        updatedAt: new Date("2024-01-01T00:00:00.000Z"),
      },
    ]);

    const result = await listMovies(1, 10);

    expect(result.data).toHaveLength(1);
    expect(result.meta.totalItems).toBe(1);
    expect(result.meta.totalPages).toBe(1);
  });

  it("uploads image and stores secure url on create", async () => {
    const file = new File(["image"], "poster.png", { type: "image/png" });

    cloudinaryMocks.uploadImageToCloudinary.mockResolvedValue({
      secureUrl: "https://cloudinary.example/poster.png",
      publicId: "movie-wallet/poster",
    });

    prismaMocks.movie.create.mockResolvedValue({
      id: "m2",
      title: "Interstellar",
      publishYear: 2014,
      image: "https://cloudinary.example/poster.png",
      imagePublicId: "movie-wallet/poster",
      createdAt: new Date("2024-01-02T00:00:00.000Z"),
      updatedAt: new Date("2024-01-02T00:00:00.000Z"),
    });

    const created = await createMovie({
      title: "Interstellar",
      publishYear: 2014,
      imageFile: file,
    });

    expect(cloudinaryMocks.uploadImageToCloudinary).toHaveBeenCalledTimes(1);
    expect(created.image).toBe("https://cloudinary.example/poster.png");
  });
});
