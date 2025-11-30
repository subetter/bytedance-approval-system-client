import React, { useState } from 'react';
import { ApprovalStatus } from '@/types/enum';
import { ApprovalFormQueryParams } from '@/types/api';
import styles from './filter-panel.module.css';

interface FilterPanelProps {
    onSearch: (params: ApprovalFormQueryParams) => void;
    onReset: () => void;
}

export default function FilterPanel({ onSearch, onReset }: FilterPanelProps) {
    const [filters, setFilters] = useState<Partial<ApprovalFormQueryParams>>({
        status: undefined,
        startDate: '',
        endDate: '',
        keyword: '',
        departmentId: undefined,
    });

    // 审批状态选项
    const statusOptions = [
        { label: '全部', value: '' },
        { label: '待审批', value: ApprovalStatus.PENDING },
        { label: '审批通过', value: ApprovalStatus.APPROVED },
        { label: '审批拒绝', value: ApprovalStatus.REJECTED },
    ];

    // 处理字段变化
    const handleFieldChange = (field: keyof ApprovalFormQueryParams, value: any) => {
        setFilters(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    // 处理查询
    const handleSearch = () => {
        // 构建查询参数
        const queryParams: ApprovalFormQueryParams = {
            page: 1,
            pageSize: 10,
            ...filters,
            status: filters.status || undefined,
        };
        onSearch(queryParams);
    };

    // 处理重置
    const handleReset = () => {
        setFilters({
            status: undefined,
            startDate: '',
            endDate: '',
            keyword: '',
            departmentId: undefined,
        });
        onReset();
    };

    // 格式化日期时间为 YYYY-MM-DD HH:mm:ss
    const formatDateTime = (dateTimeLocal: string) => {
        if (!dateTimeLocal) return '';
        return dateTimeLocal.replace('T', ' ') + ':00';
    };

    // 将 YYYY-MM-DD HH:mm:ss 转换为 datetime-local 格式
    const toDateTimeLocal = (dateTimeStr: string) => {
        if (!dateTimeStr) return '';
        return dateTimeStr.substring(0, 16);
    };

    return (
        <div className={styles.filterPanel}>
            <div className={styles.filterHeader}>
                <h3 className={styles.filterTitle}>筛选区</h3>
            </div>

            <div className={styles.filterContent}>
                {/* 第一行：审批状态 */}
                <div className={styles.filterRow}>
                    <div className={styles.filterItem}>
                        <label className={styles.filterLabel}>审批状态</label>
                        <select
                            className={styles.filterSelect}
                            value={filters.status || ''}
                            onChange={(e) => handleFieldChange('status', e.target.value as ApprovalStatus)}
                        >
                            {statusOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 创建时间范围 */}
                    <div className={styles.filterItem}>
                        <label className={styles.filterLabel}>
                            创建时间 <span className={styles.labelHint}>(开始/结束，含时间)</span>
                        </label>
                        <div className={styles.dateRangeGroup}>
                            <input
                                type="datetime-local"
                                className={styles.filterDateInput}
                                value={toDateTimeLocal(filters.startDate || '')}
                                onChange={(e) => handleFieldChange('startDate', formatDateTime(e.target.value))}
                            />
                            <span className={styles.dateSeparator}>~</span>
                            <input
                                type="datetime-local"
                                className={styles.filterDateInput}
                                value={toDateTimeLocal(filters.endDate || '')}
                                onChange={(e) => handleFieldChange('endDate', formatDateTime(e.target.value))}
                            />
                        </div>
                    </div>

                    {/* 审批时间范围 */}
                    <div className={styles.filterItem}>
                        <label className={styles.filterLabel}>
                            审批时间 <span className={styles.labelHint}>(开始/结束，含时间)</span>
                        </label>
                        <div className={styles.dateRangeGroup}>
                            <input
                                type="datetime-local"
                                className={styles.filterDateInput}
                                placeholder="--"
                            />
                            <span className={styles.dateSeparator}>~</span>
                            <input
                                type="datetime-local"
                                className={styles.filterDateInput}
                                placeholder="--"
                            />
                        </div>
                    </div>
                </div>

                {/* 第二行：审批项目和申请部门 */}
                <div className={styles.filterRow}>
                    <div className={styles.filterItem}>
                        <label className={styles.filterLabel}>
                            审批项目 <span className={styles.labelHint}>(支持模糊搜索)</span>
                        </label>
                        <input
                            type="text"
                            className={styles.filterInput}
                            placeholder="请输入审批项目关键字"
                            value={filters.keyword || ''}
                            onChange={(e) => handleFieldChange('keyword', e.target.value)}
                        />
                    </div>

                    <div className={styles.filterItem}>
                        <label className={styles.filterLabel}>
                            申请部门 <span className={styles.labelHint}>(三级联动)</span>
                        </label>
                        <input
                            type="text"
                            className={styles.filterInput}
                            placeholder="A 部门 / B 子部门 / C 团队"
                        />
                    </div>

                    {/* 操作按钮 */}
                    <div className={styles.filterActions}>
                        <button
                            className={styles.searchButton}
                            onClick={handleSearch}
                        >
                            查询
                        </button>
                        <button
                            className={styles.resetButton}
                            onClick={handleReset}
                        >
                            清空已选
                        </button>
                    </div>
                </div>

                {/* 收起按钮 */}
                <div className={styles.collapseRow}>
                    <button className={styles.collapseButton}>
                        收起 ^
                    </button>
                </div>
            </div>
        </div>
    );
}
