export type Movie = {
  id: string;
  title: string;
  publishYear: number;
  image: string;
  createdAt: string;
  updatedAt: string;
};

export type MoviesResponse = {
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

export type CreateMoviePayload = {
  title: string;
  publishYear: number;
  imageFile?: File;
};

export type UpdateMoviePayload = {
  title?: string;
  publishYear?: number;
  imageFile?: File;
};
