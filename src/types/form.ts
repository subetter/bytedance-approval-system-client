export interface FormValidator {
    required?: boolean;
    maxCount?: number;
    pattern?: string;
    message?: string;
}

export interface FormField {
    field: string;
    name: string;
    component: 'Input' | 'Textarea' | 'DepartmentSelect' | 'DateTimePicker' | 'Cascader' | 'DatePicker';
    validator?: FormValidator;
    props?: Record<string, any>;
}

export interface FormSchemaResponse {
    code: number;
    msg: string;
    data: FormField[];
}
