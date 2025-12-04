import React, { useState, useEffect } from 'react';
import {
    Form,
    Select,
    DatePicker,
    Input,
    Button,
    Grid,
    Space,
    Cascader,
} from '@arco-design/web-react';
import { IconDown, IconUp } from '@arco-design/web-react/icon';
import { ApprovalStatus } from '@/types/enum';
import { ApprovalFormQueryParams } from '@/types/api';
import styles from './filter-panel.module.css';
import { useApprovalStore } from '@/store';
import { useUserRoleStore } from '@/store/useUserRoleStore';
import { FormField } from '@/types/form';
import { UserRole } from '@/types/enum';


const { Row, Col } = Grid;
const { RangePicker } = DatePicker;
const FormItem = Form.Item;

interface FilterPanelProps {
    onSearch: (params: ApprovalFormQueryParams) => void;
    onReset: () => void;
}

export default function FilterPanel({ onSearch, onReset }: FilterPanelProps) {
    const [form] = Form.useForm();
    const [collapsed, setCollapsed] = useState(false);

    // 从 Store 获取部门数据和表单配置
    const { departmentOptions, fetchDepartmentOptions, formSchema } = useApprovalStore();
    // 获取当前角色
    const { currentRole } = useUserRoleStore();

    // 获取部门数据
    useEffect(() => {
        fetchDepartmentOptions();
    }, [fetchDepartmentOptions]);

    // 监听角色变化
    useEffect(() => {
        if (currentRole === UserRole.APPROVER) {
            // 如果是审批人，强制设置状态为待审批
            form.setFieldValue('status', ApprovalStatus.PENDING);
        } else {
            // 切换回申请人时，重置为全部（空字符串）
            form.setFieldValue('status', '');
        }
    }, [currentRole, form]);

    // 审批状态选项
    const statusOptions = [
        { label: '全部', value: '' },
        { label: '待审批', value: ApprovalStatus.PENDING },
        { label: '审批通过', value: ApprovalStatus.APPROVED },
        { label: '审批拒绝', value: ApprovalStatus.REJECTED },
    ];

    // 处理查询
    const handleSearch = () => {
        const values = form.getFieldsValue();

        // 构建查询参数
        const queryParams: ApprovalFormQueryParams = {
            page: 1,
            pageSize: 10,
            status: values.status || undefined,
            // 系统固定字段
            // createTimeStart: values.createTimeRange?.[0] || undefined,
            // createTimeEnd: values.createTimeRange?.[1] || undefined,
        };

        // 动态字段映射
        formSchema.forEach(field => {
            const value = values[field.field];
            if (value) {
                if (field.component === 'DepartmentSelect' || field.component === 'Cascader') {
                    // 部门取最后一个ID
                    queryParams.departmentId = Array.isArray(value) ? value[value.length - 1] : value;
                } else if (field.component === 'DateTimePicker' || field.component === 'DatePicker') {
                    // 时间范围
                    // 假设 filter 中命名为 fieldName + 'Range' (e.g. approvalAtRange)
                    // 或者直接用 fieldName 作为 range 数组
                    // 这里我们在 render 时会用 field.field 作为 name，所以 value 就是数组
                    if (Array.isArray(value)) {
                        // 特殊处理：如果是 approvalAt，映射到 api 的 approvalTimeStart/End
                        if (field.field === 'approvalAt') {
                            queryParams.approvalTimeStart = value[0];
                            queryParams.approvalTimeEnd = value[1];
                        } else if (field.field === 'createdAt') {
                            queryParams.createTimeStart = value[0];
                            queryParams.createTimeEnd = value[1];
                        } else if (field.field === 'executeDate') {
                            // 假设后端支持 executeDateStart/End，或者精确匹配
                            // 这里假设是范围搜索
                            // 如果后端没有对应字段，可能需要调整。
                            // 暂时假设后端支持 executeDateStart/End
                            // @ts-ignore
                            queryParams.executeDateStart = value[0];
                            // @ts-ignore
                            queryParams.executeDateEnd = value[1];
                        }
                    }
                } else if (field.component === 'Input' || field.component === 'Textarea') {
                    // 文本搜索
                    // @ts-ignore
                    queryParams[field.field] = value;
                }
            }
        });

        onSearch(queryParams);
    };

    // 处理重置
    const handleReset = () => {
        form.resetFields();
        onReset();
    };

    // 切换折叠状态
    const toggleCollapse = () => {
        setCollapsed(!collapsed);
    };

    return (
        <div className={styles.filterPanel}>
            <div className={styles.filterHeader}>
                <h3 className={styles.filterTitle}>筛选区</h3>
            </div>

            <div className={styles.filterContent}>
                <Form form={form} layout="vertical" autoComplete="off">
                    <Row gutter={20}>
                        {/* 1. 系统固定字段：审批状态 */}
                        <Col span={8}>
                            <FormItem label="审批状态" field="status">
                                <Select
                                    placeholder="请选择状态"
                                    allowClear={currentRole !== UserRole.APPROVER}
                                    disabled={currentRole === UserRole.APPROVER}
                                    options={statusOptions}
                                />
                            </FormItem>
                        </Col>

                        {/* 3. 动态字段 */}
                        {formSchema.map((field, index) => {
                            // 如果折叠，只显示前 2 个动态字段 (加上 status 共 3 个，占一行)
                            // 注意：这里简单的逻辑是，如果 collapsed，index >= 2 的隐藏
                            // 但 status 占了一个位置，所以 dynamic fields 显示 2 个正好填满一行 (1+2=3)
                            // 实际上 Grid 是 24 栅格，span=8 意味着一行 3 个。
                            // status 是第 1 个。
                            // dynamic fields 是第 2, 3, ... 个。
                            // 如果 collapsed，我们希望只显示一行。
                            // 所以 dynamic fields 应该显示 index < 2 的。

                            if (collapsed && index >= 2) return null;

                            let component = null;
                            if (field.component === 'Input' || field.component === 'Textarea') {
                                component = <Input placeholder={`请输入${field.name}`} allowClear onPressEnter={handleSearch} />;
                            } else if (field.component === 'DepartmentSelect' || field.component === 'Cascader') {
                                component = (
                                    <Cascader
                                        placeholder={`请选择${field.name}`}
                                        options={departmentOptions}
                                        showSearch
                                        allowClear
                                        style={{ width: '100%' }}
                                    />
                                );
                            } else if (field.component === 'DateTimePicker') {
                                component = (
                                    <RangePicker
                                        showTime
                                        format="YYYY-MM-DD HH:mm:ss"
                                        style={{ width: '100%' }}
                                        placeholder={['开始时间', '结束时间']}
                                    />
                                );
                            } else if (field.component === 'DatePicker') {
                                component = (
                                    <RangePicker
                                        format="YYYY-MM-DD"
                                        style={{ width: '100%' }}
                                        placeholder={['开始时间', '结束时间']}
                                    />
                                );
                            }

                            // 如果是 content，可能不需要在筛选里显示
                            if (field.field === 'content') return null;

                            return (
                                <Col span={8} key={field.field}>
                                    <FormItem label={field.name} field={field.field}>
                                        {component}
                                    </FormItem>
                                </Col>
                            );
                        })}

                        {/* 占位符，确保按钮在右下角或者跟随在最后 */}
                        {/* 如果不折叠，按钮应该在最后。如果折叠，按钮应该在第一行最后？ 
                            或者按钮单独一行？
                            通常做法是按钮放在最后，如果空间不够会自动换行。
                            为了美观，我们可以让按钮 float right 或者单独一行。
                            这里我们尝试让按钮跟随在最后一个 input 后面。
                        */}
                        <Col span={8} style={{ display: 'flex', marginTop: 'auto', justifyContent: 'flex-end', marginLeft: 'auto' }}>
                            <FormItem label=" ">
                                <Space size="medium">
                                    <Button type="primary" onClick={handleSearch}>
                                        查询
                                    </Button>
                                    <Button onClick={handleReset}>
                                        重置
                                    </Button>
                                    <Button
                                        type="text"
                                        size="small"
                                        onClick={toggleCollapse}
                                        icon={collapsed ? <IconDown /> : <IconUp />}
                                    >
                                        {collapsed ? '展开' : '收起'}
                                    </Button>
                                </Space>
                            </FormItem>
                        </Col>
                    </Row>

                </Form>


            </div>
        </div>
    );
}
