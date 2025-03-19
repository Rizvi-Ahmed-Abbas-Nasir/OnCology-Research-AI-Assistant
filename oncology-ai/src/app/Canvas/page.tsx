"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  FaEraser,
  FaBrush,
  FaImage,
  FaSave,
  FaPalette,
  FaDotCircle,
  FaSlash,
  FaSprayCan,
} from "react-icons/fa";
import AdminHeader from "@/components/Header";


const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState("#ffff");
  const [brushSize, setBrushSize] = useState(5);
  const [brushType, setBrushType] = useState("solid"); 
  const [tool, setTool] = useState("brush"); 
  const [texts, setTexts] = useState<
  { id: number; text: string; x: number; y: number }[]
>([]);
const [draggedText, setDraggedText] = useState<number | null>(null);
const [savedDrawing, setSavedDrawing] = useState<string | null>(null);



  
const handleDoubleClick = (e: any) => {
    const { offsetX, offsetY } = getCoordinates(e);
    const newText = prompt("Enter text:");
    if (newText) {
      const newTextObj = {
        id: Date.now(),
        text: newText,
        x: offsetX,
        y: offsetY,
      };
      setTexts((prev) => [...prev, newTextObj]);
      drawText(newTextObj);
    }
  };



  const handleMouseDown = (e: any) => {
    const { offsetX, offsetY } = getCoordinates(e);
    const clickedText = texts.find(
      (text) =>
        offsetX >= text.x - 10 &&
        offsetX <= text.x + text.text.length * 10 &&
        offsetY >= text.y - 20 &&
        offsetY <= text.y
    );
    if (clickedText) {
      setDraggedText(clickedText.id);
    }
  };
  
  const handleMouseMove = (e: any) => {
    if (draggedText !== null) {
      const { offsetX, offsetY } = getCoordinates(e);
      setTexts((prev) =>
        prev.map((text) =>
          text.id === draggedText ? { ...text, x: offsetX, y: offsetY } : text
        )
      );
      redrawCanvas();
    }
  };
  
  const handleMouseUp = () => {
    setDraggedText(null);
  };
  
  

  
  const drawText = (textObj: { text: string; x: number; y: number }) => {
    const ctx = ctxRef.current;
    if (ctx) {
      const fontSize = brushSize * 5; 
      ctx.font = `${fontSize}px Arial`; 
      ctx.fillStyle = color;
      ctx.fillText(textObj.text, textObj.x, textObj.y);
    }
  };
  
  
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
  
      if (savedDrawing) {
        const img = new Image();
        img.src = savedDrawing;
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          texts.forEach(drawText); 
        };
      } else {
        texts.forEach(drawText);
      }
    }
  };
  
  

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.7;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.lineCap = "round";
      ctxRef.current = ctx;
    }
  }, []);

  const getCoordinates = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { offsetX: 0, offsetY: 0 };
  
    const rect = canvas.getBoundingClientRect(); 
  
    if (
      typeof window !== "undefined" &&
      "TouchEvent" in window &&
      e.nativeEvent instanceof TouchEvent
    ) {
      const touch = e.nativeEvent.touches[0];
      return {
        offsetX: touch.clientX - rect.left,
        offsetY: touch.clientY - rect.top,
      };
    } else {
      // For mouse events
      return {
        offsetX: e.clientX - rect.left, // Correct offset based on canvas position
        offsetY: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: any) => {
    setDrawing(true);
    const { offsetX, offsetY } = getCoordinates(e);
    ctxRef.current?.beginPath();
    ctxRef.current?.moveTo(offsetX, offsetY);
  };

  const draw = (e: any) => {
    if (!drawing || !ctxRef.current) return;
    const { offsetX, offsetY } = getCoordinates(e);

    if (tool === "eraser") {
      ctxRef.current.globalCompositeOperation = "destination-out";
      ctxRef.current.lineWidth = 20;
    } else {
      ctxRef.current.globalCompositeOperation = "source-over";
      ctxRef.current.strokeStyle = color;
      ctxRef.current.lineWidth = brushSize;

      if (brushType === "solid") {
        ctxRef.current.lineTo(offsetX, offsetY);
        ctxRef.current.stroke();
      } else if (brushType === "dotted") {
        drawDottedLine(offsetX, offsetY);
      } else if (brushType === "dashed") {
        drawDashedLine(offsetX, offsetY);
      } else if (brushType === "spray") {
        drawSpray(offsetX, offsetY);
      }
    }
  };

  const stopDrawing = () => {
    setDrawing(false);
    ctxRef.current?.closePath();
    saveDrawing();
  };
  
  const saveDrawing = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      setSavedDrawing(canvas.toDataURL()); 
    }
  };
  

  const drawDottedLine = (x: number, y: number) => {
    const ctx = ctxRef.current;
    if (ctx) {
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 4, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
    }
  };

  const drawDashedLine = (x: number, y: number) => {
    const ctx = ctxRef.current;
    if (ctx) {
      ctx.setLineDash([10, 10]);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  };

  const drawSpray = (x: number, y: number) => {
    const ctx = ctxRef.current;
    if (ctx) {
      for (let i = 0; i < 20; i++) {
        const offsetX = Math.random() * brushSize * 2 - brushSize;
        const offsetY = Math.random() * brushSize * 2 - brushSize;
        ctx.fillStyle = color;
        ctx.fillRect(x + offsetX, y + offsetY, 1, 1);
      }
    }
  };

  const handleColorChange = (e: any) => {
    setColor(e.target.value);
  };

  const handleBrushSizeChange = (e: any) => {
    setBrushSize(Number(e.target.value));
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      ctxRef.current?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const saveCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement("a");
      link.download = "canvas-drawing.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  };

  

  const handleToggle = (collapsed: boolean) => {
    console.log("Menu collapsed:", collapsed);
  };

  return (
      <div className="w-[100%] flex">
          <AdminHeader onToggle={handleToggle} isAdmin={true} />
    <div className="flex flex-col items-center justify-end bg-[#111111] w-full  p-4">
    <div className="bg-[#111111] w-[100%] flex-col flex h-[100vh] justify-center items-center">

    <canvas
  ref={canvasRef}
  className="bg-[#111111] w-auto"
  onMouseDown={(e) => {
    startDrawing(e);
    handleMouseDown(e); 
  }}
  onMouseMove={(e) => {
    draw(e); 
    handleMouseMove(e); 
  }}
  onMouseUp={(e) => {
    stopDrawing();
    handleMouseUp(); 
  }}
  onMouseOut={stopDrawing} 
  onTouchStart={startDrawing} 
  onTouchMove={draw} 
  onTouchEnd={stopDrawing}
  onDoubleClick={handleDoubleClick} 
/>



<div className="flex items-center bg-[#141414] border-2 border-[#f111111] px-6 py-4 rounded-full gap-4 mb-4">
        <input
          type="range"
          min="1"
          max="20"
          value={brushSize}
          onChange={handleBrushSizeChange}
          className="w-32 cursor-pointer"
        />
        <input
          type="color"
          value={color}
          onChange={handleColorChange}
          className="w-10 h-10 border-2 rounded-full"
        />
        <select
          value={brushType}
          onChange={(e) => setBrushType(e.target.value)}
          className="p-2 rounded-lg bg-[#313131] text-white"
        >
          <option value="solid">Solid</option>
          <option value="dotted">Dotted</option>
          <option value="dashed">Dashed</option>
          <option value="spray">Spray</option>
        </select>
        <button
          onClick={() => setTool("brush")}
          className="bg-blue-500 p-2 rounded-lg"
        >
          <FaBrush className="text-white" />
        </button>
        <button
          onClick={() => setTool("eraser")}
          className="bg-red-500 p-2 rounded-lg"
        >
          <FaEraser className="text-white" />
        </button>
        <button
          onClick={clearCanvas}
          className="bg-gray-700 p-2 rounded-lg text-white"
        >
          Clear
        </button>
        <button
          onClick={saveCanvas}
          className="bg-green-500 p-2 rounded-lg text-white"
        >
          <FaSave />
        </button>
      </div>
</div>
     


     
    </div>
    </div>
  );
};

export default Canvas;
