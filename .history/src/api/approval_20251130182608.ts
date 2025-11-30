import { ApprovalForm } from '@/types/approval';
import { ApiResponse, ApprovalFormQueryParams, PaginationResponse } from '@/types/api';

const BASE_URL = 'http://localhost:3001/api';

/**
 * 获取审批单列表
 * @param params 查询参数
 */
export async function fetchApprovals(
    params: ApprovalFormQueryParams
): Promise<ApiResponse<PaginationResponse<ApprovalForm>>> {
    // 构建查询字符串
    const queryString = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            queryString.append(key, String(value));
        }
    });

    try {
        const response = await fetch(`${BASE_URL}/approvals?${queryString.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Fetch approvals failed:', error);
        throw error;
    }
}
