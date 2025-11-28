'use server';

import { serializeMdx } from '@/components/mdx/utils';

/**
 * 序列化 MDX 内容的 Server Action
 */
export async function serializeMdxAction(source: string) {
  try {
    const result = await serializeMdx(source);
    return { success: true, data: result };
  } catch (error: any) {
    console.error('MDX 序列化错误:', error);
    return { success: false, error: error.message || '序列化失败' };
  }
}
