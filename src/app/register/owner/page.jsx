// 経営者側の新規登録
"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import styles from "@/styles/approvals.module.css";

import ApprovalsButton from "@/components/atoms/ApprovalsButton";
import ApprovalsInput from "@/components/atoms/ApprovalsInput";
import ConfirmModal from "@/components/atoms/ConfirmModal";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export default function OwnerRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // 入力状態
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleBack = () => {
    router.push("/login/owner");
  };

  // まずモーダルを開く
  const handleSubmit = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  // モーダルOK時の実処理
  const handleConfirm = async () => {
    if (loading) return;

    if (!userId || !password || !name) {
      alert("名前 と ID と パスワードを入力してください。");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/owner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId: userId, password, userName: name }),
      });

      if (!res.ok) {
        const ct = res.headers.get("content-type") || "";
        const msg = ct.includes("application/json")
          ? (await res.json())?.message ?? "登録に失敗しました"
          : await res.text();

        if (
          String(msg).includes("既に存在") ||
          String(msg).includes("すでに")
        ) {
          alert("※このIDはすでに使用されています");
        } else {
          alert(String(msg));
          console.error("register error:", msg);
        }
        return;
      }

      alert("登録が完了しました。");
      router.push("/login/owner");
    } catch (err) {
      console.error("登録エラー:", err);
      alert("登録に失敗しました。");
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  return (
    <>
      <div className={styles.div}>
        <button className={styles.backbutton} onClick={handleBack}>
          ←
        </button>

        <form className={styles.loginForm} onSubmit={handleSubmit}>
          <h2 className={styles.h2}>経営者新規アカウント登録</h2>

          <ApprovalsInput
            type="text"
            name="name"
            id="name"
            text="ユーザー氏名"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <ApprovalsInput
            type="text"
            name="userId"
            id="userId"
            text="ID(半角英数字のみ)"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          />

          <ApprovalsInput
            type="password"
            name="password"
            id="password"
            text="パスワード(半角英数字のみ)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <ApprovalsButton
            type="submit"
            text={loading ? "登録中…" : "登録"}
            disabled={loading}
          />
        </form>
      </div>

      {showModal && (
        <ConfirmModal
          fields={[
            { label: "ユーザ氏名", value: name },
            { label: "ID(半角英数字のみ)", value: userId },
            { label: "パスワード(半角英数字のみ)", value: password },
          ]}
          onConfirm={handleConfirm}
          onCancel={() => setShowModal(false)}
        />
      )}
    </>
  );
}
