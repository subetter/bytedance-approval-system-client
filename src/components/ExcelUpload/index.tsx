
import React from 'react';
import { Upload, Button, Message, Spin } from '@arco-design/web-react';
import * as XLSX from 'xlsx';
import { batchCreateApprovals } from '@/api/approval';
import { fetchDepartmentsByName } from '@/api/department';
import dayjs from 'dayjs';
import { MessageType } from '@/components/GlobalMessage';

interface ExcelUploadProps {
    formId?: number;
    departmentOptions: any[];
    onSuccess?: () => void;
    showMessage?: (type: MessageType, content: string, duration?: number) => void;
}

export default function ExcelUpload({ formId, departmentOptions, onSuccess, showMessage }: ExcelUploadProps) {
    // 下载模板
    const downloadTemplate = () => {
        const wb = XLSX.utils.book_new();
        const headers = ['审批项目', '审批内容', '申请部门', '执行日期'];
        const data = ['示例项目名称1', '示例审批内容1', '示例1级部门/示例2级部门/示例3级部门', '2025-12-01'];
        const ws = XLSX.utils.aoa_to_sheet([headers, data]);
        XLSX.utils.book_append_sheet(wb, ws, '审批单模板');

        // 直接使用 writeFile，它在浏览器端会自动处理下载
        XLSX.writeFile(wb, '审批单上传模板.xlsx');
    };
    const [loading, setLoading] = React.useState(false);

    const handleExcelUpload = (option: any) => { // 解析excel文件,根据departmentName查找部门id,调用批量创建审批单接口
        const { file, onError, onSuccess: onUploadSuccess } = option;
        const reader = new FileReader();

        setLoading(true);

        reader.onload = async (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                if (!json || json.length < 2) { // 至少要有表头和一行数据
                    showMessage?.('error', '表格内容为空');
                    onError?.(new Error('Empty file'));
                    setLoading(false);
                    return;
                }

                const headers = json[0] as string[];
                const expectedHeaders = ['审批项目', '审批内容', '申请部门', '执行日期'];
                // 简单表头校验
                const isValid = expectedHeaders.every((h, i) => headers[i] === h);

                if (!isValid) {
                    showMessage?.('error', '模板格式不正确，请下载最新模板');
                    onError?.(new Error('Invalid format'));
                    setLoading(false);
                    return;
                }

                // 解析数据行
                const rows = json.slice(1);

                const approvalPromises = rows.map(async (row: any) => {
                    const projectName = row[0];
                    const content = row[1];
                    const departmentName = row[2];
                    let executeDate = row[3];

                    // 处理日期格式 (Excel 日期可能是数字)
                    if (typeof executeDate === 'number') {
                        // Excel date serial number conversion
                        const date = new Date(Math.round((executeDate - 25569) * 86400 * 1000));
                        executeDate = dayjs(date).format('YYYY-MM-DD');
                    } else if (executeDate) {
                        // 尝试直接解析字符串
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
                                applicantId: 1 // 默认申请人
                            };
                        }
                    } catch (error) {
                        console.error(`获取部门 ${departmentName} 失败`, error);
                    }
                    return null;
                });

                const approvals = (await Promise.all(approvalPromises)).filter(item => item !== null);

                if (approvals.length === 0) {
                    Message.error('未解析到有效数据，请检查部门名称是否正确');
                    onError?.(new Error('No valid data'));
                    setLoading(false);
                    return;
                }
                // 调用批量创建接口
                let successMessage = '';
                try {
                    const res = await batchCreateApprovals(approvals);
                    if (res.code === 200) {
                        successMessage = res.message || `成功导入 ${approvals.length} 条审批单`;
                        // 上传组件成功回调
                        onUploadSuccess?.(file);
                        // 关闭弹窗回调
                        onSuccess?.();
                    } else {
                        throw new Error(res.message || '批量创建失败');
                    }
                } catch (error: any) {
                    Message.error(error.message || '批量创建失败');
                    onError?.(error);
                    setLoading(false);
                    return;
                }

                setLoading(false);

                if (successMessage) {
                    Message.success(successMessage);
                }

            } catch (err) {
                Message.error('导入失败，请检查文件格式');
                onError?.(err as Error);
                setLoading(false);
            }
        };
        reader.readAsBinaryString(file);
    };

    return (
        <div>
            <div style={{ marginBottom: 8, fontSize: 12, color: '#86909c' }}>
                请根据 <a onClick={downloadTemplate} style={{ cursor: 'pointer', color: '#165DFF' }}>表格模板</a> 格式上传内容
            </div>
            <Spin loading={loading} tip="正在解析并导入数据..." style={{ display: 'block' }}>
                <Upload
                    accept=".xlsx, .xls"
                    limit={1}
                    customRequest={handleExcelUpload}
                />
            </Spin>
        </div>
    );
}
