"use client";

import styles from "@/styles/ownerRegister.module.css";
import { useState } from "react";
import { useRouter } from "next/navigation";

import ApprovalsButton from "@/components/atoms/ApprovalsButton";
import ApprovalsInput from "@/components/atoms/ApprovalsInput";
import ApprovalsTextarea from "@/components/atoms/ApprovalsTextarea";
import ApprovalsImg from "@/components/atoms/ApprovalsImg";
import BusinessHoursTable from "@/components/Molecules/BusinessHoursTable";

import { apiFetch, checkTokenExpired } from "@/hooks/useApiFetch";
import { useUpload } from "@/hooks/useUpload";

// "HH:mm" -> "HH:mm:00"（空は null）
const ensureSeconds = (v) => {
  if (!v) return null;
  return v.length === 5 ? `${v}:00` : v;
};

export default function RestaurantRegister() {
  const { getPresignedPut, putToS3 } = useUpload();
  const router = useRouter();

  // presign → S3 PUT 後に返る tmpKey
  const [interiorTmpKey, setInteriorTmpKey] = useState(null);
  const [exteriorTmpKey, setExteriorTmpKey] = useState(null);

  const days = ["月", "火", "水", "木", "金", "土", "日", "祝日"];
  const [hours, setHours] = useState(
    days.map(() => ({
      closed: false,
      lunch: { start: "", end: "", available: false },
      dinner: { start: "", end: "", available: false },
    }))
  );

  // ===== 子コンポーネント(ApprovalsImg) から受け取る =====
  const onPickInterior = async (file) => {
    if (!file) return setInteriorTmpKey(null);
    const presign = await getPresignedPut(file.name, "restaurant-image");
    if (!presign) return;
    const ok = await putToS3(presign.url, file, presign.contentType);
    if (!ok) return alert("アップロード失敗");
    setInteriorTmpKey(presign.key);
  };

  const onPickExterior = async (file) => {
    if (!file) return setExteriorTmpKey(null);
    const presign = await getPresignedPut(file.name, "restaurant-image");
    if (!presign) return;
    const ok = await putToS3(presign.url, file, presign.contentType);
    if (!ok) return alert("アップロード失敗");
    setExteriorTmpKey(presign.key);
  };

  // ===== 店舗登録 =====
  const handleSubmit = async (e) => {
    e.preventDefault();

    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") || "").trim();
    const postcode = String(f.get("postcode") || "").trim();
    const address1 = String(f.get("address1") || "").trim();
    const address2 = String(f.get("address2") || "").trim();
    const phone = String(f.get("phone") || "").trim();
    const email = String(f.get("email") || "").trim();
    // 既存の name が "descrption" になっている前提で合わせます
    const description = String(f.get("descrption") || "").trim();

    if (!name) return alert("店舗名を入力してください。");
    if (!postcode) return alert("郵便番号を入力してください。");

    // 営業時間
    const storeScheduleDtoList = hours.map((h, idx) => {
      const isLunchClosed = h.closed || h.lunch.available; // 設定不可なら閉店
      const isDinnerClosed = h.closed || h.dinner.available;

      const lunchStart = isLunchClosed ? null : ensureSeconds(h.lunch.start);
      const lunchEnd = isLunchClosed ? null : ensureSeconds(h.lunch.end);
      const dinnerStart = isDinnerClosed ? null : ensureSeconds(h.dinner.start);
      const dinnerEnd = isDinnerClosed ? null : ensureSeconds(h.dinner.end);

      return {
        dayOfWeek: idx, // 0..7（0=月, 7=祝）
        isClosed: h.closed,
        lunchStart,
        lunchEnd,
        isLunchClosed,
        dinnerStart,
        dinnerEnd,
        isDinnerClosed,
      };
    });

    // バックエンドの RequestAddRestaurantDto に合わせる
    const payload = {
      name,
      address: `${address1}${address2 ? " " + address2 : ""}`,
      postCode: postcode,
      phone,
      email,
      description,
      interiorTmpKey: interiorTmpKey ?? "",
      exteriorTmpKey: exteriorTmpKey ?? "",
      certificate: "",
      storeScheduleDtoList,
      categoryDtoList: [],
    };
    const result = await apiFetch("/api/owner/restaurants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (checkTokenExpired(result, router)) return;

    if (!result.response.ok) {
      const ct = result.response.headers.get("content-type") || "";
      const msg = ct.includes("application/json")
        ? (await result.response.json())?.message ?? "登録に失敗しました"
        : await result.response.text();
      alert(String(msg));
      console.error("register error:", msg);
      return;
    }

    alert("店舗を登録しました。");
    router.replace("/owner/stores");
  };

  return (
    <div className={styles.div}>
      <h2 className={styles.h2}>新規店舗登録</h2>

      <form className={styles.Form} onSubmit={handleSubmit}>
        <div className={styles.formContent}>
          <div className={styles.leftContent}>
            <ApprovalsInput type="text" name="name" id="name" text="店舗名" />
            <ApprovalsImg
              name="interiorImg"
              id="interiorImg"
              text="店内の写真"
              onChange={onPickInterior}
            />
            <ApprovalsImg
              name="outsideImg"
              id="outsideImg"
              text="店外の写真"
              onChange={onPickExterior}
            />

            <ApprovalsInput
              type="text"
              name="postcode"
              id="postcode"
              text="郵便番号（ハイフンなし）"
              maxLength={7}
            />
            <ApprovalsInput
              type="text"
              name="address1"
              id="address1"
              text="市区町村"
            />
            <ApprovalsInput
              type="text"
              name="address2"
              id="address2"
              text="それ以降の住所"
            />
            <ApprovalsInput type="text" name="phone" id="phone" text="電話番号" />
            <ApprovalsInput
              type="text"
              name="email"
              id="email"
              text="メールアドレス"
            />
            <ApprovalsTextarea
              name="descrption"
              id="descrption"
              text="店舗のメモ"
            />
          </div>

          <div className={styles.rightContent}>
            <ApprovalsImg
              name="certificate"
              id="certificate"
              text="飲食店営業許可証"
            />
            <small>
              飲食店営業許可証とは、保健所が発行する飲食店の営業を許可する証明書です。
              <br />
              番号・有効期限・営業者名が読める画像をご準備ください。
            </small>

            <BusinessHoursTable hours={hours} setHours={setHours}/>
          </div>
        </div>

        <ApprovalsButton type="submit" text="登録" className={styles.registerBtn}/>
      </form>
    </div>
  );
}
