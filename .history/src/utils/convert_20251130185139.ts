/**
 * 将下划线命名转换为驼峰命名
 * @param str 下划线字符串
 * @returns 驼峰字符串
 */
export function snakeToCamelKey(str: string): string {
    return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
}

/**
 * 深度将对象或数组中的所有 Key 从下划线转换为驼峰
 * @param data 输入数据
 * @returns 转换后的数据
 */
export function toCamelCase<T = any>(data: any): T {
    // 如果是数组，递归处理每个元素
    if (Array.isArray(data)) {
        return data.map(item => toCamelCase(item)) as any;
    }

    // 如果是对象且不为 null，处理每个 key
    if (data !== null && typeof data === 'object') {
        const newObj: any = {};
        Object.keys(data).forEach(key => {
            const newKey = snakeToCamelKey(key);
            // 递归处理值
            newObj[newKey] = toCamelCase(data[key]);
        });
        return newObj;
    }

    // 基本类型直接返回
    return data;
}
