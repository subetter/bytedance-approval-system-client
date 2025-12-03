import request from './request';
import { FormSchemaResponse } from '@/types/form';

/**
 * 获取表单配置 Schema
 */
export function fetchFormSchema(key: string = 'basic_approval'): Promise<FormSchemaResponse> {
    return request.get('/form/schema', {
        params: { key }
    });
}
