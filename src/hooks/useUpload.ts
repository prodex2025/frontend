'use client';
import { apiFetch, checkTokenExpired } from '@/hooks/useApiFetch';
import { useRouter } from 'next/navigation';

export const useUpload = () => {
  const router = useRouter();

  const getPresignedPut = async (filename: string, scope: 'restaurant-image'|'dish-image'|'dish-model') => {
    const body = new URLSearchParams({ filename, scope }).toString();
    const result = await apiFetch('/api/resign/put', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    if (checkTokenExpired(result, router)) return null;
    if (!result.response.ok) {
      console.error('presign error:', await result.response.text());
      alert('画像のアップロード準備に失敗しました。');
      return null;
    }
    return (await result.response.json()) as { url: string; key: string; contentType: string };
  };

  const putToS3 = async (url: string, file: File, contentType: string) => {
    const res = await fetch(url, { method: 'PUT', headers: { 'Content-Type': contentType }, body: file });
    return res.ok;
  };

  return { getPresignedPut, putToS3 };
};
