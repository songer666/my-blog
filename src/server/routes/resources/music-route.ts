import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/server/init";
import { 
  musicAlbumListSchema,
  musicAlbumSchema,
  createMusicAlbumSchema,
  updateMusicAlbumSchema,
  addMusicToAlbumSchema,
  removeMusicFromAlbumSchema,
  updateAlbumMusicSchema,
} from "@/server/schema/resources-schema";
import { 
  getAllAlbums,
  getAllPublicAlbums,
  getAlbumById,
  getAlbumBySlug,
  getPublicAlbumBySlug,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  addMusicToAlbum,
  removeMusicFromAlbum,
  updateAlbumMusic,
} from "@/server/actions/resources/music-action";
import { isNil } from "lodash";
import { TRPCError } from "@trpc/server";
import { z } from "zod";


export const musicRoute = createTRPCRouter({
  // 获取所有专辑（管理端用）
  all: protectedProcedure
    .output(musicAlbumListSchema)
    .query(async () => {
      try {
        const albums = await getAllAlbums();
        if (isNil(albums) || albums.length === 0)
          return [];
        return albums;
      } catch (e: any) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: e.message });
      }
    }),

  // 获取所有公开的专辑（前台用）
  allPublic: baseProcedure
    .output(musicAlbumListSchema)
    .query(async () => {
      try {
        const albums = await getAllPublicAlbums();
        if (isNil(albums) || albums.length === 0)
          return [];
        return albums;
      } catch (e: any) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: e.message });
      }
    }),

  // 根据 ID 获取专辑
  byId: baseProcedure
    .input(z.object({ id: z.string() }))
    .output(musicAlbumSchema.nullable())
    .query(async (opts) => {
      try {
        const album = await getAlbumById(opts.input.id);
        return album || null;
      } catch (e: any) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: e.message });
      }
    }),

  // 根据 slug 获取专辑（管理端用）
  bySlug: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .output(musicAlbumSchema.nullable())
    .query(async (opts) => {
      try {
        const album = await getAlbumBySlug(opts.input.slug);
        return album || null;
      } catch (e: any) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: e.message });
      }
    }),

  // 根据 slug 获取公开的专辑（前台用）
  bySlugPublic: baseProcedure
    .input(z.object({ slug: z.string() }))
    .output(musicAlbumSchema.nullable())
    .query(async (opts) => {
      try {
        const album = await getPublicAlbumBySlug(opts.input.slug);
        return album || null;
      } catch (e: any) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: e.message });
      }
    }),

  // 创建专辑
  create: protectedProcedure
    .input(createMusicAlbumSchema)
    .output(musicAlbumSchema)
    .mutation(async (opts) => {
      try {
        const result = await createAlbum(opts.input);
        
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

  // 更新专辑
  update: protectedProcedure
    .input(updateMusicAlbumSchema)
    .output(musicAlbumSchema)
    .mutation(async (opts) => {
      try {
        const { id, ...data } = opts.input;
        const result = await updateAlbum(id, data);
        
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

  // 删除专辑
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async (opts) => {
      try {
        const result = await deleteAlbum(opts.input.id);
        
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

  // 添加音乐到专辑
  addMusic: protectedProcedure
    .input(addMusicToAlbumSchema)
    .mutation(async (opts) => {
      try {
        const { albumId, ...musicData } = opts.input;
        const result = await addMusicToAlbum(albumId, musicData);
        
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

  // 从专辑删除音乐
  removeMusic: protectedProcedure
    .input(removeMusicFromAlbumSchema)
    .mutation(async (opts) => {
      try {
        const { albumId, musicId } = opts.input;
        const result = await removeMusicFromAlbum(albumId, musicId);
        
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

  // 更新专辑中的音乐
  updateMusic: protectedProcedure
    .input(updateAlbumMusicSchema)
    .mutation(async (opts) => {
      try {
        const { albumId, musicId, ...data } = opts.input;
        const result = await updateAlbumMusic(albumId, musicId, data);
        
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
