'use client';

import { useState } from 'react';
import { Button } from '@arco-design/web-react';
import NavigationBar from '@/components/navgation-bar';
import FilterPanel from '@/components/filter-panel';
import ApprovalTable from '@/components/approval-table';
import ApprovalModal from '@/components/approval-modal';
import { UserRole } from '@/types/enum';
import { ApprovalFormQueryParams } from '@/types/api';
import { ApprovalForm } from '@/types/approval';
import { useUserRoleStore, useApprovalStore } from '@/store';
import styles from './page.module.css';

export default function Home() {
  // 使用 Zustand store
  const { currentRole, switchRole } = useUserRoleStore();
  const { setQueryParams, resetQueryParams, fetchApprovalList } = useApprovalStore();

  // 弹窗状态
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedRecord, setSelectedRecord] = useState<ApprovalForm | undefined>();

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

  // 处理新建审批单
  const handleCreate = () => {
    setModalMode('create');
    setSelectedRecord(undefined);
    setModalVisible(true);
  };

  // 处理查看审批单
  const handleViewApproval = (record: ApprovalForm) => {
    console.log('查看审批单详情:', record);
    setModalMode('view');
    setSelectedRecord(record);
    setModalVisible(true);
  };

  // 处理修改审批单
  const handleEditApproval = (record: ApprovalForm) => {
    console.log('修改审批单:', record);
    setModalMode('edit');
    setSelectedRecord(record);
    setModalVisible(true);
  };

  // 关闭弹窗
  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedRecord(undefined);
  };

  // 弹窗操作成功
  const handleModalSuccess = () => {
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

          {/* 新建按钮 */}
          <div className={styles.actionBar}>
            <Button
              type="primary"
              onClick={handleCreate}
              size="large"
            >
              新建
            </Button>
          </div>

          <ApprovalTable
            onView={handleViewApproval}
            onEdit={handleEditApproval}
          />
        </div>
      </main>

      {/* 审批单弹窗 */}
      <ApprovalModal
        visible={modalVisible}
        mode={modalMode}
        record={selectedRecord}
        onClose={handleCloseModal}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
