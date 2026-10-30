"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const SPIKES = 22;

// A small spiky green monster that lives in the corner of the WTF theme. Its
// body (a wobbling ball with spikes) is turned by the page scroll; its face
// stays toward the visitor — the eyes follow the pointer and it blinks. Spikes
// flare out while the page is scrolling fast. Drawn on its own tiny canvas, so
// it adds one extra WebGL context on top of the backdrop.
export function CrazyCreature() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const size = () => mount.clientWidth;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(size(), size());
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
    camera.position.z = 6.2;

    scene.add(new THREE.AmbientLight(0x6fbf9a, 0.8));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(2.5, 3, 4);
    scene.add(key);
    const rim = new THREE.PointLight(0x7dff9a, 14, 12);
    rim.position.set(-3, -1.5, 2);
    scene.add(rim);

    // Body: displaced icosphere, vertices wobble around their rest position.
    const bodyGeo = new THREE.IcosahedronGeometry(1, 4);
    const rest = bodyGeo.attributes.position.array.slice() as Float32Array;
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x22d878,
      emissive: 0x053d22,
      roughness: 0.32,
      metalness: 0.1,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    const spin = new THREE.Group();
    spin.add(body);

    // Spikes spread over the sphere (Fibonacci lattice).
    const spikeGeo = new THREE.ConeGeometry(0.11, 0.42, 10);
    spikeGeo.translate(0, 0.21, 0);
    const spikeMat = new THREE.MeshStandardMaterial({
      color: 0xc8ff7a,
      emissive: 0x2c5a10,
      roughness: 0.4,
    });
    const spikes: THREE.Mesh[] = [];
    for (let i = 0; i < SPIKES; i++) {
      const y = 1 - (i / (SPIKES - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const a = i * Math.PI * (3 - Math.sqrt(5));
      const dir = new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r);
      const spike = new THREE.Mesh(spikeGeo, spikeMat);
      spike.position.copy(dir).multiplyScalar(0.98);
      spike.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      spin.add(spike);
      spikes.push(spike);
    }
    scene.add(spin);

    // Face: always drawn on top of the body so spikes never cut through it.
    const face = new THREE.Group();
    face.position.z = 1.05;
    const white = new THREE.MeshBasicMaterial({ color: 0xffffff, depthTest: false });
    const dark = new THREE.MeshBasicMaterial({ color: 0x06180f, depthTest: false });
    const eyes: { lid: THREE.Mesh; pupil: THREE.Mesh }[] = [];
    for (const x of [-0.34, 0.34]) {
      const lid = new THREE.Mesh(new THREE.SphereGeometry(0.24, 20, 16), white);
      lid.position.set(x, 0.12, 0);
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 12), dark);
      pupil.position.set(x, 0.12, 0.2);
      lid.renderOrder = 2;
      pupil.renderOrder = 3;
      face.add(lid, pupil);
      eyes.push({ lid, pupil });
    }
    const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.04, 8, 20, Math.PI), dark);
    mouth.position.set(0, -0.28, 0.1);
    mouth.rotation.z = Math.PI;
    mouth.renderOrder = 2;
    face.add(mouth);
    scene.add(face);

    const pointer = new THREE.Vector2(0, 0);
    const look = new THREE.Vector2(0, 0);
    let scrollTarget = window.scrollY;
    let scrollNow = scrollTarget;
    let flare = 0;
    let raf = 0;
    const tmp = new THREE.Vector3();

    function onMove(e: PointerEvent) {
      const r = mount!.getBoundingClientRect();
      pointer.set(
        THREE.MathUtils.clamp((e.clientX - (r.left + r.width / 2)) / 400, -1, 1),
        THREE.MathUtils.clamp(-(e.clientY - (r.top + r.height / 2)) / 400, -1, 1),
      );
    }
    function onScroll() {
      scrollTarget = window.scrollY;
      if (reduced) draw(0);
    }

    function draw(t: number) {
      scrollNow += (scrollTarget - scrollNow) * 0.12;
      const vel = scrollTarget - scrollNow;
      flare += (Math.min(1, Math.abs(vel) / 120) - flare) * 0.15;

      // Wobble the body.
      if (!reduced) {
        const pos = bodyGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const x = rest[i * 3], y = rest[i * 3 + 1], z = rest[i * 3 + 2];
          const k = 1 + 0.05 * Math.sin(x * 3 + t * 1.6) * Math.cos(y * 3 - t * 1.2) + 0.03 * Math.sin(z * 4 + t);
          pos.setXYZ(i, x * k, y * k, z * k);
        }
        pos.needsUpdate = true;
        bodyGeo.computeVertexNormals();
      }

      spin.rotation.y = scrollNow * 0.006 + t * 0.15;
      spin.rotation.x = Math.sin(scrollNow * 0.003) * 0.6;
      const s = 1 + 0.06 * Math.sin(t * 2);
      spin.scale.setScalar(s);
      for (const sp of spikes) sp.scale.set(1, 1 + flare * 0.9, 1);

      // Eyes follow the pointer; blink every few seconds.
      look.lerp(pointer, 0.12);
      const blink = Math.sin(t * 1.3) > 0.985 ? 0.12 : 1;
      for (const e of eyes) {
        e.lid.scale.y = blink;
        e.pupil.visible = blink > 0.5;
        tmp.set(look.x * 0.09, look.y * 0.08, 0.2);
        e.pupil.position.set(e.lid.position.x + tmp.x, e.lid.position.y + tmp.y, tmp.z);
      }
      face.rotation.y = look.x * 0.25;
      face.rotation.x = -look.y * 0.2;

      renderer.render(scene, camera);
    }
    function frame(now: number) {
      draw(now / 1000);
      raf = requestAnimationFrame(frame);
    }
    function resize() {
      renderer.setSize(size(), size());
      if (reduced) draw(0);
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", resize);
    if (reduced) draw(0);
    else raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
      bodyGeo.dispose();
      bodyMat.dispose();
      spikeGeo.dispose();
      spikeMat.dispose();
      white.dispose();
      dark.dispose();
      for (const e of eyes) {
        e.lid.geometry.dispose();
        e.pupil.geometry.dispose();
      }
      mouth.geometry.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="pointer-events-none fixed bottom-3 left-3 z-[60] h-24 w-24 sm:h-36 sm:w-36 lg:bottom-6 lg:left-auto lg:right-6 lg:h-44 lg:w-44"
    />
  );
}
