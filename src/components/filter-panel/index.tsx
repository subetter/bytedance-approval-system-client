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

    // 从 Store 获取部门数据
    const { departmentOptions, fetchDepartmentOptions } = useApprovalStore();
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
            projectName: values.keyword || undefined, // 搜索框字段名仍为 keyword，但映射到 projectName
            departmentId: values.department?.[values.department.length - 1] || undefined, // 取最后一级部门ID

            // 创建时间
            createTimeStart: values.createTimeRange?.[0] || undefined,
            createTimeEnd: values.createTimeRange?.[1] || undefined,

            // 审批时间
            approvalTimeStart: values.approvalTimeRange?.[0] || undefined,
            approvalTimeEnd: values.approvalTimeRange?.[1] || undefined,
        };

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
                        {/* 审批状态 */}
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

                        {/* 创建时间 */}
                        <Col span={8}>
                            <FormItem
                                label={
                                    <span>
                                        创建时间
                                        <span className={styles.labelHint}> (开始/结束，含时间)</span>
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
                        </Col>

                        {/* 审批时间 */}
                        <Col span={8}>
                            <FormItem
                                label={
                                    <span>
                                        审批时间
                                        <span className={styles.labelHint}> (开始/结束，含时间)</span>
                                    </span>
                                }
                                field="approvalTimeRange"
                            >
                                <RangePicker
                                    showTime
                                    format="YYYY-MM-DD HH:mm:ss"
                                    style={{ width: '100%' }}
                                    placeholder={['开始时间', '结束时间']}
                                />
                            </FormItem>
                        </Col>
                    </Row>

                    {!collapsed && (
                        <Row gutter={20}>
                            {/* 审批项目 */}
                            <Col span={8}>
                                <FormItem
                                    label={
                                        <span>
                                            审批项目
                                            <span className={styles.labelHint}> (支持模糊搜索)</span>
                                        </span>
                                    }
                                    field="keyword"
                                >
                                    <Input
                                        placeholder="请输入审批项目关键字"
                                        allowClear
                                        onPressEnter={handleSearch}
                                    />
                                </FormItem>
                            </Col>

                            {/* 申请部门 */}
                            <Col span={8}>
                                <FormItem
                                    label={
                                        <span>
                                            申请部门
                                            <span className={styles.labelHint}> (三级联动)</span>
                                        </span>
                                    }
                                    field="department"
                                >
                                    <Cascader
                                        placeholder="请选择部门"
                                        options={departmentOptions}
                                        showSearch
                                        allowClear
                                        style={{ width: '100%' }}
                                    />
                                </FormItem>
                            </Col>

                            {/* 操作按钮 */}
                            <Col span={8}>
                                <div className={styles.buttonWrapper}>
                                    <Space size="medium">
                                        <Button type="primary" onClick={handleSearch} style={{ width: '120px' }}>
                                            查询
                                        </Button>
                                        <Button onClick={handleReset} style={{ width: '120px' }}>
                                            清空已选
                                        </Button>
                                    </Space>
                                </div>
                            </Col>
                        </Row>
                    )}
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
