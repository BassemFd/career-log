"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const DURATION = 1600; // ms — the "sucked into a wormhole" moment
const PARTICLE_COUNT = 1400;
const PSYCHEDELIC_HUES = [330, 25, 48, 275, 185]; // hot pink, orange, mustard, purple, teal

// Full-viewport three.js tunnel: particles spiral past the camera while it
// rolls and the FOV punches in, hue-cycling through the psychedelic palette.
// three's renderer.setSize() sets both the drawing buffer AND the CSS box
// size, which is what keeps this centered on high-DPR phones — a canvas that
// only sets the .width/.height attributes (not the CSS size) renders at its
// raw device-pixel size instead of the viewport and drifts off-screen.
export function VortexTransition({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef(onComplete);
  doneRef.current = onComplete;

  useEffect(() => {
    if (!mountRef.current) return;
    const mount: HTMLDivElement = mountRef.current;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      200
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    mount.appendChild(renderer.domElement);

    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const radii = new Float32Array(PARTICLE_COUNT);
    const angles = new Float32Array(PARTICLE_COUNT);
    const speeds = new Float32Array(PARTICLE_COUNT);

    const tmpColor = new THREE.Color();
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const radius = 0.5 + Math.random() * 4;
      const angle = Math.random() * Math.PI * 2;
      radii[i] = radius;
      angles[i] = angle;
      speeds[i] = 0.6 + Math.random() * 1.2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = -Math.random() * 100;

      const hue = PSYCHEDELIC_HUES[i % PSYCHEDELIC_HUES.length] + (Math.random() * 20 - 10);
      tmpColor.setHSL(((hue % 360) + 360) % 360 / 360, 0.85, 0.6);
      colors[i * 3] = tmpColor.r;
      colors[i * 3 + 1] = tmpColor.g;
      colors[i * 3 + 2] = tmpColor.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.14,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let raf = 0;
    let done = false;
    const start = performance.now();

    function resize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function cleanup() {
      if (done) return;
      done = true;
      window.removeEventListener("resize", resize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    }

    function frame(now: number) {
      const t = Math.min(1, (now - start) / DURATION);
      const eased = t * t;

      const posAttr = geometry.getAttribute("position") as THREE.BufferAttribute;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        let z = posAttr.getZ(i) + speeds[i] * (0.5 + eased * 5);
        if (z > 2) z -= 100;
        const swirl = angles[i] + eased * 7 + i * 0.0004;
        posAttr.setX(i, Math.cos(swirl) * radii[i]);
        posAttr.setY(i, Math.sin(swirl) * radii[i]);
        posAttr.setZ(i, z);
      }
      posAttr.needsUpdate = true;

      camera.rotation.z = eased * Math.PI * 1.4;
      camera.fov = 75 + eased * 55;
      camera.updateProjectionMatrix();

      renderer.render(scene, camera);

      if (t >= 1) {
        cleanup();
        doneRef.current();
        return;
      }
      raf = requestAnimationFrame(frame);
    }

    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      cleanup();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[100] bg-[#150a20]"
    />
  );
}
