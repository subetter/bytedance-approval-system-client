/**
 * 用户角色枚举
 * 对应数据库 ENUM('APPLICANT', 'APPROVER')
 */
export enum UserRole {
    APPLICANT = 'APPLICANT', // 申请人
    APPROVER = 'APPROVER', // 审批员
}

/**
 * 审批状态枚举
 * 对应数据库 ENUM('0', '1', '2')
 */
export enum ApprovalStatus {
    PENDING = '0', // 待审批
    APPROVED = '1', // 审批通过
    REJECTED = '2', // 审批拒绝
}

/**
 * 操作类型枚举
 * 对应数据库 ENUM('CREATE', 'UPDATE', 'WITHDRAW', 'APPROVE', 'REJECT')
 */
export enum ApprovalAction {
    CREATE = 'CREATE', // 创建
    UPDATE = 'UPDATE', // 更新
    WITHDRAW = 'WITHDRAW', // 撤回
    APPROVE = 'APPROVE', // 审批通过
    REJECT = 'REJECT', // 审批拒绝
}

/**
 * 文件类型枚举
 * 对应数据库 ENUM('IMAGE', 'EXCEL', 'OTHER')
 */
export enum FileType {
    IMAGE = 'IMAGE', // 图片
    EXCEL = 'EXCEL', // Excel文件
    OTHER = 'OTHER', // 其他类型
}
