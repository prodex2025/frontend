// cssのインポート
import styles from '@/styles/BusinesRegister.module.css'

export default function TimeSelect({ label, data, onChange, disabled }) {
  const times = Array.from({ length: 24 }, (_, h) =>
    ['00', '30'].map((m) => `${String(h).padStart(2, '0')}:${m}`)
  ).flat();

  return (
    <div className={styles.content}>
      <div className={`${styles.timeContent} ${disabled ? styles.disabled : ''}`}>
        <div className={styles.selectWrapper}>
          <select disabled={disabled} value={data.start ?? ""}
          onChange={(e) => onChange({ ...data, start: e.target.value })}
          >
            <option value="">--</option>
            {times.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <span>~</span>
        <div className={styles.selectWrapper}>
          <select disabled={disabled} value={data.end ?? ""}
          onChange={(e) => onChange({ ...data, end: e.target.value })}
          >
            <option value="">--</option>
            {times.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>
      <label className={styles.checkbox}>
          <input type="checkbox" checked={data.available}
            onChange={(e) => onChange({ ...data, available: e.target.checked })} disabled={disabled}
          />
          設定不可
      </label>
    </div>
  );
}
