'use client';

import React, { useEffect } from 'react';
import {
    Modal,
    Form,
    Input,
    DatePicker,
    Cascader,
    Button,
    Message
} from '@arco-design/web-react';
import { ApprovalForm } from '@/types/approval';
import { useApprovalStore } from '@/store';
import styles from './approval-modal.module.css';

const FormItem = Form.Item;
const TextArea = Input.TextArea;

interface ApprovalModalProps {
    visible: boolean;
    mode: 'create' | 'edit' | 'view';
    record?: ApprovalForm;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function ApprovalModal({
    visible,
    mode,
    record,
    onClose,
    onSuccess
}: ApprovalModalProps) {
    const [form] = Form.useForm();
    const { fetchApprovalList } = useApprovalStore();

    // 部门级联数据（示例数据）
    const departmentOptions = [
        {
            value: 1,
            label: '技术部',
            children: [
                {
                    value: 2,
                    label: '前端研发组',
                    children: [
                        { value: 3, label: 'React开发团队' },
                        { value: 4, label: 'Vue开发团队' },
                    ],
                },
                {
                    value: 5,
                    label: '后端研发组',
                    children: [
                        { value: 6, label: 'Java开发团队' },
                        { value: 7, label: 'Go开发团队' },
                    ],
                },
            ],
        },
        {
            value: 8,
            label: '财务部',
            children: [
                {
                    value: 9,
                    label: '会计组',
                    children: [
                        { value: 10, label: '成本核算团队' },
                    ],
                },
            ],
        },
    ];

    // 获取弹窗标题
    const getTitle = () => {
        switch (mode) {
            case 'create':
                return '新建审批单';
            case 'edit':
                return '审批单修改';
            case 'view':
                return '审批单详情';
            default:
                return '审批单';
        }
    };

    // 是否只读模式
    const isReadOnly = mode === 'view';

    // 初始化表单数据
    useEffect(() => {
        if (visible && record && (mode === 'edit' || mode === 'view')) {
            form.setFieldsValue({
                projectName: record.projectName,
                content: record.content,
                department: [1, 2, record.departmentId], // 示例：假设是三级路径
                executeDate: record.executeDate,
            });
        } else if (visible && mode === 'create') {
            form.resetFields();
        }
    }, [visible, record, mode, form]);

    // 处理提交
    const handleSubmit = async () => {
        try {
            const values = await form.validate();

            if (mode === 'create') {
                // TODO: 调用创建API
                console.log('创建审批单:', values);
                Message.success('审批单创建成功！');
            } else if (mode === 'edit') {
                // TODO: 调用更新API
                console.log('更新审批单:', { id: record?.id, ...values });
                Message.success('审批单修改成功！');
            }

            // 刷新列表
            fetchApprovalList();
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('表单验证失败:', error);
        }
    };

    // 处理取消
    const handleCancel = () => {
        form.resetFields();
        onClose();
    };

    return (
        <Modal
            title={getTitle()}
            visible={visible}
            onCancel={handleCancel}
            footer={
                isReadOnly ? (
                    <Button onClick={handleCancel}>关闭</Button>
                ) : (
                    <>
                        <Button onClick={handleCancel}>取消</Button>
                        <Button type="primary" onClick={handleSubmit}>
                            {mode === 'create' ? '提交' : '保存'}
                        </Button>
                    </>
                )
            }
            className={styles.modal}
            style={{ width: 600 }}
        >
            <Form
                form={form}
                layout="vertical"
                disabled={isReadOnly}
                autoComplete="off"
            >
                <FormItem
                    label="审批项目"
                    field="projectName"
                    rules={[
                        { required: true, message: '请输入审批项目' },
                        { maxLength: 20, message: '审批项目不能超过20个字符' }
                    ]}
                >
                    <Input
                        placeholder="示例项目名称"
                        maxLength={20}
                        showWordLimit
                    />
                </FormItem>

                <FormItem
                    label="审批内容"
                    field="content"
                    rules={[
                        { required: true, message: '请输入审批内容' },
                        { maxLength: 300, message: '审批内容不能超过300个字符' }
                    ]}
                >
                    <TextArea
                        placeholder="这是审批项目对应的具体审批内容，限制300字，长文本会自动换行以保证可读性。"
                        maxLength={300}
                        showWordLimit
                        autoSize={{ minRows: 4, maxRows: 8 }}
                    />
                </FormItem>

                <FormItem
                    label="申请部门"
                    field="department"
                    rules={[
                        { required: true, message: '请选择申请部门' }
                    ]}
                >
                    <Cascader
                        placeholder="A部门 / B子部门 / C团队"
                        options={departmentOptions}
                        showSearch
                        allowClear
                    />
                </FormItem>

                <FormItem
                    label="执行日期"
                    field="executeDate"
                    rules={[
                        { required: true, message: '请选择执行日期' }
                    ]}
                >
                    <DatePicker
                        style={{ width: '100%' }}
                        placeholder="2025-11-18"
                        format="YYYY-MM-DD"
                    />
                </FormItem>
            </Form>
        </Modal>
    );
}
