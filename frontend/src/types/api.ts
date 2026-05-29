export type NoteType = "RGPV" | "PROGRAMMING" | "COMMON";
export type FileType = "PDF" | "DOC" | "DOCX" | "PPT" | "PPTX" | "ZIP";

export type CatalogOption = {
  id: number;
  name: string;
  slug: string;
  code?: string | null;
  fullName?: string | null;
  description?: string | null;
};

export type Note = {
  id: string;
  title: string;
  description?: string | null;
  fileUrl: string;
  downloadUrl: string;
  fileName: string;
  fileType: FileType;
  fileSize: number;
  readableFileSize: string;
  noteType: NoteType;
  semester?: CatalogOption | null;
  branch?: CatalogOption | null;
  subject?: CatalogOption | null;
  programmingCategory?: CatalogOption | null;
  tags: string[];
  downloadCount: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProgrammingGroup = {
  category: CatalogOption;
  notes: Note[];
};

export type DashboardStats = {
  totalNotes: number;
  totalDownloads: number;
  totalRgpvMaterials: number;
  totalProgrammingNotes: number;
  totalCommonDocuments: number;
  recentlyUploadedFiles: Note[];
  popularDownloads: Note[];
};

export type PageResponse<T> = {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type LoginResponse = {
  token: string;
  expiresAt: string;
  email: string;
  roles: string[];
};

export type SettingResponse = {
  key: string;
  value: string;
};
