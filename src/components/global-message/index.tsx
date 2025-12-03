import React, { useEffect } from 'react';
import { Alert, Spin } from '@arco-design/web-react';
import styles from './style.module.css';

export type MessageType = 'success' | 'error' | 'warning' | 'info' | 'loading';

interface GlobalMessageProps {
    visible: boolean;
    type: MessageType;
    content: string;
    onClose?: () => void;
    duration?: number;
}

export default function GlobalMessage({
    visible,
    type,
    content,
    onClose,
    duration = 3000,
}: GlobalMessageProps) {
    useEffect(() => {
        if (visible && type !== 'loading' && duration > 0) {
            const timer = setTimeout(() => {
                onClose?.();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [visible, type, duration, onClose]);

    if (!visible) return null;

    return (
        <div className={`${styles.messageContainer} ${visible ? styles.visible : ''}`}>
            <div className={styles.content}>
                {type === 'loading' ? (
                    <div style={{
                        padding: '10px 20px',
                        background: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        borderRadius: '4px',
                        border: '1px solid #e5e6eb'
                    }}>
                        <Spin size={16} />
                        <span>{content}</span>
                    </div>
                ) : (
                    <Alert
                        type={type}
                        content={content}
                        showIcon
                        closable
                        onClose={onClose}
                        style={{ minWidth: '300px' }}
                    />
                )}
            </div>
        </div>
    );
}
