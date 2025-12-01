import request from './request';
import { Department } from '@/types/department';
import { ApiResponse } from '@/types/api';

/**
 * 获取部门列表（树形结构）
 */
export function fetchDepartments(params?: { format?: string }): Promise<ApiResponse<Department[]>> {
    return request.get('/departments', { params });
}
