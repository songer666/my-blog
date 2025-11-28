import { z } from "zod";
import {
  profileSchema,
  bioUpdateSchema,
  socialLinkSchema,
  socialLinkUpdateSchema,
  educationSchema,
  skillCategorySchema,
  skillCategoryUpdateSchema,
  skillSchema,
  skillUpdateSchema,
  friendSchema,
  friendUpdateSchema,
  fullProfileSchema,
  educationUpdateSchema,
} from "@/server/schema/profile-schema";

// Profile Types
export type ProfileType = z.infer<typeof profileSchema>;
export type BioUpdateType = z.infer<typeof bioUpdateSchema>;

// Social Link Types
export type SocialLinkType = z.infer<typeof socialLinkSchema>;
export type SocialLinkUpdateType = z.infer<typeof socialLinkUpdateSchema>;

// Education Types
export type EducationType = z.infer<typeof educationSchema>;

// Skill Category Types
export type SkillCategoryType = z.infer<typeof skillCategorySchema>;
export type SkillCategoryUpdateType = z.infer<typeof skillCategoryUpdateSchema>;

// Skill Types
export type SkillType = z.infer<typeof skillSchema>;
export type SkillUpdateType = z.infer<typeof skillUpdateSchema>;

// Friend Types
export type FriendType = z.infer<typeof friendSchema>;
export type FriendUpdateType = z.infer<typeof friendUpdateSchema>;

// Complex Types
export type FullProfileType = z.infer<typeof fullProfileSchema>;

// Response Types
export type EducationUpdateType = z.infer<typeof educationUpdateSchema>;

