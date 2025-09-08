"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import styles from "@/styles/ThreeViewer.module.css";

// ▼ 追加：three.js とローダー
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

/** 3Dモデル表示用コンポーネント */
export default function ThreeModelViewer({ folder }) {
  const mountRef = useRef(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!folder || !mountRef.current) return;

    const container = mountRef.current; // bowl内の描画先
    setLoadError("");

    // 基本セットアップ
    const scene = new THREE.Scene();
    scene.background = null; // 透明（親側の背景を利用）

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0.6, 0.6, 1.2);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 0, 0);

    // ライティング（お好みで調整）
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dir = new THREE.DirectionalLight(0xffffff, 0.6);
    dir.position.set(5, 10, 7.5);
    scene.add(dir);

    // ローダー
    const manager = new THREE.LoadingManager();
    const base = `/model/${folder}/`; // ← public/model/<folder>/ に置く
    const mtlLoader = new MTLLoader(manager);
    mtlLoader.setResourcePath(base); // MTL内の相対パス解決用（3DModel.png）

    // モデル読み込み
    mtlLoader.load(
      `${base}3DModel.mtl`,
      (materials) => {
        materials.preload();

        const objLoader = new OBJLoader(manager);
        objLoader.setMaterials(materials);

        objLoader.load(
          `${base}3DModel.obj`,
          (obj) => {
            // バウンディングで正規化（中央寄せ＆スケール調整）
            const box = new THREE.Box3().setFromObject(obj);
            const size = new THREE.Vector3();
            const center = new THREE.Vector3();
            box.getSize(size);
            box.getCenter(center);
            obj.position.sub(center); // 中央へ
            const maxDim = Math.max(size.x, size.y, size.z) || 1;
            const scale = 0.8 / maxDim; // 画面に収まる程度に
            obj.scale.setScalar(scale);

            // 影プロパティ（必要なら）
            obj.traverse((c) => {
              if (c.isMesh) {
                c.castShadow = true;
                c.receiveShadow = true;
              }
            });

            scene.add(obj);
          },
          undefined,
          (err) => setLoadError(`OBJの読み込みに失敗しました: ${err?.message ?? ""}`)
        );
      },
      undefined,
      (err) => setLoadError(`MTLの読み込みに失敗しました: ${err?.message ?? ""}`)
    );

    // リサイズ対応
    const onResize = () => {
      if (!container) return;
      const { clientWidth, clientHeight } = container;
      renderer.setSize(clientWidth, clientHeight);
      camera.aspect = clientWidth / Math.max(1, clientHeight);
      camera.updateProjectionMatrix();
    };
    onResize();
    window.addEventListener("resize", onResize);

    // ループ
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      controls.update();
      renderer.render(scene, camera);
    };
    tick();

    // クリーンアップ
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement?.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [folder]);

  return (
    <div ref={mountRef} className={styles.viewer3d}>
      {/* ここはcanvasの親要素。エラーはテキストで表示 */}
      {loadError && <p className={styles.errorText}>{loadError}</p>}
    </div>
  );
}