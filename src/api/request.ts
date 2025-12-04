import axios from 'axios';
import { toCamelCase } from '@/utils/convert';

// 创建 axios 实例
const request = axios.create({
    baseURL: '/api', // 使用相对路径，触发 Next.js 代理
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 请求拦截器
request.interceptors.request.use(
    config => {
        // 在这里可以添加 token 等通用请求头
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// 响应拦截器
request.interceptors.response.use(
    response => {
        // 先获取原始数据
        const rawData = response.data;

        // 自动转换为驼峰命名
        const res = toCamelCase(rawData);

        // 如果后端返回的 code 不是 200，则判断为错误
        // 注意：这里假设后端返回格式为 { code: 200, data: ..., message: ... }
        if (res.code && res.code !== 200) {
            console.error(res.message || 'Error');
            return Promise.reject(new Error(res.message || 'Error'));
        }
        return res;
    },
    error => {
        console.error(error.message || 'Request Error');
        return Promise.reject(error);
    }
);

export default request;
