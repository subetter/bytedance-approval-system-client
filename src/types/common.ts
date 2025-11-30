// ==================== 前端组件使用的类型 ====================

import { ApprovalForm } from './approval';
import { ApprovalLog } from './approval';
import { ApprovalAttachment } from './approval';
import { User } from './user';
import { Department } from './department';
import { UserRole } from './enum';
/**
 * 表格列配置
 */
export interface TableColumn<T = any> {
  key: string; // 列唯一标识
  title: string; // 列标题
  dataIndex: keyof T | string; // 数据字段名
  width?: number | string; // 列宽度
  align?: 'left' | 'center' | 'right'; // 对齐方式
  sortable?: boolean; // 是否可排序
  filterable?: boolean; // 是否可筛选
  fixed?: 'left' | 'right'; // 是否固定列
  render?: (value: any, record: T, index: number) => React.ReactNode; // 自定义渲染
}

/**
 * 筛选条件
 */
export interface FilterCondition {
  field: string; // 字段名
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in' | 'between';
  value: any; // 筛选值
}

/**
 * 用户角色切换状态
 * 用于 role-detail 组件
 */
export interface RoleState {
  currentRole: UserRole; // 当前角色
  userId: number; // 用户ID
  user?: User; // 用户信息
}

/**
 * 审批统计数据
 */
export interface ApprovalStatistics {
  total: number; // 总数
  pending: number; // 待审批
  approved: number; // 已通过
  rejected: number; // 已拒绝
  byDepartment: Record<number, number>; // 按部门统计
  recentActions: ApprovalLog[]; // 最近操作记录
}

/**
 * 审批单详情（包含关联数据）
 */
export interface ApprovalFormDetail extends ApprovalForm {
  applicant: User; // 申请人信息（必须）
  currentApprover?: User; // 当前审批人信息
  department: Department; // 部门信息（必须）
  attachments: ApprovalAttachment[]; // 附件列表
  logs: ApprovalLog[]; // 操作日志列表
}

/**
 * 级联选择器选项
 */
export interface CascaderOption {
  value: number; // 选项值（部门ID）
  label: string; // 显示文本（部门名称）
  children?: CascaderOption[]; // 子选项
  disabled?: boolean; // 是否禁用
}

/**
 * 表单验证规则
 */
export interface FormRule {
  required?: boolean; // 是否必填
  message?: string; // 错误提示信息
  min?: number; // 最小长度/值
  max?: number; // 最大长度/值
  pattern?: RegExp; // 正则表达式验证
  validator?: (value: any) => boolean | Promise<boolean>; // 自定义验证函数
}

/**
 * 表单字段配置
 */
export interface FormField {
  name: string; // 字段名
  label: string; // 字段标签
  type: 'text' | 'textarea' | 'select' | 'date' | 'cascader' | 'upload';
  placeholder?: string; // 占位符
  rules?: FormRule[]; // 验证规则
  options?: Array<{ label: string; value: any }>; // 选项（用于select）
  disabled?: boolean; // 是否禁用
  defaultValue?: any; // 默认值
}
