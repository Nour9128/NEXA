import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { NexaCore, CoreState } from './NexaCore';
import { Sparkles, Brain, Cpu } from 'lucide-react';

interface NexaCoreCanvasProps {
  state?: CoreState;
  className?: string;
  interactive?: boolean;
  showStatusTooltip?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// Fallback component for devices without WebGL or reduced motion
const FallbackCore: React.FC<{ state: CoreState }> = ({ state }) => {
  return (
    <div className="relative flex items-center justify-center w-full h-full min-h-[280px]">
      <div className="absolute w-44 h-44 rounded-full bg-indigo-600/20 blur-2xl animate-pulse" />
      <div className="absolute w-36 h-36 rounded-full border border-cyan-400/30 animate-spin" style={{ animationDuration: '14s' }} />
      <div className="absolute w-48 h-48 rounded-full border border-purple-500/20 animate-spin" style={{ animationDuration: '22s', animationDirection: 'reverse' }} />
      
      <div className="relative z-10 flex flex-col items-center justify-center w-28 h-28 rounded-full bg-gradient-to-tr from-indigo-900/80 via-purple-900/60 to-cyan-900/80 border border-cyan-400/40 shadow-glow-primary backdrop-blur-md">
        <Cpu className="w-10 h-10 text-cyan-300 animate-pulse" />
        <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-200 mt-1">NEXA CORE</span>
      </div>
    </div>
  );
};

export const NexaCoreCanvas: React.FC<NexaCoreCanvasProps> = ({
  state = 'idle',
  className = 'w-full h-[400px]',
  interactive = true,
  showStatusTooltip = true,
  size = 'md',
}) => {
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [clickCount, setClickCount] = useState<number>(0);

  // Check WebGL availability
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      setHasWebGL(Boolean(gl));
    } catch {
      setHasWebGL(false);
    }
  }, []);

  if (!hasWebGL) {
    return <FallbackCore state={state} />;
  }

  const cameraDistance = size === 'sm' ? 6 : size === 'lg' ? 4.8 : 5.4;

  return (
    <div className={`relative ${className} select-none`}>
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, cameraDistance], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.5} />
        <Suspense fallback={null}>
          <Float
            speed={interactive ? 1.5 : 0.8}
            rotationIntensity={0.6}
            floatIntensity={0.8}
          >
            <NexaCore
              state={state}
              onHover={interactive ? setIsHovered : undefined}
              onClick={() => setClickCount(c => c + 1)}
            />
          </Float>
        </Suspense>
      </Canvas>

      {/* Interactive Tooltip / Status Badge */}
      {showStatusTooltip && (
        <div
          className={`absolute bottom-4 left-1/2 -translate-x-1/2 transition-all duration-300 pointer-events-none px-4 py-2 rounded-full glass-panel border border-white/10 flex items-center space-x-2.5 shadow-glass ${
            isHovered ? 'scale-105 border-indigo-400/50 bg-indigo-950/70' : 'opacity-80'
          }`}
        >
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              state === 'processing'
                ? 'bg-fuchsia-400 animate-ping'
                : state === 'listening'
                ? 'bg-sky-400 animate-pulse'
                : state === 'completed'
                ? 'bg-emerald-400'
                : 'bg-indigo-400'
            }`}
          />
          <span className="text-xs font-medium tracking-wide text-slate-200">
            {state === 'processing'
              ? 'NEXA Engine Synthesizing...'
              : state === 'listening'
              ? 'NEXA Listening to Prompt...'
              : state === 'completed'
              ? 'Plan Generated Successfully'
              : 'NEXA Core Active • Ready'}
          </span>
          {clickCount > 0 && (
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded">
              Sync #{clickCount}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
