// ==================== API 请求/响应类型 ====================
import { ApprovalStatus } from './enum';
import { ApprovalAction } from './enum';

/**
 * 分页参数
 */
export interface PaginationParams {
  page: number; // 当前页码（从1开始）
  pageSize: number; // 每页数量
}

/**
 * 分页响应
 */
export interface PaginationResponse<T> {
  data: T[]; // 数据列表
  total: number; // 总数
  page: number; // 当前页码
  pageSize: number; // 每页数量
  totalPages: number; // 总页数
}

/**
 * 审批单列表查询参数
 */
export interface ApprovalFormQueryParams extends PaginationParams {
  status?: ApprovalStatus; // 按状态筛选
  applicantId?: number; // 按申请人筛选
  currentApproverId?: number; // 按当前审批人筛选
  departmentId?: number; // 按部门筛选
  startDate?: string; // 执行日期范围 - 开始
  endDate?: string; // 执行日期范围 - 结束
  keyword?: string; // 关键词搜索（项目名称或内容）
  isDeleted?: boolean; // 是否查询已删除的记录
  sortBy?: 'createdAt' | 'updatedAt' | 'executeDate' | 'approvalAt'; // 排序字段
  sortOrder?: 'asc' | 'desc'; // 排序方向
}

/**
 * 创建审批单请求
 */
export interface CreateApprovalFormRequest {
  projectName: string; // 审批项目名称 (限制20字)
  content: string; // 审批内容 (限制300字)
  departmentId: number; // 申请的最终部门/团队ID
  executeDate: string; // 执行日期 (YYYY-MM-DD)
  currentApproverId?: number; // 指定审批人ID（可选）
  attachments?: File[]; // 附件文件列表（前端上传用）
}

/**
 * 更新审批单请求
 */
export interface UpdateApprovalFormRequest {
  projectName?: string; // 审批项目名称
  content?: string; // 审批内容
  departmentId?: number; // 部门ID
  executeDate?: string; // 执行日期
  currentApproverId?: number; // 当前审批人ID
}

/**
 * 审批操作请求
 */
export interface ApprovalActionRequest {
  action: ApprovalAction.APPROVE | ApprovalAction.REJECT | ApprovalAction.WITHDRAW;
  comment?: string; // 操作意见/备注 (最多500字)
}

/**
 * 附件上传请求
 */
export interface UploadAttachmentRequest {
  formId: number; // 审批单ID
  file: File; // 文件对象
}

/**
 * 统一API响应格式
 */
export interface ApiResponse<T = any> {
  code: number; // 状态码 (200: 成功, 400: 客户端错误, 500: 服务器错误)
  message: string; // 消息
  data?: T; // 数据
}
