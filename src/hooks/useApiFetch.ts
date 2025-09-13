// src/hooks/useApiFetch.ts
"use client";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export type ApiFetchResult = { response: Response; tokenExpired: boolean };

export const apiFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<ApiFetchResult> => {
  // localStorage はクライアントのみ
  const accessToken =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const refreshToken =
    typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;

  let tokenExpired = false;
  const fullUrl = `${API_BASE_URL}${url}`;

  // Headers で安全にマージ
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type"))
    headers.set("Content-Type", "application/json");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  let response = await fetch(fullUrl, { ...options, headers });

  // アクセストークン失効 → リフレッシュ
  if (response.status === 403 || (response.status === 401 && refreshToken)) {
    const refreshRes = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (refreshRes.ok) {
      const data = await refreshRes.json();
      if (typeof window !== "undefined") {
        localStorage.setItem("accessToken", data.accessToken);
      }

      const retryHeaders = new Headers(options.headers);
      if (!retryHeaders.has("Content-Type"))
        retryHeaders.set("Content-Type", "application/json");
      retryHeaders.set("Authorization", `Bearer ${data.accessToken}`);

      response = await fetch(fullUrl, { ...options, headers: retryHeaders });
    } else {
      tokenExpired = true;
    }
  }

  return { response, tokenExpired };
};

// src/hooks/useApiFetch.ts
export const checkTokenExpired = (
  result: ApiFetchResult,
  router: { push: (path: string) => void; replace?: (path: string) => void },
  redirectTo: string = "/login" // ← ここでデフォルトを /login に
) => {
  if (result.tokenExpired) {
    alert("セッションの有効期限が切れました。再度ログインしてください。");
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
    // 戻るで保護ページに戻られたくない場合は replace を使用
    if (router.replace) router.replace(redirectTo);
    else router.push(redirectTo);
    return true;
  }
  return false;
};
