'use client';

import React from 'react';
import styles from '@/styles/storeStatisticsTab.module.css';
import { dishes, storeStatistics, restaurantAccessLogs, popularMenus, menuAccessLogs } from '@/data/mockData';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

export default function StoreStatisticsTab({ restaurant }) {
  if (!restaurant) return null;
  console.log(restaurant);
  // 該当店舗の統計情報を取り出す
  const stats = storeStatistics.find(rc => rc.restaurant_id === restaurant.id);
  console.log(stats);

  // 過去14日分の日付を作成
  const today = new Date();
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (13 - i)); // 13日前～今日
    return d.toISOString().slice(0, 10);    // YYYY-MM-DD形式
  });

  // 日別店舗アクセスデータ
  const accessData = days.map(day => {
    const log = restaurantAccessLogs.find(l => l.restaurant_id === restaurant.id && l.date === day);
    return {
      date: day,
      count: log ? log.count : 0,
    };
  });

  // 人気メニューランキング
  const popularMenuData = popularMenus
    .filter(p => p.restaurant_id === restaurant.id)
    .sort((a, b) => b.total_count - a.total_count)
    .map(p => {
      const dish = dishes.find(d => d.id === p.dish_id);
      return {
        ...p,
        name: dish?.name || '不明',
        image_url: dish?.image_url || '',
      };
    });

  // 前日比を計算する関数
  const calcChange = (logs) => {
    const today = logs[logs.length - 1]?.count ?? 0;
    const yesterday = logs[logs.length - 2]?.count ?? 0;
    const diff = today - yesterday;
    const rate = yesterday === 0 ? 0 : ((diff / yesterday) * 100).toFixed(1);
    return { diff, rate };
  };

  // 店舗アクセス数の前日比
  const restaurantChange = calcChange(
    accessData
  );

  // メニューアクセス数の前日比
  const menuChange = calcChange(
    menuAccessLogs
      .filter(log => log.restaurant_id === restaurant.id)
      .reduce((acc, curr) => {
        const found = acc.find(a => a.date === curr.date);
        if (found) {
          found.count += curr.count;
        } else {
          acc.push({ date: curr.date, count: curr.count });
        }
        return acc;
      }, [])
  );


  return (
    <div className={styles.wrapper}>

      {/* 数値表示 */}
      <div className={styles.statsContainer}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>
            <span className="material-symbols-outlined">
              bar_chart
            </span>
            店舗アクセス数
          </p>
          <p className={styles.statValue}>{stats?.total_restaurant_access ?? 0}</p>
          <p className={styles.statChange}>前日比 
            {restaurantChange.diff >= 0 ? '+' : ''}{restaurantChange.diff}件（{restaurantChange.rate}%）
          </p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>
            <span className="material-symbols-outlined">
              fork_spoon
            </span>
            メニューアクセス数</p>
          <p className={styles.statValue}>{stats?.total_menu_access ?? 0}</p>
          <p className={styles.statChange}>前日比 
            {menuChange.diff >= 0 ? '+' : ''}{menuChange.diff}件（{menuChange.rate}%）
          </p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>
            <span className="material-symbols-outlined">
              yoshoku
            </span>
            登録料理数
            </p>
          <p className={styles.statValue}>{stats?.total_dishes ?? 0}</p>
        </div>
      </div>

      {/* 日別店舗アクセスグラフ */}
      <div className={styles.chartContainer}>
        <h3 className={styles.chartTitle}>店舗アクセス数</h3>
        <small>過去14日分の日付を表示します</small>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={accessData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date"
              tickFormatter={(date) => {
                const d = new Date(date);
                return `${d.getMonth() + 1}/${d.getDate()}`; // 月/日
              }}
            />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#397bffb7" strokeWidth={3}/>
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 人気メニューランキング */}
      <div className={styles.popularMenuContainer}>
        <h3 className={styles.chartTitle}>人気メニューランキング</h3>
        <ol className={styles.menuList}>
          {popularMenuData.slice(0, 3).map((menu, idx) => (
          <li key={menu.dish_id} className={styles.menuItem}>
            <span className={styles.menuRank}>{idx + 1}位：</span>
            <span className={styles.menuName}>{menu.name}</span>
            <span className={styles.menuCount}>{menu.total_count}回</span>
          </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
