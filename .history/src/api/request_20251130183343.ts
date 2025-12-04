import axios from 'axios';
import { Message } from '@arco-design/web-react';

// 创建 axios 实例
const request = axios.create({
    baseURL: 'http://localhost:3001/api',
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
        const res = response.data;
        console.log('res:', res);
        // 如果后端返回的 code 不是 200，则判断为错误
        // 注意：这里假设后端返回格式为 { code: 200, data: ..., message: ... }
        // 如果后端直接返回数据，这里需要调整
        if (res.code && res.code !== 200) {
            Message.error(res.message || 'Error');
            return Promise.reject(new Error(res.message || 'Error'));
        }
        return res;
    },
    error => {
        console.error('Request Error:', error);
        Message.error(error.message || 'Request Error');
        return Promise.reject(error);
    }
);

export default request;
