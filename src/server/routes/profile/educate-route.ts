import { createTRPCRouter, protectedProcedure } from "@/server/init";
import { educationUpdateSchema, educationListResponseSchema } from "@/server/schema/profile-schema";
import { getEducationList, createEducation, deleteEducation } from "@/server/actions/profile/educate-action";
import { TRPCError } from "@trpc/server";
import { z } from "zod";


export const educateRoute = createTRPCRouter({
  // 获取教育经历列表
  list: protectedProcedure
    .output(educationListResponseSchema)
    .query(async () => {
      try {
        const educationList = await getEducationList();
        
        return {
          success: true,
          data: educationList,
          message: educationList.length > 0 ? "获取教育经历成功" : "暂无教育经历",
        };
      } catch (error: any) {
        console.error("获取教育经历失败:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || "获取教育经历失败",
        });
      }
    }),

  // 新增教育经历
  create: protectedProcedure
    .input(educationUpdateSchema)
    .mutation(async (opts) => {
      try {
        const newEducation = await createEducation(opts.input);
        
        return {
          success: true,
          data: newEducation,
          message: "教育经历添加成功",
        };
      } catch (error: any) {
        console.error("创建教育经历失败:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || "创建教育经历失败",
        });
      }
    }),

  // 删除教育经历
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async (opts) => {
      try {
        const result = await deleteEducation(opts.input.id);
        
        return {
          success: result.deleted,
          message: result.deleted ? "教育经历删除成功" : "删除失败",
        };
      } catch (error: any) {
        console.error("删除教育经历失败:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || "删除教育经历失败",
        });
      }
    }),
});
