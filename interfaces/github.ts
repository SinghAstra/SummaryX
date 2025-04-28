import { Directory, File } from "@prisma/client";


export interface DirectoryWithRelations extends Directory {
  children: DirectoryWithRelations[];
  files: File[];
}

