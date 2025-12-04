'use client';

import NavigationBar from '@/components/navgation-bar';
import FilterPanel from '@/components/filter-panel';
import ApprovalTable from '@/components/approval-table';
import { UserRole } from '@/types/enum';
import { ApprovalFormQueryParams } from '@/types/api';
import { ApprovalForm } from '@/types/approval';
import { useUserRoleStore, useApprovalStore } from '@/store';
import { Message } from '@arco-design/web-react';
import styles from './page.module.css';

export default function Home() {
  // 使用 Zustand store
  const { currentRole, switchRole } = useUserRoleStore();
  const { setQueryParams, resetQueryParams, fetchApprovalList } = useApprovalStore();

  // 处理角色切换
  const handleRoleChange = (role: UserRole) => {
    switchRole(role);
  };

  // 根据角色显示用户名
  const getUserName = () => {
    return currentRole === UserRole.APPLICANT ? '申请人' : '审批人';
  };

  // 处理查询
  const handleSearch = (params: ApprovalFormQueryParams) => {
    console.log('查询参数:', params);
    setQueryParams(params);
    fetchApprovalList(params);
  };

  // 处理重置
  const handleReset = () => {
    console.log('重置筛选条件');
    resetQueryParams();
    fetchApprovalList();
  };

  // 处理查看审批单
  const handleViewApproval = (record: ApprovalForm) => {
    console.log('查看审批单详情:', record);
    // TODO: 打开审批单详情弹窗或跳转到详情页
  };

  // 处理删除审批单
  const handleDeleteApproval = (record: ApprovalForm) => {
    console.log('删除审批单:', record);
    // TODO: 调用删除API
  };

  return (
    <div className={styles.page}>
      <NavigationBar
        pageTitle="审批查询页"
        currentRole={currentRole}
        userName={getUserName()}
        onRoleChange={handleRoleChange}
      />
      <main className={styles.main}>
        <div className={styles.content}>
          <FilterPanel
            onSearch={handleSearch}
            onReset={handleReset}
          />
          <ApprovalTable
            onView={handleViewApproval}
            onDelete={handleDeleteApproval}
          />
        </div>
      </main>
    </div>
  );
}
