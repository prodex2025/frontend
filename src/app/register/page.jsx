'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/styles/approvals.module.css';

import ApprovalsButton from '@/components/atoms/ApprovalsButton';
import ApprovalsInput from '@/components/atoms/ApprovalsInput';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

  // 戻る
  const handleBack = () => {
    router.push('/login');
  };

  // 送信（登録）
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const form = new FormData(e.currentTarget);
    const userId = String(form.get('userId') || '');
    const password = String(form.get('password') || '');

    if (!userId || !password) {
      alert('ID と パスワードを入力してください。');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // バックエンド仕様に合わせてキーは loginId / password
        body: JSON.stringify({ loginId: userId, password }),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type') || '';
        const msg = contentType.includes('application/json')
          ? (await response.json())?.message ?? '登録に失敗しました'
          : await response.text();

        if (String(msg).includes('既に存在') || String(msg).includes('すでに')) {
          alert('※このユーザー名はすでに使用されています');
        } else {
          alert(String(msg));
          console.error('register error:', msg);
        }
        setLoading(false);
        return;
      }

      alert('登録が完了しました。');
      router.push('/login'); // 登録完了後にログインへ
    } catch (err) {
      console.error('登録エラー:', err);
      alert('登録に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.div}>
      <button className={styles.backbutton} onClick={handleBack}>←</button>

      {/* onSubmit をフォームにセット */}
      <form className={styles.loginForm} onSubmit={handleSubmit}>
        <h2 className={styles.h2}>新規アカウント登録</h2>

        {/* ユーザーID（name が FormData で拾われます） */}
        <ApprovalsInput
          type="text"
          name="userId"
          id="userId"
          text="ID(半角英数字のみ)"
          required
        />

        {/* パスワード */}
        <ApprovalsInput
          type="password"
          name="password"
          id="password"
          text="パスワード(半角英数字のみ)"
          required
        />

        {/* 登録ボタン。onClick は不要、type=submit で送信 */}
        <ApprovalsButton
          type="submit"
          text={loading ? '登録中…' : '登録'}
          disabled={loading}
        />
      </form>
    </div>
  );
}
