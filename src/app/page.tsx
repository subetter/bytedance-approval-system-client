'use client';

import { useState } from 'react';
import { Button, Modal, Space } from '@arco-design/web-react';
import ExcelImport from '@/components/excel-import';
import GlobalMessage, { MessageType } from '@/components/global-message';
import NavigationBar from '@/components/navgation-bar';
import FilterPanel from '@/components/filter-panel';
import ApprovalTable from '@/components/approval-table';
import ApprovalModal from '@/components/approval-modal';
import ApprovalDrawer from '@/components/approval-drawer';
import { UserRole } from '@/types/enum';
import { ApprovalFormQueryParams } from '@/types/api';
import { ApprovalForm } from '@/types/approval';
import { useUserRoleStore, useApprovalStore } from '@/store';
import { approveApproval, rejectApproval, withdrawApproval } from '@/api/approval';
import styles from './page.module.css';

export default function Home() {
  // 使用 Zustand store
  const { currentRole, switchRole } = useUserRoleStore();
  const { setQueryParams, resetQueryParams, fetchApprovalList } = useApprovalStore();

  // 弹窗状态
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedRecord, setSelectedRecord] = useState<ApprovalForm | undefined>();

  // 抽屉状态
  const [drawerVisible, setDrawerVisible] = useState(false);

  // 处理角色切换
  const handleRoleChange = (role: UserRole) => {
    switchRole(role);
    // 切换角色后，重置查询条件（回到第一页）并重新获取列表
    resetQueryParams();
    fetchApprovalList();
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
    console.log('查看审批单详情: ----record------', record);
    setSelectedRecord(record);
    setDrawerVisible(true);
  };

  // 处理修改审批单
  const handleEditApproval = (record: ApprovalForm) => {
    console.log('修改审批单: ----record------', record);
    setModalMode('edit');
    setSelectedRecord(record);
    setModalVisible(true);
  };

  // 关闭抽屉
  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    setSelectedRecord(undefined);
  };

  // 确认弹窗状态
  const [actionRecord, setActionRecord] = useState<ApprovalForm | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'withdraw' | null>(null);

  // 关闭弹窗
  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedRecord(undefined);
  };

  // 弹窗操作成功
  const handleModalSuccess = () => {
    fetchApprovalList();
  };

  // 处理撤回审批单
  const handleWithdraw = async (record: ApprovalForm) => {
    try {
      setActionRecord(record);
      setActionType('withdraw');
      fetchApprovalList();
    } catch (error) {
      console.error('撤回失败:', error);
    }
  };

  // 处理审批通过
  const handleApprove = (record: ApprovalForm) => {
    setActionRecord(record);
    setActionType('approve');
  };

  // 处理审批驳回
  const handleReject = (record: ApprovalForm) => {
    setActionRecord(record);
    setActionType('reject');
  };

  // 执行确认操作
  const handleConfirmAction = async () => {
    if (!actionRecord || !actionType) return;

    try {
      if (actionType === 'approve') {
        console.log('审批通过:', actionRecord.id);
        await approveApproval(actionRecord.id, currentRole);
        showMessage('success', '审批已通过');
      } else if (actionType === 'reject') {
        await rejectApproval(actionRecord.id, currentRole);
        showMessage('success', '审批已驳回');
      } else if (actionType === 'withdraw') {
        await withdrawApproval(actionRecord.id);
        showMessage('success', '审批单已撤回');
      }
      fetchApprovalList();
      handleCloseConfirm();
    } catch (error) {
      console.error('操作失败:', error);
      showMessage('error', '操作失败');
    }
  };

  // 关闭确认弹窗
  const handleCloseConfirm = () => {
    setActionRecord(null);
    setActionType(null);
  };

  // 全局消息状态
  const [messageState, setMessageState] = useState<{
    visible: boolean;
    type: MessageType;
    content: string;
    duration?: number;
  }>({
    visible: false,
    type: 'info',
    content: '',
  });

  const showMessage = (type: MessageType, content: string, duration: number = 3000) => {
    setMessageState({ visible: true, type, content, duration });
  };

  const closeMessage = () => {
    setMessageState(prev => ({ ...prev, visible: false }));
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
          <FilterPanel onSearch={handleSearch} onReset={handleReset} />

          {/* 新建按钮 - 仅申请人可见 */}
          {currentRole === UserRole.APPLICANT && (
            <div className={styles.actionBar}>
              <Space size={16}>
                <Button type="primary" onClick={handleCreate} size="large">
                  新建
                </Button>
                <ExcelImport onSuccess={fetchApprovalList} showMessage={showMessage} />
              </Space>
            </div>
          )}

          <ApprovalTable
            onView={handleViewApproval}
            onEdit={handleEditApproval}
            onApprove={handleApprove}
            onReject={handleReject}
            onWithdraw={handleWithdraw}
          />
        </div>
      </main>

      {/* 审批单弹窗 (新建/编辑) */}
      <ApprovalModal
        visible={modalVisible}
        mode={modalMode}
        record={selectedRecord}
        onClose={handleCloseModal}
        onSuccess={handleModalSuccess}
        showMessage={showMessage}
      />

      {/* 审批单详情抽屉 (查看) */}
      <ApprovalDrawer
        visible={drawerVisible}
        record={selectedRecord}
        onClose={handleCloseDrawer}
      />

      {/* 确认操作弹窗 */}
      <Modal
        title={actionType === 'approve' ? '确认通过' : actionType === 'reject' ? '确认驳回' : '确认撤回'}
        visible={!!actionRecord}
        onOk={handleConfirmAction}
        onCancel={handleCloseConfirm}
        okText="确认"
        cancelText="取消"
      >
        {actionRecord && (
          <p>
            确定要{actionType === 'approve' ? '通过' : actionType === 'reject' ? '驳回' : '撤回'}
            "{actionRecord.projectName}" 的审批申请吗？
          </p>
        )}
      </Modal>
      <GlobalMessage
        visible={messageState.visible}
        type={messageState.type}
        content={messageState.content}
        duration={messageState.duration}
        onClose={closeMessage}
      />
    </div>
  );
}
