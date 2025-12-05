import React from 'react';
import { TableColumnProps } from '@arco-design/web-react';
import { ApprovalForm } from '@/types/approval';
import { FormField } from '@/types/form';
import dayjs from 'dayjs';
import { getDepartmentPath } from '@/utils/convert';

/**
 * 字段渲染器类型
 */
type FieldRenderer = (
    value: any,
    record: ApprovalForm,
    departmentPathMap: Map<string, string>
) => React.ReactNode;

/**
 * 特殊字段渲染器映射
 */
const FIELD_RENDERER_MAP: Record<string, FieldRenderer> = {
    departmentId: (departmentId: number, record: ApprovalForm, departmentPathMap: Map<string, string>) => {
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
    executeDate: (date: string) => {
        return date ? dayjs(date).format('YYYY-MM-DD') : '--';
    },
    approvalAt: (date: string) => {
        return date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : '--';
    },
    createdAt: (createdAt?: string) => {
        return createdAt ? dayjs(createdAt).format('YYYY-MM-DD HH:mm:ss') : '--';
    },
};

/**
 * 字段配置映射（宽度、省略等）
 */
const FIELD_CONFIG_MAP: Record<string, Partial<TableColumnProps<ApprovalForm>>> = {
    projectName: {
        width: 250,
        ellipsis: true,
    },
    content: {
        width: 300,
        ellipsis: true,
    },
    createdAt: {
        width: 180,
    },
};

/**
 * 生成动态表格列配置
 */
export const generateTableColumn = (
    field: FormField,
    departmentPathMap: Map<string, string>
): TableColumnProps<ApprovalForm> => {
    const col: TableColumnProps<ApprovalForm> = {
        title: field.name,
        dataIndex: field.field as keyof ApprovalForm,
        width: 200,
    };

    // 应用字段配置
    const fieldConfig = FIELD_CONFIG_MAP[field.field];
    if (fieldConfig) {
        Object.assign(col, fieldConfig);
    }

    // 应用字段渲染器
    const renderer = FIELD_RENDERER_MAP[field.field];
    if (renderer) {
        col.render = (value: any, record: ApprovalForm) => {
            return renderer(value, record, departmentPathMap);
        };
    }

    // 特殊处理：创建时间支持排序
    if (field.field === 'createdAt') {
        col.sorter = (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }

    return col;
};

