import React, { useState } from 'react';
import { Button, Upload, Space } from '@arco-design/web-react';
import { MessageType } from '@/components/global-message';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import { batchCreateApprovals } from '@/api/approval';
import { fetchDepartmentsByName } from '@/api/department';

interface ExcelImportProps {
    onSuccess: () => void;
    showMessage: (type: MessageType, content: string, duration?: number) => void;
}

export default function ExcelImport({ onSuccess, showMessage }: ExcelImportProps) {
    // 批量导入状态
    const [importLoading, setImportLoading] = useState(false);

    // 下载模板
    const downloadTemplate = () => {
        const wb = XLSX.utils.book_new();
        const headers = ['审批项目', '审批内容', '申请部门', '执行日期'];
        const data = ['示例项目名称1', '示例审批内容1', '示例1级部门/示例2级部门/示例3级部门', '2025-12-01'];
        const ws = XLSX.utils.aoa_to_sheet([headers, data]);
        XLSX.utils.book_append_sheet(wb, ws, '审批单模板');
        XLSX.writeFile(wb, '审批单上传模板.xlsx');
    };

    // 处理批量导入
    const handleExcelUpload = (option: any) => {
        const { file, onError, onSuccess: onUploadSuccess } = option;
        const reader = new FileReader();

        setImportLoading(true);
        setImportLoading(true);
        showMessage('loading', '正在解析并导入数据...', 0);

        reader.onload = async (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                if (!json || json.length < 2) {
                    showMessage('error', '表格内容为空');
                    onError?.(new Error('Empty file'));
                    return;
                }

                const headers = json[0] as string[];
                const expectedHeaders = ['审批项目', '审批内容', '申请部门', '执行日期'];
                const isValid = expectedHeaders.every((h, i) => headers[i] === h);

                if (!isValid) {
                    showMessage('error', '模板格式不正确，请下载最新模板');
                    onError?.(new Error('Invalid format'));
                    return;
                }

                const rows = json.slice(1);
                const approvalPromises = rows.map(async (row: any) => {
                    const projectName = row[0];
                    const content = row[1];
                    const departmentName = row[2];
                    let executeDate = row[3];

                    if (typeof executeDate === 'number') {
                        const date = new Date(Math.round((executeDate - 25569) * 86400 * 1000));
                        executeDate = dayjs(date).format('YYYY-MM-DD');
                    } else if (executeDate) {
                        executeDate = dayjs(executeDate).format('YYYY-MM-DD');
                    }

                    try {
                        const res = await fetchDepartmentsByName(departmentName);
                        if (res.code === 200 && res.data) {
                            // @ts-ignore
                            const departmentId = res.data.id;
                            return {
                                projectName,
                                content,
                                departmentId,
                                executeDate,
                                applicantId: 1
                            };
                        }
                    } catch (error) {
                        console.error(`获取部门 ${departmentName} 失败`, error);
                    }
                    return null;
                });

                const approvals = (await Promise.all(approvalPromises)).filter(item => item !== null);

                if (approvals.length === 0) {
                    showMessage('error', '未解析到有效数据，请检查部门名称是否正确');
                    onError?.(new Error('No valid data'));
                    return;
                }

                const res = await batchCreateApprovals(approvals);
                if (res.code === 200) {
                    showMessage('success', res.message || `成功导入 ${approvals.length} 条审批单`);
                    onUploadSuccess?.(file);
                    onSuccess?.();
                } else {
                    throw new Error(res.message || '批量创建失败');
                }
            } catch (err: any) {
                console.error('导入失败:', err);
                showMessage('error', err.message || '导入失败，请检查文件格式');
                onError?.(err as Error);
            } finally {
                setImportLoading(false);
                // closeLoading(); // Removed as showMessage handles loading state via global state, but we might need to explicitly close it if we want to hide it immediately, or just let the next message replace it.
                // Actually, since we use a single global message state, showing 'success' or 'error' will replace 'loading'.
                // If we want to just close it, we might need a closeMessage prop, but usually success/error follows loading.
            }
        };
        reader.readAsBinaryString(file);
    };

    return (
        <Space size={16}>
            <Upload
                accept=".xlsx, .xls"
                showUploadList={false}
                customRequest={handleExcelUpload}
                disabled={importLoading}
            >
                <Button size="large" status="success" loading={importLoading}>
                    批量导入
                </Button>
            </Upload>
            <span
                onClick={downloadTemplate}
                style={{ cursor: 'pointer', fontSize: '12px' }}
            >
                请根据 <span style={{ color: '#165DFF' }}> 表格模板 </span> 格式上传内容
            </span>
        </Space>
    );
}
