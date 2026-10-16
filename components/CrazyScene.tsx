"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const HUES = [330, 25, 48, 275, 185]; // hot pink, orange, mustard, purple, teal

// The ambient backdrop for crazy mode: a drifting field of glowing particles
// (confetti reimagined with real depth/parallax instead of flat CSS divs)
// plus two morphing wireframe shapes — original abstract forms, no IP —
// standing in for "unexpected things happening" in the background.
export function CrazyScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const mount: HTMLDivElement = mountRef.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.z = 18;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    mount.appendChild(renderer.domElement);

    const COUNT = reduced ? 140 : 420;
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const tmpColor = new THREE.Color();
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 44;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 26;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
      tmpColor.setHSL(HUES[i % HUES.length] / 360, 0.85, 0.65);
      colors[i * 3] = tmpColor.r;
      colors[i * 3 + 1] = tmpColor.g;
      colors[i * 3 + 2] = tmpColor.b;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({
      size: 0.24,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    const shapeGeoA = new THREE.IcosahedronGeometry(2.6, 1);
    const shapeMatA = new THREE.MeshBasicMaterial({
      color: 0xff2d95,
      wireframe: true,
      transparent: true,
      opacity: 0.55,
    });
    const shapeA = new THREE.Mesh(shapeGeoA, shapeMatA);
    shapeA.position.set(-6, 2, -4);
    scene.add(shapeA);

    const shapeGeoB = new THREE.TorusKnotGeometry(1.6, 0.5, 120, 16);
    const shapeMatB = new THREE.MeshBasicMaterial({
      color: 0x00c2cb,
      wireframe: true,
      transparent: true,
      opacity: 0.55,
    });
    const shapeB = new THREE.Mesh(shapeGeoB, shapeMatB);
    shapeB.position.set(6, -2, -6);
    scene.add(shapeB);

    let raf = 0;

    function resize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function frame(now: number) {
      const t = now * 0.001;
      particles.rotation.y = t * 0.05;
      particles.rotation.x = t * 0.02;

      shapeA.rotation.x = t * 0.4;
      shapeA.rotation.y = t * 0.3;
      shapeA.position.y = 2 + Math.sin(t * 0.6) * 1.2;

      shapeB.rotation.x = t * -0.25;
      shapeB.rotation.y = t * 0.5;
      shapeB.position.y = -2 + Math.cos(t * 0.5) * 1.2;

      renderer.render(scene, camera);
      if (!reduced) raf = requestAnimationFrame(frame);
    }

    window.addEventListener("resize", resize);
    renderer.render(scene, camera);
    if (!reduced) raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      geometry.dispose();
      material.dispose();
      shapeGeoA.dispose();
      shapeMatA.dispose();
      shapeGeoB.dispose();
      shapeMatB.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[20]"
    />
  );
}
