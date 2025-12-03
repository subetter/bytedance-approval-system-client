import request from './request';
import { Department } from '@/types/department';
import { ApiResponse } from '@/types/api';

/**
 * 获取部门列表（树形结构）
 */
export function fetchDepartments(params?: { format?: string }): Promise<ApiResponse<Department[]>> {
    return request.get('/departments', { params });
}

/**
 * 根据部门名称获取部门
 */
export function fetchDepartmentsByName(name: string): Promise<ApiResponse<Department>> {
    return request.get(`/departments/byname/${encodeURIComponent(name)}`);
}
