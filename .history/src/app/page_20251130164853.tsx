'use client';

import { useState } from 'react';
import NavigationBar from '@/components/navgation-bar';
import { UserRole } from '@/types/enum';
import styles from './page.module.css';

export default function Home() {
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.APPLICANT);

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    console.log('角色切换为:', role === UserRole.APPLICANT ? '申请人' : '审批人');
  };

  return (
    <div className={styles.page}>
      <NavigationBar
        pageTitle="审批查询页"
        currentRole={currentRole}
        userName="申请人"
        onRoleChange={handleRoleChange}
      />
      <main className={styles.main}>
        <div className={styles.content}>
          {/* 这里将放置筛选区和表格区 */}
        </div>
      </main>
    </div>
  );
}
