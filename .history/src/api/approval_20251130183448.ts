import request from './request';
import { ApprovalForm } from '@/types/approval';
import { ApiResponse, ApprovalFormQueryParams, PaginationResponse } from '@/types/api';

/**
 * 获取审批单列表
 * @param params 查询参数
 */
export function fetchApprovals(
    params: ApprovalFormQueryParams
): Promise<ApiResponse<PaginationResponse<ApprovalForm>>> {
    return request.get('/approvals');
}
