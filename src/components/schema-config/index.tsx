import React, { useState } from 'react';
import { Modal, Select, Message } from '@arco-design/web-react';
import { useApprovalStore } from '@/store';

interface SchemaConfigProps {
    className?: string;
}

const SCHEMA_OPTIONS = [
    { label: '基础审批 (Basic Approval)', value: 'basic_approval' },
    { label: '无时间版本 (No Time Version)', value: 'no_time_version_approval' },
    { label: '极简审批 (Simple Approval)', value: 'simple_approval' },
];

export default function SchemaConfig({ className }: SchemaConfigProps) {
    const { fetchFormSchema, currentSchemaKey } = useApprovalStore();

    const handleChange = async (value: string) => {
        try {
            await fetchFormSchema(value);
            Message.success('表单配置已更新');
        } catch (error) {
            console.error(error);
            Message.error('更新失败');
        }
    };

    return (
        <div className={className} style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: 8, whiteSpace: 'nowrap' }}>表单配置:</span>
            <Select
                value={currentSchemaKey}
                onChange={handleChange}
                placeholder="请选择配置 Key"
                options={SCHEMA_OPTIONS}
                style={{ width: 240 }}
            />
        </div>
    );
}
