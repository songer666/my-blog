"use client";

import { TRPCReactProvider } from "@/components/trpc/client";
import { LinkCodeRepositoryDialog } from "./link-code-repository-dialog";
import type { ProjectType } from "@/server/types/project-type";

interface LinkCodeRepositoryWrapperProps {
  project: ProjectType;
}

export function LinkCodeRepositoryWrapper({ project }: LinkCodeRepositoryWrapperProps) {
  return (
    <TRPCReactProvider>
      <LinkCodeRepositoryDialog project={project} />
    </TRPCReactProvider>
  );
}
