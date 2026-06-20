export type ApiErrorCode =
  | "validation"
  | "auth"
  | "upstream-unavailable"
  | "server"
  | "network";

export type ApiError = {
  kind: ApiErrorCode;
  code: string;
  message: string;
  fields?: unknown;
};

export type SafeUser = {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
};

export type MetObject = Record<string, unknown> & {
  objectID: number;
  title: string | null;
  artistDisplayName: string | null;
  artistDisplayBio: string | null;
  primaryImage: string | null;
  primaryImageSmall: string | null;
  objectDate: string | null;
  department: string | null;
  culture: string | null;
  period: string | null;
  objectURL: string | null;
};

export type Department = {
  departmentId: number;
  displayName: string;
};

export type CollectionItem = {
  id: string;
  collectionId: string;
  metObjectId: number;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Collection = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  items: CollectionItem[];
};
