import { authClient } from "@/lib/auth-client";
import { useTRPC } from "@/components/trpc/client";
import { useMutation } from "@tanstack/react-query";

/**
 * 统一的认证API管理类
 * 封装所有与用户认证相关的后端请求
 */
export class AuthAPI {
  /**
   * 用户登录
   * @param email 邮箱
   * @param password 密码
   * @param rememberMe 记住我
   * @param callbackURL 登录成功后跳转URL
   */
  async signIn(email: string, password: string, rememberMe: boolean = true, callbackURL: string = '/admin/dashboard') {
      return await authClient.signIn.email({
      email,
      password,
      rememberMe,
      callbackURL,
    });
  }

  /**
   * 用户注册
   * @param email 邮箱
   * @param name 姓名
   * @param password 密码
   */
  async signUp(email: string, name: string, password: string) {
    return await authClient.signUp.email({
      email,
      name,
      password,
    });
  }

  /**
   * 用户登出
   */
  async signOut() {
    return await authClient.signOut();
  }

  /**
   * 撤销会话
   * @param token 会话token
   */
  async revokeSession(token: string) {
    return await authClient.revokeSession({ token });
  }
}

/**
 * TRPC Hook工具函数
 * 用于在React组件中获取TRPC mutations
 */
export function useAuthAPI() {
  const trpc = useTRPC();
  
  return {
    /**
     * 删除用户的mutation hook
     */
    useDeleteUser: () => useMutation(trpc.auth.delete.mutationOptions()),
    
    /**
     * 切换用户验证状态的mutation hook  
     */
    useToggleVerify: () => useMutation(trpc.auth.toggle.mutationOptions()),
    
    /**
     * 更新用户信息的mutation hook
     */
    useUpdateUser: () => useMutation(trpc.auth.update.mutationOptions()),
    
    /**
     * 更新用户头像的mutation hook
     */
    useUpdateAvatar: () => useMutation(trpc.auth.updateAvatar.mutationOptions()),
    
    /**
     * 获取TRPC客户端实例
     */
    getTRPC: () => trpc,
  };
}

// 导出单例实例
export const authApi = new AuthAPI();
