import type {
  CatalogOption,
  DashboardStats,
  LoginResponse,
  Note,
  NoteType,
  PageResponse,
  ProgrammingGroup,
  SettingResponse
} from "@/types/api";
import { absoluteApiUrl } from "@/lib/utils";

type RequestOptions = RequestInit & {
  token?: string | null;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const url = absoluteApiUrl(path);
  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
      cache: options.cache ?? "no-store"
    });
  } catch {
    throw new Error(
      `Could not reach the backend API at ${url}. Check that the backend is running, NEXT_PUBLIC_API_URL is correct, and the backend allows this site's origin in CORS.`
    );
  }

  if (!response.ok) {
    let message = "Request failed.";
    try {
      const error = (await response.json()) as { message?: string };
      message = error.message ?? message;
    } catch {
      message = response.statusText;
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

export const publicApi = {
  semesters: () => request<CatalogOption[]>("/api/notes/rgpv/semesters"),
  branches: (semesterId: number) => request<CatalogOption[]>(`/api/notes/rgpv/semesters/${semesterId}/branches`),
  rgpvNotes: (params: { semester?: string | number; branch?: string | number; subject?: string | number }) => {
    const search = new URLSearchParams();
    if (params.semester) search.set("semester", String(params.semester));
    if (params.branch) search.set("branch", String(params.branch));
    if (params.subject) search.set("subject", String(params.subject));
    return request<Note[]>(`/api/notes/rgpv?${search.toString()}`);
  },
  programming: () => request<ProgrammingGroup[]>("/api/notes/programming"),
  programmingCategory: (slug: string) => request<Note[]>(`/api/notes/programming/${slug}`),
  common: () => request<Note[]>("/api/notes/common"),
  search: (query: string) => request<Note[]>(`/api/notes/search?q=${encodeURIComponent(query)}`),
  recent: () => request<Note[]>("/api/notes/recent"),
  popular: () => request<Note[]>("/api/notes/popular"),
  whatsapp: () => request<SettingResponse>("/api/settings/whatsapp")
};

export const adminApi = {
  login: (email: string, password: string) =>
    request<LoginResponse>("/api/admin/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    }),
  googleLogin: (credential: string) =>
    request<LoginResponse>("/api/admin/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential })
    }),
  changePassword: (token: string, currentPassword: string, newPassword: string) =>
    request<void>("/api/admin/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
      token
    }),
  dashboard: (token: string) => request<DashboardStats>("/api/admin/dashboard", { token }),
  notes: (token: string, filters: { q?: string; noteType?: NoteType; page?: number; size?: number }) => {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.noteType) params.set("noteType", filters.noteType);
    params.set("page", String(filters.page ?? 0));
    params.set("size", String(filters.size ?? 20));
    return request<PageResponse<Note>>(`/api/admin/notes?${params.toString()}`, { token });
  },
  createRgpv: (token: string, formData: FormData) =>
    request<Note>("/api/admin/notes/rgpv", { method: "POST", body: formData, token }),
  createProgramming: (token: string, formData: FormData) =>
    request<Note>("/api/admin/notes/programming", { method: "POST", body: formData, token }),
  createCommon: (token: string, formData: FormData) =>
    request<Note>("/api/admin/notes/common", { method: "POST", body: formData, token }),
  updateNote: (token: string, id: string, formData: FormData) =>
    request<Note>(`/api/admin/notes/${id}`, { method: "PUT", body: formData, token }),
  publish: (token: string, id: string, published: boolean) =>
    request<Note>(`/api/admin/notes/${id}/publish`, {
      method: "PATCH",
      body: JSON.stringify({ published }),
      token
    }),
  deleteNote: (token: string, id: string) =>
    request<void>(`/api/admin/notes/${id}`, { method: "DELETE", token }),
  semesters: (token: string) => request<CatalogOption[]>("/api/admin/semesters", { token }),
  branches: (token: string) => request<CatalogOption[]>("/api/admin/branches", { token }),
  subjects: (token: string, semester?: number, branch?: number) => {
    const params = new URLSearchParams();
    if (semester) params.set("semester", String(semester));
    if (branch) params.set("branch", String(branch));
    return request<CatalogOption[]>(`/api/admin/subjects?${params.toString()}`, { token });
  },
  programmingCategories: (token: string) => request<CatalogOption[]>("/api/admin/programming-categories", { token }),
  createCatalog: (token: string, path: string, body: Record<string, unknown>) =>
    request<CatalogOption>(path, { method: "POST", body: JSON.stringify(body), token }),
  updateCatalog: (token: string, path: string, body: Record<string, unknown>) =>
    request<CatalogOption>(path, { method: "PUT", body: JSON.stringify(body), token }),
  deleteCatalog: (token: string, path: string) => request<void>(path, { method: "DELETE", token }),
  updateWhatsapp: (token: string, value: string) =>
    request<SettingResponse>("/api/admin/settings/whatsapp", {
      method: "PUT",
      body: JSON.stringify({ value }),
      token
    })
};

export function downloadHref(url: string) {
  return absoluteApiUrl(url);
}
