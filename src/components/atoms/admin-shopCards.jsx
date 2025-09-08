import styles from '@/styles/adminhome.module.css';

export default function ShopCards({ shops, categories, restaurants_categories, router, openId, setOpenId, setPrivateModal }) {
  if (shops.length === 0) {
    return <p className={styles.nothing}>該当する店舗はありません</p>;
  }

  return (
    <div className={styles.visibleshops}>
      {shops.map((r) => (
        <div
          key={r.id}
          className={styles.visibleshop}
          onClick={() => router.push(`/admin/store-detail?id=${r.id}`)}
        >
          <img src={r.image_url} alt={r.name} className={styles.storephoto} />

          <div className={styles.storedetail + (openId === r.id ? `${styles.open}` : "")}>
            {openId === r.id ? (
              <div className={styles.openContent}>
                <p className={styles.storename}>
                  {r.name.length > 8 ? (
                    <>
                      {r.name.slice(0, 8)}<br />
                      {r.name.slice(8)}
                    </>
                  ) : (
                    r.name
                  )}
                </p>
                <p
                  className={styles.privatebutton}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPrivateModal(true);
                  }}
                >
                  非公開にする
                </p>
                <p
                  className={styles.smalltext}
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/admin/store-detail?id=${r.id}`);
                  }}
                >
                  この店舗の詳細ページへ
                </p>
              </div>
            ) : (
              <div className={styles.closedContent}>
                <p className={styles.storename}>
                  {r.name.length > 8 ? (
                    <>
                      {r.name.slice(0, 8)}<br />
                      {r.name.slice(8)}
                    </>
                  ) : (
                    r.name
                  )}
                </p>
                <p className={styles.storeadress}>{r.address}</p>
                <p className={styles.storecategory}>
                  {restaurants_categories
                    .filter((rc) => rc.restaurant_id === r.id)
                    .map((rc) => categories.find((c) => c.id === rc.category_id)?.name ?? "不明")
                    .join("/")}
                </p>
              </div>
            )}

            <span
              className={`material-symbols-outlined ${styles.displaychange}`}
              onClick={(e) => {
                e.stopPropagation();
                setOpenId(openId === r.id ? null : r.id);
              }}
            >
              more_vert
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
