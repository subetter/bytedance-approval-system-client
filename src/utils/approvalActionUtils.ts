import { approveApproval, rejectApproval, withdrawApproval } from '@/api/approval';
import { ApprovalForm } from '@/types/approval';
import { UserRole } from '@/types/enum';
import { ApprovalActionType } from './approvalUtils';

/**
 * 执行审批操作
 */
export const executeApprovalAction = async (
    actionType: ApprovalActionType,
    record: ApprovalForm,
    currentRole: UserRole
): Promise<void> => {
    switch (actionType) {
        case 'approve':
            await approveApproval(record.id, currentRole);
            break;
        case 'reject':
            await rejectApproval(record.id, currentRole);
            break;
        case 'withdraw':
            await withdrawApproval(record.id);
            break;
        default:
            throw new Error(`未知的审批操作类型: ${actionType}`);
    }
};

/**
 * 审批操作成功消息映射
 */
export const APPROVAL_ACTION_SUCCESS_MESSAGE_MAP: Record<ApprovalActionType, string> = {
    approve: '审批已通过',
    reject: '审批已驳回',
    withdraw: '审批单已撤回',
};

/**
 * 获取审批操作成功消息
 */
export const getApprovalActionSuccessMessage = (actionType: ApprovalActionType): string => {
    return APPROVAL_ACTION_SUCCESS_MESSAGE_MAP[actionType] || '操作成功';
};

