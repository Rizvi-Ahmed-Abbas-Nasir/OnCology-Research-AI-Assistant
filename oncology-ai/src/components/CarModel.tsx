"use client";

import type React from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import { type Mesh, AnimationMixer, Clock, MeshStandardMaterial } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {  Oswald, Courgette } from "next/font/google";
import gsap from "gsap";
import SplitType from "split-type";


// Font Families
// const lobster = Lobster({ subsets: ["latin"], weight: ["400"] });
// const rokkitt = Rokkitt({ subsets: ["latin"], weight: ["200"], preload: false });
const oswald = Oswald({ subsets: ["latin"], weight: ["200"], preload: false });
const courgette = Courgette({ subsets: ["latin"], weight: ["400"], preload: false });

export const ModelViewer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cesaRef = useRef<HTMLHeadingElement | null>(null);
  const [isClient, setIsClient] = useState(false);


  useEffect(() => {
    setIsClient(true);

    if (!isClient || !cesaRef.current) return;

    const cesaSplit = new SplitType(cesaRef.current, { types: "chars" });
          const timeline = gsap.timeline();

    timeline
      .set(cesaSplit.chars, { yPercent: 100, opacity: 0 })
      .to(cesaSplit.chars, {
        yPercent: 0,
        opacity: 1,
        duration: 0.75,
        stagger: 0.05,
        ease: "power4.out",
      });

  }, [isClient]);

  useEffect(() => {
  
    const container = containerRef.current;
    if (container) {
      const preventScroll = (e: WheelEvent) => {
        e.stopPropagation();
      };
      container.addEventListener("wheel", preventScroll, { passive: false });

      return () => {
        container.removeEventListener("wheel", preventScroll);
      };
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex justify-center items-center w-full h-screen overflow-hidden  "
    >
      
      <div className="absolute inset-0 flex mt-[-1rem] flex-col justify-center items-center text-center text-white px-4">
        <p className={`${courgette.className} text-lg sm:text-xl md:text-2xl drop-shadow-md`}>
          Welcome to,
        </p>
        <h2
          ref={cesaRef}
          className={`${oswald.className} text-5xl sm:text-7xl md:text-9xl lg:text-[18rem] xl:text-[22rem] font-bold leading-none drop-shadow-xl`}
        >
          Miles India
        </h2>
        <button className="mt-4 py-[1rem] px-4 sm:py-2 sm:px-6 bg-orange-700 text-white font-bold rounded-[1.2rem] transition transform hover:bg-orange-600 hover:scale-105 text-sm sm:text-lg shadow-lg">
          About Us
        </button>
      </div>

  <div className="absolute bottom-14 right-14 opacity-20 pointer-events-none">
                <svg className="rotating-gear w-32 h-32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ animationDirection: 'reverse' }}>
                    <path fillRule="evenodd" clipRule="evenodd" d="M50 15C51.3807 15 52.5 13.8807 52.5 12.5V5C52.5 3.61929 51.3807 2.5 50 2.5C48.6193 2.5 47.5 3.61929 47.5 5V12.5C47.5 13.8807 48.6193 15 50 15ZM25.4289 25.429C26.3691 26.3692 27.8724 26.3692 28.8126 25.429L34.1421 20.0996C35.0824 19.1593 35.0824 17.656 34.1421 16.7158C33.2019 15.7756 31.6986 15.7756 30.7583 16.7158L25.4289 22.0453C24.4886 22.9855 24.4886 24.4888 25.4289 25.429ZM25.429 74.5711C24.4888 75.5114 22.9855 75.5114 22.0453 74.5711L16.7158 69.2417C15.7756 68.3014 15.7756 66.7981 16.7158 65.8579C17.656 64.9176 19.1593 64.9176 20.0996 65.8579L25.429 71.1874C26.3692 72.1276 26.3692 73.6309 25.429 74.5711ZM77.9545 69.2416L72.625 74.5711C71.6848 75.5113 70.1815 75.5113 69.2412 74.5711C68.301 73.6309 68.301 72.1276 69.2412 71.1873L74.5707 65.8579C75.511 64.9176 77.0142 64.9176 77.9545 65.8579C78.8947 66.7981 78.8947 68.3014 77.9545 69.2416ZM74.571 25.429C73.6308 26.3692 72.1276 26.3692 71.1873 25.429L65.8579 20.0996C64.9176 19.1593 64.9176 17.656 65.8579 16.7158C66.7981 15.7756 68.3014 15.7756 69.2416 16.7158L74.571 22.0453C75.5113 22.9855 75.5113 24.4888 74.571 25.429ZM15 50C15 51.3807 13.8807 52.5 12.5 52.5H5C3.61929 52.5 2.5 51.3807 2.5 50C2.5 48.6193 3.61929 47.5 5 47.5H12.5C13.8807 47.5 15 48.6193 15 50ZM97.5 50C97.5 51.3807 96.3807 52.5 95 52.5H87.5C86.1193 52.5 85 51.3807 85 50C85 48.6193 86.1193 47.5 87.5 47.5H95C96.3807 47.5 97.5 48.6193 97.5 50ZM50 97.5C48.6193 97.5 47.5 96.3807 47.5 95V87.5C47.5 86.1193 48.6193 85 50 85C51.3807 85 52.5 86.1193 52.5 87.5V95C52.5 96.3807 51.3807 97.5 50 97.5ZM38.75 50C38.75 43.7868 43.7868 38.75 50 38.75C56.2132 38.75 61.25 43.7868 61.25 50C61.25 56.2132 56.2132 61.25 50 61.25C43.7868 61.25 38.75 56.2132 38.75 50ZM50 31.25C39.6447 31.25 31.25 39.6447 31.25 50C31.25 60.3553 39.6447 68.75 50 68.75C60.3553 68.75 68.75 60.3553 68.75 50C68.75 39.6447 60.3553 31.25 50 31.25Z" fill="url(#paint0_linear_gear2)" />
                    <defs>
                        <linearGradient id="paint0_linear_gear2" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#FF8A00" />
                            <stop offset="1" stopColor="#FF5C00" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>
      <Canvas
        className="relative w-full md:flex h-full hidden"
        camera={{ position: [2, 2, 5], fov: 50 }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />
        <Environment preset="city" />
        <OrbitControls enableZoom={false} minDistance={3} maxDistance={10} enablePan={true} rotateSpeed={0.5} />
        <TractorModel />
      </Canvas>

      

    </div>
  );
};

export const TractorModel: React.FC = () => {
  const myModel = useLoader(GLTFLoader, "/model_desmuntable_de_pulmo_i_cor_huma_mdeie.glb");
  const modelRef = useRef<Mesh>(null);
  const mixerRef = useRef<AnimationMixer | null>(null);
  const clock = new Clock();

  useEffect(() => {
    if (myModel.animations.length > 0) {
      mixerRef.current = new AnimationMixer(myModel.scene);
      myModel.animations.forEach((clip) => {
        const action = mixerRef.current!.clipAction(clip);
        action.play();
      });
    }

    myModel.scene.traverse((child) => {
      if ((child as Mesh).isMesh) {
        const mesh = child as Mesh;
        if (!mesh.material) {
          mesh.material = new MeshStandardMaterial({ color: "white" });
        }
      }
    });
  }, [myModel]);

  useFrame(() => {
    if (mixerRef.current) {
      mixerRef.current.update(clock.getDelta());
    }
  });

  useFrame((_state, delta) => {
    if (modelRef.current) {
      modelRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group ref={modelRef} scale={0.2} position={[0, -1 , -0.2]} rotation={[0, Math.PI * 3.8, 0]}>
      <primitive object={myModel.scene} />
    </group>
  );
};
