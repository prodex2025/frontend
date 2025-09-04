'use client'

import styles from '@/styles/ownerRegister.module.css';
import Cancel from '@mui/icons-material/Cancel';
import { useRef, useState } from 'react';

export default function ApprovalsVideo({ name, id, text }) {
  const fileInputRef = useRef(null);

  const [fileName, setFileName] = useState('');
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // MP4のみ許可するバリデーション
  const isMp4 = (file) => {
    if (!file) return false;
    // 1) MIMEで判定
    if (file.type === 'video/mp4') return true;
    // 2) 拡張子でダブルチェック（環境によってMIMEが空のことがあるため）
    const ext = file.name?.split('.').pop()?.toLowerCase();
    if (ext === 'mp4') return true;
    return false;
  };

  // ファイル選択 → そのままプレビュー（MP4のみ）
  const handleChange = (e) => {
    const file = e.target.files?.[0];
    setError('');
    setPreview(null);

    if (!file) {
      resetVideo();
      return;
    }

    if (!isMp4(file)) {
      // 許可しない拡張子は即リセット＆エラー表示
      resetVideo();
      setError('MP4形式（.mp4）の動画のみアップロードできます。');
      return;
    }

    setFileName(file.name);
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const resetVideo = () => {
    setFileName('');
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={styles.imgContent}>
      <div onClick={handleClick} className={styles.fileLabel}>
        {!fileName && '動画ファイルを選択してください'}
      </div>

      <input
        type="file"
        name={name}
        id={id}
        accept="video/mp4"               // ← MP4だけを選択ダイアログで表示
        ref={fileInputRef}
        className="hidden"
        onChange={handleChange}
      />

      <label htmlFor={id}>{text}</label>

      {/* エラー表示 */}
      {error && <small style={{ color: 'red', padding: '0 12px' }}>{error}</small>}

      {preview && (
        <div className={styles.previewContainer}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              resetVideo();
            }}
          >
            <Cancel />
          </button>
          <video
            key={preview}
            src={preview}
            className={`${styles.previewImage} ${styles.videoPreview}`}
            controls
          />
        </div>
      )}
    </div>
  );
}