import React, { useState } from 'react';
import { UserRole } from '@/types/enum';
import styles from './navigation-bar.module.css';

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
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const roleText = {
        [UserRole.APPLICANT]: '申请人',
        [UserRole.APPROVER]: '审批人',
    };

    const handleRoleSwitch = (role: UserRole) => {
        if (role !== currentRole && onRoleChange) {
            onRoleChange(role);
        }
        setIsDropdownOpen(false);
    };

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
                    <div
                        className={styles.roleSelector}
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        <span className={styles.roleName}>{userName}</span>
                        <svg
                            className={`${styles.dropdownIcon} ${isDropdownOpen ? styles.open : ''}`}
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M2.5 4.5L6 8L9.5 4.5"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>

                        {/* 下拉菜单 */}
                        {isDropdownOpen && (
                            <div className={styles.dropdown}>
                                <div
                                    className={`${styles.dropdownItem} ${currentRole === UserRole.APPLICANT ? styles.active : ''
                                        }`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRoleSwitch(UserRole.APPLICANT);
                                    }}
                                >
                                    <div className={styles.dropdownItemContent}>
                                        <span className={styles.dropdownItemLabel}>申请人</span>
                                        {currentRole === UserRole.APPLICANT && (
                                            <svg
                                                className={styles.checkIcon}
                                                width="16"
                                                height="16"
                                                viewBox="0 0 16 16"
                                                fill="none"
                                            >
                                                <path
                                                    d="M13.3333 4L6 11.3333L2.66667 8"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                                <div
                                    className={`${styles.dropdownItem} ${currentRole === UserRole.APPROVER ? styles.active : ''
                                        }`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRoleSwitch(UserRole.APPROVER);
                                    }}
                                >
                                    <div className={styles.dropdownItemContent}>
                                        <span className={styles.dropdownItemLabel}>审批人</span>
                                        {currentRole === UserRole.APPROVER && (
                                            <svg
                                                className={styles.checkIcon}
                                                width="16"
                                                height="16"
                                                viewBox="0 0 16 16"
                                                fill="none"
                                            >
                                                <path
                                                    d="M13.3333 4L6 11.3333L2.66667 8"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
