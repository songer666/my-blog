import { z } from "zod";
import {
  projectSchema,
  projectUpdateSchema,
  projectCreateSchema,
} from "@/server/schema/project-schema";

// Project Types
export type ProjectType = z.infer<typeof projectSchema>;
export type ProjectUpdateType = z.infer<typeof projectUpdateSchema>;
export type ProjectCreateType = z.infer<typeof projectCreateSchema>;

// Project List Type
export type ProjectList = ProjectType[];

// Project List Item Type (without content field for list queries)
export type ProjectListItemType = Omit<ProjectType, 'content'>;

