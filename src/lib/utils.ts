import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import deepmerge from "deepmerge";
import { lowerCase, trim } from 'lodash';
import pinyin from 'pinyin';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 获取url参数提供给grpc接口
 * 返回url路径
 * */
export function getUrl(): string {
    const base = (() => {
        if (typeof window !== 'undefined') return '';
        if (process.env.NETWORK_URL) return process.env.NETWORK_URL;
        return 'http://localhost:3000';
    })();
    return `${base}/api/trpc`;
}

/**
 * 深度合并对象
 * @param x 初始值
 * @param y 新值
 * @param arrayMode 对于数组采取的策略,`replace`为直接替换,`merge`为合并数组
 */
export const deepMerge = <T1, T2>(
    x: Partial<T1>,
    y: Partial<T2>,
    arrayMode: 'replace' | 'merge' = 'merge',
) => {
    const options: deepmerge.Options = {};
    if (arrayMode === 'replace') {
        options.arrayMerge = (_d, s, _o) => s;
    } else if (arrayMode === 'merge') {
        options.arrayMerge = (_d, s, _o) => Array.from(new Set([..._d, ...s]));
    }
    return deepmerge(x, y, options) as T2 extends T1 ? T1 : T1 & T2;
};

/**
 * 把一个字符串的所有字符均转化为小写
 * 并使用"-"替换空格连接所有单词
 * 如果是汉字,则先转换为拼音后再进行以上操作
 * @param from 原始字符串
 */
export const generateLowerString = (from: string): string => {
    const slug = pinyin(from, {
        style: 0,
        segment: false,
    })
        .map((words: string[]) => words[0])
        .join('-');
    return lowerCase(slug)
        .split(' ')
        .map((v) => trim(v, ' '))
        .filter(v => v.length > 0)
        .join('-');
};

/**
 * 生成博客文章的 URL slug
 * @param title 文章标题
 */
export const generatePostSlug = (title: string): string => {
    if (!title || !title.trim()) return '';
    
    // 使用拼音转换
    const slug = generateLowerString(title);
    
    // 进一步清理和限制长度
    return slug
        .replace(/[^a-z0-9\-]/g, '') // 只保留字母、数字和连字符
        .replace(/-+/g, '-') // 合并多个连字符
        .replace(/^-|-$/g, '') // 移除开头和结尾的连字符
        .substring(0, 100); // 限制长度
};

/**
 * 生成项目的 URL slug
 * @param title 项目标题
 */
export const generateProjectSlug = (title: string): string => {
    if (!title || !title.trim()) return '';
    
    // 使用拼音转换
    const slug = generateLowerString(title);
    
    // 进一步清理和限制长度
    return slug
        .replace(/[^a-z0-9\-]/g, '') // 只保留字母、数字和连字符
        .replace(/-+/g, '-') // 合并多个连字符
        .replace(/^-|-$/g, '') // 移除开头和结尾的连字符
        .substring(0, 100); // 限制长度
};

/**
 * 格式化日期时间为中文本地化格式
 * @param date 日期对象或日期字符串
 * @param options 格式化选项
 */
export const formatDateTime = (
    date: Date | string, 
    options?: {
        showTime?: boolean;
        showSeconds?: boolean;
        format?: 'short' | 'long' | 'numeric';
    }
): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    const defaultOptions = {
        showTime: true,
        showSeconds: false,
        format: 'short' as const,
        ...options
    };
    
    const formatOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: defaultOptions.format,
        day: 'numeric',
        timeZone: 'Asia/Shanghai', // 明确指定中国时区
    };
    
    if (defaultOptions.showTime) {
        formatOptions.hour = '2-digit';
        formatOptions.minute = '2-digit';
        
        if (defaultOptions.showSeconds) {
            formatOptions.second = '2-digit';
        }
    }
    
    return dateObj.toLocaleString('zh-CN', formatOptions);
};

/**
 * 格式化日期为简短格式（仅日期）
 * @param date 日期对象或日期字符串
 */
export const formatDate = (date: Date | string): string => {
    return formatDateTime(date, { showTime: false });
};

/**
 * 格式化时间为相对时间描述
 * @param date 日期对象或日期字符串
 */
export const formatRelativeTime = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
        return '刚刚';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes}分钟前`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours}小时前`;
    } else if (diffInSeconds < 2592000) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days}天前`;
    } else if (diffInSeconds < 31536000) {
        const months = Math.floor(diffInSeconds / 2592000);
        return `${months}个月前`;
    } else {
        const years = Math.floor(diffInSeconds / 31536000);
        return `${years}年前`;
    }
};
