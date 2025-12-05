/**
 * 弹窗模式类型
 */
export type ModalMode = 'create' | 'edit' | 'view';

/**
 * 弹窗标题映射
 */
export const MODAL_TITLE_MAP: Record<ModalMode, string> = {
    create: '新建审批单',
    edit: '审批单修改',
    view: '审批单详情',
};

/**
 * 获取弹窗标题
 */
export const getModalTitle = (mode: ModalMode): string => {
    return MODAL_TITLE_MAP[mode] || '审批单';
};

/**
 * 提交按钮文本映射
 */
export const SUBMIT_BUTTON_TEXT_MAP: Record<ModalMode, string> = {
    create: '提交',
    edit: '保存',
    view: '确定',
};

/**
 * 获取提交按钮文本
 */
export const getSubmitButtonText = (mode: ModalMode): string => {
    return SUBMIT_BUTTON_TEXT_MAP[mode] || '提交';
};

