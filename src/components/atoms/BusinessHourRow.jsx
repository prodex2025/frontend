// CSSのインポート
import styles from '@/styles/BusinessHourRow.module.css';

export default function BusinessHourRow({ day, data, onChange }) {
  const { closed, start, end, breakStart, breakEnd } = data;

  return (
    <div className={styles.businesContent}>
      <label className={styles.label}>{day}</label>

      {/* 定休日チェック */}
      <label className={styles.checkbox}>
        <input type="checkbox" checked={closed} onChange={(e) => onChange('closed', e.target.checked)} />
        <span>定休日</span>
      </label>

      {/* 営業時間入力 */}
      <div className={styles.businesTime}>
        <span>営業時間</span>
        <div className={styles.timeContent}>
          <input type="time" value={start} onChange={(e) => onChange('start', e.target.value)} disabled={closed}/>
          <span>〜</span>
          <input type="time" value={end} onChange={(e) => onChange('end', e.target.value)} disabled={closed} />
        </div>
        <span>休憩時間</span>
        <div className={styles.timeContent}>
          {/* 休憩時間入力 */}
          <input type="time" value={breakStart} onChange={(e) => onChange('breakStart', e.target.value)} disabled={closed}/>
          <span>〜</span>
          <input type="time" value={breakEnd} onChange={(e) => onChange('breakEnd', e.target.value)} disabled={closed}/>
        </div>
      </div>
    </div>
  );
}
