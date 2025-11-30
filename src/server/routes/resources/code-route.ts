import {baseProcedure, createTRPCRouter, protectedProcedure} from "@/server/init";
import { 
  codeRepositoryListSchema,
  codeRepositorySchema,
  createCodeRepositorySchema,
  updateCodeRepositorySchema,
  addCodeToRepositorySchema,
  removeCodeFromRepositorySchema,
  updateRepositoryCodeSchema,
  addDemoImageSchema,
  removeDemoImageSchema,
} from "@/server/schema/resources-schema";
import { 
  getAllRepositories,
  getAllPublicRepositories,
  getRepositoryById,
  getRepositoryBySlug,
  getPublicRepositoryBySlug,
  createRepository,
  updateRepository,
  deleteRepository,
  addCodeToRepository,
  removeCodeFromRepository,
  updateRepositoryCode,
  addDemoImageToRepository,
  removeDemoImageFromRepository,
} from "@/server/actions/resources/code-action";
import { isNil } from "lodash";
import { TRPCError } from "@trpc/server";
import { z } from "zod";


export const codeRoute = createTRPCRouter({
  // 获取所有代码库（管理端用）
  all: protectedProcedure
    .output(codeRepositoryListSchema)
    .query(async () => {
      try {
        const repositories = await getAllRepositories();
        if (isNil(repositories) || repositories.length === 0)
          return [];
        return repositories;
      } catch (e: any) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: e.message });
      }
    }),

  // 获取所有公开的代码库（前台用）
  allPublic: baseProcedure
    .output(codeRepositoryListSchema)
    .query(async () => {
      try {
        const repositories = await getAllPublicRepositories();
        if (isNil(repositories) || repositories.length === 0)
          return [];
        return repositories;
      } catch (e: any) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: e.message });
      }
    }),

  // 根据 ID 获取代码库
  byId: baseProcedure
    .input(z.object({ id: z.string() }))
    .output(codeRepositorySchema.nullable())
    .query(async (opts) => {
      try {
        const repository = await getRepositoryById(opts.input.id);
        return repository || null;
      } catch (e: any) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: e.message });
      }
    }),

  // 根据 slug 获取代码库（管理端用）
  bySlug: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .output(codeRepositorySchema.nullable())
    .query(async (opts) => {
      try {
        const repository = await getRepositoryBySlug(opts.input.slug);
        return repository || null;
      } catch (e: any) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: e.message });
      }
    }),

  // 根据 slug 获取公开的代码库（前台用）
  bySlugPublic: baseProcedure
    .input(z.object({ slug: z.string() }))
    .output(codeRepositorySchema.nullable())
    .query(async (opts) => {
      try {
        const repository = await getPublicRepositoryBySlug(opts.input.slug);
        return repository || null;
      } catch (e: any) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: e.message });
      }
    }),

  // 创建代码库
  create: protectedProcedure
    .input(createCodeRepositorySchema)
    .output(codeRepositorySchema)
    .mutation(async (opts) => {
      try {
        const result = await createRepository(opts.input);
        
        if (!result.success || !result.data) {
          throw new TRPCError({ 
            code: 'BAD_REQUEST', 
            message: result.error || '创建失败' 
          });
        }

        return result.data;
      } catch (e: any) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: e.message });
      }
    }),

  // 更新代码库
  update: protectedProcedure
    .input(updateCodeRepositorySchema)
    .output(codeRepositorySchema)
    .mutation(async (opts) => {
      try {
        const { id, ...data } = opts.input;
        const result = await updateRepository(id, data);
        
        if (!result.success || !result.data) {
          throw new TRPCError({ 
            code: 'BAD_REQUEST', 
            message: result.error || '更新失败' 
          });
        }

        return result.data;
      } catch (e: any) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: e.message });
      }
    }),

  // 删除代码库
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async (opts) => {
      try {
        const result = await deleteRepository(opts.input.id);
        
        if (!result.success) {
          throw new TRPCError({ 
            code: 'INTERNAL_SERVER_ERROR', 
            message: result.error || '删除失败' 
          });
        }

        return result;
      } catch (e: any) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: e.message });
      }
    }),

  // 添加代码文件到代码库
  addCode: protectedProcedure
    .input(addCodeToRepositorySchema)
    .mutation(async (opts) => {
      try {
        const { repositoryId, ...codeData } = opts.input;
        const result = await addCodeToRepository(repositoryId, codeData);
        
        if (!result.success) {
          throw new TRPCError({ 
            code: 'BAD_REQUEST', 
            message: result.error || '添加失败' 
          });
        }

        return result;
      } catch (e: any) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: e.message });
      }
    }),

  // 从代码库删除代码文件
  removeCode: protectedProcedure
    .input(removeCodeFromRepositorySchema)
    .mutation(async (opts) => {
      try {
        const { repositoryId, codeId } = opts.input;
        const result = await removeCodeFromRepository(repositoryId, codeId);
        
        if (!result.success) {
          throw new TRPCError({ 
            code: 'BAD_REQUEST', 
            message: result.error || '删除失败' 
          });
        }

        return result;
      } catch (e: any) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: e.message });
      }
    }),

  // 更新代码库中的代码文件
  updateCode: protectedProcedure
    .input(updateRepositoryCodeSchema)
    .mutation(async (opts) => {
      try {
        const { repositoryId, codeId, ...data } = opts.input;
        const result = await updateRepositoryCode(repositoryId, codeId, data);
        
        if (!result.success) {
          throw new TRPCError({ 
            code: 'BAD_REQUEST', 
            message: result.error || '更新失败' 
          });
        }

        return result;
      } catch (e: any) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: e.message });
      }
    }),

  // 添加演示图片到代码库
  addDemoImage: protectedProcedure
    .input(addDemoImageSchema)
    .mutation(async (opts) => {
      try {
        const { repositoryId, ...imageData } = opts.input;
        const result = await addDemoImageToRepository(repositoryId, imageData);
        
        if (!result.success) {
          throw new TRPCError({ 
            code: 'BAD_REQUEST', 
            message: result.error || '添加失败' 
          });
        }

        return result;
      } catch (e: any) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: e.message });
      }
    }),

  // 从代码库删除演示图片
  removeDemoImage: protectedProcedure
    .input(removeDemoImageSchema)
    .mutation(async (opts) => {
      try {
        const { repositoryId, imageId } = opts.input;
        const result = await removeDemoImageFromRepository(repositoryId, imageId);
        
        if (!result.success) {
          throw new TRPCError({ 
            code: 'BAD_REQUEST', 
            message: result.error || '删除失败' 
          });
        }

        return result;
      } catch (e: any) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: e.message });
      }
    }),
});
