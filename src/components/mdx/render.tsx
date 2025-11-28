import {MdxRenderProps} from "@/components/mdx/type";
import {serializeMdx} from "@/components/mdx/utils";
import {MdxHydrate} from "@/components/mdx/hydrate";
import { getQueryClient, trpc } from '@/components/trpc/server';

/**
 * 动态mdx渲染组件
 * @param props
 */
export async function MdxRender(props:MdxRenderProps) {
    const { source, options, hydrate } = props;
    const result = await serializeMdx(source, options ?? {});
    
    // 获取个人资料数据
    const queryClient = getQueryClient();
    const profileData = await queryClient.fetchQuery(trpc.bio.get.queryOptions());
    const profile = profileData?.data || null;
    
    return <MdxHydrate 
        {...(hydrate ?? {})} 
        serialized={result} 
        profile={profile}
    />;
};