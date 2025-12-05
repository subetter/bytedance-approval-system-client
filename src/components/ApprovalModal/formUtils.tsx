import React from 'react';
import { Input, DatePicker, Cascader } from '@arco-design/web-react';
import { FormField } from '@/types/form';
import { CascaderOption } from '@/utils/convert';

const { TextArea } = Input;

/**
 * 表单组件类型
 */
export type FormComponentType = 'Input' | 'Textarea' | 'DepartmentSelect' | 'Cascader' | 'DateTimePicker' | 'DatePicker';

/**
 * 表单组件渲染器类型
 */
type FormComponentRenderer = (field: FormField, departmentOptions?: CascaderOption[]) => React.ReactNode;

/**
 * 表单组件渲染器映射
 */
const FORM_COMPONENT_RENDERER_MAP: Record<FormComponentType, FormComponentRenderer> = {
    Input: (field) => (
        <Input
            placeholder={`请输入${field.name}`}
            maxLength={field.validator?.maxCount}
            showWordLimit={!!field.validator?.maxCount}
        />
    ),
    Textarea: (field) => (
        <TextArea
            placeholder={`请输入${field.name}`}
            maxLength={field.validator?.maxCount}
            showWordLimit={!!field.validator?.maxCount}
            autoSize={{ minRows: 4, maxRows: 8 }}
        />
    ),
    DepartmentSelect: (field, departmentOptions) => (
        <Cascader
            placeholder="请选择部门"
            options={departmentOptions || []}
            showSearch
            allowClear
        />
    ),
    Cascader: (field, departmentOptions) => (
        <Cascader
            placeholder="请选择部门"
            options={departmentOptions || []}
            showSearch
            allowClear
        />
    ),
    DateTimePicker: () => (
        <DatePicker
            style={{ width: '100%' }}
            placeholder="请选择日期时间"
            showTime
            format="YYYY-MM-DD HH:mm:ss"
        />
    ),
    DatePicker: () => (
        <DatePicker
            style={{ width: '100%' }}
            placeholder="请选择日期"
            format="YYYY-MM-DD"
        />
    ),
};

/**
 * 渲染表单组件
 */
export const renderFormComponent = (
    field: FormField,
    departmentOptions?: CascaderOption[]
): React.ReactNode => {
    const renderer = FORM_COMPONENT_RENDERER_MAP[field.component as FormComponentType];
    return renderer ? renderer(field, departmentOptions) : <Input />;
};

/**
 * 生成表单验证规则
 */
export const generateFormRules = (field: FormField) => {
    const rules: Array<{ required?: boolean; message?: string; maxLength?: number }> = [];

    if (field.validator?.required) {
        rules.push({ required: true, message: `请输入${field.name}` });
    }

    if (field.validator?.maxCount) {
        rules.push({
            maxLength: field.validator.maxCount,
            message: `${field.name}不能超过${field.validator.maxCount}个字符`,
        });
    }

    return rules;
};

