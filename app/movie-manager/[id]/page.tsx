import { MovieManagerForm } from "@/components/movies/movie-manager-form";

type EditMoviePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditMoviePage({ params }: EditMoviePageProps) {
  const { id } = await params;

  return <MovieManagerForm movieId={id} />;
}
