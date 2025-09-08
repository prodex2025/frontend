// src/hooks/useKiriAutoPolling.ts
import { useEffect, useRef, useState } from "react";

/**
 * Kiriの生成完了を定期的に確認 → 完了したら自動ダウンロード → dishes更新までやるフック
 *
 * @param dishId        対象料理ID
 * @param serialize     Kiri側のジョブID（= video_task_id）
 * @param intervalMs    ポーリング間隔(ms) デフォ 5000
 * @param maxTries      最大試行回数      デフォ 120（= 約10分）
 * @returns { status, error, done }
 *          status: 'idle' | 'polling' | 'downloading' | 'updating' | 'done' | 'failed'
 *          error:  エラーメッセージ
 *          done:   完了フラグ
 */
export function useKiriAutoPolling(
  dishId: number | null,
  serialize: string | null,
  intervalMs = 5000,
  maxTries = 120
) {
  const [status, setStatus] = useState<
    "idle" | "polling" | "downloading" | "updating" | "done" | "failed"
  >("idle");
  const [error, setError] = useState<string>("");
  const [done, setDone] = useState(false);

  const triesRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // 前提が揃ってないなら何もしない
    if (!dishId || !serialize) return;

    setStatus("polling");
    setError("");
    setDone(false);
    triesRef.current = 0;

    async function checkOnce() {
      try {
        triesRef.current += 1;

        // 生成ステータス確認
        const r = await fetch(`/api/kiri/status?serialize=${encodeURIComponent(serialize)}`, {
          method: "GET",
          cache: "no-store",
        });
        const js = await r.json();

        // js.code:
        // 200 = 完成, 2000 = 処理中, 2001 = 生成不可, 2009 = アップ不可
        const code = js?.code;

        if (code === 200) {
          // 完成 → ダウンロードへ
          setStatus("downloading");
          const dlRes = await fetch(`/api/kiri/download`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ serialize }),
          });
          const dlJson = await dlRes.json();
          if (!dlRes.ok) {
            throw new Error(dlJson?.error || "モデルのダウンロードに失敗しました。");
          }

          // 料理の video_url を更新
          const modelDirUrl = dlJson?.modelDirUrl; // 例: /model/<serialize>/
          setStatus("updating");
          const upRes = await fetch(`/api/dishes/${dishId}/video`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              video_url: modelDirUrl,
              // ついでにタスクIDを消したい場合は ↓
              video_task_id: null,
            }),
          });
          const upJson = await upRes.json();
          if (!upRes.ok) {
            throw new Error(upJson?.error || "料理の更新に失敗しました。");
          }

          // 完了！
          setStatus("done");
          setDone(true);
          // タイマー停止
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
          return;
        }

        if (code === 2000) {
          // 継続ポーリング
          if (triesRef.current >= maxTries) {
            throw new Error("タイムアウト：3Dモデルの生成が完了しませんでした。");
          }
          return; // 何もせず次のtickを待つ
        }

        // 明示的エラー系
        if (code === 2001) {
          throw new Error("この動画からは3Dモデルを生成できませんでした。（code:2001）");
        }
        if (code === 2009) {
          throw new Error("動画が要件を満たしていません。（code:2009）");
        }

        // 想定外
        throw new Error(`ステータス不明（code:${code ?? "N/A"}）`);
      } catch (e: any) {
        setStatus("failed");
        setError(e?.message || "ポーリング中にエラーが発生しました。");
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    // すぐ1回チェック→以降 interval で継続
    checkOnce();
    timerRef.current = setInterval(checkOnce, intervalMs);

    // アンマウント時/依存変更時に停止
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [dishId, serialize, intervalMs, maxTries]);

  return { status, error, done };
}
