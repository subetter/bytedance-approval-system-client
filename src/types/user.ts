import { UserRole } from './enum';

/**
 * 用户信息表 (users)
 * 用于存储申请人和审批员信息
 */
export interface User {
  id: number; // 主键ID
  username: string; // 用户名（登录名）
  displayName: string; // 显示名称
  department?: string; // 所属部门
  role: UserRole; // 系统角色：申请人或审批员
}
