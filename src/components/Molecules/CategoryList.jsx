import React from "react";
import styles from "@/styles/editModal.module.css";
import { categories } from "@/data/mockData";

export default function CategoryList({ selectedCategories, setSelectedCategories }) {
  const toggleCategory = (categoryId) => {
    const alreadySelected = selectedCategories.includes(categoryId);
    const newSelected = alreadySelected
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];

    setSelectedCategories(newSelected);
  };

  return (
    <div className={styles.categoryList}>
      {categories.map(cat => {
        const isSelected = selectedCategories.includes(cat.id);
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => toggleCategory(cat.id)}
            className={`${styles.category} ${isSelected ? styles.selected : ''}`}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
