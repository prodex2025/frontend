'use client'

import styles from '@/styles/ownerRegister.module.css';
import Cancel from '@mui/icons-material/Cancel';
import { useRef, useState, useEffect } from 'react';

export default function ApprovalsImg({ name, id, text, value }) {
  const fileInputRef = useRef(null);

  // 選択されたファイル名
  const [fileName, setFileName] = useState('');
  // プレビュー画像
  const [preview, setPreview] = useState(null);

  // 初期値（value）からファイル名とプレビューを設定
  useEffect(() => {
    if (value) {
      setFileName(value);
      setPreview(value); // value が画像URLの場合
    }
  }, [value]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      resetImage();
      return;
    }

    setFileName(file.name);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const resetImage = () => {
    setFileName('');
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className={styles.imgContent}>
      <div onClick={handleClick} className={styles.fileLabel}>
        {!fileName && 'ファイルを選択してください'}
      </div>

      <input
        type="file"
        name={name}
        id={id}
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleChange}
      />

      <label htmlFor={id}>{text}</label>

      {preview && (
        <div className={styles.previewContainer}>
          <button type="button" onClick={resetImage}><Cancel /></button>
          <img src={preview} alt={text} className={styles.previewImage} />
        </div>
      )}
    </div>
  );
}
