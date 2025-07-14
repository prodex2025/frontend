import { useState } from 'react';
import BusinessHourRow from '@/components/atoms/BusinessHourRow';

// CSSをインポート
import styles from '@/styles/BusinessHourRow.module.css';

const days = ['月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日', '日曜日'];

export default function BusinessHours() {
  // 営業時間・休憩時間・定休日を曜日ごとに管理
  const [hours, setHours] = useState(
    days.map(() => ({
      closed: false,
      start: '',
      end: '',
      breakStart: '',
      breakEnd: ''
    }))
  );

  const handleChange = (index, field, value) => {
    const newHours = [...hours];
    newHours[index][field] = value;
    setHours(newHours);
  };

  return (
    <div className={styles.businesTimeContent}>
      <h3>営業時間</h3>
      {days.map((day, index) => (
        <BusinessHourRow key={index} day={day} data={hours[index]} onChange={(field, value) => handleChange(index, field, value)} />
      ))}
    </div>
  );
}
