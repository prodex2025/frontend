import styles from '@/styles/adminhome.module.css';

export default function ShopTable({ shops, users, router }) {
  if (shops.length === 0) {
    return <p className={styles.nothing}>該当する店舗はありません</p>;
  }

  return (
    <table className={styles.storeRequestList}>
      <thead>
        <tr>
          <th>店舗名</th>
          <th>申請者名</th>
          <th>店舗ページ公開ステータス</th>
          <th>承認/申請日</th>
        </tr>
      </thead>
      <tbody>
        {shops.map((r) => {
          const owner = users.find((u) => u.id === r.owner_id);

          return (
            <tr
              key={r.id}
              className={styles.requeststore}
              onClick={() => router.push(`/admin/store-detail?id=${r.id}`)}
            >
              <td>{r.name}</td>
              <td>{owner ? owner.name : "不明"}</td>
              <td>{r.isPublished ? "公開済み" : "非公開"}</td>
              <td>
                {r.approved
                  ? new Date(r.approvalDate).toLocaleDateString("ja-JP", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : r.applicationData
                  ? new Date(r.applicationData).toLocaleDateString("ja-JP", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "ー"}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
