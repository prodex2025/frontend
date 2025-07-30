'use client'

import styles from '@/styles/ownerRegister.module.css';

// マテリアルアイコンをインポート
import Cancel from '@mui/icons-material/Cancel';

import { useRef, useState } from 'react';

export default function ApprovalsImg({ name, id, text }) {
  const fileInputRef = useRef(null);
  // 選択されたファイル名を保存する変数
  const [fileName, setFileName] = useState('');
  // プレビュー用の画像を保存
  const [preview, setPreview] = useState(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // ファイルが選ばれたときの処理
  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      resetImage();
      return;
    }

    // ファイル名を保存
    setFileName(file.name);

    // 画像ファイルであれば読み込んでプレビューに表示
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result); // base64文字列
      };
      reader.readAsDataURL(file);
    } else {
      // 画像でなければプレビューしない
      setPreview(null);
    }
  };

  // 選択したファイル・プレビューをすべてリセット
  const resetImage = () => {
    setFileName('');      // ファイル名をクリア
    setPreview(null);     // プレビュー画像も消す
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // inputの中身もリセット
    }
  };

  return (
    <div className={styles.imgContent}>
      <div onClick={handleClick} className={styles.fileLabel}>
        {!fileName && 'ファイルを選択してください'}
      </div>
      <input className="hidden" ref={fileInputRef} type="file" name={name} id={id} accept="image/*" onChange={handleChange}/>
      <label htmlFor={id}>{text}</label>

      {/* 画像プレビュー表示 */}
      {preview && (
        <div className={styles.previewContainer}>
          <button onClick={resetImage}><Cancel/></button>
          <img src={preview} alt={text} className={styles.previewImage} />
        </div>
      )}
    </div>
  );
}
