// ==================== 工具类型 ====================

/**
 * 数据库字段名到前端字段名的映射
 * 用于数据转换
 */
export type DbToFrontendMapping = {
  display_name: 'displayName';
  current_approver_id: 'currentApproverId';
  project_name: 'projectName';
  dept_path: 'deptPath';
  department_id: 'departmentId';
  execute_date: 'executeDate';
  applicant_id: 'applicantId';
  created_at: 'createdAt';
  updated_at: 'updatedAt';
  approval_at: 'approvalAt';
  is_deleted: 'isDeleted';
  form_id: 'formId';
  operator_id: 'operatorId';
  action_time: 'actionTime';
  file_name: 'fileName';
  file_url: 'fileUrl';
  file_type: 'fileType';
  uploader_id: 'uploaderId';
  uploaded_at: 'uploadedAt';
  parent_id: 'parentId';
  is_active: 'isActive';
};

/**
 * 排序配置
 */
export interface SortConfig {
  field: string; // 排序字段
  order: 'asc' | 'desc'; // 排序方向
}

/**
 * 选择项
 */
export interface SelectOption<T = any> {
  label: string; // 显示文本
  value: T; // 选项值
  disabled?: boolean; // 是否禁用
  description?: string; // 描述信息
}
