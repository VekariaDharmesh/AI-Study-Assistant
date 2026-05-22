'use client';

import React, { useRef, useEffect } from 'react';

interface WaveformProps {
  isRecording: boolean;
  stream: MediaStream | null;
}

export default function WaveformVisualizer({ isRecording, stream }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  // Set up real audio analysis when recording starts with a real stream
  useEffect(() => {
    if (isRecording && stream) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioCtxRef.current = ctx;

        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        source.connect(analyser);
        
        analyserRef.current = analyser;
        dataArrayRef.current = dataArray;
      } catch (e) {
        console.warn("Real audio visualizer setup failed, falling back to simulation.", e);
      }
    }

    return () => {
      // Clean audio layers
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      analyserRef.current = null;
      dataArrayRef.current = null;
    };
  }, [isRecording, stream]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle canvas sizing for high DPI screens
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let phase = 0;

    const render = () => {
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);
      
      // 1. Clear with gradient transparency
      ctx.clearRect(0, 0, w, h);
      
      // Wave design variables
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 12;

      const analyser = analyserRef.current;
      const dataArray = dataArrayRef.current;

      if (isRecording) {
        if (analyser && dataArray) {
          // A. Draw REAL voice wave graph
          analyser.getByteTimeDomainData(dataArray as any);
          
          ctx.beginPath();
          // Gradient fill
          const grad = ctx.createLinearGradient(0, 0, w, 0);
          grad.addColorStop(0, '#6366f1'); // Indigo
          grad.addColorStop(1, '#06b6d4'); // Cyan
          ctx.strokeStyle = grad;
          ctx.shadowColor = 'rgba(99, 102, 241, 0.4)';

          const sliceWidth = w / dataArray.length;
          let x = 0;

          for (let i = 0; i < dataArray.length; i++) {
            const v = dataArray[i] / 128.0; // Normalized -1.0 to 1.0
            const y = (v * h) / 2;

            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }

            x += sliceWidth;
          }

          ctx.lineTo(w, h / 2);
          ctx.stroke();
        } else {
          // B. Draw simulated voice wave graph (using dynamic overlapping mathematical waves)
          phase += 0.15;
          const numWaves = 3;
          const colors = [
            'rgba(99, 102, 241, 0.85)', // Strong Indigo
            'rgba(6, 182, 212, 0.65)',  // Cyan
            'rgba(236, 72, 153, 0.4)'    // Pink overlay
          ];

          for (let wIndex = 0; wIndex < numWaves; wIndex++) {
            ctx.beginPath();
            ctx.strokeStyle = colors[wIndex];
            ctx.shadowColor = colors[wIndex];
            
            // Adjust wave parameters for diversity
            const waveOffset = wIndex * 40;
            const frequency = 0.015 - wIndex * 0.003;
            const amplitude = 32 - wIndex * 8;
            
            ctx.moveTo(0, h / 2);

            for (let x = 0; x < w; x++) {
              // Mathematical wave: multi-octave sine wave overlay
              const sineValue = Math.sin(x * frequency + phase + waveOffset) * 
                                Math.cos(x * 0.005 - phase * 0.2);
              
              // Scale down amplitude towards edges (pinching effect)
              const pinch = Math.sin((x / w) * Math.PI);
              
              const y = h / 2 + sineValue * amplitude * pinch;
              ctx.lineTo(x, y);
            }
            ctx.stroke();
          }
        }
      } else {
        // C. Draw resting wave (flat ambient line)
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.shadowBlur = 0;
        ctx.moveTo(0, h / 2);
        
        phase += 0.02;
        for (let x = 0; x < w; x++) {
          const y = h / 2 + Math.sin(x * 0.025 + phase) * 2;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isRecording]);

  return (
    <div className="w-full h-24 rounded-2xl bg-black/10 border border-white/5 relative overflow-hidden flex items-center justify-center p-2">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full block" 
      />
      {!isRecording && (
        <span className="absolute text-[10px] font-bold text-text-muted/60 tracking-wider uppercase pointer-events-none">
          Microphone Standby
        </span>
      )}
    </div>
  );
}
