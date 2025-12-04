import { create } from 'zustand';
import { UserRole } from '@/types/enum';
import { User } from '@/types/user';

/**
 * 用户角色状态接口
 */
interface UserRoleState {
    // 状态
    currentRole: UserRole;
    currentUser: User | null;

    // Actions
    setCurrentRole: (role: UserRole) => void;
    setCurrentUser: (user: User | null) => void;
    switchRole: (role: UserRole) => void;
}

/**
 * 用户角色状态管理
 */
export const useUserRoleStore = create<UserRoleState>(set => ({
    // 初始状态
    currentRole: UserRole.APPLICANT,
    currentUser: null,

    // 设置当前角色
    setCurrentRole: role => {
        set({ currentRole: role });
    },

    // 设置当前用户
    setCurrentUser: user => {
        set({ currentUser: user });
    },

    // 切换角色（带日志）
    switchRole: role => {
        set({ currentRole: role });
    },
}));
