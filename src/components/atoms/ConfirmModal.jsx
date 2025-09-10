//登録時の確認モーダル用

'use client';
import React from 'react';
import styles from '@/styles/confirmModal.module.css';
import ApprovalsButton from '@/components/atoms/approvalsButton';

// 表示するフィールドの配列を受け取れるようにする
export default function ConfirmModal({ fields, onConfirm, onCancel, title = '登録内容の確認' }) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        {/* 戻るアイコン */}
        <button className={styles.backButton} onClick={onCancel}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>

        <h2 className={styles.modalTitle}>{title}</h2>

        {/* 表示するフィールドをループで出力 */}
        {fields.map((field, index) => (
          <div className={styles.field} key={index}>
            <label>{field.label}</label>
            <p>{field.value}</p>
          </div>
        ))}

        <div className={styles.buttonGroup}>
          <ApprovalsButton
            text="OK"
            type="button"
            onClick={onConfirm}
            className={`${styles.okButton} loginBtn`}
          />
        </div>
      </div>
    </div>
  );
}
