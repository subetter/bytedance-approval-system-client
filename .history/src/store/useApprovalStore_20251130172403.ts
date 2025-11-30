import { create } from 'zustand';
import { ApprovalForm } from '@/types/approval';
import { ApprovalFormQueryParams, PaginationResponse } from '@/types/api';
import { ApprovalStatus } from '@/types/enum';

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
    setApprovalList: (list) => {
        set({ approvalList: list });
    },

    // 设置加载状态
    setLoading: (loading) => {
        set({ loading });
    },

    // 设置总数
    setTotal: (total) => {
        set({ total });
    },

    // 设置当前页码
    setCurrentPage: (page) => {
        set({ currentPage: page });
    },

    // 设置每页数量
    setPageSize: (size) => {
        set({ pageSize: size });
    },

    // 设置查询参数
    setQueryParams: (params) => {
        set({ queryParams: params });
    },

    // 重置查询参数
    resetQueryParams: () => {
        set({
            queryParams: {},
            currentPage: 1,
        });
    },

    // 获取审批单列表（模拟API调用）
    fetchApprovalList: async (params) => {
        set({ loading: true });

        try {
            // TODO: 这里后续替换为真实的API调用
            console.log('查询参数:', params || get().queryParams);

            // 模拟API延迟
            await new Promise(resolve => setTimeout(resolve, 500));

            // 模拟数据
            const mockData: ApprovalForm[] = [
                {
                    id: 1,
                    projectName: '2025年度预算申请',
                    content: '申请部门年度预算，用于设备采购和团建活动。',
                    departmentId: 3,
                    executeDate: '2025-12-30',
                    applicantId: 101,
                    currentApproverId: 102,
                    status: ApprovalStatus.PENDING,
                    createdAt: '2025-11-28 09:00:00',
                    updatedAt: '2025-11-28 09:15:00',
                    isDeleted: false,
                },
                {
                    id: 2,
                    projectName: '紧急服务器升级项目',
                    content: '需要紧急升级核心服务器，以应对高并发流量。',
                    departmentId: 3,
                    executeDate: '2025-11-20',
                    applicantId: 101,
                    status: ApprovalStatus.APPROVED,
                    createdAt: '2025-11-18 08:00:00',
                    updatedAt: '2025-11-19 10:30:00',
                    approvalAt: '2025-11-19 10:30:00',
                    isDeleted: false,
                },
            ];

            set({
                approvalList: mockData,
                total: mockData.length,
            });
        } catch (error) {
            console.error('获取审批单列表失败:', error);
        } finally {
            set({ loading: false });
        }
    },
}));
