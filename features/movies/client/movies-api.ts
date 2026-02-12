"use client";

import type {
  CreateMoviePayload,
  Movie,
  MoviesResponse,
  UpdateMoviePayload,
} from "@/lib/types/movies";

const API_BASE = "/api/movies";

async function parseResponse<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => null)) as T | { message?: string } | null;
  if (!response.ok) {
    const message =
      data && typeof data === "object" && "message" in data && typeof data.message === "string"
        ? data.message
        : "Request failed.";
    throw new Error(message);
  }
  return data as T;
}

export async function getMovies(page = 1, limit = 8): Promise<MoviesResponse> {
  const response = await fetch(`${API_BASE}?page=${page}&limit=${limit}`, {
    method: "GET",
    cache: "no-store",
  });
  return parseResponse<MoviesResponse>(response);
}

export async function getMovie(id: string): Promise<Movie> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "GET",
    cache: "no-store",
  });
  return parseResponse<Movie>(response);
}

export async function createMovie(payload: CreateMoviePayload): Promise<Movie> {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("publishYear", String(payload.publishYear));
  if (payload.imageFile) {
    formData.append("image", payload.imageFile);
  }

  const response = await fetch(API_BASE, {
    method: "POST",
    body: formData,
  });
  return parseResponse<Movie>(response);
}

export async function updateMovie(id: string, payload: UpdateMoviePayload): Promise<Movie> {
  const formData = new FormData();
  if (payload.title !== undefined) {
    formData.append("title", payload.title);
  }
  if (payload.publishYear !== undefined) {
    formData.append("publishYear", String(payload.publishYear));
  }
  if (payload.imageFile) {
    formData.append("image", payload.imageFile);
  }

  const response = await fetch(`${API_BASE}/${id}`, {
    method: "PATCH",
    body: formData,
  });
  return parseResponse<Movie>(response);
}

export async function deleteMovie(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
  });
  await parseResponse<{ success: boolean }>(response);
}
