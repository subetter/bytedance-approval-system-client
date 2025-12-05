import { ApprovalStatus } from '@/types/enum';

/**
 * 审批状态颜色映射
 */
export const APPROVAL_STATUS_COLOR_MAP: Record<ApprovalStatus, string> = {
    [ApprovalStatus.PENDING]: 'orange',
    [ApprovalStatus.APPROVED]: 'green',
    [ApprovalStatus.REJECTED]: 'red',
};

/**
 * 获取审批状态标签颜色
 */
export const getStatusColor = (status: ApprovalStatus): string => {
    return APPROVAL_STATUS_COLOR_MAP[status] || 'gray';
};

/**
 * 审批操作类型
 */
export type ApprovalActionType = 'approve' | 'reject' | 'withdraw';

/**
 * 审批操作标题映射
 */
export const APPROVAL_ACTION_TITLE_MAP: Record<ApprovalActionType, string> = {
    approve: '确认通过',
    reject: '确认驳回',
    withdraw: '确认撤回',
};

/**
 * 审批操作文本映射
 */
export const APPROVAL_ACTION_TEXT_MAP: Record<ApprovalActionType, string> = {
    approve: '通过',
    reject: '驳回',
    withdraw: '撤回',
};

/**
 * 获取审批操作标题
 */
export const getApprovalActionTitle = (actionType: ApprovalActionType | null): string => {
    return actionType ? APPROVAL_ACTION_TITLE_MAP[actionType] : '确认操作';
};

/**
 * 获取审批操作文本
 */
export const getApprovalActionText = (actionType: ApprovalActionType | null): string => {
    return actionType ? APPROVAL_ACTION_TEXT_MAP[actionType] : '操作';
};

