// BusinessHourRow.jsx
import TimeSelect from '@/components/atoms/TimeSelect';
import styles from '@/styles/BusinesRegister.module.css';

export default function BusinessHourRow({ day, data, onChange }) {
  const { closed, lunch, dinner } = data;

  const update = (field, value) => {
    // 定休日トグルの特別処理
    if (field === 'closed') {
      if (value) {
        // 定休日：両帯とも「設定不可(available=true)」にして時刻は消す
        onChange({
          ...data,
          closed: true,
          lunch:  { start: '', end: '', available: true },
          dinner: { start: '', end: '', available: true },
        });
      } else {
        // 定休日解除：両帯とも「利用可(available=false)」に戻す（時刻は空のままでOK）
        onChange({
          ...data,
          closed: false,
          lunch:  { ...data.lunch,  available: false },
          dinner: { ...data.dinner, available: false },
        });
      }
      return; // ここで終了（以下の通常更新は実行しない）
    }

    // 通常更新（ランチ・ディナーの各フィールド）
    onChange({ ...data, [field]: value });
  };

  return (
    <tr className={styles.tr}>
      <td>{day}</td>
      <td>
        <input
          type="checkbox"
          checked={closed}
          onChange={(e) => update('closed', e.target.checked)}
        />
      </td>
      <td>
        <TimeSelect
          label="ランチ"
          data={lunch}
          onChange={(value) => update('lunch', value)}
          disabled={closed}
        />
      </td>
      <td>
        <TimeSelect
          label="ディナー"
          data={dinner}
          onChange={(value) => update('dinner', value)}
          disabled={closed}
        />
      </td>
    </tr>
  );
}
