
'use client';
import styles from '@/styles/pagination.module.css';

/**
 * Paginationコンポーネント
 * 
 * 【概要】
 * ページ番号を表示し、前後のページ移動を可能にするUI部品です。
 * 1ページあたりの表示件数などのロジックは親コンポーネントで管理し、
 * ページ切替時は親に通知して状態を更新してもらいます。
 * 
 * 【必須props】
 * - currentPage: 現在表示中のページ番号（親で状態管理）
 * - totalPages: 総ページ数（親で計算）
 * - onPageChange: ページ変更時に呼ばれるコールバック関数
 *      (新しいページ番号を引数に受け取ります)
 * 
 * 【使い方の例】親コンポーネント内
 * 
 * const [currentPage, setCurrentPage] = useState(1);
 * const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
 * 
 * const goToPage = (page) => {
 *   if (page >= 1 && page <= totalPages) {
 *     setCurrentPage(page);
 *     // 必要ならスクロールやAPI呼び出しもここで
 *   }
 * }
 * 
 * <Pagination
 *   currentPage={currentPage}
 *   totalPages={totalPages}
 *   onPageChange={goToPage}
 * />
 */

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages == 0) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className={styles.pagination}>
      <button
        className={styles.pageButton}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <span className="material-symbols-outlined">chevron_left</span>
      </button>

      {pages.map((page) => (
        <button
          key={page}
          className={`${styles.pageButton} ${page === currentPage ? styles.active : ''}`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}

      <button
        className={styles.pageButton}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <span className="material-symbols-outlined">chevron_right</span>
      </button>
    </div>
  );
}
