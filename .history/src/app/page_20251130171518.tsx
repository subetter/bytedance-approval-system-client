
import { useState } from 'react';
import NavigationBar from '@/components/navgation-bar';
import FilterPanel from '@/components/filter-panel';
import { UserRole } from '@/types/enum';
import { ApprovalFormQueryParams } from '@/types/api';
import styles from './page.module.css';

export default function Home() {
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.APPLICANT);

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    console.log('角色切换为:', role === UserRole.APPLICANT ? '申请人' : '审批人');
  };

  // 根据角色显示用户名
  const getUserName = () => {
    return currentRole === UserRole.APPLICANT ? '申请人' : '审批人';
  };

  // 处理查询
  const handleSearch = (params: ApprovalFormQueryParams) => {
    console.log('查询参数:', params);
    // TODO: 调用API查询数据
  };

  // 处理重置
  const handleReset = () => {
    console.log('重置筛选条件');
    // TODO: 重置表格数据
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

