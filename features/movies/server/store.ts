import { prisma } from "@/lib/server/prisma";
import { deleteImageFromCloudinary, uploadImageToCloudinary } from "@/lib/server/cloudinary";

export type Movie = {
  id: string;
  title: string;
  publishYear: number;
  image: string;
  imagePublicId?: string | null;
  createdAt: string;
  updatedAt: string;
};

type MovieInput = {
  title: string;
  publishYear: number;
  imageFile?: File;
};

type MovieListResult = {
  data: Movie[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

function mapMovie(movie: {
  id: string;
  title: string;
  publishYear: number;
  image: string;
  imagePublicId: string | null;
  createdAt: Date;
  updatedAt: Date;
}): Movie {
  return {
    id: movie.id,
    title: movie.title,
    publishYear: movie.publishYear,
    image: movie.image,
    imagePublicId: movie.imagePublicId,
    createdAt: movie.createdAt.toISOString(),
    updatedAt: movie.updatedAt.toISOString(),
  };
}

export async function listMovies(page = 1, limit = 10): Promise<MovieListResult> {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 10;
  const [totalItems, rows] = await Promise.all([
    prisma.movie.count(),
    prisma.movie.findMany({
      orderBy: { createdAt: "desc" },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalItems / safeLimit));

  return {
    data: rows.map(mapMovie),
    meta: {
      page: safePage,
      limit: safeLimit,
      totalItems,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPreviousPage: safePage > 1,
    },
  };
}

export async function getMovieById(id: string): Promise<Movie | null> {
  const movie = await prisma.movie.findUnique({ where: { id } });
  return movie ? mapMovie(movie) : null;
}

export async function createMovie(input: MovieInput): Promise<Movie> {
  let image = "";
  let imagePublicId: string | null = null;

  if (input.imageFile) {
    const uploaded = await uploadImageToCloudinary(input.imageFile);
    image = uploaded.secureUrl;
    imagePublicId = uploaded.publicId;
  }

  const movie = await prisma.movie.create({
    data: {
      title: input.title.trim(),
      publishYear: input.publishYear,
      image,
      imagePublicId,
    },
  });

  return mapMovie(movie);
}

export async function updateMovie(id: string, input: Partial<MovieInput>): Promise<Movie | null> {
  const existing = await prisma.movie.findUnique({ where: { id } });
  if (!existing) return null;

  let nextImage = existing.image;
  let nextImagePublicId = existing.imagePublicId;

  if (input.imageFile) {
    const uploaded = await uploadImageToCloudinary(input.imageFile);
    nextImage = uploaded.secureUrl;
    nextImagePublicId = uploaded.publicId;
    if (existing.imagePublicId) {
      await deleteImageFromCloudinary(existing.imagePublicId);
    }
  }

  const updated = await prisma.movie.update({
    where: { id },
    data: {
      title: input.title !== undefined ? input.title.trim() : existing.title,
      publishYear: input.publishYear !== undefined ? input.publishYear : existing.publishYear,
      image: nextImage,
      imagePublicId: nextImagePublicId,
    },
  });
  return mapMovie(updated);
}

export async function deleteMovie(id: string): Promise<boolean> {
  const existing = await prisma.movie.findUnique({ where: { id } });
  if (!existing) return false;

  if (existing.imagePublicId) {
    await deleteImageFromCloudinary(existing.imagePublicId);
  }

  await prisma.movie.delete({ where: { id } });
  return true;
}
