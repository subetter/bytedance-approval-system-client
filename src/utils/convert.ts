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

/**
 * 级联选择器选项类型
 */
export interface CascaderOption {
    value: number | string;
    label: string;
    path?: string; // 完整路径
    children?: CascaderOption[];
}

/**
 * 将部门树转换为 Cascader 选项格式
 * (如果后端直接返回 options 格式，此函数可能只需要做简单的透传或类型转换)
 */
export function transformDepartmentToOptions(departments: any[]): CascaderOption[] {
    if (!departments || !Array.isArray(departments)) {
        return [];
    }

    return departments.map(dept => {
        const option: CascaderOption = {
            value: dept.value || dept.id, // 兼容后端返回的 value 或 id
            label: dept.label || dept.name, // 兼容后端返回的 label 或 name
            path: dept.path,
        };

        if (dept.children && dept.children.length > 0) {
            option.children = transformDepartmentToOptions(dept.children);
        }

        return option;
    });
}

/**
 * 扁平化部门选项，用于通过 ID 快速查找 Path
 * @param options 部门选项树
 * @returns Map<value, path>
 */
export function flattenDepartmentOptions(options: CascaderOption[]): Map<string, string> {
    const map = new Map<string, string>();

    const traverse = (nodes: CascaderOption[]) => {
        for (const node of nodes) {
            if (node.path) {
                map.set(String(node.value), node.path);
            }
            if (node.children) {
                traverse(node.children);
            }
        }
    };

    traverse(options);
    return map;
}

/**
 * 根据部门ID查找完整路径 (使用扁平化 Map 优化性能)
 * @param departmentMap 扁平化的部门 Map
 * @param targetId 目标部门ID
 * @returns 部门路径字符串
 */
export function getDepartmentPath(departmentMap: Map<string, string>, targetId: number | string): string {
    return departmentMap.get(String(targetId)) || '';
}

/**
 * 根据部门ID在选项树中查找完整的ID路径数组
 * @param options 部门选项树
 * @param targetId 目标部门ID
 * @returns ID路径数组 (e.g. [1, 2, 3])
 */
export function getDepartmentIdPath(options: CascaderOption[], targetId: number | string): (number | string)[] {
    for (const option of options) {
        if (String(option.value) === String(targetId)) {
            return [option.value];
        }
        if (option.children && option.children.length > 0) {
            const childPath = getDepartmentIdPath(option.children, targetId);
            if (childPath.length > 0) {
                return [option.value, ...childPath];
            }
        }
    }
    return [];
}
