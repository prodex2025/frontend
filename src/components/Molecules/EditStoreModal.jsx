import React from "react";
import { Dialog } from "@mui/material";

// CSSファイルを適応
import styles from '@/styles/editModal.module.css';

export default function EditStoreModal({ open, onClose, children }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      {/* モーダルの中身 */}
      <div className={styles.modalContent}>
        {/* ×ボタン*/}
        <button onClick={onClose}>
          <span className={`material-symbols-outlined ${styles.closeBtn}`}>close</span>
        </button>
        {children}
      </div>
    </Dialog>
  );
}