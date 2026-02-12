type MovieBody = {
  title?: unknown;
  publishYear?: unknown;
};

type ValidationResult<T> = { ok: true; data: T } | { ok: false; message: string };

export type CreateMoviePayload = {
  title: string;
  publishYear: number;
};

export type UpdateMoviePayload = {
  title?: string;
  publishYear?: number;
};

const MIN_YEAR = 1888;
const MAX_YEAR = new Date().getFullYear() + 1;

function parseYear(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isInteger(parsed)) return parsed;
  }
  return null;
}

export function validateCreateMovie(body: MovieBody): ValidationResult<CreateMoviePayload> {
  if (typeof body.title !== "string" || body.title.trim().length < 2) {
    return { ok: false, message: "Title must be at least 2 characters long." };
  }

  const publishYear = parseYear(body.publishYear);
  if (publishYear === null || publishYear < MIN_YEAR || publishYear > MAX_YEAR) {
    return { ok: false, message: `Publish year must be between ${MIN_YEAR} and ${MAX_YEAR}.` };
  }

  return {
    ok: true,
    data: { title: body.title.trim(), publishYear },
  };
}

export function validateUpdateMovie(
  body: MovieBody,
  options?: { hasImageFile?: boolean },
): ValidationResult<UpdateMoviePayload> {
  const hasImageFile = options?.hasImageFile ?? false;
  if (!("title" in body) && !("publishYear" in body) && !hasImageFile) {
    return { ok: false, message: "At least one field is required." };
  }

  const payload: UpdateMoviePayload = {};

  if ("title" in body) {
    if (typeof body.title !== "string" || body.title.trim().length < 2) {
      return { ok: false, message: "Title must be at least 2 characters long." };
    }
    payload.title = body.title.trim();
  }

  if ("publishYear" in body) {
    const publishYear = parseYear(body.publishYear);
    if (publishYear === null || publishYear < MIN_YEAR || publishYear > MAX_YEAR) {
      return { ok: false, message: `Publish year must be between ${MIN_YEAR} and ${MAX_YEAR}.` };
    }
    payload.publishYear = publishYear;
  }

  return { ok: true, data: payload };
}
