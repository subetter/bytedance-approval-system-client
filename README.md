# Approval System Frontend (审批系统前端)

## 项目简介
这是一个基于 Next.js + React + TypeScript + Arco Design 的审批系统前端项目。系统支持动态表单配置、多角色（申请人/审批人）切换、审批流程管理以及批量导入等功能。

## 技术栈
- **核心框架**: Next.js 14 (App Router), React 18
- **语言**: TypeScript
- **UI 组件库**: Arco Design (字节跳动企业级设计系统)
- **状态管理**: Zustand
- **HTTP 请求**: Axios
- **工具库**: Day.js (日期处理), XLSX (Excel 解析)

## 目录结构
```
src/
├── api/            # API 接口定义 (approval, department, form, etc.)
├── app/            # Next.js App Router 页面
├── components/     # 业务组件 & 公共组件
├── store/          # Zustand 全局状态管理
├── types/          # TypeScript 类型定义
└── utils/          # 工具函数
```

## 组件划分与职责

### 1. 核心业务组件

#### `NavigationBar` (导航栏)
- **位置**: `src/components/navgation-bar`
- **职责**: 
  - 显示系统标题。
  - 展示当前登录用户信息。
  - **角色切换**: 提供申请人 (Applicant) 和审批人 (Approver) 的视图切换功能，触发全局状态更新。

#### `FilterPanel` (筛选面板)
- **位置**: `src/components/filter-panel`
- **职责**: 
  - 提供审批单的查询筛选功能。
  - **动态渲染**: 根据后端返回的 Form Schema 动态生成筛选字段（如时间范围、部门选择、文本输入等）。
  - **交互**: 支持展开/收起高级筛选，响应查询和重置操作。

#### `ApprovalTable` (审批列表)
- **位置**: `src/components/approval-table`
- **职责**: 
  - 展示审批单列表数据。
  - **动态列**: 根据 Form Schema 动态生成表格列。
  - **操作列**: 根据当前角色和审批单状态，动态显示“查看”、“修改”、“撤回”、“通过”、“驳回”按钮。
  - **分页**: 处理分页逻辑。

#### `ApprovalModal` (审批弹窗)
- **位置**: `src/components/approval-modal`
- **职责**: 
  - **新建/编辑**: 提供审批单的创建和修改表单。
  - **动态表单**: 基于 Schema 动态渲染表单项（Input, Textarea, DatePicker, Cascader 等）。
  - **附件上传**: 集成图片上传功能，支持预览和删除。
  - **表单验证**: 根据 Schema 定义的规则进行校验。

#### `ApprovalDrawer` (详情抽屉)
- **位置**: `src/components/approval-drawer`
- **职责**: 
  - 以只读模式展示审批单的详细信息。
  - 展示审批流转记录（如审批时间、操作人）。

#### `ExcelImport` (Excel 导入)
- **位置**: `src/components/excel-import`
- **职责**: 
  - **模板下载**: 生成并下载标准的 Excel 导入模板。
  - **前端解析**: 使用 `xlsx` 库在浏览器端解析上传的 Excel 文件。
  - **数据转换**: 将 Excel 行数据映射为系统可识别的审批单对象，自动处理日期格式和部门名称匹配。
  - **批量提交**: 调用后端接口批量创建审批单。

#### `SchemaConfig` (表单配置)
- **位置**: `src/components/schema-config`
- **职责**: 
  - 允许用户（演示目的）切换不同的表单配置（如：基础版、无时间版、精简版）。
  - 触发全局 Schema 更新，从而改变列表、筛选和弹窗的布局。

### 2. 公共组件

#### `GlobalMessage` (全局消息)
- **位置**: `src/components/global-message`
- **职责**: 
  - 封装全局提示信息（Success, Error, Warning），统一 UI 风格。

## 核心功能流程

### 1. 动态表单渲染流程
1. **获取配置**: 应用初始化或切换 Schema 时，调用 `fetchFormSchema` API。
2. **更新状态**: Schema 数据存入 Zustand `useApprovalStore`。
3. **组件响应**: 
   - `FilterPanel` 根据 Schema 生成查询字段。
   - `ApprovalTable` 根据 Schema 生成表格列。
   - `ApprovalModal` 根据 Schema 生成输入表单项。

### 2. 审批操作流程
- **新建 (申请人)**: 点击“新建” -> 打开 `ApprovalModal` -> 填写动态表单 & 上传附件 -> 提交 -> 刷新列表。
- **审批 (审批人)**: 切换到审批人角色 -> 在列表中点击“通过/驳回” -> 确认操作 -> 调用 API -> 刷新列表。
- **撤回 (申请人)**: 仅在“待审批”状态下可见 -> 点击“撤回” -> 确认 -> 更新状态。

### 3. 批量导入流程
1. 用户点击“批量导入” -> 选择 Excel 文件。
2. `ExcelImport` 组件读取文件二进制数据。
3. 使用 `XLSX.read` 解析 Sheet 数据。
4. 遍历数据行：
   - 校验表头格式。
   - 解析日期（处理 Excel 数字日期格式）。
   - 调用 `fetchDepartmentsByName` 将部门名称转换为 ID。
5. 组装数据列表 -> 调用 `batchCreateApprovals` API。
6. 成功后刷新列表并提示结果。

## 部署说明
本项目支持部署到 GitHub Pages (静态站点)。
- **构建**: `npm run build` (输出到 `out` 目录)
- **部署**: `npm run deploy` (推送到 `gh-pages` 分支)
- **配置**: 
  - `next.config.ts` 配置了 `output: 'export'` 和 `basePath`。
  - `.env.production` 配置了生产环境 API 地址。

## 本地开发
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
# 访问 http://localhost:3000
```
