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

        // 兼容旧的 keyword (projectName) 如果 schema 里有 projectName，上面已经处理了
        // 如果 schema 没有 projectName，这里可能需要保留？
        // 现在的 schema 有 projectName。

        console.log('查询参数:', queryParams);
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

                        {/* 2. 系统固定字段：创建时间 - 已移除，改为动态配置 */}
                        {/* <Col span={8}>
                            <FormItem
                                label={
                                    <span>
                                        创建时间
                                        <span className={styles.labelHint}> (开始/结束)</span>
                                    </span>
                                }
                                field="createTimeRange"
                            >
                                <RangePicker
                                    showTime
                                    format="YYYY-MM-DD HH:mm:ss"
                                    style={{ width: '100%' }}
                                    placeholder={['开始时间', '结束时间']}
                                />
                            </FormItem>
                        </Col> */}

                        {/* 3. 动态字段 */}
                        {formSchema.map(field => {
                            // 审批时间已经在 schema 中 (approvalAt)，这里不需要单独硬编码
                            // 但为了保持顺序或者特殊处理，我们可以检查

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
                            } else if (field.component === 'DateTimePicker' || field.component === 'DatePicker') {
                                component = (
                                    <RangePicker
                                        showTime
                                        format="YYYY-MM-DD HH:mm:ss"
                                        style={{ width: '100%' }}
                                        placeholder={['开始时间', '结束时间']}
                                    />
                                );
                            }

                            // 如果是 content，可能不需要在筛选里显示，或者显示为 Input
                            if (field.field === 'content') return null;

                            return (
                                <Col span={8} key={field.field}>
                                    <FormItem label={field.name} field={field.field}>
                                        {component}
                                    </FormItem>
                                </Col>
                            );
                        })}

                        {/* 操作按钮 */}
                        <Col span={8}>
                            <div className={styles.buttonWrapper} style={{ marginTop: 29 }}>
                                <Space size="medium">
                                    <Button type="primary" onClick={handleSearch} style={{ width: '100px' }}>
                                        查询
                                    </Button>
                                    <Button onClick={handleReset} style={{ width: '100px' }}>
                                        重置
                                    </Button>
                                </Space>
                            </div>
                        </Col>
                    </Row>
                </Form>

                {/* 收起/展开按钮 */}
                <div className={styles.collapseRow}>
                    <Button
                        type="text"
                        size="small"
                        onClick={toggleCollapse}
                        icon={collapsed ? <IconDown /> : <IconUp />}
                        iconOnly={false}
                    >
                        {collapsed ? '展开' : '收起'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
