"use client";

import styles from "@/styles/ownerRegister.module.css";
import Cancel from "@mui/icons-material/Cancel";
import { useRef, useState, useEffect } from "react";

/**
 * Props:
 * - name, id, text, value?: 初期プレビューURL（既存画像URLなど）
 * - onChange?: (file | null) => void  親に選択ファイルを通知
 * - accept?: input accept（既定: 'image/*'）
 * - disabled?: trueで操作不可
 * - maxSizeMB?: ファイル最大サイズ(MB) 既定: 10
 */
export default function ApprovalsImg({
  name,
  id,
  text,
  value,
  onChange,
  accept = "image/*",
  disabled = false,
  maxSizeMB = 10,
}) {
  const fileInputRef = useRef(null);

  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState(null); // string | null (URL)

  // 初期値（URL）からプレビュー
  useEffect(() => {
    if (value) {
      // URL末尾を表示名に
      try {
        const last = value.split("/").pop();
        setFileName(last || value);
      } catch {
        setFileName(value);
      }
      setPreview(value);
    }
  }, [value]);

  // blob URL のクリーンアップ
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const openPicker = () => {
    if (!disabled) fileInputRef.current?.click();
  };

  const handleChange = (e) => {
    const file = e.target.files?.[0] ?? null;

    if (!file) {
      resetImage();
      onChange?.(null);
      return;
    }

    // サイズ制限
    if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
      alert(`ファイルサイズは ${maxSizeMB}MB 以下にしてください`);
      resetImage();
      onChange?.(null);
      return;
    }

    setFileName(file.name);

    // 画像プレビュー
    const url = URL.createObjectURL(file);
    setPreview((prev) => {
      if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return url;
    });

    // 親へ通知
    onChange?.(file);
  };

  const resetImage = () => {
    setFileName("");
    if (preview && preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className={styles.imgContent}>
      <div
        onClick={openPicker}
        className={styles.fileLabel}
        aria-disabled={disabled}
      >
        {fileName || "ファイルを選択してください"}
      </div>

      <input
        type="file"
        name={name}
        id={id}
        accept={accept}
        ref={fileInputRef}
        className="hidden"
        disabled={disabled}
        onChange={handleChange}
      />

      <label htmlFor={id}>{text}</label>

      {preview && (
        <div className={styles.previewContainer}>
          <button
            type="button"
            onClick={() => {
              resetImage();
              onChange?.(null);
            }}
            title="画像をクリア"
          >
            <Cancel />
          </button>
          <img src={preview} alt={text} className={styles.previewImage} />
        </div>
      )}
    </div>
  );
}
