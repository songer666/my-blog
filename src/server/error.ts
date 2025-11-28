// src/trpc/pg-error.ts
import { TRPCError } from '@trpc/server';

// 解析 Postgres unique_violation 的 detail（可选）
function parsePgDetail(e: any): string | undefined {
    const d: string | undefined = e?.detail;
    // 例如: 'Key (email)=(foo@bar.com) already exists.'
    return d;
}

export function mapPgErrorToTrpc(err: unknown): never {
    const e = err as any;
    const code: string | undefined = e?.code;

    switch (code) {
        // ---- 唯一/外键/非空/检查 约束 ----
        case '23505': { // unique_violation
            const detail = parsePgDetail(e);
            throw new TRPCError({ code: 'CONFLICT', message: detail ?? '已存在相同记录' });
        }
        case '23503': // foreign_key_violation
            throw new TRPCError({ code: 'BAD_REQUEST', message: '外键约束失败（存在关联数据或引用不存在）' });
        case '23502': // not_null_violation
            throw new TRPCError({ code: 'BAD_REQUEST', message: '必要字段为空' });
        case '23514': // check_violation
            throw new TRPCError({ code: 'BAD_REQUEST', message: '数据不满足约束' });

        // ---- 其他常见 ----
        case '22001': // string_data_right_truncation
            throw new TRPCError({ code: 'BAD_REQUEST', message: '字段长度超限' });
        case '40001': // serialization_failure
            throw new TRPCError({ code: 'CONFLICT', message: '并发冲突，请重试' });
        case '57014': // query_canceled
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '请求被取消' });

        // 架构/列缺失（通常是开发期）
        case '42P01': // undefined_table
        case '42703': // undefined_column
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '数据库结构错误（表/列不存在）' });

        default:
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '服务器异常' });
    }
}

// 通用守护器：少写 try/catch
export async function dbGuard<T>(fn: () => Promise<T>): Promise<T> {
    try {
        return await fn();
    } catch (err) {
        mapPgErrorToTrpc(err);
    }
};
