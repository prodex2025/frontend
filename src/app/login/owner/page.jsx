"use client";

// 経営者のログイン画面
// CSSファイルの読み込み
import styles from "@/styles/approvals.module.css";

// コンポーネント読み込み
import ApprovalsButton from "@/components/atoms/ApprovalsButton";
import ApprovalsInput from "@/components/atoms/ApprovalsInput";

import { useRouter } from "next/navigation";
import { useState } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export default function LoginPage() {
  // ページ遷移用のフック
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // 入力値を状態管理
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  //ログインボタンを押したときの処理
  const login = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      if (!userId || !password) {
        alert("ID と パスワードを入力してください。");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // バックエンドの期待に合わせてキー名は loginId / password
        body: JSON.stringify({ loginId: userId, password }),
      });

      if (!response.ok) {
        // レスポンスの形式が JSON/テキスト どちらでも拾えるようにする
        const contentType = response.headers.get("content-type") || "";
        const msg = contentType.includes("application/json")
          ? (await response.json())?.message ?? "ログインに失敗しました"
          : await response.text();

        if (String(msg).includes("ログイン失敗")) {
          alert("※ユーザー名またはパスワードが間違っています");
        } else {
          alert(String(msg));
        }
        setLoading(false);
        return;
      }
      const result = await response.json();
      const accessToken = result.accessToken;
      const refreshToken = result.refreshToken;

      if (accessToken) localStorage.setItem("accessToken", accessToken);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

      // 成功後に遷移
      router.push("/owner/stores");
    } catch (err) {
      console.error(err);
      alert("ログインに失敗しました。もう一度お試しください。");
      setLoading(false);
    }
  };

  return (
    <div className={styles.div}>
      <form className={styles.loginForm} onSubmit={login}>
        <h2 className={styles.h2}>ログイン</h2>

        {/* ユーザーID */}
        <ApprovalsInput
          type="text"
          name="userId"
          id="userId"
          text="ID"
          onChange={(e) => setUserId(e.target.value)}
        />

        {/* password */}
        <ApprovalsInput
          type="password"
          name="password"
          id="password"
          text="パスワード"
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* ログインボタン */}
        <ApprovalsButton
          type="submit"
          text={loading ? "ログイン中..." : "ログイン"}
          disabled={loading}
        />
      </form>

      <p>アカウントが未登録ですか？</p>
      <a href={"/register/owner"}>アカウント作成</a>
    </div>
  );
}
