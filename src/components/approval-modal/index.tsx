'use client';
import dayjs from 'dayjs';

import React, { useEffect } from 'react';
import { Modal, Form, Input, DatePicker, Cascader, Button, Message, Drawer, Descriptions, Divider } from '@arco-design/web-react';
import { ApprovalForm, ApprovalStatusText } from '@/types/approval';
import { useApprovalStore } from '@/store';
import styles from './approval-modal.module.css';
import { getDepartmentIdPath } from '@/utils/convert';
import { createApproval, updateApproval } from '@/api/approval';
import { useUserRoleStore } from '@/store/useUserRoleStore';


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
  onSuccess,
}: ApprovalModalProps) {
  const [form] = Form.useForm();
  const { fetchApprovalList } = useApprovalStore();
  const { currentUser } = useUserRoleStore();

  // 从 Store 获取部门数据
  const { departmentOptions, fetchDepartmentOptions } = useApprovalStore();

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

  // 当弹窗打开时，确保部门选项已加载
  useEffect(() => {
    if (visible) {
      // 如果尚未加载，则请求部门数据
      if (departmentOptions.length === 0) {
        fetchDepartmentOptions();
      }
    }
  }, [visible, departmentOptions, fetchDepartmentOptions]);

  // 初始化表单数据
  useEffect(() => {
    if (visible && record && (mode === 'edit' || mode === 'view')) {
      // 计算部门ID路径
      let departmentPathIds: (number | string)[] = [];
      if (record.departmentId && departmentOptions.length > 0) {
        departmentPathIds = getDepartmentIdPath(departmentOptions, record.departmentId);
      }

      // 如果找不到路径但有 ID，至少放入 ID (虽然 Cascader 可能无法正确显示路径，但至少有值)
      if (departmentPathIds.length === 0 && record.departmentId) {
        departmentPathIds = [record.departmentId];
      }

      form.setFieldsValue({
        projectName: record.projectName,
        content: record.content,
        department: departmentPathIds,
        // Convert string date to dayjs for DatePicker
        executeDate: record.executeDate ? dayjs(record.executeDate) : undefined,
      });
    } else if (visible && mode === 'create') {
      form.resetFields();
    }
  }, [visible, record, mode, form, departmentOptions]);

  // 处理提交
  const handleSubmit = async () => {
    try {
      const values = await form.validate();
      console.log('----values:------', values);

      // 提取部门ID (Cascader 返回的是数组，取最后一个)
      const departmentId = Array.isArray(values.department)
        ? values.department[values.department.length - 1]
        : values.department;

      // 将 DatePicker 返回的 dayjs 对象转换为字符串
      const executeDate = values.executeDate;
      console.log('executeDate: ', executeDate);

      if (mode === 'create') {
        const payload = {
          ...values,
          departmentId,
          executeDate,
          applicantId: currentUser?.id || 1, // 默认使用当前用户ID，如果为空则默认为1
        };
        delete payload.department; // 移除原始的 department 数组字段

        // 创建或编辑前打印 payload，检查 executeDate 是否正确
        console.log('payload to submit:', payload);
        await createApproval(payload);
        // messageApi?.success('审批单创建成功！'); // optional success toast
      } else if (mode === 'edit' && record) {
        console.log('-=============values:==========', values);
        const payload = {
          ...values,
          departmentId,
          executeDate,
        };
        delete payload.department;

        await updateApproval(record.id, payload);

      }

      // 刷新列表
      fetchApprovalList();
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('操作失败:', error);

    }
  };

  // 处理取消
  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  if (mode === 'view' && record) {
    return (
      <Drawer
        width={600}
        title={getTitle()}
        visible={visible}
        onCancel={onClose}
        footer={null}
      >
        <Descriptions
          colon=":"
          title="基本信息"
          column={1}
          labelStyle={{ width: 100 }}
          data={[
            { label: '审批项目', value: record.projectName },
            { label: '申请部门', value: record.departmentPath || record.departmentName || '--' },
            { label: '执行日期', value: record.executeDate },
            { label: '申请人', value: record.applicantName || '--' },
            { label: '创建时间', value: dayjs(record.createdAt).format('YYYY-MM-DD HH:mm:ss') },
            { label: '审批状态', value: ApprovalStatusText[record.status] },
          ]}
        />
        <Divider />
        <Descriptions
          colon=":"
          title="审批内容"
          column={1}
          labelStyle={{ width: 100 }}
          data={[
            {
              label: '内容详情',
              value: <div style={{ whiteSpace: 'pre-wrap' }}>{record.content}</div>,
            },
          ]}
        />
      </Drawer>
    );
  }

  return (
    <Modal
      title={getTitle()}
      visible={visible}
      onCancel={handleCancel}
      footer={
        <>
          <Button onClick={handleCancel}>取消</Button>
          <Button type="primary" onClick={handleSubmit}>
            {mode === 'create' ? '提交' : '保存'}
          </Button>
        </>
      }
      className={styles.modal}
      style={{ width: 600 }}
    >
      <Form form={form} layout="vertical" autoComplete="off">
        <FormItem
          label="审批项目"
          field="projectName"
          rules={[
            { required: true, message: '请输入审批项目' },
            { maxLength: 20, message: '审批项目不能超过20个字符' },
          ]}
        >
          <Input placeholder="示例项目名称" maxLength={20} showWordLimit />
        </FormItem>

        <FormItem
          label="审批内容"
          field="content"
          rules={[
            { required: true, message: '请输入审批内容' },
            { maxLength: 300, message: '审批内容不能超过300个字符' },
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
          rules={[{ required: true, message: '请选择申请部门' }]}
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
          rules={[{ required: true, message: '请选择执行日期' }]}
        >
          <DatePicker style={{ width: '100%' }} placeholder="2025-11-18" format="YYYY-MM-DD" />
        </FormItem>
      </Form>
    </Modal>
  );
}
