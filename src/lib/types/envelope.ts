export type Meta = {
  requestId: string;
  timestamp: string;
  durationMs?: number;
  path: string;
};

export type ResponseEnvelope<T> = {
  success: true;
  message: string;
  data: T;
  meta: Meta;
};

export type ErrorEnvelope = {
  success: false;
  message: string;
  data: null;
  error: { code: string; details: string[] };
  meta: Meta;
};

export type AnyEnvelope<T> = ResponseEnvelope<T> | ErrorEnvelope;

/** Standard paginated list shape (page/pageSize/total live alongside the rows). */
export type Paginated<T, K extends string> = {
  total: number;
  page: number;
  pageSize: number;
} & { [P in K]: T[] };
