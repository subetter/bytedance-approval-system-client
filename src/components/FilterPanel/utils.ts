import { FormField } from '@/types/form';
import { ApprovalFormQueryParams } from '@/types/api';

/**
 * 字段值处理器类型
 */
type FieldValueProcessor = (
    value: any,
    field: FormField,
    queryParams: ApprovalFormQueryParams
) => void;

/**
 * 字段值处理器映射
 */
const FIELD_VALUE_PROCESSOR_MAP: Record<string, FieldValueProcessor> = {
    // 部门选择器处理
    DepartmentSelect: (value, field, queryParams) => {
        if (value) {
            queryParams.departmentId = Array.isArray(value) ? value[value.length - 1] : value;
        }
    },
    Cascader: (value, field, queryParams) => {
        if (value) {
            queryParams.departmentId = Array.isArray(value) ? value[value.length - 1] : value;
        }
    },
    // 日期时间选择器处理
    DateTimePicker: (value, field, queryParams) => {
        if (Array.isArray(value) && value.length === 2) {
            processDateRangeField(field.field, value, queryParams);
        }
    },
    DatePicker: (value, field, queryParams) => {
        if (Array.isArray(value) && value.length === 2) {
            processDateRangeField(field.field, value, queryParams);
        }
    },
    // 文本输入处理
    Input: (value, field, queryParams) => {
        if (value) {
            (queryParams as any)[field.field] = value;
        }
    },
    Textarea: (value, field, queryParams) => {
        if (value) {
            (queryParams as any)[field.field] = value;
        }
    },
};

/**
 * 日期范围字段映射
 */
const DATE_RANGE_FIELD_MAP: Record<string, { start: string; end: string }> = {
    approvalAt: { start: 'approvalTimeStart', end: 'approvalTimeEnd' },
    createdAt: { start: 'createTimeStart', end: 'createTimeEnd' },
    executeDate: { start: 'executeDateStart', end: 'executeDateEnd' },
};

/**
 * 处理日期范围字段
 */
const processDateRangeField = (
    fieldName: string,
    value: any[],
    queryParams: ApprovalFormQueryParams
) => {
    const mapping = DATE_RANGE_FIELD_MAP[fieldName];
    if (mapping) {
        (queryParams as any)[mapping.start] = value[0];
        (queryParams as any)[mapping.end] = value[1];
    }
};

/**
 * 处理表单字段值，构建查询参数
 */
export const processFormFieldValue = (
    field: FormField,
    value: any,
    queryParams: ApprovalFormQueryParams
): void => {
    if (!value) return;

    const processor = FIELD_VALUE_PROCESSOR_MAP[field.component];
    if (processor) {
        processor(value, field, queryParams);
    }
};

