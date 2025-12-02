import React from 'react';
import { Drawer, Descriptions, Divider } from '@arco-design/web-react';
import dayjs from 'dayjs';
import { ApprovalForm, ApprovalStatusText } from '@/types/approval';

interface ApprovalDrawerProps {
    visible: boolean;
    record?: ApprovalForm;
    onClose: () => void;
}

export default function ApprovalDrawer({ visible, record, onClose }: ApprovalDrawerProps) {
    if (!record) return null;

    return (
        <Drawer
            width={600}
            title="审批单详情"
            visible={visible}
            onCancel={onClose}
            footer={null}
        >
            <Descriptions
                colon=":"
                title="基本信息"
                column={1}
                labelStyle={{ width: 100 }}
                data={[
                    { label: '审批项目', value: record.projectName },
                    { label: '申请部门', value: record.departmentPath || record.departmentName || '--' },
                    { label: '执行日期', value: record.executeDate },
                    { label: '申请人', value: record.applicantName || '--' },
                    { label: '创建时间', value: dayjs(record.createdAt).format('YYYY-MM-DD HH:mm:ss') },
                    { label: '审批状态', value: ApprovalStatusText[record.status] },
                ]}
            />
            <Divider />
            <Descriptions
                colon=":"
                title="审批内容"
                column={1}
                labelStyle={{ width: 100 }}
                data={[
                    {
                        label: '内容详情',
                        value: <div style={{ whiteSpace: 'pre-wrap' }}>{record.content}</div>,
                    },
                ]}
            />
        </Drawer>
    );
}
