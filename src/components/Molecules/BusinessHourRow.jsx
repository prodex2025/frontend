import TimeSelect from '@/components/atoms/TimeSelect';

// cssのインポート
import styles from '@/styles/BusinesRegister.module.css';

export default function BusinessHourRow({ day, data, onChange }) {
  const { closed, lunch, dinner } = data;

  const update = (field, value) => {
    if (field === 'closed' && value === true) {
      onChange({
        ...data,
        closed: true,
        lunch: { start: '', end: '', available: false },
        dinner: { start: '', end: '', available: false },
      });
    } else {
      onChange({ ...data, [field]: value });
    }
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
