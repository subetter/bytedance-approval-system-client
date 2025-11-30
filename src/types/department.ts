/**
 * 部门/组织结构表 (departments)
 * 用于存储级联选择器所需的树形数据
 */
export interface Department {
  id: number; // 主键ID
  parentId?: number; // 父级部门ID
  name: string; // 部门/团队名称
  level: number; // 部门层级 (1, 2, 3...)
  isActive: boolean; // 是否启用
  createdAt: string; // 创建时间
  children?: Department[]; // 子部门列表（用于树形结构）
}

/**
 * 部门路径（用于级联选择器）
 */
export interface DepartmentPath {
  path: number[]; // 部门ID路径 [一级部门ID, 二级部门ID, 三级团队ID]
  label: string; // 完整路径文本 "A部门-B子部门-C团队"
}
