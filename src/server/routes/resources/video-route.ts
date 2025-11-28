import { createTRPCRouter, protectedProcedure } from "@/server/init";
import { 
  videoCollectionListSchema,
  videoCollectionSchema,
  createVideoCollectionSchema,
  updateVideoCollectionSchema,
  addVideoToCollectionSchema,
  removeVideoFromCollectionSchema,
  updateCollectionVideoSchema,
} from "@/server/schema/resources-schema";
import { 
  getAllCollections,
  getCollectionById,
  getCollectionBySlug,
  createCollection,
  updateCollection,
  deleteCollection,
  addVideoToCollection,
  removeVideoFromCollection,
  updateCollectionVideo,
} from "@/server/actions/resources/video-action";
import { isNil } from "lodash";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const videoRoute = createTRPCRouter({
  // 获取所有视频集
  all: protectedProcedure
    .output(videoCollectionListSchema)
    .query(async () => {
      try {
        const collections = await getAllCollections();
        if (isNil(collections) || collections.length === 0)
          return [];
        return collections;
      } catch (e: any) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: e.message });
      }
    }),

  // 根据 ID 获取视频集
  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(videoCollectionSchema.nullable())
    .query(async (opts) => {
      try {
        const collection = await getCollectionById(opts.input.id);
        return collection || null;
      } catch (e: any) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: e.message });
      }
    }),

  // 根据 slug 获取视频集
  bySlug: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .output(videoCollectionSchema.nullable())
    .query(async (opts) => {
      try {
        const collection = await getCollectionBySlug(opts.input.slug);
        return collection || null;
      } catch (e: any) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: e.message });
      }
    }),

  // 创建视频集
  create: protectedProcedure
    .input(createVideoCollectionSchema)
    .output(videoCollectionSchema)
    .mutation(async (opts) => {
      try {
        const result = await createCollection(opts.input);
        
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

  // 更新视频集
  update: protectedProcedure
    .input(updateVideoCollectionSchema)
    .output(videoCollectionSchema)
    .mutation(async (opts) => {
      try {
        const { id, ...data } = opts.input;
        const result = await updateCollection(id, data);
        
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

  // 删除视频集
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async (opts) => {
      try {
        const result = await deleteCollection(opts.input.id);
        
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

  // 添加视频到视频集
  addVideo: protectedProcedure
    .input(addVideoToCollectionSchema)
    .mutation(async (opts) => {
      try {
        const { collectionId, ...videoData } = opts.input;
        const result = await addVideoToCollection(collectionId, videoData);
        
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

  // 从视频集删除视频
  removeVideo: protectedProcedure
    .input(removeVideoFromCollectionSchema)
    .mutation(async (opts) => {
      try {
        const { collectionId, videoId } = opts.input;
        const result = await removeVideoFromCollection(collectionId, videoId);
        
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

  // 更新视频集中的视频
  updateVideo: protectedProcedure
    .input(updateCollectionVideoSchema)
    .mutation(async (opts) => {
      try {
        const { collectionId, videoId, ...data } = opts.input;
        const result = await updateCollectionVideo(collectionId, videoId, data);
        
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
});
