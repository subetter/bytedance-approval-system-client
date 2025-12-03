import React from 'react';
import { Upload, Message } from '@arco-design/web-react';
import { deleteAttachment } from '@/api/attachment';

interface ImageUploadProps {
    value?: any[];
    onChange?: (fileList: any[], file: any) => void;
    formId?: number;
}

export default function ImageUpload({ value, onChange, formId }: ImageUploadProps) {
    const handleDelete = (file: any) => {
        console.log('触发删除，文件信息:', file);
        // 调用删除的接口
        deleteAttachment(formId!, file.url).then(() => {
            Message.success('删除成功');
        }).catch((err: any) => {
            Message.error('删除失败');
        });
    }
    return (
        <Upload
            fileList={value}
            onChange={(fileList, file) => {
                console.log('上传状态变化:', file.status);
                console.log('当前文件信息:', file);
                console.log('完整文件列表:', fileList);
                onChange?.(fileList, file);
            }}
            multiple
            imagePreview
            limit={3}
            listType="picture-card"
            action="/api/attachments/upload"
            data={{
                formId: formId,
            }}
            onPreview={(file) => {
                Message.info('click preview icon');
            }}
            onExceedLimit={() => {
                Message.warning('最多上传3张图片');
            }}
            onRemove={(file) => handleDelete(file)}
        />
    );
}
