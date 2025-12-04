'use client';

import NavigationBar from '@/components/navgation-bar';
import FilterPanel from '@/components/filter-panel';
import { UserRole } from '@/types/enum';
import { ApprovalFormQueryParams } from '@/types/api';
import { useUserRoleStore, useApprovalStore } from '@/store';
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
          {/* 这里将放置表格区 */}
        </div>
      </main>
    </div>
  );
}
