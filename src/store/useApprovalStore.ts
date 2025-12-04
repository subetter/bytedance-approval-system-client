import { create } from 'zustand';
import { ApprovalForm } from '@/types/approval';
import { ApprovalFormQueryParams, PaginationResponse } from '@/types/api';
import { ApprovalStatus } from '@/types/enum';
import { fetchApprovals } from '@/api/approval';
import { fetchDepartments } from '@/api/department';
import { fetchFormSchema as fetchFormSchemaApi } from '@/api/form';
import { transformDepartmentToOptions, CascaderOption, flattenDepartmentOptions } from '@/utils/convert';
import { useUserRoleStore } from './useUserRoleStore';
import { FormField } from '@/types/form';

/**
 * 审批单状态接口
 */
interface ApprovalState {
    // 状态
    approvalList: ApprovalForm[];
    loading: boolean;
    total: number;
    currentPage: number;
    pageSize: number;
    queryParams: Partial<ApprovalFormQueryParams>;
    departmentOptions: CascaderOption[]; // 部门选项数据
    departmentPathMap: Map<string, string>; // 部门路径映射 Map<id, path>
    formSchema: FormField[]; // 表单配置
    currentSchemaKey: string; // 当前表单配置 Key

    // Actions
    setApprovalList: (list: ApprovalForm[]) => void;
    setLoading: (loading: boolean) => void;
    setTotal: (total: number) => void;
    setCurrentPage: (page: number) => void;
    setPageSize: (size: number) => void;
    setQueryParams: (params: Partial<ApprovalFormQueryParams>) => void;
    resetQueryParams: () => void;
    fetchApprovalList: (params?: ApprovalFormQueryParams) => Promise<void>;
    fetchDepartmentOptions: () => Promise<void>; // 获取部门选项
    fetchFormSchema: (key?: string) => Promise<void>; // 获取表单配置
}

/**
 * 审批单状态管理
 */
export const useApprovalStore = create<ApprovalState>((set, get) => ({
    // 初始状态
    approvalList: [],
    loading: false,
    total: 0,
    currentPage: 1,
    pageSize: 10,
    queryParams: {},
    departmentOptions: [],
    departmentPathMap: new Map(),
    formSchema: [],
    currentSchemaKey: 'basic_approval',

    // 设置审批单列表
    setApprovalList: list => {
        set({ approvalList: list });
    },

    // 设置加载状态
    setLoading: loading => {
        set({ loading });
    },

    // 设置总数
    setTotal: total => {
        set({ total });
    },

    // 设置当前页码
    setCurrentPage: page => {
        set({ currentPage: page });
    },

    // 设置每页数量
    setPageSize: size => {
        set({ pageSize: size });
    },

    // 设置查询参数
    setQueryParams: params => {
        set({ queryParams: params });
    },

    // 重置查询参数
    resetQueryParams: () => {
        set({
            queryParams: {},
            currentPage: 1,
        });
    },

    // 获取部门选项数据
    fetchDepartmentOptions: async () => {
        // 如果已经有数据，不再重复请求
        if (get().departmentOptions.length > 0) return;

        try {
            // 请求 format=options，后端会返回包含 path 的树形结构
            const response = await fetchDepartments({ format: 'options' });
            if (response.data) {
                const options = transformDepartmentToOptions(response.data);
                const pathMap = flattenDepartmentOptions(options);
                set({
                    departmentOptions: options,
                    departmentPathMap: pathMap
                });
            }
        } catch (error) {
            console.error('加载部门数据失败:', error);
        }
    },

    // 获取表单配置
    fetchFormSchema: async (key) => {
        const schemaKey = key || get().currentSchemaKey;
        try {
            const res = await fetchFormSchemaApi(schemaKey);
            if (res.code === 200 || res.code === 0) {
                set({
                    formSchema: res.data,
                    currentSchemaKey: schemaKey
                });
            }
        } catch (error) {
            console.error('加载表单配置失败:', error);
            throw error; // Re-throw so UI can handle error
        }
    },

    // 获取审批单列表
    fetchApprovalList: async (params) => {
        set({ loading: true });
        try {
            const { currentPage, pageSize, queryParams } = get();
            const { currentRole } = useUserRoleStore.getState(); // 获取当前角色

            const requestParams: ApprovalFormQueryParams = {
                page: currentPage,
                pageSize: pageSize,
                role: currentRole, // 传递角色参数
                ...queryParams,
                ...params,
            };
            const response = await fetchApprovals(requestParams);
            if (response.data) {
                // 后端返回的数据结构包含 list 和 total
                set({
                    approvalList: response.data.list,
                    total: response.data.total,
                });
            }
        } catch (error) {
            console.error('获取审批列表失败:', error);
        } finally {
            set({ loading: false });
        }
    },
}));
