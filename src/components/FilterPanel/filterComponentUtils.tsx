import React from 'react';
import { Input, DatePicker, Cascader } from '@arco-design/web-react';
import { FormField } from '@/types/form';
import { CascaderOption } from '@/utils/convert';

const { RangePicker } = DatePicker;

/**
 * 筛选组件渲染器类型
 */
type FilterComponentRenderer = (field: FormField, departmentOptions?: CascaderOption[], onSearch?: () => void) => React.ReactNode;

/**
 * 筛选组件渲染器映射
 */
const FILTER_COMPONENT_RENDERER_MAP: Record<string, FilterComponentRenderer> = {
    Input: (field, _, onSearch) => (
        <Input
            placeholder={`请输入${field.name}`}
            allowClear
            onPressEnter={onSearch}
        />
    ),
    Textarea: (field, _, onSearch) => (
        <Input
            placeholder={`请输入${field.name}`}
            allowClear
            onPressEnter={onSearch}
        />
    ),
    DepartmentSelect: (field, departmentOptions) => (
        <Cascader
            placeholder={`请选择${field.name}`}
            options={departmentOptions || []}
            showSearch
            allowClear
            style={{ width: '100%' }}
        />
    ),
    Cascader: (field, departmentOptions) => (
        <Cascader
            placeholder={`请选择${field.name}`}
            options={departmentOptions || []}
            showSearch
            allowClear
            style={{ width: '100%' }}
        />
    ),
    DateTimePicker: () => (
        <RangePicker
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            style={{ width: '100%' }}
            placeholder={['开始时间', '结束时间']}
        />
    ),
    DatePicker: () => (
        <RangePicker
            format="YYYY-MM-DD"
            style={{ width: '100%' }}
            placeholder={['开始时间', '结束时间']}
        />
    ),
};

/**
 * 渲染筛选组件
 */
export const renderFilterComponent = (
    field: FormField,
    departmentOptions?: CascaderOption[],
    onSearch?: () => void
): React.ReactNode => {
    const renderer = FILTER_COMPONENT_RENDERER_MAP[field.component];
    return renderer ? renderer(field, departmentOptions, onSearch) : null;
};

