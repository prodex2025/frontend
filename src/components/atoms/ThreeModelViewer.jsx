"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

/* ===== デフォルト調整値（props なしで効く） ===== */
const CFG = {
  levelQuantile: 0.20,       // 底面抽出の分位（ノイズ多いほど上げると安定）
  maxLevelDeg: 75,           // 一度に回せる最大角（過回転防止）
  bottomPercentile: 0.08,    // 接地に使う底面の分位（0.06〜0.12で調整余地）
  plateScale: 1.10,          // 皿のXZサイズ＝料理のXZ * plateScale
  gap: 0.00005,                // 皿と料理の隙間（m）
  plateOffset: { x: 0, y: 0.08, z: 0 }, // 皿の最終微調整（軽く沈める）
};

/** "@/model/..." や "model/..." をブラウザURL "/model/..." に正規化 */
function normalizeBase(folder) {
  if (!folder) return null;
  let f = String(folder).replace(/\/+$/g, "");
  if (f.startsWith("@/model")) f = f.replace(/^@\/model/, "/model");
  else if (!f.startsWith("/model")) f = `/model/${f}`;
  return `${f}/`;
}

/** OBJ+MTL ロード（MTL NG 時は OBJ 単体＋標準マテリアルでフォールバック） */
async function loadObjWithMtl(base, manager, { objName = "3DModel.obj", mtlName = "3DModel.mtl" } = {}) {
  const mtlLoader = new MTLLoader(manager);
  mtlLoader.setResourcePath(base);
  mtlLoader.setPath(base);

  const objLoader = new OBJLoader(manager);
  objLoader.setPath(base);

  try {
    const materials = await new Promise((resolve, reject) => {
      mtlLoader.load(
        mtlName,
        (mats) => { mats.preload(); resolve(mats); },
        undefined,
        (err) => reject(err)
      );
    });
    objLoader.setMaterials(materials);
    return await new Promise((resolve, reject) => {
      objLoader.load(objName, (o) => resolve(o), undefined, (e) => reject(e));
    });
  } catch {
    const obj = await new Promise((resolve, reject) => {
      objLoader.load(objName, (o) => resolve(o), undefined, (e) => reject(e));
    });
    const fallbackMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.05, roughness: 0.9 });
    obj.traverse((n) => { if (n && n.isMesh) { n.material = fallbackMat; n.castShadow = true; n.receiveShadow = true; } });
    return obj;
  }
}

/** 中央寄せ＆等比スケール（最大辺が targetSize に収まる） */
function centerAndScale(obj, targetSize = 0.9) {
  const box = new THREE.Box3().setFromObject(obj);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);
  obj.position.sub(center);
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const s = targetSize / maxDim;
  obj.scale.setScalar(s);
  const newBox = new THREE.Box3().setFromObject(obj);
  const newSize = new THREE.Vector3();
  newBox.getSize(newSize);
  return { box: newBox, size: newSize, scale: s };
}

/** obj から“自分のローカル”基準で全頂点を集める（ワールド→objローカル） */
function collectWorldPositions(obj) {
  const pts = [];
  const invWorld = obj.matrixWorld.clone().invert();
  const tmp = new THREE.Vector3();
  const toLocal = new THREE.Matrix4();
  obj.traverse((n) => {
    if (!n || !n.isMesh || !n.geometry?.attributes?.position) return;
    n.updateWorldMatrix(true, false);
    toLocal.copy(invWorld).multiply(n.matrixWorld);
    const pos = n.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      tmp.fromBufferAttribute(pos, i).applyMatrix4(toLocal);
      pts.push(tmp.clone());
    }
  });
  return pts;
}

/** 配列の p パーセンタイル（0..1） */
function percentile(arr, p) {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const k = Math.min(sorted.length - 1, Math.max(0, Math.floor(sorted.length * p)));
  return sorted[k];
}

/** 底面点から平面推定→+Y に合わせて回転（外れ値に強い） */
function autoLevelByBottomPlane(obj, { quantile = CFG.levelQuantile, maxDeg = CFG.maxLevelDeg } = {}) {
  obj.updateMatrixWorld(true);
  const pts = collectWorldPositions(obj);
  if (pts.length < 10) return;

  const ys = pts.map((p) => p.y).sort((a, b) => a - b);
  const yth = ys[Math.floor(ys.length * quantile)];
  let bottom = pts.filter((p) => p.y <= yth + 1e-4);
  if (bottom.length < 3) return;

  // 1回目フィット
  let mx = 0, mz = 0, my = 0;
  bottom.forEach((p) => { mx += p.x; mz += p.z; my += p.y; });
  mx /= bottom.length; mz /= bottom.length; my /= bottom.length;
  let sxx = 0, sxz = 0, szz = 0, sxy = 0, szy = 0;
  bottom.forEach((p) => { const x = p.x - mx, z = p.z - mz, y = p.y - my; sxx += x*x; sxz += x*z; szz += z*z; sxy += x*y; szy += z*y; });
  let det = sxx * szz - sxz * sxz; if (Math.abs(det) < 1e-8) return;
  let u = ( szz * sxy - sxz * szy) / det;
  let v = (-sxz * sxy + sxx * szy) / det;

  // 外れ値除去（MAD）→ 2回目フィット
  const d = my - u * mx - v * mz;
  const resid = bottom.map(p => Math.abs(p.y - (u * p.x + v * p.z + d)));
  const med = percentile(resid, 0.5);
  const mad = percentile(resid.map(r => Math.abs(r - med)), 0.5) || 1e-6;
  const thr = med + 2.5 * mad;
  const trimmed = bottom.filter((p, i) => resid[i] <= thr);
  if (trimmed.length >= 6) {
    mx = mz = my = 0;
    trimmed.forEach((p) => { mx += p.x; mz += p.z; my += p.y; });
    mx /= trimmed.length; mz /= trimmed.length; my /= trimmed.length;
    sxx = sxz = szz = sxy = szy = 0;
    trimmed.forEach((p) => { const x = p.x - mx, z = p.z - mz, y = p.y - my; sxx += x*x; sxz += x*z; szz += z*z; sxy += x*y; szy += z*y; });
    det = sxx * szz - sxz * sxz; if (Math.abs(det) >= 1e-8) {
      u = ( szz * sxy - sxz * szy) / det;
      v = (-sxz * sxy + sxx * szy) / det;
    }
  }

  const n = new THREE.Vector3(-u, 1, -v).normalize();
  const up = new THREE.Vector3(0, 1, 0);
  const angle = Math.acos(THREE.MathUtils.clamp(n.dot(up), -1, 1));
  if (angle < 1e-3) return;
  const axis = new THREE.Vector3().crossVectors(n, up).normalize();
  if (axis.lengthSq() < 1e-8) return;
  const max = THREE.MathUtils.degToRad(maxDeg);
  obj.applyQuaternion(new THREE.Quaternion().setFromAxisAngle(axis, Math.min(angle, max)));
}

