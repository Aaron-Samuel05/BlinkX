"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

const THUMBS = [
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=700&q=85",
];

function roundedRectGeometry(w:number,h:number,r:number){
  const s=new THREE.Shape();
  const x=-w/2,y=-h/2;
  s.moveTo(x+r,y); s.lineTo(x+w-r,y); s.quadraticCurveTo(x+w,y,x+w,y+r);
  s.lineTo(x+w,y+h-r); s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  s.lineTo(x+r,y+h); s.quadraticCurveTo(x,y+h,x,y+h-r);
  s.lineTo(x,y+r); s.quadraticCurveTo(x,y,x+r,y);
  return new THREE.ShapeGeometry(s,8);
}

function ReelScreen({width,height,z}:{width:number;height:number;z:number}){
  const [texture,setTexture]=useState<THREE.CanvasTexture|null>(null);
  const canvas=useMemo(()=>{
    const c=document.createElement("canvas"); c.width=900; c.height=1900; return c;
  },[]);
  const geometry=useMemo(()=>roundedRectGeometry(width,height,Math.min(width,height)*.075),[width,height]);
  const imagesRef=useRef<HTMLImageElement[]>([]);

  useEffect(()=>{
    const ctx=canvas.getContext("2d"); if(!ctx) return;
    const tex=new THREE.CanvasTexture(canvas);
    tex.colorSpace=THREE.SRGBColorSpace;
    tex.minFilter=THREE.LinearFilter;
    tex.magFilter=THREE.LinearFilter;
    setTexture(tex);

    const draw=()=>{
      ctx.clearRect(0,0,900,1900);
      ctx.fillStyle="rgba(0,0,0,0)"; ctx.clearRect(0,0,900,1900);
      ctx.fillStyle="rgba(255,255,255,.95)"; ctx.font="700 30px Arial"; ctx.fillText("9:41",46,60);
      ctx.fillStyle="rgba(255,255,255,.75)"; ctx.font="700 23px Arial"; ctx.textAlign="right"; ctx.fillText("●  ▪",858,59); ctx.textAlign="left";
      ctx.fillStyle="#050505"; ctx.beginPath(); ctx.roundRect(358,22,184,38,19); ctx.fill();

      const gap=14,left=28,top=92,gridW=844,tileW=(gridW-gap*2)/3,tileH=410;
      imagesRef.current.forEach((img,i)=>{
        if(!img.complete||!img.naturalWidth)return;
        const col=i%3,row=Math.floor(i/3),x=left+col*(tileW+gap),y=top+row*(tileH+gap);
        const scale=Math.max(tileW/img.naturalWidth,tileH/img.naturalHeight);
        const sw=tileW/scale,sh=tileH/scale,sx=(img.naturalWidth-sw)/2,sy=(img.naturalHeight-sh)/2;
        ctx.save(); ctx.beginPath(); ctx.roundRect(x,y,tileW,tileH,24); ctx.clip();
        ctx.drawImage(img,sx,sy,sw,sh,x,y,tileW,tileH);
        ctx.fillStyle="rgba(0,0,0,.12)"; ctx.fillRect(x,y,tileW,tileH); ctx.restore();
        ctx.fillStyle="rgba(255,255,255,.95)"; ctx.font="700 22px Arial"; ctx.fillText(String(i+1),x+18,y+32);
        ctx.fillStyle="rgba(255,255,255,.95)"; ctx.beginPath(); ctx.arc(x+tileW-25,y+tileH-25,15,0,Math.PI*2); ctx.fill();
        ctx.fillStyle="#111"; ctx.beginPath(); ctx.moveTo(x+tileW-20,y+tileH-25); ctx.lineTo(x+tileW-30,y+tileH-32); ctx.lineTo(x+tileW-30,y+tileH-18); ctx.closePath(); ctx.fill();
      });
      ctx.fillStyle="rgba(255,255,255,.92)"; ctx.font="800 25px Arial"; ctx.fillText("REELS",40,1835);
      ctx.fillStyle="rgba(255,255,255,.62)"; ctx.font="600 23px Arial"; ctx.textAlign="right"; ctx.fillText("12 / 12",860,1835); ctx.textAlign="left";
      tex.needsUpdate=true;
    };

    let alive=true;
    Promise.all(THUMBS.map(src=>new Promise<HTMLImageElement>(resolve=>{
      const img=new Image(); img.crossOrigin="anonymous"; img.onload=()=>resolve(img); img.onerror=()=>resolve(img); img.src=src;
    }))).then(images=>{if(alive){imagesRef.current=images;draw();}});
    draw();
    return()=>{alive=false;tex.dispose();};
  },[canvas]);

  useEffect(()=>()=>geometry.dispose(),[geometry]);

  return <mesh geometry={geometry} position={[0,0,z]} renderOrder={4}>
    <meshBasicMaterial map={texture ?? undefined} transparent opacity={texture ? 1 : 0} toneMapped={false} side={THREE.FrontSide}/>
  </mesh>;
}

