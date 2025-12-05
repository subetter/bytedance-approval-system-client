'use client';
import dayjs from 'dayjs';

import React, { useEffect } from 'react';
import { Modal, Form, Input, DatePicker, Cascader, Button } from '@arco-design/web-react';
import { MessageType } from '@/components/GlobalMessage';
import { ApprovalForm } from '@/types/approval';
import { useApprovalStore } from '@/store';
import styles from './index.module.css';
import { getDepartmentIdPath } from '@/utils/convert';
import { createApproval, updateApproval } from '@/api/approval';
import { useUserRoleStore } from '@/store/useUserRoleStore';
import { FormField } from '@/types/form';

import ImageUpload from './ImageUpload';


const FormItem = Form.Item;
const TextArea = Input.TextArea;

interface ApprovalModalProps {
  visible: boolean;
  mode: 'create' | 'edit' | 'view';
  record?: ApprovalForm;
  onClose: () => void;
  onSuccess?: () => void;
  showMessage?: (type: MessageType, content: string, duration?: number) => void;
}

// 辅助函数：从上传组件的 fileList 中提取附件 ID 列表
const extractAttachmentIds = (fileList: any[] = []): (number | string)[] => {
  // 假设 fileList 可能是 AntD/Arco Upload 的文件对象数组
  return fileList
    .filter(file => file.status === 'done' || file.status === 'ready') // 只处理已完成或准备好的文件
    .map(file => {
      // 新上传的文件ID来自 response，已存在的文件ID来自 uid
      // 确保这里的 ID 是数字或字符串，与数据库 BIGINT 兼容
      return file.response?.data?.id || file.uid;
    })
    .filter(id => id); // 过滤掉无效的 ID
};


export default function ApprovalModal({
  visible,
  mode,
  record,
  onClose,
  onSuccess,
  showMessage,
}: ApprovalModalProps) {
  const [form] = Form.useForm();
  const { fetchApprovalList } = useApprovalStore();
  const { currentUser } = useUserRoleStore();

  // 从 Store 获取部门数据
  const { departmentOptions, fetchDepartmentOptions, formSchema } = useApprovalStore();

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

      // 附件初始化：将附件 ID 列表转换为 Upload 组件所需的结构
      // 注意：ImageUpload 组件通常使用 fileList 属性，而不是直接使用 images
      const imageFileList = record.attachments?.map((att: any) => ({
        uid: String(att.id),
        name: att.fileName || att.file_name,
        url: att.fileUrl || att.file_url,
        status: 'done', // Mark as uploaded
      })) || [];

      form.setFieldsValue({
        projectName: record.projectName,
        content: record.content,
        departmentId: departmentPathIds, // Schema uses departmentId
        // Convert string date to dayjs for DatePicker
        executeDate: record.executeDate ? dayjs(record.executeDate) : undefined,
        approvalAt: record.approvalAt ? dayjs(record.approvalAt) : undefined,
        // 初始化 images 字段，使用 Upload 组件所需的 fileList 结构
        images: imageFileList,
      });
    } else if (visible && mode === 'create') {
      form.resetFields();
      // 确保 images 字段被重置
      form.setFieldValue('images', []);
    }
  }, [visible, record, mode, form, departmentOptions]);

  // 处理提交
  const handleSubmit = async () => {
    try {
      const values = await form.validate();

      // 提取部门ID (Cascader 返回的是数组，取最后一个)
      const departmentIdVal = values.departmentId;
      const departmentId = Array.isArray(departmentIdVal)
        ? departmentIdVal[departmentIdVal.length - 1]
        : departmentIdVal;

      // 将 DatePicker 返回的 dayjs 对象转换为字符串
      const executeDate = values.executeDate ? dayjs(values.executeDate).format('YYYY-MM-DD') : undefined;
      const approvalAt = values.approvalAt ? dayjs(values.approvalAt).format('YYYY-MM-DD HH:mm:ss') : undefined;

      // 核心修改：从 Upload 组件返回的 fileList 中提取附件 ID 列表
      const attachmentIds = extractAttachmentIds(values.images);

      if (mode === 'create') {
        const payload = {
          ...values,
          departmentId,
          executeDate,
          approvalAt,
          applicantId: currentUser?.id || 1,
          attachmentIds: attachmentIds, // 使用提取出的 ID 列表
        };

        await createApproval(payload);
        showMessage?.('success', '审批单创建成功！');
      } else if (mode === 'edit' && record) {
        const payload = {
          ...values,
          departmentId,
          executeDate,
          approvalAt,
          attachmentIds: attachmentIds, // 使用提取出的 ID 列表
        };

        await updateApproval(record.id, payload);
        showMessage?.('success', '审批单修改成功！');
      }

      // 刷新列表
      fetchApprovalList();
      onSuccess?.();
      onClose();
    } catch (error) {
      showMessage?.('error', '操作失败');
    }
  };

  const renderFormItem = (field: FormField) => {
    const { field: fieldName, name, component, validator } = field;
    const rules = [];
    if (validator?.required) {
      rules.push({ required: true, message: `请输入${name}` });
    }
    if (validator?.maxCount) {
      rules.push({ maxLength: validator.maxCount, message: `${name}不能超过${validator.maxCount}个字符` });
    }

    // 特殊处理图片附件，不使用动态渲染，而使用下面的硬编码 FormItem
    if (fieldName === 'images' || fieldName === 'imageAttachments') {
      return null;
    }

    let formComponent;
    switch (component) {
      case 'Input':
        formComponent = <Input placeholder={`请输入${name}`} maxLength={validator?.maxCount} showWordLimit={!!validator?.maxCount} />;
        break;
      case 'Textarea':
        formComponent = (
          <TextArea
            placeholder={`请输入${name}`}
            maxLength={validator?.maxCount}
            showWordLimit={!!validator?.maxCount}
            autoSize={{ minRows: 4, maxRows: 8 }}
          />
        );
        break;
      case 'DepartmentSelect':
      case 'Cascader':
        formComponent = (
          <Cascader
            placeholder="请选择部门"
            options={departmentOptions}
            showSearch
            allowClear
          />
        );
        break;
      case 'DateTimePicker':
        formComponent = <DatePicker style={{ width: '100%' }} placeholder="请选择日期时间" showTime format="YYYY-MM-DD HH:mm:ss" />;
        break;
      case 'DatePicker':
        formComponent = <DatePicker style={{ width: '100%' }} placeholder="请选择日期" format="YYYY-MM-DD" />;
        break;
      default:
        formComponent = <Input />;
    }

    return (
      <FormItem
        key={fieldName}
        label={name}
        field={fieldName}
        rules={rules}
      >
        {formComponent}
      </FormItem>
    );
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
        {formSchema.length > 0 ? (
          // 过滤掉 images，因为我们单独处理
          formSchema.filter(field => field.field !== 'approvalAt' && field.field !== 'imageAttachments').map(renderFormItem)
        ) : (
          // Fallback or loading state if schema is not loaded yet
          <div style={{ textAlign: 'center', padding: 20 }}>加载表单配置中...</div>
        )}

        <FormItem
          label={
            <span >
              图片附件
              <span className={styles.labelHint}>
                （单文件不超过10M，最多上传3张）
              </span>
            </span>
          }
          field="images" // 字段名改为 images
        >

          {/* 附件上传组件 */}
          <ImageUpload formId={record?.id} />


        </FormItem>


      </Form>
    </Modal>
  );
}