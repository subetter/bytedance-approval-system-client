import request from './request';


// 删除附件
export function deleteAttachment(id: number, fileUrl: string) {
    return request.post(`/attachments/delete`, {
        formId: id,
        fileUrl
    });
}

