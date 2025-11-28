'use server';
import type { Compatible } from 'vfile';

import { serialize } from 'next-mdx-remote-client/serialize';

import { deepMerge } from '@/lib/utils';

import type { MdxSerializeOptions } from './type';

import { defaultMdxSerializeOptions } from './options/serialize-option';

export const serializeMdx = async (source: Compatible, options: MdxSerializeOptions = {}) => {
    const result = await serialize({
        source,
        ...deepMerge(defaultMdxSerializeOptions, options, 'merge'),
    });
    return result;
};