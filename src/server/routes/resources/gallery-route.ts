import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/server/init";
import { 
  imageGalleryListSchema,
  imageGallerySchema,
  createImageGallerySchema,
  updateImageGallerySchema,
  addImageToGallerySchema,
  removeImageFromGallerySchema,
  updateGalleryImageSchema,
} from "@/server/schema/resources-schema";
import { 
  getAllGalleries,
  getAllPublicGalleries,
  getGalleryById,
  getGalleryBySlug,
  getPublicGalleryBySlug,
  createGallery,
  updateGallery,
  deleteGallery,
  addImageToGallery,
  removeImageFromGallery,
  updateGalleryImage,
} from "@/server/actions/resources/gallery-action";
import { isNil } from "lodash";
import { TRPCError } from "@trpc/server";
import { z } from "zod";


export const galleryRoute = createTRPCRouter({
  // 获取所有图库（管理端用）
  all: protectedProcedure
    .output(imageGalleryListSchema)
    .query(async () => {
      try {
        const galleries = await getAllGalleries();
        if (isNil(galleries) || galleries.length === 0)
          return [];
        return galleries;
      } catch (e: any) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: e.message });
      }
    }),

  // 获取所有公开的图库（前台用）
  allPublic: baseProcedure
    .output(imageGalleryListSchema)
    .query(async () => {
      try {
        const galleries = await getAllPublicGalleries();
        if (isNil(galleries) || galleries.length === 0)
          return [];
        return galleries;
      } catch (e: any) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: e.message });
      }
    }),

  // 根据 ID 获取图库
  byId: baseProcedure
    .input(z.object({ id: z.string() }))
    .output(imageGallerySchema.nullable())
    .query(async (opts) => {
      try {
        const gallery = await getGalleryById(opts.input.id);
        return gallery || null;
      } catch (e: any) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: e.message });
      }
    }),

  // 根据 slug 获取图库（管理端用）
  bySlug: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .output(imageGallerySchema.nullable())
    .query(async (opts) => {
      try {
        const gallery = await getGalleryBySlug(opts.input.slug);
        return gallery || null;
      } catch (e: any) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: e.message });
      }
    }),

  // 根据 slug 获取公开的图库（前台用）
  bySlugPublic: baseProcedure
    .input(z.object({ slug: z.string() }))
    .output(imageGallerySchema.nullable())
    .query(async (opts) => {
      try {
        const gallery = await getPublicGalleryBySlug(opts.input.slug);
        return gallery || null;
      } catch (e: any) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: e.message });
      }
    }),

  // 创建图库
  create: protectedProcedure
    .input(createImageGallerySchema)
    .output(imageGallerySchema)
    .mutation(async (opts) => {
      try {
        const result = await createGallery(opts.input);
        
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

  // 更新图库
  update: protectedProcedure
    .input(updateImageGallerySchema)
    .output(imageGallerySchema)
    .mutation(async (opts) => {
      try {
        const { id, ...data } = opts.input;
        const result = await updateGallery(id, data);
        
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

  // 删除图库
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async (opts) => {
      try {
        const result = await deleteGallery(opts.input.id);
        
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

  // 添加图片到图库
  addImage: protectedProcedure
    .input(addImageToGallerySchema)
    .mutation(async (opts) => {
      try {
        const { galleryId, ...imageData } = opts.input;
        const result = await addImageToGallery(galleryId, imageData);
        
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

  // 从图库删除图片
  removeImage: protectedProcedure
    .input(removeImageFromGallerySchema)
    .mutation(async (opts) => {
      try {
        const { galleryId, imageId } = opts.input;
        const result = await removeImageFromGallery(galleryId, imageId);
        
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

  // 更新图库中的图片
  updateImage: protectedProcedure
    .input(updateGalleryImageSchema)
    .mutation(async (opts) => {
      try {
        const { galleryId, imageId, ...data } = opts.input;
        const result = await updateGalleryImage(galleryId, imageId, data);
        
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
