import React, { useEffect, useRef, useState } from 'react';

export const InteractiveRobot: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [headTransform, setHeadTransform] = useState({
    rotX: 0,
    rotY: 0,
    eyeX: 0,
    eyeY: 0,
  });
  const [isHovered, setIsHovered] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);

  // Periodic natural blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 180);
    }, 4000);
    return () => clearInterval(blinkInterval);
  }, []);

  // Smooth mouse movement tracking across window
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      // Calculate angles bounded between -24deg and 24deg
      const maxDistance = 600;
      const clampedX = Math.max(-maxDistance, Math.min(maxDistance, deltaX));
      const clampedY = Math.max(-maxDistance, Math.min(maxDistance, deltaY));

      const rotY = (clampedX / maxDistance) * 22; // Left/Right turn
      const rotX = -(clampedY / maxDistance) * 18; // Up/Down tilt

      // Eye pupil offset bounded within eye visor (-8px to 8px)
      const eyeX = (clampedX / maxDistance) * 8;
      const eyeY = (clampedY / maxDistance) * 6;

      setHeadTransform({ rotX, rotY, eyeX, eyeY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full max-w-md mx-auto aspect-square flex flex-col items-center justify-center select-none"
      style={{ perspective: '1000px' }}
    >
      {/* Ambient Radial Platform Glow */}
      <div className="absolute w-72 h-72 rounded-full bg-blue-600/15 blur-3xl pointer-events-none animate-pulse-glow" />

      {/* 3D Rotating Robot Head Container */}
      <div
        className="relative transition-transform duration-100 ease-out flex flex-col items-center"
        style={{
          transform: `rotateX(${headTransform.rotX}deg) rotateY(${headTransform.rotY}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Antenna / Communication Beacon */}
        <div className="flex flex-col items-center relative -mb-1">
          {/* Beacon Light */}
          <div className="relative">
            <div className="w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_15px_#3B82F6] flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white animate-ping" />
            </div>
            {/* Holographic Pulse Rings */}
            <div className="absolute -inset-2 rounded-full border border-blue-400/40 animate-ping" style={{ animationDuration: '2s' }} />
          </div>
          {/* Antenna Stem */}
          <div className="w-1.5 h-6 bg-gradient-to-b from-blue-400 via-slate-600 to-slate-800 rounded-t" />
        </div>

        {/* Outer Robotic Head Shell */}
        <div className="relative w-64 h-56 rounded-[32px] bg-gradient-to-b from-slate-900 via-slate-950 to-[#090D16] border-2 border-slate-700/80 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.1)] p-5 flex flex-col justify-between overflow-hidden">
          {/* Subtle Cyber Grid Lines inside Head */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3B82F6_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          {/* Top Chassis Accent Bar */}
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 z-10 px-1">
            <span>SYS_ONLINE</span>
            <div className="flex items-center gap-1">
              <span className="w-1 h-3 rounded bg-blue-500/60" />
              <span className="w-1 h-3 rounded bg-blue-500/80" />
              <span className="w-1 h-3 rounded bg-blue-500" />
            </div>
          </div>

          {/* Visor Area (OLED Face Screen) */}
          <div className="relative w-full h-28 rounded-2xl bg-[#030712] border border-blue-900/60 shadow-[inset_0_4px_12px_rgba(0,0,0,0.9)] flex items-center justify-center p-4 overflow-hidden">
            {/* Screen Scanlines */}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,#000_2px,#000_4px)]" />

            {/* Eyes Container */}
            <div
              className="flex items-center justify-around w-full max-w-[160px] transition-transform duration-75 ease-out relative z-10"
              style={{
                transform: `translate(${headTransform.eyeX}px, ${headTransform.eyeY}px)`,
              }}
            >
              {/* Left Eye */}
              <div
                className={`relative w-12 rounded-xl bg-blue-950/80 border-2 border-blue-400/90 shadow-[0_0_20px_#2563EB] flex items-center justify-center transition-all duration-150 ${
                  isBlinking ? 'h-1' : isHovered ? 'h-14 bg-blue-900' : 'h-12'
                }`}
              >
                {!isBlinking && (
                  <>
                    {/* Glowing Pupil */}
                    <div className="w-6 h-6 rounded-lg bg-blue-400 shadow-[0_0_10px_#60A5FA] flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded bg-white shadow-[0_0_6px_#FFF]" />
                    </div>
                    {/* Eye Corner Data Grid */}
                    <div className="absolute top-1 right-1 w-1 h-1 bg-cyan-300 rounded-full" />
                  </>
                )}
              </div>

              {/* Right Eye */}
              <div
                className={`relative w-12 rounded-xl bg-blue-950/80 border-2 border-blue-400/90 shadow-[0_0_20px_#2563EB] flex items-center justify-center transition-all duration-150 ${
                  isBlinking ? 'h-1' : isHovered ? 'h-14 bg-blue-900' : 'h-12'
                }`}
              >
                {!isBlinking && (
                  <>
                    {/* Glowing Pupil */}
                    <div className="w-6 h-6 rounded-lg bg-blue-400 shadow-[0_0_10px_#60A5FA] flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded bg-white shadow-[0_0_6px_#FFF]" />
                    </div>
                    {/* Eye Corner Data Grid */}
                    <div className="absolute top-1 right-1 w-1 h-1 bg-cyan-300 rounded-full" />
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Voice Wave Visualizer / Mouth Grill */}
          <div className="flex items-center justify-center gap-1.5 py-1 z-10">
            {[4, 8, 14, 20, 14, 8, 4].map((height, idx) => (
              <div
                key={idx}
                className="w-1.5 rounded-full bg-blue-500/80 transition-all duration-150 shadow-[0_0_6px_#2563EB]"
                style={{
                  height: isHovered ? `${height * 1.5}px` : `${height}px`,
                }}
              />
            ))}
          </div>

          {/* Left Ear Actuator */}
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-3 h-14 rounded-l-lg bg-slate-800 border-l border-y border-slate-600 flex flex-col justify-around py-1 px-0.5">
            <span className="w-full h-1 bg-blue-500 rounded-full" />
            <span className="w-full h-1 bg-slate-600 rounded-full" />
            <span className="w-full h-1 bg-slate-600 rounded-full" />
          </div>

          {/* Right Ear Actuator */}
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-3 h-14 rounded-r-lg bg-slate-800 border-r border-y border-slate-600 flex flex-col justify-around py-1 px-0.5">
            <span className="w-full h-1 bg-blue-500 rounded-full" />
            <span className="w-full h-1 bg-slate-600 rounded-full" />
            <span className="w-full h-1 bg-slate-600 rounded-full" />
          </div>
        </div>

        {/* Robot Neck Joint */}
        <div className="w-16 h-5 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-b-lg border-x border-b border-slate-600 flex items-center justify-around px-2">
          <span className="w-2 h-2 rounded-full bg-slate-900 border border-slate-600" />
          <span className="w-2 h-2 rounded-full bg-slate-900 border border-slate-600" />
        </div>

        {/* Robot Torso / Chassis Base */}
        <div className="w-52 h-14 bg-gradient-to-b from-slate-900 to-slate-950 rounded-t-3xl border-t border-x border-slate-700/80 shadow-2xl flex items-center justify-center p-3 relative overflow-hidden">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
              VentureOS Core Copilot
            </span>
          </div>
          {/* Subtle metallic bevel highlight */}
          <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
        </div>
      </div>
    </div>
  );
};
