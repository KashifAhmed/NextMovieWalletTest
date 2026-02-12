import { NextRequest, NextResponse } from "next/server";
import { createMovie, listMovies } from "@/features/movies/server/store";
import { validateCreateMovie } from "@/features/movies/server/validation";
import { isCreateMovieAuthorized } from "@/features/auth/server/create-movie-auth";
import { validateImageFile } from "@/features/movies/server/image-upload";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "1");
  const limit = Number(searchParams.get("limit") ?? "10");

  const result = await listMovies(page, limit);
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  if (!(await isCreateMovieAuthorized(request))) {
    return NextResponse.json(
      { message: "Unauthorized. Sign in is required for creating movies." },
      { status: 401 },
    );
  }

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

    body = {
      title: formData.get("title"),
      publishYear: formData.get("publishYear"),
    };
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

  const validation = validateCreateMovie(body);
  if (!validation.ok) {
    return NextResponse.json({ message: validation.message }, { status: 400 });
  }

  const movie = await createMovie({
    ...validation.data,
    imageFile,
  });
  return NextResponse.json(movie, { status: 201 });
}
