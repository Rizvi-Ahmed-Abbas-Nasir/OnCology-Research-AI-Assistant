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



export const ModelViewer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
 


  return (
    <div
      ref={containerRef}
      className="relative flex justify-center items-center w-full h-screen overflow-hidden  "
    >
      
     

 
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
    <group ref={modelRef} scale={5} position={[0, -1 ,0]} rotation={[0, Math.PI * 3.8, 0]}>
      <primitive object={myModel.scene} />
    </group>
  );
};
