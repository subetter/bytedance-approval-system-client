import request from './request';
import { ApprovalForm } from '@/types/approval';
import { ApiResponse, ApprovalFormQueryParams, PaginationResponse } from '@/types/api';
import { UserRole } from '@/types/enum';

/**
 * 获取审批单列表
 * @param params 查询参数
 */
export function fetchApprovals(
    params: ApprovalFormQueryParams
): Promise<ApiResponse<PaginationResponse<ApprovalForm>>> {
    return request.get('/approvals', { params });
}

/**
 * 创建审批单 
 */
export function createApproval(data: Partial<ApprovalForm>): Promise<ApiResponse<void>> {
    return request.post('/approvals', data);
}

/**
 * 更新审批单
 */
export function updateApproval(id: number, data: Partial<ApprovalForm>): Promise<ApiResponse<void>> {
    return request.put(`/approvals/${id}`, data);
}

/**
 * 通过审批
 */
export function approveApproval(id: number, role: UserRole): Promise<ApiResponse<void>> {
    return request.post(`/approvals/${id}/approve`, {
        role: role
    });
}

/**
 * 驳回审批
 */
export function rejectApproval(id: number, role: UserRole): Promise<ApiResponse<void>> {
    return request.post(`/approvals/${id}/reject`, {
        role: role
    });
}
