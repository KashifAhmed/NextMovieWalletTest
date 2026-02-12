"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteMovie, getMovies } from "@/features/movies/client/movies-api";
import type { Movie } from "@/lib/types/movies";
import { MovieCard } from "@/components/movies/movie-card";
import { PageLayout } from "@/components/layout/page-layout";
import { useAuth } from "@/features/auth/client/auth-provider";

const ITEMS_PER_PAGE = 8;

export function MoviesPageClient() {
  const router = useRouter();
  const { isAuthenticated, signOut } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load(currentPage: number) {
    try {
      setLoading(true);
      setError(null);
      const response = await getMovies(currentPage, ITEMS_PER_PAGE);
      setMovies(response.data);
      setTotalPages(response.meta.totalPages || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch movies.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(page);
  }, [page]);

  async function onDelete(id: string) {
    const confirmed = window.confirm("Delete this movie?");
    if (!confirmed) {
      return;
    }

    try {
      await deleteMovie(id);
      if (movies.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        await load(page);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete movie.");
    }
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-white/70">Loading movies...</p>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!movies.length) {
    return (
      <PageLayout>
        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="text-center">
            <h1 className="mb-8 text-4xl font-semibold text-white">Your movie list is empty</h1>
            <button
              type="button"
              onClick={() => router.push("/movie-manager")}
              className="rounded-lg bg-primary px-8 py-3 font-semibold text-white shadow-lg transition duration-200 hover:bg-green-400"
            >
              Add a new movie
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="pb-20">
        <div className="relative z-10">
          <div className="container mx-auto px-4 py-6">
            <div className="mb-8 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-semibold text-white md:text-5xl">My movies</h1>
                <button
                  onClick={() => router.push("/movie-manager")}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-transparent text-white transition duration-200 hover:bg-white hover:text-background"
                  title="Add movie"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={async () => {
                    await signOut();
                    router.push("/signin");
                  }}
                  className="rounded-lg border border-white/60 px-4 py-2 text-sm text-white transition hover:bg-white hover:text-background"
                >
                  Logout
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => router.push("/signin")}
                  className="rounded-lg border border-white/60 px-4 py-2 text-sm text-white transition hover:bg-white hover:text-background"
                >
                  Sign in
                </button>
              )}
            </div>

            <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {movies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onEdit={(id) => router.push(`/movie-manager/${id}`)}
                  onDelete={onDelete}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mb-20 flex items-center justify-center gap-4">
                <button
                  onClick={() => setPage((prev) => prev - 1)}
                  disabled={page === 1}
                  className="flex h-10 w-10 items-center justify-center text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Prev
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((itemPage) => (
                    <button
                      key={itemPage}
                      onClick={() => setPage(itemPage)}
                      className={`h-10 w-10 rounded-lg font-semibold text-white transition ${
                        page === itemPage ? "bg-primary" : "bg-card hover:bg-input"
                      }`}
                    >
                      {itemPage}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setPage((prev) => prev + 1)}
                  disabled={page === totalPages}
                  className="flex h-10 w-10 items-center justify-center text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
