'use client';

import { useState } from 'react';
import BusinessHourRow from '@/components/Molecules/BusinessHourRow';

// cssのインポート
import styles from '@/styles/BusinesRegister.module.css';

const days = [
  '月', '火', '水', '木', '金', '土', '日', '祝日'
];

export default function BusinessHoursTable() {
  // 営業時間情報の初期化
  const [hours, setHours] = useState(
    days.map(() => ({
      closed: false,
      lunch: { start: '', end: '', available: false },
      dinner: { start: '', end: '', available: false },
    }))
  );

  const updateRow = (index, newData) => {
    const updated = [...hours];
    updated[index] = newData;
    setHours(updated);
  };

  return (
    <div className={styles.businessHoursTable}>
      <h2>営業時間・定休日</h2>
      <table>
        <thead>
          <tr>
            <th>曜日</th>
            <th>定休日</th>
            <th>ランチ</th>
            <th>ディナー</th>
          </tr>
        </thead>
        <tbody>
          {days.map((day, index) => (
            <BusinessHourRow
              key={day}
              day={day}
              data={hours[index]}
              onChange={(newData) => updateRow(index, newData)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
