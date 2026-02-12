export const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

export const IMAGE_MAX_SIZE_BYTES = 5 * 1024 * 1024;

type ValidationResult = { ok: true; file?: File } | { ok: false; message: string };

export function validateImageFile(fileValue: FormDataEntryValue | null): ValidationResult {
  if (!(fileValue instanceof File) || fileValue.size === 0) {
    return { ok: true };
  }

  if (!IMAGE_MIME_TYPES.includes(fileValue.type as (typeof IMAGE_MIME_TYPES)[number])) {
    return { ok: false, message: "Unsupported image type." };
  }

  if (fileValue.size > IMAGE_MAX_SIZE_BYTES) {
    return { ok: false, message: "Image must be 5MB or smaller." };
  }

  return { ok: true, file: fileValue };
}
