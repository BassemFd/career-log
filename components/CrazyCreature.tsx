"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const SPIKES = 12;

// A glossy black blob with real eyeballs sunk into it, parked in the corner of
// the WTF theme. The body (a wobbling ball with sparse goo spikes) is turned by
// the page scroll and the spikes flare while scrolling fast. Each eye is a small
// globe — sclera, iris, pupil, a glint — set in a rim of the body, that turns to
// follow the pointer and is blinked shut by a lid of the same black goo.
// Drawn on its own tiny canvas, so it adds one WebGL context on top of the backdrop.
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
    camera.position.z = 6.4;

    scene.add(new THREE.AmbientLight(0x6a5aa8, 0.9));
    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(2.5, 3, 4);
    scene.add(key);
    const rimPink = new THREE.PointLight(0xff54b0, 18, 12);
    rimPink.position.set(-3, -1.5, 2);
    scene.add(rimPink);
    const rimViolet = new THREE.PointLight(0xb28cff, 14, 12);
    rimViolet.position.set(3, 2.5, -1);
    scene.add(rimViolet);

    // Goo: near-black, wet-looking, tinted by the coloured lights.
    const gooMat = new THREE.MeshPhysicalMaterial({
      color: 0x0b0716,
      roughness: 0.18,
      metalness: 0.2,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
    });

    const bodyGeo = new THREE.IcosahedronGeometry(1, 4);
    const rest = bodyGeo.attributes.position.array.slice() as Float32Array;
    const body = new THREE.Mesh(bodyGeo, gooMat);
    const spin = new THREE.Group();
    spin.add(body);

    const spikeGeo = new THREE.ConeGeometry(0.09, 0.55, 10);
    spikeGeo.translate(0, 0.27, 0);
    const spikes: THREE.Mesh[] = [];
    for (let i = 0; i < SPIKES; i++) {
      const y = 1 - ((i + 0.5) / SPIKES) * 2;
      const r = Math.sqrt(1 - y * y);
      const a = i * Math.PI * (3 - Math.sqrt(5));
      const dir = new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r);
      const spike = new THREE.Mesh(spikeGeo, gooMat);
      spike.position.copy(dir).multiplyScalar(0.97);
      spike.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      spin.add(spike);
      spikes.push(spike);
    }
    scene.add(spin);

    // Eyes: fixed toward the viewer, sunk into the front of the ball.
    const R = 0.34;
    const scleraMat = new THREE.MeshStandardMaterial({ color: 0xf6f1ea, roughness: 0.25 });
    const irisGeo = new THREE.SphereGeometry(R * 1.01, 32, 16, 0, Math.PI * 2, 0, 0.68);
    const irisMat = new THREE.MeshStandardMaterial({ color: 0xff3fa8, emissive: 0x6a1048, roughness: 0.3 });
    const ringGeo = new THREE.SphereGeometry(R * 1.012, 32, 16, 0, Math.PI * 2, 0.5, 0.18);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0x7b3cff, emissive: 0x2a0f66, roughness: 0.3 });
    const pupilGeo = new THREE.SphereGeometry(R * 1.02, 24, 12, 0, Math.PI * 2, 0, 0.3);
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x050308 });
    const glintGeo = new THREE.SphereGeometry(R * 0.13, 12, 8);
    const glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const eyeGeo = new THREE.SphereGeometry(R, 32, 24);
    const lidGeo = new THREE.SphereGeometry(R * 1.1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const rimGeo = new THREE.TorusGeometry(R * 0.82, 0.075, 12, 32);

    const eyes: { ball: THREE.Group; lid: THREE.Mesh }[] = [];
    const eyeGroup = new THREE.Group();
    for (const x of [-0.4, 0.4]) {
      const eye = new THREE.Group();
      eye.position.set(x, 0.14, 0.78);

      const ball = new THREE.Group();
      ball.add(new THREE.Mesh(eyeGeo, scleraMat));
      // Iris/pupil caps are built around +y, so turn them to face +z.
      const face = new THREE.Group();
      face.rotation.x = Math.PI / 2;
      face.add(new THREE.Mesh(irisGeo, irisMat), new THREE.Mesh(ringGeo, ringMat), new THREE.Mesh(pupilGeo, pupilMat));
      ball.add(face);
      eye.add(ball);

      const glint = new THREE.Mesh(glintGeo, glintMat);
      glint.position.set(R * 0.38, R * 0.42, R * 0.82);
      eye.add(glint);

      const lid = new THREE.Mesh(lidGeo, gooMat);
      eye.add(lid);

      const rim = new THREE.Mesh(rimGeo, gooMat);
      rim.position.z = 0.17;
      eye.add(rim);

      eyeGroup.add(eye);
      eyes.push({ ball, lid });
    }
    scene.add(eyeGroup);

    const pointer = new THREE.Vector2(0, 0);
    const look = new THREE.Vector2(0, 0);
    let scrollTarget = window.scrollY;
    let scrollNow = scrollTarget;
    let flare = 0;
    let raf = 0;

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

      if (!reduced) {
        const pos = bodyGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const x = rest[i * 3], y = rest[i * 3 + 1], z = rest[i * 3 + 2];
          const k = 1 + 0.045 * Math.sin(x * 3 + t * 1.5) * Math.cos(y * 3 - t * 1.1) + 0.03 * Math.sin(z * 4 + t);
          pos.setXYZ(i, x * k, y * k, z * k);
        }
        pos.needsUpdate = true;
        bodyGeo.computeVertexNormals();
      }

      spin.rotation.y = scrollNow * 0.006 + t * 0.12;
      spin.rotation.x = Math.sin(scrollNow * 0.003) * 0.6;
      spin.scale.setScalar(1 + 0.05 * Math.sin(t * 2));
      for (const sp of spikes) sp.scale.set(1, 0.7 + flare * 0.9, 1);

      look.lerp(pointer, 0.12);
      const closed = !reduced && Math.sin(t * 1.3) > 0.996;
      for (const e of eyes) {
        e.ball.rotation.y = look.x * 0.55;
        e.ball.rotation.x = -look.y * 0.45;
        // Lid: pole tilted back = open, tilted to +z = closed over the globe.
        e.lid.rotation.x = closed ? Math.PI / 2 - 0.1 : -1.0;
      }
      eyeGroup.rotation.y = look.x * 0.18;
      eyeGroup.rotation.x = -look.y * 0.14;

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
      for (const g of [bodyGeo, spikeGeo, irisGeo, ringGeo, pupilGeo, glintGeo, eyeGeo, lidGeo, rimGeo]) g.dispose();
      for (const m of [gooMat, scleraMat, irisMat, ringMat, pupilMat, glintMat]) m.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="pointer-events-none fixed bottom-3 left-3 z-[60] h-28 w-28 sm:h-40 sm:w-40 lg:bottom-6 lg:left-auto lg:right-6 lg:h-52 lg:w-52"
    />
  );
}
