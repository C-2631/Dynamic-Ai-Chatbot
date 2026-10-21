'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function NeuralCore3D() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 360;
    const height = container.clientHeight || 360;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 4.6;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // Core Icosahedron with premium indigo material
    const coreGeo = new THREE.IcosahedronGeometry(1.2, 2);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x4338CA,
      roughness: 0.25,
      metalness: 0.8,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    group.add(coreMesh);

    // Outer Translucent Wireframe Shell
    const cageGeo = new THREE.IcosahedronGeometry(1.65, 1);
    const cageMat = new THREE.MeshStandardMaterial({
      color: 0x818CF8,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const cageMesh = new THREE.Mesh(cageGeo, cageMat);
    group.add(cageMesh);

    // Surrounding Particle Field
    const particleCount = 100;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const radius = 1.9 + Math.random() * 0.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;

      positions[i * 3] = radius * Math.cos(theta) * Math.cos(phi);
      positions[i * 3 + 1] = radius * Math.sin(phi);
      positions[i * 3 + 2] = radius * Math.sin(theta) * Math.cos(phi);
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x6366F1,
      size: 0.035,
      transparent: true,
      opacity: 0.65,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    group.add(particles);

    // Studio Lights for high-end light-theme aesthetics
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x6366F1, 2.2);
    keyLight.position.set(5, 5, 4);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xC7D2FE, 1.4);
    fillLight.position.set(-5, -4, -2);
    scene.add(fillLight);

    // Mouse responsiveness
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / width - 0.5;
      const y = (e.clientY - rect.top) / height - 0.5;
      mouseX = x * 1.5;
      mouseY = y * 1.5;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });

    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Continuous ambient rotation
      coreMesh.rotation.y = elapsedTime * 0.22;
      coreMesh.rotation.x = elapsedTime * 0.14;

      cageMesh.rotation.y = -elapsedTime * 0.3;
      cageMesh.rotation.z = elapsedTime * 0.18;

      particles.rotation.y = elapsedTime * 0.08;

      // Mouse inertia damping
      targetRotY += (mouseX - targetRotY) * 0.06;
      targetRotX += (mouseY - targetRotX) * 0.06;

      group.rotation.y = targetRotY;
      group.rotation.x = targetRotX;

      // Subtle float breathing
      group.position.y = Math.sin(elapsedTime * 1.6) * 0.06;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      coreGeo.dispose();
      coreMat.dispose();
      cageGeo.dispose();
      cageMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative h-full w-full flex items-center justify-center">
      <div ref={mountRef} className="h-full w-full min-h-[300px]" />
      <div className="pointer-events-none absolute h-56 w-56 rounded-full bg-indigo-400/15 blur-3xl -z-10" />
    </div>
  );
}
