import React, { useEffect } from 'react';
import { Table, Tag, Button, Space, TableColumnProps } from '@arco-design/web-react';
import { IconEye, IconEdit } from '@arco-design/web-react/icon';
import { ApprovalForm } from '@/types/approval';
import { ApprovalStatus } from '@/types/enum';
import { ApprovalStatusText } from '@/types/approval';
import { useApprovalStore } from '@/store';
import styles from './index.module.css';
import { useUserRoleStore } from '@/store/useUserRoleStore';
import { UserRole } from '@/types/enum';
import { IconCheck, IconClose } from '@arco-design/web-react/icon';
import { getStatusColor } from '../../utils/approvalUtils';
import { generateTableColumn } from './utils';

interface ApprovalTableProps {
    onView?: (record: ApprovalForm) => void;
    onEdit?: (record: ApprovalForm) => void;
    onApprove?: (record: ApprovalForm) => void;
    onReject?: (record: ApprovalForm) => void;
    onWithdraw?: (record: ApprovalForm) => void;
}

export default function ApprovalTable({ onView, onEdit, onApprove, onReject, onWithdraw }: ApprovalTableProps) {
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
        formSchema,
        fetchFormSchema,
    } = useApprovalStore();
    const { currentRole } = useUserRoleStore();

    // 组件挂载时加载数据
    useEffect(() => {
        fetchApprovalList();
        fetchDepartmentOptions();
        if (formSchema.length === 0) {
            fetchFormSchema().catch(console.error);
        }
    }, [fetchApprovalList, fetchDepartmentOptions, fetchFormSchema]);


    // 处理分页变化
    const handlePageChange = (page: number, pageSize: number) => {
        setCurrentPage(page);
        setPageSize(pageSize);
        fetchApprovalList();
    };

    // 处理查看
    const handleView = (record: ApprovalForm) => {
        onView?.(record);
    };

    // 处理修改 
    const handleEdit = (record: ApprovalForm) => {
        onEdit?.(record);
    };

    // 处理通过
    const handleApprove = (record: ApprovalForm) => {
        onApprove?.(record);
    };

    // 处理驳回
    const handleReject = (record: ApprovalForm) => {
        onReject?.(record);
    };

    // 动态生成表格列配置
    const getDynamicColumns = (): TableColumnProps<ApprovalForm>[] => {
        // 1. 系统固定列 (左侧)
        const leftFixedColumns: TableColumnProps<ApprovalForm>[] = [
            {
                title: '审批状态',
                dataIndex: 'status',
                width: 120,
                render: (status: ApprovalStatus) => (
                    <Tag color={getStatusColor(status)}>{ApprovalStatusText[status]}</Tag>
                ),
            },
        ];

        // 2. 动态列 (中间)
        const dynamicColumns: TableColumnProps<ApprovalForm>[] = formSchema.map(field => {
            const col = generateTableColumn(field, departmentPathMap);

            // 特殊处理：项目名称需要自定义渲染
            if (field.field === 'projectName') {
                col.render = (projectName: string) => (
                    <div className={styles.projectCell}>
                        <div className={styles.projectName}>{projectName}</div>
                    </div>
                );
            }

            return col;
        });

        // 3. 系统固定列 (右侧)
        const rightFixedColumns: TableColumnProps<ApprovalForm>[] = [
            {
                title: '操作',
                key: 'operation',
                width: 280,
                fixed: 'right',
                render: (_col, record) => (
                    <Space size="small">
                        <Button type="text" size="small" icon={<IconEye />} onClick={() => handleView(record)}>
                            查看
                        </Button>

                        {/* 申请人视角：修改按钮 (仅待审批状态可修改) */}
                        {currentRole === UserRole.APPLICANT && (
                            <Button
                                type="text"
                                size="small"
                                icon={<IconEdit />}
                                onClick={() => handleEdit(record)}
                                disabled={record.status !== ApprovalStatus.PENDING}
                            >
                                修改
                            </Button>
                        )}

                        {/* 申请人视角：撤回按钮 (仅待审批状态可撤回) */}
                        {currentRole === UserRole.APPLICANT && onWithdraw && (
                            <Button
                                type="text"
                                status="danger"
                                size="small"
                                onClick={() => onWithdraw(record)}
                                disabled={record.status !== ApprovalStatus.PENDING}
                            >
                                撤回
                            </Button>
                        )}

                        {/* 审批人视角：通过/驳回按钮 (仅待审批状态可操作) */}
                        {currentRole === UserRole.APPROVER && (
                            <Button
                                type="text"
                                status="success"
                                size="small"
                                icon={<IconCheck />}
                                onClick={() => handleApprove(record)}
                                disabled={record.status !== ApprovalStatus.PENDING}
                            >
                                通过
                            </Button>
                        )}
                        {currentRole === UserRole.APPROVER && onReject && (
                            <Button
                                type="text"
                                status="danger"
                                size="small"
                                icon={<IconClose />}
                                onClick={() => handleReject(record)}
                                disabled={record.status !== ApprovalStatus.PENDING}
                            >
                                驳回
                            </Button>
                        )}

                    </Space>
                ),
            },
        ];

        return [...leftFixedColumns, ...dynamicColumns, ...rightFixedColumns];
    };

    const columns = getDynamicColumns();

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
