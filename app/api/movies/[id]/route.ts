import { NextRequest, NextResponse } from "next/server";
import {
  deleteMovie,
  getMovieById,
  updateMovie,
} from "@/features/movies/server/store";
import { validateUpdateMovie } from "@/features/movies/server/validation";
import { validateImageFile } from "@/features/movies/server/image-upload";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const movie = await getMovieById(id);

  if (!movie) {
    return NextResponse.json({ message: "Movie not found." }, { status: 404 });
  }

  return NextResponse.json(movie);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const contentType = request.headers.get("content-type") ?? "";

  let body: Record<string, unknown>;
  let imageFile: File | undefined;
  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const imageValidation = validateImageFile(formData.get("image"));
    if (!imageValidation.ok) {
      return NextResponse.json({ message: imageValidation.message }, { status: 400 });
    }
    if (imageValidation.file) {
      imageFile = imageValidation.file;
    }

    body = {};
    const title = formData.get("title");
    const publishYear = formData.get("publishYear");
    if (title !== null) {
      body.title = title;
    }
    if (publishYear !== null) {
      body.publishYear = publishYear;
    }
  } else {
    let jsonBody: unknown;
    try {
      jsonBody = await request.json();
    } catch {
      return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 });
    }
    if (typeof jsonBody !== "object" || jsonBody === null) {
      return NextResponse.json({ message: "Invalid request payload." }, { status: 400 });
    }
    body = jsonBody as Record<string, unknown>;
  }

  const validation = validateUpdateMovie(body, { hasImageFile: Boolean(imageFile) });
  if (!validation.ok) {
    return NextResponse.json({ message: validation.message }, { status: 400 });
  }

  const movie = await updateMovie(id, {
    ...validation.data,
    imageFile,
  });
  if (!movie) {
    return NextResponse.json({ message: "Movie not found." }, { status: 404 });
  }

  return NextResponse.json(movie);
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const removed = await deleteMovie(id);

  if (!removed) {
    return NextResponse.json({ message: "Movie not found." }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
