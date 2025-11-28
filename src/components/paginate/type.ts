export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string; // 基础URL，例如 '/root/blog'
  searchParams?: Record<string, string>; // 其他查询参数
}
