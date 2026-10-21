'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { FileText, Video, Sparkles, CheckCircle2 } from 'lucide-react';

export default function HeroOrb() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
        return;
      }
    } catch {
      setHasWebGL(false);
      return;
    }

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 4.2;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    container.appendChild(renderer.domElement);

    // Core Orb - Icosahedron with Soft Lavender Wireframe
    const geometry = new THREE.IcosahedronGeometry(1.25, 2);
    const material = new THREE.MeshStandardMaterial({
      color: 0x6658E8,
      wireframe: true,
      roughness: 0.3,
      metalness: 0.2,
      transparent: true,
      opacity: 0.85,
    });
    const orb = new THREE.Mesh(geometry, material);
    scene.add(orb);

    // Inner Glowing Core
    const innerGeometry = new THREE.SphereGeometry(0.75, 24, 24);
    const innerMaterial = new THREE.MeshBasicMaterial({
      color: 0x8D7CF5,
      transparent: true,
      opacity: 0.45,
    });
    const innerOrb = new THREE.Mesh(innerGeometry, innerMaterial);
    scene.add(innerOrb);

    // Subtle Elliptical Rings
    const ringGeometry = new THREE.TorusGeometry(1.9, 0.015, 16, 100);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x8D7CF5,
      transparent: true,
      opacity: 0.35,
    });
    const ring1 = new THREE.Mesh(ringGeometry, ringMaterial);
    ring1.rotation.x = Math.PI / 3;
    ring1.rotation.y = Math.PI / 6;
    scene.add(ring1);

    const ring2 = new THREE.Mesh(ringGeometry, ringMaterial);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.y = -Math.PI / 4;
    scene.add(ring2);

    // Soft Lavender & Ambient Lighting
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x8D7CF5, 2, 10);
    pointLight.position.set(3, 3, 3);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0x6658E8, 1.5, 10);
    pointLight2.position.set(-3, -2, 2);
    scene.add(pointLight2);

    // Mouse Parallax
    let targetX = 0;
    let targetY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetX = x * 0.3;
      targetY = y * 0.3;
    };

    const mediaReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const isReducedMotion = mediaReducedMotion.matches;

    if (!isReducedMotion) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (!isReducedMotion) {
        orb.rotation.y += delta * 0.25;
        orb.rotation.x += delta * 0.15;
        ring1.rotation.z += delta * 0.1;
        ring2.rotation.z -= delta * 0.08;

        // Smooth spring parallax
        orb.rotation.x += (targetY - orb.rotation.x) * 0.05;
        orb.rotation.y += (targetX - orb.rotation.y) * 0.05;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth || 400;
      const newHeight = container.clientHeight || 400;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      innerGeometry.dispose();
      innerMaterial.dispose();
      ringGeometry.dispose();
      ringMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative flex h-[400px] sm:h-[460px] md:h-[500px] w-full max-w-[500px] mx-auto items-center justify-center">
      {/* Three.js Canvas Container */}
      <div ref={containerRef} className="h-full w-full max-w-[480px]" />

      {/* Fallback if WebGL is unavailable */}
      {!hasWebGL && (
        <div className="flex h-56 w-56 items-center justify-center rounded-full bg-gradient-to-tr from-[#6658E8] to-[#8D7CF5] p-1 shadow-xl">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-[#6658E8]">
            <Sparkles className="h-16 w-16" />
          </div>
        </div>
      )}

      {/* Floating Info Panels (Section 4 Spec) */}
      <motion.div
        initial={{ opacity: 0, x: -20, y: 10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="absolute left-0 sm:left-4 top-6 flex items-center gap-3 rounded-2xl border border-[#E9E9F2] bg-white/95 px-4 py-2.5 text-xs font-semibold text-[#202238] shadow-md backdrop-blur-sm z-10"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F0EDFF] text-[#6658E8]">
          <FileText className="h-4 w-4" />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-xs font-bold text-[#202238]">Document Parsing</span>
          <span className="text-[11px] text-[#777C94] font-normal">.pdf, .doc, .docx, .ppt</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20, y: 20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.6, delay: 0.45 }}
        className="absolute right-0 sm:right-4 bottom-16 flex items-center gap-3 rounded-2xl border border-[#E9E9F2] bg-white/95 px-4 py-2.5 text-xs font-semibold text-[#202238] shadow-md backdrop-blur-sm z-10"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E7F7F0] text-[#15803D]">
          <CheckCircle2 className="h-4 w-4" />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-xs font-bold text-[#202238]">Grounding Assurance</span>
          <span className="text-[11px] text-[#777C94] font-normal">Zero hallucinations</span>
        </div>
      </motion.div>

      {/* Miniature preview of chat interface (Section 4 Spec) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2.5 rounded-full border border-[#E9E9F2] bg-white/95 px-4 py-2 text-xs font-medium text-[#777C94] shadow-sm backdrop-blur-sm z-10 whitespace-nowrap"
      >
        <span className="h-2 w-2 rounded-full bg-[#6658E8] animate-pulse" />
        <span>Ask: &quot;Summarize clause 14 in Master_Agreement.pdf&quot;</span>
      </motion.div>
    </div>
  );
}
