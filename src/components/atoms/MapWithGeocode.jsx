import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Leafletのデフォルトアイコン設定
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/image/marker-icon-2x.png',
  iconUrl: '/image/marker-icon.png',
  shadowUrl: '/image/marker-shadow.png',
});

// 郵便番号を除去
function removePostalCode(address) {
  return address.replace(/〒?\d{3}-\d{4}/g, '').trim();
}

// ジオコーディング精度を高めるため、丁目・区・市レベルまで抽出
function extractAddressForGeocode(address) {
  const chomeMatch = address.match(/.+?丁目/);
  if (chomeMatch) return chomeMatch[0].trim();

  const wardMatch = address.match(/.+?[都道府県].+?市.+?区/);
  if (wardMatch) return wardMatch[0].trim();

  const cityMatch = address.match(/.+?[都道府県].+?市/);
  if (cityMatch) return cityMatch[0].trim();

  const townMatch = address.match(/.+?[都道府県].+?郡.+?町/);
  if (townMatch) return townMatch[0].trim();

  return address.trim(); // 最後の手段
}

// 地図表示コンポーネント
export default function MapWithGeocode({ address }) {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!address) return;

    const fetchGeocode = async () => {
      const apiKey = process.env.NEXT_PUBLIC_OPENCAGE_API_KEY;
      if (!apiKey) {
        console.error('OpenCage APIキーが設定されていません。');
        setError(true);
        return;
      }

      let cleaned = removePostalCode(address);
      const geocodeAddress = extractAddressForGeocode(cleaned);

      try {
        const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(geocodeAddress)}&key=${apiKey}&language=ja`;
        const res = await fetch(url);
        const data = await res.json();

        console.log('ジオコーディング結果:', data); // ← 開発中は確認

        if (data.results && data.results.length > 0) {
          const { lat, lng } = data.results[0].geometry;
          setPosition([lat, lng]);
          setError(false);
        } else {
          setError(true);
          setPosition(null);
        }
      } catch (e) {
        console.error('ジオコーディング中にエラーが発生しました:', e);
        setError(true);
        setPosition(null);
      }
    };

    fetchGeocode();
  }, [address]);

  if (error) return <div>住所から地図を表示できませんでした。</div>;
  if (!position) return <div>地図を読み込み中...</div>;

  return (
    <MapContainer center={position} zoom={15} style={{ height: '300px', width: '100%' }}>
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={false}>
          {address}
        </Tooltip>
      </Marker>
    </MapContainer>
  );
}
