import { ApprovalStatus, ApprovalAction, FileType } from './enum';
import { Department } from './department';
import { User } from './user';


/**
 * 审批单主表 (approval_forms)
 * 存储审批单的核心数据和状态
 */
export interface ApprovalForm {
    id: number; // 主键ID
    projectName: string; // 审批项目名称 (限制20字)
    content: string; // 审批内容 (限制300字)
    departmentId: number; // 申请的最终部门/团队ID
    departmentName?: string; // 部门名称 (后端返回)
    departmentPath?: string; // 部门完整路径 (后端返回)
    department?: Department; // 关联的部门信息（关联查询）
    executeDate: string; // 执行日期 (YYYY-MM-DD)
    applicantId: number; // 申请人ID
    applicantName?: string; // 申请人名称 (后端返回)
    applicant?: User; // 申请人信息（关联查询）
    currentApproverId?: number; // 当前待审批人ID (如果已完成，可为空)
    currentApproverName?: string; // 当前审批人名称 (后端返回)
    currentApprover?: User; // 当前审批人信息（关联查询）
    status: ApprovalStatus; // 审批状态：0-待审批, 1-审批通过, 2-审批拒绝
    createdAt: string; // 创建时间
    updatedAt: string; // 最后更新时间
    approvalAt?: string; // 审批完成时间
    isDeleted: boolean; // 逻辑删除标记
}

/**
 * 操作类型显示文本映射
 */
export const ApprovalActionText: Record<ApprovalAction, string> = {
    [ApprovalAction.CREATE]: '创建',
    [ApprovalAction.UPDATE]: '更新',
    [ApprovalAction.WITHDRAW]: '撤回',
    [ApprovalAction.APPROVE]: '审批通过',
    [ApprovalAction.REJECT]: '审批拒绝',
};

/**
 * 审批状态显示文本映射
 */
export const ApprovalStatusText: Record<ApprovalStatus, string> = {
    [ApprovalStatus.PENDING]: '待审批',
    [ApprovalStatus.APPROVED]: '审批通过',
    [ApprovalStatus.REJECTED]: '审批拒绝',
};

/**
 * 审批流转记录表 (approval_logs)
 * 记录审批单的所有操作历史
 */
export interface ApprovalLog {
    id: number; // 主键ID
    formId: number; // 关联的审批单ID
    form?: ApprovalForm; // 关联的审批单信息（关联查询）
    operatorId: number; // 操作人ID
    operator?: User; // 操作人信息（关联查询）
    action: ApprovalAction; // 操作类型
    comment?: string; // 操作意见/备注 (最多500字)
    actionTime: string; // 操作发生时间
}

/**
 * 审批附件表 (approval_attachments)
 * 存储附件信息
 */
export interface ApprovalAttachment {
    id: number; // 主键ID
    formId: number; // 关联的审批单ID
    fileName: string; // 原始文件名称
    fileUrl: string; // 文件存储路径/URL
    fileType: FileType; // 文件类型
    uploaderId: number; // 上传人ID
    uploader?: User; // 上传人信息（关联查询）
    uploadedAt: string; // 上传时间
}
