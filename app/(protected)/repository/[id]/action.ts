"use server";
import { DirectoryWithRelations } from "@/interfaces/github";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { File } from "@prisma/client";
import { getServerSession } from "next-auth";

export async function getRepositoryData(id: string) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return null;
  }

  try {
    const repository = await prisma.repository.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        directories: true,
        files: true,
      },
    });

    if (!repository) {
      return null;
    }

    const directoryMap = new Map();
    const rootDirectories: DirectoryWithRelations[] = [];
    const rootFiles: File[] = [];

    // Initialize directory map
    repository.directories.forEach((dir) => {
      directoryMap.set(dir.id, { ...dir, children: [], files: [] });
    });

    // Build hierarchy
    repository.directories.forEach((dir) => {
      if (dir.parentId) {
        directoryMap.get(dir.parentId)?.children.push(directoryMap.get(dir.id));
      } else {
        rootDirectories.push(directoryMap.get(dir.id));
      }
    });

    repository.files.map(async (file) => {
      if (file.directoryId) {
        directoryMap.get(file.directoryId).files.push(file);
      } else {
        rootFiles.push(file);
      }
    });

    // Create structured repository
    const structuredRepository = {
      ...repository,
      directories: rootDirectories,
      rootFiles,
      files: repository.files,
    };

    return structuredRepository;
  } catch (error) {
    if (error instanceof Error) {
      console.log("error.stack is ", error.stack);
      console.log("error.message is ", error.message);
    }
    return null;
  }
}
