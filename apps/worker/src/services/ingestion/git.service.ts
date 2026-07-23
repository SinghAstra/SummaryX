import { exec } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const execAsync = promisify(exec);

export async function syncWorkspace(workspacePath: string, githubUrl: string) {
  await fs.mkdir(path.dirname(workspacePath), { recursive: true });

  await fs.rm(workspacePath, { recursive: true, force: true }).catch(() => {});

  const result = await execAsync(
    `git clone --depth 1 ${githubUrl} ${workspacePath}`,
    {
      timeout: 60000,
    }
  );

  console.log("Git Clone ", result);

  console.log(`✅ Successfully cloned: ${githubUrl} into ${workspacePath}`);
}
