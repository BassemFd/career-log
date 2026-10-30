"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useLocale } from "./LocaleProvider";
import { STRINGS } from "@/lib/strings";

const SPIKES = 12;
const FOV = 12; // narrow, so the blob can swell to fill the screen without clipping the camera
const CAM_Z = 19.2; // keeps the framing of a 35° lens at 6.4
const EAT_ANTICIPATE = 0.35; // seconds: squash before the growth
const EAT_CHOMP = 4.8; // seconds: slow then ever faster growth, jaws wide, then CHOMP
const EAT_COVER = 5.4; // seconds: the body swells over the whole screen after the bite
const EAT_OVER = 5.9; // seconds until the game-over card

type Phase = "idle" | "eating" | "chomp" | "over";

const easeOut = (x: number) => 1 - (1 - x) * (1 - x);
const easeIn = (x: number) => x * x;
const easeInOut = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);

// A glossy black blob with real eyeballs sunk into it, parked in the corner of
// the WTF theme. The body (a wobbling ball with sparse goo spikes) is turned by
// the page scroll and the spikes flare while scrolling fast. Each eye is a small
// globe — sclera, iris, pupil, a glint — set in a rim of the body, that turns to
// follow the pointer and is blinked shut by a lid of the same black goo.
// Poke it and it swells, opens a mouth and swallows the page: game over, restart.
// Drawn on its own tiny canvas (full viewport while it eats), so it adds one WebGL
// context on top of the backdrop.
export function CrazyCreature() {
  const mountRef = useRef<HTMLButtonElement>(null);
  const restartRef = useRef<HTMLButtonElement>(null);
  const apiRef = useRef<{ eat: () => void; reset: () => void } | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const { locale } = useLocale();
  const t = STRINGS[locale];

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const smallSize = () => mount.clientWidth;
    let full = false; // true while the canvas covers the viewport (eating / game over)
    const sizeNow = () => (full ? { w: window.innerWidth, h: window.innerHeight } : { w: smallSize(), h: smallSize() });

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(smallSize(), smallSize());
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
    camera.position.z = CAM_Z;

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
    const rig = new THREE.Group();
    rig.add(spin);
    scene.add(rig);

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
    rig.add(eyeGroup);

    // Mouth: two dark caps hugging the front of the ball, ringed with teeth.
    // Hidden until the monster eats.
    const mouthPivot = new THREE.Group();
    mouthPivot.rotation.x = 0.32;
    mouthPivot.visible = false;
    const mouth = new THREE.Group();
    mouthPivot.add(mouth);
    const capGeo = new THREE.SphereGeometry(1.012, 40, 16, 0, Math.PI * 2, 0, 0.55);
    const throatGeo = new THREE.SphereGeometry(1.016, 40, 16, 0, Math.PI * 2, 0, 0.4);
    const capMat = new THREE.MeshBasicMaterial({ color: 0x1a0314 });
    const throatMat = new THREE.MeshBasicMaterial({ color: 0x7a1048 });
    const faceUp = new THREE.Group();
    faceUp.rotation.x = Math.PI / 2;
    faceUp.add(new THREE.Mesh(capGeo, capMat), new THREE.Mesh(throatGeo, throatMat));
    mouth.add(faceUp);
    const toothGeo = new THREE.ConeGeometry(0.045, 0.2, 8);
    toothGeo.translate(0, 0.1, 0);
    const toothMat = new THREE.MeshStandardMaterial({ color: 0xfaf6ee, roughness: 0.3 });
    const up = new THREE.Vector3(0, 1, 0);
    for (const [a0, a1] of [[0.2, 0.8], [1.2, 1.8]]) {
      for (let i = 0; i < 8; i++) {
        const phi = (a0 + ((a1 - a0) * i) / 7) * Math.PI;
        const th = 0.52;
        const P = new THREE.Vector3(Math.sin(th) * Math.cos(phi), Math.sin(th) * Math.sin(phi), Math.cos(th));
        const tan = new THREE.Vector3(Math.cos(th) * Math.cos(phi), Math.cos(th) * Math.sin(phi), -Math.sin(th));
        const dir = tan.multiplyScalar(-0.8).add(P.clone().multiplyScalar(0.6)).normalize();
        const tooth = new THREE.Mesh(toothGeo, toothMat);
        tooth.position.copy(P).multiplyScalar(1.01);
        tooth.quaternion.setFromUnitVectors(up, dir);
        mouth.add(tooth);
      }
    }
    rig.add(mouthPivot);

    const pointer = new THREE.Vector2(0, 0);
    const look = new THREE.Vector2(0, 0);
    let scrollTarget = window.scrollY;
    let scrollNow = scrollTarget;
    let flare = 0;
    let raf = 0;
    let hover = false;
    let hoverScale = 1;
    let mode: Phase = "idle";
    let eatStart = 0;
    let startX = 0;
    let startY = 0;
    let s0 = 1;
    let sPre = 1; // scale when the jaws are about to shut
    let sEnd = 1;
    let forceClose = false;
    let chompShown = false;
    let overShown = false;
    const halfH = CAM_Z * Math.tan((FOV / 2) * (Math.PI / 180));

    function setSize() {
      const { w, h } = sizeNow();
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }

    function eat() {
      if (mode !== "idle" || reduced) return;
      const r = mount!.getBoundingClientRect();
      const W = window.innerWidth;
      const H = window.innerHeight;
      const unit = H / 2 / halfH; // pixels per world unit in the full-viewport view
      s0 = r.height / H;
      startX = (r.left + r.width / 2 - W / 2) / unit;
      startY = -(r.top + r.height / 2 - H / 2) / unit;
      sPre = Math.max(H * 0.72, W * 0.44) / unit;
      sEnd = (Math.hypot(W, H) / unit) * 1.25;
      full = true;
      Object.assign(mount!.style, {
        position: "fixed",
        inset: "0",
        width: "100vw",
        height: "100vh",
        zIndex: "90",
        borderRadius: "0",
        pointerEvents: "none",
      });
      document.documentElement.style.overflow = "hidden";
      setSize();
      mouthPivot.visible = true;
      mode = "eating";
      overShown = false;
      chompShown = false;
      eatStart = performance.now();
      setPhase("eating");
    }

    function reset() {
      if (mode === "idle") return;
      mode = "idle";
      full = false;
      mount!.removeAttribute("style");
      forceClose = false;
      document.documentElement.style.overflow = "";
      rig.position.set(0, 0, 0);
      rig.scale.setScalar(1);
      mouthPivot.visible = false;
      setSize();
      setPhase("idle");
    }
    apiRef.current = { eat, reset };

    function onOver() {
      hover = true;
    }
    function onOut() {
      hover = false;
    }
    mount.addEventListener("pointerenter", onOver);
    mount.addEventListener("pointerleave", onOut);

    function onMove(e: PointerEvent) {
      const r = mount!.getBoundingClientRect();
      if (full) {
        pointer.set(0, 0);
        return;
      }
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
      hoverScale += ((hover && mode === "idle" ? 1.1 : 1) - hoverScale) * 0.15;
      spin.scale.setScalar((1 + 0.05 * Math.sin(t * 2)) * hoverScale);

      if (mode === "eating") {
        const et = (performance.now() - eatStart) / 1000;
        let S: number;
        let open: number;
        if (et < EAT_ANTICIPATE) {
          S = s0 * (1 - 0.15 * easeOut(et / EAT_ANTICIPATE));
          open = 0;
        } else if (et < EAT_CHOMP) {
          // Slow at first, then faster and faster.
          const g = (et - EAT_ANTICIPATE) / (EAT_CHOMP - EAT_ANTICIPATE);
          S = s0 * 0.85 + (sPre - s0 * 0.85) * Math.pow(g, 3);
          open = Math.pow(Math.min(1, Math.max(0, (et - 1.0) / (EAT_CHOMP - 1.2))), 1.3);
          open += 0.05 * open * Math.sin(et * 10);
        } else {
          // CHOMP: the jaws slam shut, the body lunges over the screen.
          const c = Math.min(1, (et - EAT_CHOMP) / (EAT_COVER - EAT_CHOMP));
          S = sPre * (1 + (sEnd / sPre - 1) * easeIn(c));
          open = Math.max(0, 1 - (et - EAT_CHOMP) / 0.14);
          if (!chompShown) {
            chompShown = true;
            setPhase("chomp");
          }
        }
        rig.scale.setScalar(S);
        const move = easeInOut(Math.min(1, Math.max(0, (et - EAT_ANTICIPATE) / 3.2)));
        rig.position.set(startX * (1 - move), startY * (1 - move), 0);
        mouth.scale.set(1 + 0.75 * open, 0.1 + 0.95 * open, 1);
        mouthPivot.position.y = -0.05 * open;
        spin.rotation.x *= 0.96;
        const rage = Math.min(1, Math.max(0, (et - 1) / (EAT_CHOMP - 1)));
        for (const sp of spikes) sp.scale.set(1, 0.7 + rage * (0.8 + 0.3 * Math.sin(et * 9 + sp.id)), 1);
        forceClose = et > EAT_CHOMP - 0.05 && et < EAT_CHOMP + 1.2;
        // A short shake on impact.
        const sinceBite = et - EAT_CHOMP;
        if (sinceBite > 0 && sinceBite < 0.6) {
          const k = (1 - sinceBite / 0.6) * 18;
          mount!.style.transform = `translate(${(Math.random() - 0.5) * k}px, ${(Math.random() - 0.5) * k}px)`;
        } else if (sinceBite >= 0.6) {
          mount!.style.transform = "";
        }
        if (!overShown && et >= EAT_OVER) {
          overShown = true;
          mode = "over";
          forceClose = false;
          setPhase("over");
        }
      }

      look.lerp(pointer, 0.12);
      const closed = forceClose || (!reduced && Math.sin(t * 1.3) > 0.996);
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
      setSize();
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
      mount.removeEventListener("pointerenter", onOver);
      mount.removeEventListener("pointerleave", onOut);
      document.documentElement.style.overflow = "";
      apiRef.current = null;
      for (const g of [bodyGeo, spikeGeo, irisGeo, ringGeo, pupilGeo, glintGeo, eyeGeo, lidGeo, rimGeo, capGeo, throatGeo, toothGeo]) g.dispose();
      for (const m of [gooMat, scleraMat, irisMat, ringMat, pupilMat, glintMat, capMat, throatMat, toothMat]) m.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  // Escape always gets you out of the game-over screen.
  useEffect(() => {
    if (phase === "idle") return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && apiRef.current?.reset();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  useEffect(() => {
    if (phase === "over") restartRef.current?.focus();
  }, [phase]);

  return (
    <>
      <button
        ref={mountRef}
        type="button"
        aria-label={t.monsterLabel}
        onClick={() => apiRef.current?.eat()}
        className="fixed bottom-3 left-3 z-[60] h-28 w-28 cursor-pointer rounded-full motion-reduce:pointer-events-none sm:h-40 sm:w-40 lg:bottom-6 lg:left-auto lg:right-6 lg:h-52 lg:w-52"
      />
      {phase === "chomp" && (
        <div aria-hidden="true" className="monster-chomp fixed inset-0 z-[95] grid place-items-center">
          <span className="font-display text-7xl font-black sm:text-9xl">{t.monsterChomp}</span>
        </div>
      )}
      {phase === "over" && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="monster-over-title"
          className="monster-over fixed inset-0 z-[100] grid place-items-center px-6 text-center"
        >
          <div>
            <h2
              id="monster-over-title"
              className="font-display text-5xl font-bold tracking-tight sm:text-7xl"
            >
              {t.gameOverTitle}
            </h2>
            <p className="mt-4 text-lg text-muted">{t.gameOverText}</p>
            <button
              ref={restartRef}
              type="button"
              onClick={() => apiRef.current?.reset()}
              className="mt-8 rounded-lg bg-accent px-6 py-3 font-mono text-sm font-bold text-paper transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              {t.gameOverRestart}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
