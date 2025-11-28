import type { LucideIcon } from 'lucide-react';
import type { FC } from 'react';

import { AlertTriangle, Flame, Info, LightbulbIcon, NotebookPen } from 'lucide-react';
import React from 'react';

import type { AdmonitionType } from '../plugins/remark-admonitions';
import {cn} from "@/lib/utils";


const ADMONITION_CONFIG: Record<AdmonitionType, AdmonitionConfig> = {
    note: {
        icon: NotebookPen,
        title: '注意',
        containerClasses:
            'bg-[#fdfdfe]/40 dark:bg-[#474748]/30 border-l-[#d4d5d8] dark:border-l-[#a1a1a4]',
        iconClasses: 'text-[#3578e5] dark:text-[#2b60b8]',
        titleClasses: 'text-[#3578e5] dark:text-[#2b60b8]',
    },
    tip: {
        icon: LightbulbIcon,
        title: '提示',
        containerClasses:
            'bg-[#e6f6e6]/40 dark:bg-[#14532d]/30 border-l-[#009400] dark:border-l-[#2a8c2a]',
        iconClasses: 'text-[#009400] dark:text-[#2a8c2a]',
        titleClasses: 'text-[#009400] dark:text-[#2a8c2a]',
    },
    info: {
        icon: Info,
        title: '信息',
        containerClasses:
            'bg-[#eef3fd]/40 dark:bg-[#172554]/30 border-l-[#3578e5] dark:border-l-[#2b60b8]',
        iconClasses: 'text-[#3578e5] dark:text-[#2b60b8]',
        titleClasses: 'text-[#3578e5] dark:text-[#2b60b8]',
    },
    warning: {
        icon: AlertTriangle,
        title: '警告',
        containerClasses:
            'bg-[#fff8e6]/40 dark:bg-[#713f12]/30 border-l-[#e6a700] dark:border-l-[#b88a00]',
        iconClasses: 'text-[#e6a700] dark:text-[#b88a00]',
        titleClasses: 'text-[#e6a700] dark:text-[#b88a00]',
    },
    danger: {
        icon: Flame,
        title: '危险',
        containerClasses:
            'bg-[#ffe3e3]/40 dark:bg-[#7f1d1d]/30 border-l-[#fa383e] dark:border-l-[#c82333]',
        iconClasses: 'text-[#fa383e] dark:text-[#c82333]',
        titleClasses: 'text-[#fa383e] dark:text-[#c82333]',
    },
};

interface AdmonitionProps {
    type: AdmonitionType;
    title?: string;
    children: React.ReactNode;
}

export const Admonition: FC<AdmonitionProps> = ({ type, title, children }) => {
    const config = ADMONITION_CONFIG[type];
    const Icon = config.icon;

    return (
        <div
            className={cn(
                'flex my-4 rounded border-l-4 p-2',
                'shadow-sm dark:shadow-none',
                config.containerClasses,
            )}
        >
            <div className="flex items-center gap-2">
                <Icon className={cn('h-5 w-5', config.iconClasses)} />
                <p className={cn(config.titleClasses)}>{title || config.title}</p>
            </div>
            <div className="prose dark:prose-invert">{children}</div>
        </div>
    );
};

interface AdmonitionConfig {
    icon: LucideIcon;
    title: string;
    containerClasses: string;
    iconClasses: string;
    titleClasses: string;
}
