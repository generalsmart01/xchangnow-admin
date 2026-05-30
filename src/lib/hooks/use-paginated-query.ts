"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

export type ListParams = {
  page: number;
  pageSize: number;
  [key: string]: string | number;
};

type Config<T> = {
  /** Base query key, e.g. "transactions". */
  queryKey: string;
  /** Filter param names to read from / write to the URL. */
  filterKeys?: string[];
  /** Default values for filters (applied when the URL omits them). */
  defaults?: Record<string, string>;
  defaultPageSize?: number;
  fetcher: (params: ListParams) => Promise<{ data: T }>;
  enabled?: boolean;
};

/**
 * TanStack Query bound to URL search-params. Page + filters live in the URL so
 * lists are shareable/back-button friendly. Changing any filter resets to
 * page 1.
 */
export function usePaginatedQuery<T>({
  queryKey,
  filterKeys = [],
  defaults = {},
  defaultPageSize = DEFAULT_PAGE_SIZE,
  fetcher,
  enabled = true,
}: Config<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filterKeysKey = filterKeys.join(",");
  const params = useMemo<ListParams>(() => {
    const page = Number(searchParams.get("page") ?? "1") || 1;
    const pageSize =
      Number(searchParams.get("pageSize") ?? String(defaultPageSize)) ||
      defaultPageSize;
    const filters: Record<string, string> = {};
    for (const key of filterKeys) {
      filters[key] = searchParams.get(key) ?? defaults[key] ?? "";
    }
    return { page, pageSize, ...filters };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, defaultPageSize, filterKeysKey]);

  const writeParams = useCallback(
    (next: Record<string, string | number>, { resetPage = false } = {}) => {
      const sp = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(next)) {
        if (v === "" || v === null || v === undefined) sp.delete(k);
        else sp.set(k, String(v));
      }
      if (resetPage) sp.set("page", "1");
      router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const setPage = useCallback(
    (page: number) => writeParams({ page }),
    [writeParams],
  );

  const setFilter = useCallback(
    (key: string, value: string) => writeParams({ [key]: value }, { resetPage: true }),
    [writeParams],
  );

  const setFilters = useCallback(
    (values: Record<string, string>) => writeParams(values, { resetPage: true }),
    [writeParams],
  );

  const query = useQuery({
    queryKey: [queryKey, params],
    queryFn: () => fetcher(params).then((r) => r.data),
    placeholderData: keepPreviousData,
    enabled,
  });

  return { ...query, params, setPage, setFilter, setFilters, writeParams };
}
