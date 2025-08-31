'use client'

import styles from '@/styles/ownerRegister.module.css';
import Cancel from '@mui/icons-material/Cancel';
import { useRef, useState, useEffect } from 'react';

export default function ApprovalsVideo({ name, id, text }) {
  const fileInputRef = useRef(null);

  // 選択されたファイル名
  const [fileName, setFileName] = useState('');
  // プレビュー動画URL（サーバー返却の mp4 URL またはフォールバックの dataURL）
  const [preview, setPreview] = useState(null);

  // ファイル選択ボックスをクリックさせる
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // ファイルが選択された時の処理
  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      resetVideo();
      return;
    }

    setFileName(file.name);

    try {
      // ---- まずはサーバーへアップロード（.mov → .mp4 に変換）----
      const fd = new FormData();
      fd.append('video', file); // /api/upload/video は "video" フィールド名で受け取る実装

      const res = await fetch('/api/upload/video', {
        method: 'POST',
        body: fd,
      });
      const json = await res.json();

      if (!res.ok) {
        // サーバー変換に失敗した場合はフォールバック（FileReader で dataURL プレビュー）
        await fallbackPreview(file);
        return;
      }

      // サーバー側で変換済みの mp4 URL をプレビューに使用（互換性◎）
      setPreview(json.url); // 例: "/video/169..._xxx.mp4"
    } catch (err) {
      // 予期せぬエラー時もフォールバック
      await fallbackPreview(file);
    }
  };

  // フォールバック: FileReader で dataURL プレビュー（ブラウザが再生できない拡張子だとプレビュー不可のことあり）
  const fallbackPreview = async (file) => {
    if (!file || !file.type?.startsWith('video/')) {
      setPreview(null);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result); // base64形式でプレビュー（※互換性は mp4 URLに劣る）
    };
    reader.readAsDataURL(file);
  };

  // 動画のリセット
  const resetVideo = () => {
    setFileName('');
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // input をリセット
    }
  };

  // アンマウント時に後処理（現状は特になし。ObjectURL を使っていないため revoke 不要）
  useEffect(() => {
    return () => {
      // cleanup
    };
  }, []);

  return (
    <div className={styles.imgContent}>
      <div onClick={handleClick} className={styles.fileLabel}>
        {!fileName && '動画ファイルを選択してください'}
      </div>

      <input
        type="file"
        name={name}
        id={id}
        accept="video/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleChange}
      />

      <label htmlFor={id}>{text}</label>

      {preview && (
        <div className={styles.previewContainer}>
          <button type="button"
          className={styles.cancelBtn}
          onClick={(e) => {
            e.preventDefault();  //デフォルトのbutton動作を止める
            e.stopPropagation(); // 動画へのイベント伝播を止める
            resetVideo();        // 動画リセット処理
            }}>
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