function PhoneModel({rotationRef}:{rotationRef:React.RefObject<THREE.Group|null>}){
  const {scene}=useGLTF("/iphone 18 pro max blinkxblacked_no_reflection.glb");
  const group=useRef<THREE.Group>(null);
  const model=useMemo(()=>scene.clone(true),[scene]);
  const bounds=useMemo(()=>{
    const box=new THREE.Box3().setFromObject(model);
    return {size:box.getSize(new THREE.Vector3()),center:box.getCenter(new THREE.Vector3()),minZ:box.min.z,maxZ:box.max.z};
  },[model]);

  const scale=5.25/bounds.size.y;
  // Keep the custom Reel screen slightly inside the phone silhouette so its edge
  // never peeks out behind the chassis when the phone is viewed from the side.
  useEffect(()=>{ if(rotationRef) rotationRef.current=group.current; return()=>{ if(rotationRef) rotationRef.current=null; }; },[rotationRef]);
  return <group ref={group} scale={scale} rotation={[-.018,.085,-.055]} position={[-bounds.center.x*scale,-bounds.center.y*scale,-bounds.center.z*scale]}>
    <primitive object={model}/>
  </group>;
}

export default function IPhone3D(){
  const [isMobile,setIsMobile]=useState(false);
  const phoneGroup=useRef<THREE.Group>(null);
  const dragState=useRef({active:false,startX:0,lastX:0,axisLocked:false});

  useEffect(()=>{
    const query=window.matchMedia("(max-width: 768px), (pointer: coarse)");
    const update=()=>setIsMobile(query.matches);
    update();
    query.addEventListener("change",update);
    return()=>query.removeEventListener("change",update);
  },[]);

  useEffect(()=>{
    if(!isMobile) return;
    const canvas=document.querySelector(".heroVisual canvas") as HTMLCanvasElement | null;
    if(!canvas) return;
    canvas.style.touchAction="pan-y";
    const state=dragState.current;

    const onPointerDown=(e:PointerEvent)=>{
      if(e.pointerType!=="touch" && e.pointerType!=="pen") return;
      state.active=true;
      state.axisLocked=false;
      state.startX=e.clientX;
      state.lastX=e.clientX;
    };
    const onPointerMove=(e:PointerEvent)=>{
      if(!state.active || !phoneGroup.current) return;
      const dx=e.clientX-state.lastX;
      const totalX=e.clientX-state.startX;
      const totalY=e.clientY-(e as any).__startY;
      if(!(e as any).__startY) (e as any).__startY=e.clientY;
      const absX=Math.abs(totalX);
      const absY=Math.abs(e.clientY-(e as any).__startY);
      if(!state.axisLocked){
        if(Math.max(absX,absY)<8) return;
        state.axisLocked=absX>absY;
      }
      if(!state.axisLocked) return;
      e.preventDefault();
      phoneGroup.current.rotation.y += dx*0.012;
      state.lastX=e.clientX;
    };
    const onPointerUp=()=>{
      state.active=false;
      state.axisLocked=false;
    };
    canvas.addEventListener("pointerdown",onPointerDown,{passive:true});
    canvas.addEventListener("pointermove",onPointerMove,{passive:false});
    canvas.addEventListener("pointerup",onPointerUp,{passive:true});
    canvas.addEventListener("pointercancel",onPointerUp,{passive:true});
    return()=>{
      canvas.removeEventListener("pointerdown",onPointerDown);
      canvas.removeEventListener("pointermove",onPointerMove);
      canvas.removeEventListener("pointerup",onPointerUp);
      canvas.removeEventListener("pointercancel",onPointerUp);
    };
  },[isMobile]);

  return <Canvas dpr={[1,1.6]} camera={{position:[0,0,10.2],fov:31}} gl={{alpha:true,antialias:true,powerPreference:"high-performance"}} style={{width:"100%",height:"100%",display:"block"}}>
    <ambientLight intensity={1.15}/>
    <directionalLight position={[4,6,8]} intensity={2.8}/>
    <directionalLight position={[-5,2,3]} intensity={1.4}/>
    <Environment preset="studio" environmentIntensity={.7}/>
    <PhoneModel rotationRef={phoneGroup}/>
    <ContactShadows position={[0,-3.15,0]} opacity={.24} scale={5.8} blur={2.6} far={4.5}/>
    {!isMobile && <OrbitControls enablePan={false} enableZoom={false} enableDamping dampingFactor={0.08} rotateSpeed={0.65} minPolarAngle={0} maxPolarAngle={Math.PI} minAzimuthAngle={-Infinity} maxAzimuthAngle={Infinity} />}
  </Canvas>;
}

useGLTF.preload("/iphone 18 pro max blinkxblacked_no_reflection.glb");
