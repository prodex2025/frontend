// 店舗詳細の編集用画面
import React, { useState, useRef } from 'react';
import styles from '@/styles/EditPage.module.css';
import { restaurants_business_calendar } from '@/data/mockData'; 

import EditButton from '@/components/atoms/EditButton'; // 編集ボタンのコンポーネント
import EditStoreModal from "@/components/molecules/EditStoreModal"; // 編集の際のモーダルのコンポーネント
import EditBusinessHoursForm from "@/components/Molecules/EditBusinessHoursForm";

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土', '祝日'];

function formatPhoneNumber(number) {
  if (!number) return '';
  const clean = number.replace(/[^\d]/g, '');
  if (clean.length === 11) return `${clean.slice(0,3)}-${clean.slice(3,7)}-${clean.slice(7)}`;
  if (clean.length === 10) return `${clean.slice(0,2)}-${clean.slice(2,6)}-${clean.slice(6)}`;
  return number;
}

export default function EditDetailTab({ restaurant }) {
  if (!restaurant) return null;

  // 編集中のフィールド管理
  const [editingField, setEditingField] = useState(null);
  const [formData, setFormData] = useState({
    address: restaurant.address,
    phone: restaurant.phone,
    email: restaurant.email,
  });

  const [previewUrl, setPreviewUrl] = useState(restaurant.image_detail_url);
  const fileInputRef = useRef(null);

  // 編集モーダルの開閉状態を管理
  const [editModalOpen, setEditModalOpen] = useState(false);

  const [businessHours, setBusinessHours] = useState(
    restaurants_business_calendar.filter((b) => b.restaurant_id === restaurant.id)
  );

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) setPreviewUrl(URL.createObjectURL(file));
  };
  const openFileDialog = () => fileInputRef.current?.click();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const weekdayMap = Object.fromEntries(businessHours.map((b) => [b.day_of_week, b]));

  return (
    <>
    <form className={styles.form}>
      <div className={styles.container}>
        {/* 左：画像 */}
        <div className={styles.imageWrapper}>
          <h2 className={styles.h2}>店内の写真</h2>
          <div className={styles.imgContent}>
            <img src={previewUrl} alt={`${restaurant.name} の画像`} className={styles.detailImage} />
            <EditButton onClick={openFileDialog} icon="edit_square" className={styles.editBtn} />
            <input type="file" accept="image/*" style={{ display: 'none' }} ref={fileInputRef} onChange={handleFileSelect} />
          </div>
        </div>

        {/* 右：店舗情報テーブル */}
        <div className={styles.contentWrapper}>
          <h2 className={styles.h2}>店舗詳細情報</h2>
          <table className={styles.infoTable}>
            <tbody>
              {/* 営業時間（モーダルで編集） */}
              <tr>
                <th>営業時間</th>
                <td>
                  {Object.entries(weekdayMap)
                    .filter(([_, info]) => !info.is_closed)
                    .map(([day, info], idx) => (
                      <React.Fragment key={day}>
                        {idx > 0 && <br />}
                        （{WEEKDAYS[Number(day)]}）
                        {info.is_lunch_closed ? '' : `ランチ ${info.lunch_start}〜${info.lunch_end} `}
                        {info.is_dinner_closed ? '' : `ディナー ${info.dinner_start}〜${info.dinner_end}`}
                      </React.Fragment>
                  ))}
                </td>
                <td>
                  <EditButton onClick={() => setEditModalOpen(true)} icon="edit" />
                </td>
              </tr>

              {/* 定休日 */}
              <tr>
                <th>定休日</th>
                <td>
                  {businessHours.some(b => b.is_closed)
                    ? businessHours.filter(b => b.is_closed)
                        .map(b => WEEKDAYS[b.day_of_week] === '祝日' ? '祝日' : `${WEEKDAYS[b.day_of_week]}曜日`)
                        .join('、')
                    : 'なし'}
                </td>
                <td></td>
              </tr>

              {/* アクセス */}
              <tr className={editingField === "address" ? styles.editingRow : ""}>
                <th>アクセス</th>
                <td>
                  {editingField === 'address' ? (
                    <input type="text" name="address" value={formData.address} onChange={handleChange} />
                  ) : (
                    formData.address
                  )}
                </td>
                <td>
                  <EditButton onClick={() => setEditingField('address')} icon='edit' />
                </td>
              </tr>

              {/* TEL */}
              <tr className={editingField === "phone" ? styles.editingRow : ""}>
                <th>TEL</th>
                <td>
                  {editingField === 'phone' ? (
                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
                  ) : (
                    formatPhoneNumber(formData.phone)
                  )}
                </td>
                <td>
                  <EditButton onClick={() => setEditingField('phone')} icon='edit' />
                </td>
              </tr>

              {/* Email */}
              <tr className={editingField === "email" ? styles.editingRow : ""}>
                <th>Email</th>
                <td>
                  {editingField === 'email' ? (
                    <input type="text" name="email" value={formData.email} onChange={handleChange} />
                  ) : (
                    formData.email
                  )}
                </td>
                <td>
                  <EditButton onClick={() => setEditingField('email')} icon='edit'/>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* フッター */}
      <div className={styles.footerContent}>
        <p className={styles.p}>変更内容を確認後「登録」ボタンを押してください。</p>
        <button type="submit" className={styles.submitBtn}>登録</button>
      </div>
    </form>
    {/* 編集モーダル */}
    <EditStoreModal open={editModalOpen} onClose={() => setEditModalOpen(false)}>
      <EditBusinessHoursForm onClose={() => setEditModalOpen(false)} />
    </EditStoreModal>
    </>
  );
}
