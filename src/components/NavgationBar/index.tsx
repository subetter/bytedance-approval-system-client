import { Dropdown, Menu, Tag } from '@arco-design/web-react';
import { IconDown, IconCheck } from '@arco-design/web-react/icon';
import { UserRole } from '@/types/enum';
import styles from './index.module.css';

const MenuItem = Menu.Item;

interface NavigationBarProps {
  pageTitle: string;
  currentRole: UserRole;
  userName: string;
  onRoleChange?: (role: UserRole) => void;
}

export default function NavigationBar({
  pageTitle,
  currentRole,
  userName,
  onRoleChange,
}: NavigationBarProps) {
  const roleText = {
    [UserRole.APPLICANT]: '申请人',
    [UserRole.APPROVER]: '审批人',
  };

  // 处理角色切换
  const handleRoleSwitch = (role: UserRole) => {
    if (role !== currentRole && onRoleChange) {
      onRoleChange(role);
    }
  };

  // 下拉菜单内容
  const dropdownMenu = (
    <Menu onClickMenuItem={key => handleRoleSwitch(key as UserRole)} style={{ minWidth: 160 }}>
      <MenuItem key={UserRole.APPLICANT}>
        <div className={styles.menuItemContent}>
          <span>申请人</span>
          {currentRole === UserRole.APPLICANT && <IconCheck className={styles.checkIcon} />}
        </div>
      </MenuItem>
      <MenuItem key={UserRole.APPROVER}>
        <div className={styles.menuItemContent}>
          <span>审批人</span>
          {currentRole === UserRole.APPROVER && <IconCheck className={styles.checkIcon} />}
        </div>
      </MenuItem>
    </Menu>
  );

  return (
    <nav className={styles.navigationBar}>
      {/* 左侧：页面标题 */}
      <div className={styles.leftSection}>
        <h1 className={styles.pageTitle}>{pageTitle}</h1>
      </div>

      {/* 右侧：角色信息 */}
      <div className={styles.rightSection}>
        <div className={styles.roleContainer}>
          <span className={styles.roleLabel}>角色</span>
          <Dropdown droplist={dropdownMenu} trigger="click" position="br">
            <div className={styles.roleSelector}>
              <Tag color="arcoblue" className={styles.roleTag}>
                {roleText[currentRole]}
              </Tag>
              <span className={styles.roleName}>{userName}</span>
              <IconDown className={styles.dropdownIcon} />
            </div>
          </Dropdown>
        </div>
      </div>
    </nav>
  );
}
