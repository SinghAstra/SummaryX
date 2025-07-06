import { Directory, File } from "@prisma/client";

export interface DirectoryWithRelations extends Directory {
  children: DirectoryWithRelations[];
  files: File[];
}

export interface RepositoryPreview {
  owner: string;
  avatarUrl: string;
  name: string;
}
