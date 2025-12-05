import React from 'react';
import { Tabs } from '@arco-design/web-react';
import { useApprovalStore } from '@/store';
import styles from './index.module.css';

interface SchemaConfigProps {
    className?: string;
}

const SCHEMA_OPTIONS = [
    { label: '基础审批', value: 'basic_approval' },
    { label: '无时间版本', value: 'no_time_version_approval' },
    { label: '极简审批', value: 'simple_approval' },
];

export default function SchemaConfig({ className }: SchemaConfigProps) {
    const { fetchFormSchema, currentSchemaKey } = useApprovalStore();

    const handleTabChange = async (key: string) => {
        try {
            await fetchFormSchema(key);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className={`${styles.schemaConfigContainer} ${className || ''}`}>
            <Tabs
                activeTab={currentSchemaKey}
                onChange={handleTabChange}
                type="line"
                size="large"
            >
                {SCHEMA_OPTIONS.map(option => (
                    <Tabs.TabPane key={option.value} title={option.label} />
                ))}
            </Tabs>
        </div>
    );
}
