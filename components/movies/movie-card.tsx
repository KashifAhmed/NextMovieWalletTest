"use client";

import type { Movie } from "@/lib/types/movies";

type MovieCardProps = {
  movie: Movie;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

const FALLBACK_IMAGE =
  "https://via.placeholder.com/300x450/222222/FFFFFF?text=No+Image";

export function MovieCard({ movie, onEdit, onDelete }: MovieCardProps) {
  return (
    <article className="group cursor-pointer">
      <div className="mb-4 rounded-xl bg-card p-0 backdrop-blur-[100px] transition-all duration-300 hover:bg-card/80 md:rounded-xl md:p-2 sm:rounded-t-xl sm:rounded-b-none">
        <div className="relative mb-4 aspect-[2/3] overflow-hidden rounded-t-xl md:rounded-lg sm:rounded-t-xl sm:rounded-b-none">
          <img
            src={movie.image || FALLBACK_IMAGE}
            alt={movie.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(event) => {
              const image = event.currentTarget;
              image.src = FALLBACK_IMAGE;
            }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => onEdit(movie.id)}
              className="w-full rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white transition hover:bg-green-400"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete(movie.id)}
              className="w-full rounded-lg bg-error px-6 py-2 text-sm font-semibold text-white transition hover:bg-red-400"
            >
              Delete
            </button>
          </div>
        </div>
        <div className="px-2 pb-3">
          <h3 className="truncate text-lg font-medium text-white">{movie.title}</h3>
          <p className="text-sm text-white">{movie.publishYear}</p>
        </div>
      </div>
    </article>
  );
}
