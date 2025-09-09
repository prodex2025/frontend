'use client';

import { useRouter, useParams, usePathname, useSearchParams } from 'next/navigation';
import styles from "@/styles/ThreeViewer.module.css";

export default function BackButton({
  className,
  /** 'owner' | 'user' を明示。省略時はURLから推定（/owner で始まれば owner） */
  role,
  /** params から取れない場合に備えて、明示的にレストランIDを渡せます */
  restaurantId: propRestaurantId,
  /** 役割ごとのフォールバックURLを上書きしたい場合に渡す */
  fallbackMap = {},
  /** フォールバック遷移に replace を使うか（履歴を増やさない） */
  replaceOnFallback = false,
}) {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 役割を推定（明示優先）
  const inferredRole = role || (pathname?.startsWith('/owner') ? 'owner' : 'user');

  // URLの [id] から取得（なければ prop を使う）
  const restaurantId = propRestaurantId ?? (Number(params?.id) || null);

  // 既定のフォールバック先（必要に応じてここを好みの経路に）
  const defaultFallbackMap = {
    owner: restaurantId ? `/owner/dashboard/${restaurantId}` : '/owner',
    user: restaurantId ? `/restaurants/${restaurantId}` : '/',
  };

  const mergedFallbackMap = { ...defaultFallbackMap, ...fallbackMap };

  // /page?from=/something のように、呼び出し元を明示できる
  const from = searchParams?.get('from');
  const fallbackUrl = from || mergedFallbackMap[inferredRole] || '/';

  const handleBack = () => {
    try {
      if (typeof window !== 'undefined') {
        const hasHistory = window.history.length > 1;
        const sameOriginRef =
          document.referrer && new URL(document.referrer).origin === location.origin;

        // 同一オリジンかつ履歴があれば back
        if (hasHistory && sameOriginRef) {
          router.back(); // = history.back()
          return;
        }
      }
    } catch {
      /* ignore */
    }
    // 履歴が無い/外部から直リンク → 役割別フォールバックへ
    if (replaceOnFallback) router.replace(fallbackUrl);
    else router.push(fallbackUrl);
  };

  return (
    <button
      type="button"
      className={styles.backButton}
      onClick={handleBack}
      aria-label="前の画面に戻る"
    >
      <span className="material-symbols-outlined">arrow_back</span>
    </button>
  );
}