'use client';

import styles from '@/styles/approvals.module.css';
import ApprovalsButton from '@/components/atoms/ApprovalsButton';
import ApprovalsInput from '@/components/atoms/ApprovalsInput';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      const form = new FormData(e.currentTarget);
      // ApprovalsInput に渡している name をそのまま使う
      const userId = String(form.get('userId') ?? '');
      const password = String(form.get('password') ?? '');

      if (!userId || !password) {
        alert('ID と パスワードを入力してください。');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // バックエンドの期待に合わせてキー名は loginId / password
        body: JSON.stringify({ loginId: userId, password }),
      });

      if (!response.ok) {
        // レスポンスの形式が JSON/テキスト どちらでも拾えるようにする
        const contentType = response.headers.get('content-type') || '';
        const msg = contentType.includes('application/json')
          ? (await response.json())?.message ?? 'ログインに失敗しました'
          : await response.text();

        if (String(msg).includes('ログイン失敗')) {
          alert('※ユーザー名またはパスワードが間違っています');
        } else {
          alert(String(msg));
        }
        setLoading(false);
        return;
      }

      const result = await response.json();
      const accessToken = result.accessToken;
      const refreshToken = result.refreshToken;

      if (accessToken) localStorage.setItem('accessToken', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

      // 成功後に遷移
      router.push('/store/list');
    } catch (err) {
      console.error(err);
      alert('ログインに失敗しました。もう一度お試しください。');
      setLoading(false);
    }
  };

  return (
    <div className={styles.div}>
      <form className={styles.loginForm} onSubmit={handleSubmit}>
        <h2 className={styles.h2}>ログイン</h2>

        {/* ユーザーID */}
        <ApprovalsInput type="text" name="userId" id="userId" text="ID" required />

        {/* パスワード */}
        <ApprovalsInput type="password" name="password" id="password" text="パスワード" required />

        {/* ログインボタン */}
        {/* onClick は不要。type="submit" で送信される */}
        <ApprovalsButton type="submit" text={loading ? 'ログイン中...' : 'ログイン'} disabled={loading} />
      </form>

      <p>アカウントが未登録ですか？</p>
      <a href="/register">アカウント作成</a>
    </div>
  );
}
