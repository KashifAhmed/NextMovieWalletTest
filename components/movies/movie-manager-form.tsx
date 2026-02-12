"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createMovie,
  getMovie,
  updateMovie,
} from "@/features/movies/client/movies-api";
import { PageLayout } from "@/components/layout/page-layout";
import { AuthGuard } from "@/features/auth/client/auth-guard";

type MovieManagerFormProps = {
  movieId?: string;
};

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 60 }, (_, i) => currentYear - i);

export function MovieManagerForm({ movieId }: MovieManagerFormProps) {
  const router = useRouter();
  const isEditMode = useMemo(() => Boolean(movieId), [movieId]);

  const [title, setTitle] = useState("");
  const [publishYear, setPublishYear] = useState(String(currentYear));
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState("");
  const [filePreview, setFilePreview] = useState("");
  const [isLoadingMovie, setIsLoadingMovie] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMovie() {
      if (!movieId) {
        return;
      }

      try {
        setIsLoadingMovie(true);
        const movie = await getMovie(movieId);
        setTitle(movie.title);
        setPublishYear(String(movie.publishYear));
        setExistingImage(movie.image ?? "");
        setFilePreview(movie.image ?? "");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load movie.";
        setError(message);
      } finally {
        setIsLoadingMovie(false);
      }
    }

    loadMovie();
  }, [movieId]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (title.trim().length < 2) {
      setError("Title must be at least 2 characters.");
      return;
    }

    const parsedYear = Number(publishYear);
    if (!Number.isInteger(parsedYear)) {
      setError("Please select a valid publish year.");
      return;
    }

    try {
      setIsSaving(true);
      if (movieId) {
        const updatePayload = {
          title: title.trim(),
          publishYear: parsedYear,
        } as {
          title: string;
          publishYear: number;
          imageFile?: File;
        };
        if (selectedFile) {
          updatePayload.imageFile = selectedFile;
        }
        await updateMovie(movieId, updatePayload);
      } else {
        await createMovie({
          title: title.trim(),
          publishYear: parsedYear,
          imageFile: selectedFile ?? undefined,
        });
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save movie.";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  }

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      const preview = String(reader.result || "");
      setFilePreview(preview);
    };
    reader.readAsDataURL(file);
  }

  return (
    <PageLayout>
      <AuthGuard>
        <div className="relative z-10 flex min-h-screen flex-col px-6 pb-32 pt-10">
          <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col">
            <h2 className="mb-8 text-2xl font-semibold text-white md:mb-12 md:text-4xl">
              {isEditMode ? "Edit" : "Create a new movie"}
            </h2>

            {isLoadingMovie ? (
              <div className="flex min-h-[300px] items-center justify-center">
                <p className="text-white/70">Loading movie...</p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="flex-1">
                {error ? (
                  <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </div>
                ) : null}

              <div className="grid gap-12 md:grid-cols-[300px,1fr] lg:grid-cols-[350px,1fr] lg:gap-16">
                <label
                  htmlFor="movie-image-upload"
                  className="relative flex h-96 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/30 bg-input/20 transition-all duration-300 hover:border-primary/50"
                >
                  {filePreview || existingImage ? (
                    <img
                      src={filePreview || existingImage}
                      alt="Preview"
                      className="h-full w-full rounded-xl object-cover"
                    />
                  ) : (
                    <p className="text-base text-white/70">Drop an image here</p>
                  )}
                  <input
                    id="movie-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={onFileChange}
                    className="hidden"
                  />
                </label>

                <div className="flex max-w-sm flex-col justify-center space-y-5">
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    className="h-12 w-full rounded-lg border border-input/50 bg-input px-4 text-white placeholder:text-gray-300 focus:border-primary focus:outline-none"
                    placeholder="Title"
                    required
                    minLength={2}
                  />

                  <select
                    value={publishYear}
                    onChange={(event) => setPublishYear(event.target.value)}
                    className="h-12 max-w-[180px] rounded-lg border border-input/50 bg-input px-4 text-white focus:border-primary focus:outline-none"
                  >
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => router.back()}
                      className="h-12 rounded-lg border-2 border-white px-6 text-base font-semibold text-white transition duration-200 hover:bg-white hover:text-background"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="h-12 rounded-lg bg-primary px-8 text-base font-semibold text-white shadow-lg transition duration-200 hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSaving ? "Saving..." : isEditMode ? "Update" : "Submit"}
                    </button>
                  </div>
                </div>
              </div>
              </form>
            )}
          </div>
        </div>
      </AuthGuard>
    </PageLayout>
  );
}
