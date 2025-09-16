// src/components/molecules/CategoryList.jsx
import React from "react";
import styles from "@/styles/editModal.module.css";

/**
 * props:
 * - options: { id: string, name: string }[]
 * - selectedIds: string[]                // ★ ID配列で管理
 * - onChange: (nextIds: string[]) => void
 */
export default function CategoryList({ options = [], selectedIds = [], onChange }) {
  const toggle = (id) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id]
    );
  };

  return (
    <div className={styles.categoryList}>
      {options.map(({ id, name }) => {
        const selected = selectedIds.includes(id);
        return (
          <button
            key={id}
            type="button"
            onClick={() => toggle(id)}
            className={`${styles.category} ${selected ? styles.selected : ""}`}
          >
            {name}
          </button>
        );
      })}
    </div>
  );
}