"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const MAX_RIPPLES = 4;

const VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`;

// A slow domain-warped aurora (indigo → violet → magenta, with a cyan edge
// light) that bends toward the pointer. Every click sends a ripple through it.
const FRAG = `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uPointer;
uniform float uScroll;
uniform vec3 uRipple[${MAX_RIPPLES}]; // xy = origin (uv), z = birth time

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x),
             mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.02; a *= 0.5; }
  return v;
}

void main() {
  vec2 aspect = vec2(uRes.x / uRes.y, 1.0);
  vec2 p = vUv * aspect;
  vec2 m = uPointer * aspect;

  float t = uTime * 0.045;
  vec2 q = p * 1.35 + vec2(0.0, uScroll * 0.6);

  // Pointer pulls the flow field toward itself.
  vec2 toM = m - p;
  float md = length(toM);
  q += toM * 0.35 * exp(-md * 2.4);

  // Click ripples: expanding rings that warp the field.
  float ring = 0.0;
  for (int i = 0; i < ${MAX_RIPPLES}; i++) {
    float age = uTime - uRipple[i].z;
    if (age > 0.0 && age < 3.2) {
      float d = length(p - uRipple[i].xy * aspect);
      float wave = exp(-pow((d - age * 0.55) * 7.0, 2.0)) * (1.0 - age / 3.2);
      q += normalize(p - uRipple[i].xy * aspect + 1e-4) * wave * 0.18;
      ring += wave;
    }
  }

  vec2 w = vec2(fbm(q + t), fbm(q + vec2(5.2, 1.3) - t));
  float f = fbm(q + 2.4 * w + t * 0.7);

  vec3 deep   = vec3(0.035, 0.03, 0.10);
  vec3 indigo = vec3(0.20, 0.12, 0.56);
  vec3 magenta = vec3(0.95, 0.20, 0.64);
  vec3 cyan   = vec3(0.10, 0.80, 0.90);

  vec3 col = mix(deep, indigo, smoothstep(0.25, 0.75, f));
  col = mix(col, magenta, smoothstep(0.55, 0.95, f) * (0.55 + 0.45 * w.x));
  col += cyan * smoothstep(0.62, 0.9, w.y) * 0.22;

  // Soft light that follows the pointer, and a bright crest on click rings.
  col += mix(magenta, cyan, 0.5) * exp(-md * md * 7.0) * 0.28;
  col += vec3(0.9, 0.7, 1.0) * ring * 0.35;

  // Vignette + faint film grain so gradients never band.
  col *= 1.0 - 0.45 * pow(length(vUv - 0.5) * 1.25, 2.0);
  col += (hash(gl_FragCoord.xy + uTime) - 0.5) * 0.02;

  gl_FragColor = vec4(col, 1.0);
}`;

// Ambient backdrop for the WTF theme: one full-screen shader that reacts to
// the pointer (smoothed), to scroll, and to clicks/taps. It sits under the
// content column, so it listens on window rather than on the canvas.
export function CrazyScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const mount: HTMLDivElement = mountRef.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    mount.appendChild(renderer.domElement);

    const ripples = Array.from({ length: MAX_RIPPLES }, () => new THREE.Vector3(0, 0, -100));
    const uniforms = {
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      uPointer: { value: new THREE.Vector2(0.5, 0.5) },
      uScroll: { value: 0 },
      uRipple: { value: ripples },
    };
    const material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms,
      depthTest: false,
      depthWrite: false,
    });
    const geometry = new THREE.PlaneGeometry(2, 2);
    const scene = new THREE.Scene();
    scene.add(new THREE.Mesh(geometry, material));
    const camera = new THREE.Camera();

    const target = new THREE.Vector2(0.5, 0.5);
    let nextRipple = 0;
    let raf = 0;
    const start = performance.now();

    const toUv = (e: PointerEvent) =>
      target.set(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight);

    function onMove(e: PointerEvent) {
      toUv(e);
      if (reduced) draw();
    }
    function onDown(e: PointerEvent) {
      toUv(e);
      ripples[nextRipple].set(target.x, target.y, uniforms.uTime.value);
      nextRipple = (nextRipple + 1) % MAX_RIPPLES;
      if (reduced) draw();
    }
    function resize() {
      renderer.setSize(window.innerWidth, window.innerHeight);
      uniforms.uRes.value.set(window.innerWidth, window.innerHeight);
      if (reduced) draw();
    }
    function draw() {
      uniforms.uScroll.value = window.scrollY / Math.max(1, document.body.scrollHeight);
      renderer.render(scene, camera);
    }
    function frame(now: number) {
      uniforms.uTime.value = (now - start) / 1000;
      uniforms.uPointer.value.lerp(target, 0.06);
      draw();
      raf = requestAnimationFrame(frame);
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("resize", resize);
    if (reduced) {
      uniforms.uTime.value = 40; // a fixed, pleasant frame — no loop under reduced motion
      uniforms.uPointer.value.copy(target);
      draw();
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("resize", resize);
      geometry.dispose();
      material.dispose();
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
