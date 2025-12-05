import React from 'react';
import { Upload, Message } from '@arco-design/web-react';
import { deleteAttachment } from '@/api/attachment'; // 假设这是附件删除接口
import { MessageType } from '@/components/GlobalMessage';

interface ImageUploadProps {
    value?: any[];
    onChange?: (fileList: any[]) => void; // 移除 file 参数，只传递 fileList
    formId?: number; // formId 可能为 number (edit) 或 undefined (create)
    showMessage?: (type: MessageType, content: string, duration?: number) => void;
}

// 辅助函数：将 fileList 转换为纯粹的 ID 列表，用于 Form 状态管理
// ⚠️ 注意：这个函数应该在父组件 ApprovalModal 中，用于 normalize 表单值。
// 但为了演示，我们假设 onChange 期待的是 fileList。

export default function ImageUpload({ value, onChange, formId, showMessage }: ImageUploadProps) {

    // 附件上传接口，在新建模式下 formId 为 undefined
    // Koa 后端接口 uploadAttachment 会处理 formId 为 NULL 的情况

    let uploadAction = `/api/attachments/upload`;
    if (formId) {
        uploadAction = `/api/attachments/upload?formId=${formId}`;
    }


    const handleDelete = (file: any) => {
        // 只有当 formId 存在且文件是已完成状态时，才调用后端删除接口
        // 如果是新建模式 (formId 不存在)，则不调用后端删除，只在前端列表移除
        if (formId && file.status === 'done' && file.response?.id) {
            // 使用文件 ID 或其他标识符进行删除，而不是 file.url
            const attachmentId = file.response.id || file.uid;

            deleteAttachment(formId, attachmentId).then(() => {
                showMessage?.('success', '附件记录删除成功');
            }).catch((err: any) => {
                // 如果删除失败，可能需要阻止文件从列表中移除
                showMessage?.('error', '删除附件失败');
                console.error('删除附件失败:', err);
                // 返回 false 阻止 Upload 默认移除行为，让用户重试
                return false;
            });
        }

        // 如果没有 formId (新建模式) 或文件状态不是 done，直接允许前端移除
        return true;
    }

    // 文件大小限制：10MB
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

    // 上传前检查文件大小
    const beforeUpload = (file: File): boolean | Promise<boolean> => {
        if (file.size > MAX_FILE_SIZE) {
            showMessage?.('error', `文件 "${file.name}" 超过10M，请选择较小的文件`);
            return false; // 阻止上传
        }
        return true; // 允许上传
    };

    // Upload 组件的 onChange 处理器
    const handleChange = (fileList: any[], file: any) => {
        // 核心修复：处理上传成功逻辑，更新文件对象的 uid 和 url
        if (file.status === 'done' && file.response?.data) {
            const { id, fileUrl } = file.response.data; // 假设后端返回 { data: { id, fileUrl, ... } }

            // 1. 必须更新当前文件的 uid (用于 onRemove/onChange 的 key) 和 url (用于预览/展示)
            // 确保 file.uid 使用后端返回的 ID，因为它现在是最终的数据库 ID
            file.uid = String(id);
            file.url = fileUrl;

            // 2. 更新 fileList 确保 React 重新渲染
            const updatedFileList = fileList.map(f => (f.uid === file.uid ? file : f));
            onChange?.(updatedFileList);
            return;
        }

        // 处理上传失败
        if (file.status === 'error') {
            Message.error(`${file.name} 上传失败`);
            const filteredList = fileList.filter(f => f.uid !== file.uid);
            onChange?.(filteredList);
            return;
        }

        // Arco Design 的 onChange 签名是 (fileList, file)
        // 我们只向 FormItem 传递 fileList
        onChange?.(fileList);
    };

    return (
        <Upload
            fileList={value}
            onChange={handleChange} // 使用我们定义的处理器
            beforeUpload={beforeUpload} // 上传前检查文件大小
            multiple
            imagePreview
            limit={3}
            listType="picture-card"
            action={uploadAction} // 使用包含可选 formId 的 action URL
            data={{
                // 如果后端需要 formId 在 body 中，也可以在这里传递
                // 但通常推荐在 action URL 中传递 formId
                // formId: formId, // 暂时注释掉，避免重复
            }}
            onPreview={(file) => {
                Message.info('点击了预览图标');
            }}
            onExceedLimit={() => {
                Message.warning('最多上传3张图片');
            }}
            onRemove={(file) => handleDelete(file)} // 使用修改后的删除处理器
        />
    );
}