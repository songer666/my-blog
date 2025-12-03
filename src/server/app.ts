import { createTRPCRouter } from '@/server/init';
import {authRoute} from "@/server/routes/auth-route";
import {bioRoute} from "@/server/routes/profile/bio-route";
import {linkRoute} from "@/server/routes/profile/link-route";
import {educateRoute} from "@/server/routes/profile/educate-route";
import {skillRoute} from "@/server/routes/profile/skill-route";
import {friendRoute} from "@/server/routes/profile/friend-route";
import {tagRoute} from "@/server/routes/blog/tag-route";
import {postRoute} from "@/server/routes/blog/post-route";
import {postStatsRoute} from "@/server/routes/blog/post-stats-route";
import {projectRoute} from "@/server/routes/project-route";
import {messageRoute} from "@/server/routes/message-route";
import {galleryRoute} from "@/server/routes/resources/gallery-route";
import {musicRoute} from "@/server/routes/resources/music-route";
import {videoRoute} from "@/server/routes/resources/video-route";
import {codeRoute} from "@/server/routes/resources/code-route";

export const appRouter = createTRPCRouter({
    auth: authRoute,
    bio: bioRoute,
    link: linkRoute,
    educate: educateRoute,
    skill: skillRoute,
    friend: friendRoute,
    tag: tagRoute,
    post: postRoute,
    postStats: postStatsRoute,
    project: projectRoute,
    message: messageRoute,
    imageGallery: galleryRoute,
    musicAlbum: musicRoute,
    videoCollection: videoRoute,
    codeRepository: codeRoute,
});

//获取类型trpc路由类型
export type AppRouter = typeof appRouter;