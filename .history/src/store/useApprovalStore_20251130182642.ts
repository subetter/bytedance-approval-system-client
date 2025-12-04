import { create } from 'zustand';
import { ApprovalForm } from '@/types/approval';
import { ApprovalFormQueryParams, PaginationResponse } from '@/types/api';
import { ApprovalStatus } from '@/types/enum';
import { fetchApprovals } from '@/api/approval';

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

    // Actions
    setApprovalList: (list: ApprovalForm[]) => void;
    setLoading: (loading: boolean) => void;
    setTotal: (total: number) => void;
    setCurrentPage: (page: number) => void;
    setPageSize: (size: number) => void;
    setQueryParams: (params: Partial<ApprovalFormQueryParams>) => void;
    resetQueryParams: () => void;
    fetchApprovalList: (params?: ApprovalFormQueryParams) => Promise<void>;
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

    // 获取审批单列表
    fetchApprovalList: async params => {
        set({ loading: true });

        try {
            const { currentPage, pageSize, queryParams } = get();

            // 合并参数：优先使用传入的 params，其次是 store 中的 queryParams
            // 同时带上分页参数
            const requestParams: ApprovalFormQueryParams = {
                page: currentPage,
                pageSize: pageSize,
                ...queryParams,
                ...(params || {}),
            };

            console.log('发起API请求，参数:', requestParams);

            const response = await fetchApprovals(requestParams);

            if (response.success && response.data) {
                set({
                    approvalList: response.data.data,
                    total: response.data.total,
                    // 如果后端返回了当前的 page 和 pageSize，也可以更新 store
                    // currentPage: response.data.page,
                    // pageSize: response.data.pageSize,
                });
            } else {
                console.error('API请求失败:', response.message);
                // 可以考虑在这里处理错误提示，或者通过状态暴露错误
            }
        } catch (error) {
            console.error('获取审批单列表失败:', error);
        } finally {
            set({ loading: false });
        }
    },
}));
