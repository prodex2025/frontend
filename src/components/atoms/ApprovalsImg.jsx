'use client';

import styles from "@/styles/ownerRegister.module.css";
import Cancel from "@mui/icons-material/Cancel";
import { useRef, useState, useEffect } from "react";

/**
 * Props:
 * - name, id, text, value?: 初期プレビューURL（既存画像URLなど）
 * - onChange?: (file | null | string) => void
 * - accept?: input accept（既定: 'image/*'）
 * - disabled?: trueで操作不可
 * - maxSizeMB?: ファイル最大サイズ(MB) 既定: 10
 * - showPickerBar?: ファイル名の表示/クリック用バーを出す（既定: true）
 *   → false にすると「画像だけ」表示（画像クリックでファイル選択）
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
  showPickerBar = true,
}) {
  const fileInputRef = useRef(null);

  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState(null); // string | null (URL)

  // URLから見やすいファイル名に整形（クエリ/ハッシュ除去 & デコード）
  const getDisplayName = (url) => {
    try {
      const last = url.split("/").pop() || url;
      return decodeURIComponent(last.split("?")[0].split("#")[0]);
    } catch {
      return url;
    }
  };

  // 初期値（URL）からプレビュー
  useEffect(() => {
    if (value) {
      setFileName(getDisplayName(String(value)));
      setPreview(String(value));
    } else {
      setFileName("");
      setPreview(null);
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

    // 親へ通知（Fileを渡す想定）
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
      {/* クリック用のバー（署名URLの文字が見えるのがイヤなら非表示に） */}
      {showPickerBar && !preview && (
      <div
        onClick={openPicker}
        className={styles.fileLabel}
        aria-disabled={disabled}
        title="クリックして画像を選択"
      >
        ファイルを選択してください
      </div>
    )}

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
        <div
          className={styles.previewContainer}
          onClick={!showPickerBar ? openPicker : undefined} // 画像だけ表示モードでも画像クリックで選択可
          title={!showPickerBar ? "クリックして画像を変更" : undefined}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
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
