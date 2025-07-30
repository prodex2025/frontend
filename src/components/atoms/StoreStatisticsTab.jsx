import React from 'react';
import styles from '@/styles/StoreStatisticsTab.module.css';
import { dishes } from '@/data/mockData'; // モックデータから経営情報を取得

export default function StoreStatisticsTab({ restaurant }) {
  if (!restaurant) return null;

  return (
    <div className={styles.statisticsContainer}>
      <h1>統計情報を表示</h1>
    </div>
  );
}
