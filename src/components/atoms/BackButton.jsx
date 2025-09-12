'use client';

import { useRouter, useParams, usePathname, useSearchParams } from 'next/navigation';
import styles from "@/styles/ThreeViewer.module.css";

export default function BackButton({
  className,
  role,
  restaurantId: propRestaurantId,
  fallbackMap = {},
  replaceOnFallback = false,
}) {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 役割を推定（明示優先）
  const inferredRole = role || (pathname?.startsWith('/owner') ? 'owner' : 'store');

  // URLの [id] から取得（なければ prop を使う）
  const restaurantId = propRestaurantId ?? (Number(params?.id) || null);

  // 既定のフォールバック先
  const defaultFallbackMap = {
    owner: restaurantId ? `/owner/dashboard/${restaurantId}` : '/owner',
    store: restaurantId ? `/store/list/details/${restaurantId}` : '/store',
  };

  const mergedFallbackMap = { ...defaultFallbackMap, ...fallbackMap };

  // /page?from=/something のように、呼び出し元を明示できる
  const from = searchParams?.get('from');
  const fallbackUrl = from || mergedFallbackMap[inferredRole] || '/';

  const handleBack = () => {
    try {
      if (typeof window !== 'undefined') {
        const hasHistory = window.history.length > 1;
        const ref = document.referrer;

        if (hasHistory && ref) {
          const refUrl = new URL(ref, location.origin);
          const sameOriginRef = refUrl.origin === location.origin;

          // ★ 追加：ロール一致チェック（owner→owner / store→store のときだけ back）
          const rolePrefix = inferredRole === 'owner' ? '/owner' : '/store';
          const sameRoleRef = refUrl.pathname.startsWith(rolePrefix);

          if (sameOriginRef && sameRoleRef) {
            router.back(); // = history.back()
            return;
          }
        }
      }
    } catch {
      /* ignore */
    }

    // 履歴が無い／外部から直リンク／ロールが異なる履歴 → 役割別フォールバックへ
    if (replaceOnFallback) router.replace(fallbackUrl);
    else router.push(fallbackUrl);
  };

  return (
    <button
      type="button"
      className={`${styles.backButton} ${className ?? ''}`}
      onClick={handleBack}
      aria-label="前の画面に戻る"
    >
      <span className="material-symbols-outlined">arrow_back</span>
    </button>
  );
}