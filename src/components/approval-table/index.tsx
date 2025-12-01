import React, { useEffect } from 'react';
import { Table, Tag, Button, Space, TableColumnProps } from '@arco-design/web-react';
import { IconEye, IconEdit } from '@arco-design/web-react/icon';
import { ApprovalForm } from '@/types/approval';
import { ApprovalStatus } from '@/types/enum';
import { ApprovalStatusText } from '@/types/approval';
import { useApprovalStore } from '@/store';
import styles from './approval-table.module.css';
import { getDepartmentPath } from '@/utils/convert';

interface ApprovalTableProps {
    onView?: (record: ApprovalForm) => void;
    onEdit?: (record: ApprovalForm) => void;
}

export default function ApprovalTable({ onView, onEdit }: ApprovalTableProps) {
    const {
        approvalList,
        loading,
        total,
        currentPage,
        pageSize,
        departmentPathMap,
        setCurrentPage,
        setPageSize,
        fetchApprovalList,
        fetchDepartmentOptions,
    } = useApprovalStore();

    // 组件挂载时加载数据
    useEffect(() => {
        fetchApprovalList();
        fetchDepartmentOptions();
    }, [fetchApprovalList, fetchDepartmentOptions]);

    // 获取审批状态标签颜色
    const getStatusColor = (status: ApprovalStatus) => {
        switch (status) {
            case ApprovalStatus.PENDING:
                return 'orange';
            case ApprovalStatus.APPROVED:
                return 'green';
            case ApprovalStatus.REJECTED:
                return 'red';
            default:
                return 'gray';
        }
    };

    // 处理分页变化
    const handlePageChange = (page: number, pageSize: number) => {
        setCurrentPage(page);
        setPageSize(pageSize);
        fetchApprovalList();
    };

    // 处理查看
    const handleView = (record: ApprovalForm) => {
        console.log('查看审批单record:', record);
        onView?.(record);
    };

    // 处理修改
    const handleEdit = (record: ApprovalForm) => {
        console.log('修改审批单:', record);
        onEdit?.(record);
    };

    // 表格列配置
    const columns: TableColumnProps<ApprovalForm>[] = [
        {
            title: '审批状态',
            dataIndex: 'status',
            width: 120,
            render: (status: ApprovalStatus) => (
                <Tag color={getStatusColor(status)}>{ApprovalStatusText[status]}</Tag>
            ),
        },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
            width: 180,
            sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        },
        {
            title: '审批时间',
            dataIndex: 'approvalAt',
            width: 180,
            render: (approvalAt?: string) => approvalAt || '--',
            sorter: (a, b) => {
                if (!a.approvalAt) return 1;
                if (!b.approvalAt) return -1;
                return new Date(a.approvalAt).getTime() - new Date(b.approvalAt).getTime();
            },
        },
        {
            title: '审批项目',
            dataIndex: 'projectName',
            width: 300,
            ellipsis: true,
            render: (projectName: string, record: ApprovalForm) => (
                <div className={styles.projectCell}>
                    <div className={styles.projectName}>{projectName}</div>
                    <div className={styles.projectContent}>{record.content}</div>
                </div>
            ),
        },
        {
            title: '申请部门',
            dataIndex: 'departmentId',
            width: 200,
            render: (departmentId: number, record: ApprovalForm) => {
                // 1. 优先显示后端直接返回的完整路径
                if (record.departmentPath) {
                    return record.departmentPath;
                }
                // 2. 其次尝试使用 departmentPathMap 查找
                if (departmentPathMap.size > 0 && departmentId) {
                    const path = getDepartmentPath(departmentPathMap, departmentId);
                    if (path) return path;
                }
                // 3. 降级显示后端返回的名称或 '--'
                return record.departmentName || '--';
            },
        },
        {
            title: '操作',
            key: 'operation',
            width: 150,
            fixed: 'right',
            render: (_col, record) => (
                <Space size="small">
                    <Button type="text" size="small" icon={<IconEye />} onClick={() => handleView(record)}>
                        查看
                    </Button>
                    <Button type="text" size="small" icon={<IconEdit />} onClick={() => handleEdit(record)}>
                        修改
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div className={styles.tableContainer}>
            <Table
                columns={columns}
                data={approvalList}
                loading={loading}
                pagination={{
                    total,
                    current: currentPage,
                    pageSize,
                    showTotal: true,
                    showJumper: true,
                    sizeCanChange: true,
                    pageSizeChangeResetCurrent: true,
                    onChange: handlePageChange,
                }}
                rowKey="id"
                stripe
                hover
                className={styles.table}
            />

            {/* 底部说明 */}
            <div className={styles.tableFooter}>
                <span className={styles.footerNote}>
                    说明：审批项目内容支持对审批单编号，本页面审批项目问题为：'--'
                </span>
            </div>
        </div>
    );
}