/* ============== コンポーネント本体（propsは従来どおり） ============== */
export default function ThreeModelViewer({ dishFolder, folder, plateType = "circle", className }) {
  const mountRef = useRef(null);
  const [error, setError] = useState("");

  const dishBase = useMemo(() => normalizeBase(dishFolder ?? folder ?? null), [dishFolder, folder]);
  const plateBase = useMemo(() => normalizeBase(`/model/plate/${plateType}`), [plateType]);

  useEffect(() => {
    setError("");
    const container = mountRef.current;
    if (!container || !dishBase) return;

    // Three.js セットアップ
    const scene = new THREE.Scene();
    scene.background = null;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(45, Math.max(1, container.clientWidth) / Math.max(1, container.clientHeight), 0.1, 1000);
    camera.position.set(0.6, 0.6, 1.2);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 0, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    const dir = new THREE.DirectionalLight(0xffffff, 0.7);
    dir.position.set(5, 8, 6);
    scene.add(dir);

    const manager = new THREE.LoadingManager();
    let animId = 0;

    (async () => {
      try {
        // 1) 料理
        const dishObj = await loadObjWithMtl(dishBase, manager, { objName: "3DModel.obj", mtlName: "3DModel.mtl" });
        dishObj.traverse((n) => { if (n && n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });

        // 中央寄せ＆スケール → ロバスト水平化 → 回転後のXZ再センタリング
        centerAndScale(dishObj, 0.9);
        autoLevelByBottomPlane(dishObj, { quantile: CFG.levelQuantile, maxDeg: CFG.maxLevelDeg });
        {
          const b = new THREE.Box3().setFromObject(dishObj);
          const c = new THREE.Vector3(); b.getCenter(c);
          dishObj.position.x -= c.x; dishObj.position.z -= c.z;
        }
        const dishBox = new THREE.Box3().setFromObject(dishObj);
        const dishSize = new THREE.Vector3(); dishBox.getSize(dishSize);
        scene.add(dishObj);

        // 2) 皿（失敗しても料理のみ表示）
        if (plateBase) {
          try {
            const plateObj = await loadObjWithMtl(plateBase, manager, { objName: "plate.obj", mtlName: "plate.mtl" });
            centerAndScale(plateObj, 1.0);

            // 皿サイズ：料理XZ * plateScale
            const dishXZ  = Math.max(dishSize.x, dishSize.z) || 1;
            const pBox = new THREE.Box3().setFromObject(plateObj);
            const pSize = new THREE.Vector3(); pBox.getSize(pSize);
            const plateXZ = Math.max(pSize.x, pSize.z) || 1;
            plateObj.scale.multiplyScalar((dishXZ * CFG.plateScale) / plateXZ);

            // 高さ：料理底面の下位分位に接地＋微小隙間
            const pBox2 = new THREE.Box3().setFromObject(plateObj);
            const plateTopY = pBox2.max.y;
            dishObj.updateMatrixWorld(true);
            const dishPts = collectWorldPositions(dishObj);
            const dishBottomY = percentile(dishPts.map((p) => p.y), CFG.bottomPercentile);
            plateObj.position.y += (dishBottomY - plateTopY - CFG.gap);

            // 最終微調整（既定：ほんの少し沈める）
            plateObj.position.x += CFG.plateOffset.x;
            plateObj.position.y += CFG.plateOffset.y;
            plateObj.position.z += CFG.plateOffset.z;

            plateObj.traverse((n) => { if (n && n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });
            scene.add(plateObj);
          } catch (e) {
            console.warn("[ThreeModelViewer] plate load failed:", e);
          }
        }
      } catch (e) {
        console.error(e);
        setError(e?.message || "モデルの読み込みに失敗しました。");
      }
    })();

    const onResize = () => {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);
    onResize();

    const loop = () => {
      animId = requestAnimationFrame(loop);
      controls.update();
      renderer.render(scene, camera);
    };
    loop();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      controls.dispose();
      scene.traverse((n) => {
        if (n && n.isMesh) {
          n.geometry?.dispose?.();
          if (Array.isArray(n.material)) n.material.forEach((m) => m?.dispose?.());
          else n.material?.dispose?.();
        }
      });
      renderer.dispose();
      if (renderer.domElement?.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, [dishBase, plateBase]);

  return (
    <div ref={mountRef} className={className} style={{ width: "100%", height: "100%" }} aria-busy={!!(!error && dishBase)}>
      {error && <p style={{ color: "#ff8a8a", padding: 8, fontSize: 14 }}>{error}</p>}
    </div>
  );
}