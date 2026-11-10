import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, FastForward, Play, Eye } from 'lucide-react';
import { Factory3DScene } from './Factory3DScene';
import { LoginForm } from './LoginForm';
import { AuthSceneStage, TelemetryState } from './types';
import { industrialAudio } from './IndustrialAudio';

interface FactoryLoginExperienceProps {
  onAuthenticated: (operatorName: string) => void;
}

export const FactoryLoginExperience: React.FC<FactoryLoginExperienceProps> = ({
  onAuthenticated,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<Factory3DScene | null>(null);

  const [currentStage, setCurrentStage] = useState<AuthSceneStage>('ARRIVAL');
  const [telemetry, setTelemetry] = useState<TelemetryState | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isCncAuthenticating, setIsCncAuthenticating] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);

  // Initialize Three.js 3D Scene
  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new Factory3DScene(containerRef.current, {
      onTelemetryUpdate: (data) => {
        setTelemetry(data);
      },
      onStageComplete: (completedStage) => {
        if (completedStage === 'MANAGER_APPROACH') {
          // Transition to opening shutter
          setCurrentStage('SHUTTER_OPEN');
          sceneRef.current?.setStage('SHUTTER_OPEN');

          // After shutter finishes opening (2.4s), present login interface
          setTimeout(() => {
            setCurrentStage('LOGIN_READY');
            sceneRef.current?.setStage('LOGIN_READY');
          }, 2400);
        }
      },
    });

    sceneRef.current = scene;
    setSceneReady(true);

    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  // Audio Toggle
  const handleToggleAudio = () => {
    const nextMuted = !isAudioMuted;
    setIsAudioMuted(nextMuted);
    industrialAudio.setMuted(nextMuted);
  };

  // Begin Character Approach & Shutter Sequence
  const handleOpenShutter = useCallback(() => {
    if (currentStage !== 'ARRIVAL') return;
    setCurrentStage('MANAGER_APPROACH');
    sceneRef.current?.setStage('MANAGER_APPROACH');
  }, [currentStage]);

  // Handle Login Credential Submission
  const handleLoginSubmit = useCallback((operatorId: string) => {
    setIsCncAuthenticating(true);
    setCurrentStage('CNC_MACHINING');
    sceneRef.current?.setStage('CNC_MACHINING');

    // Run CNC machining sequence for ~2.6 seconds as loading cycle
    setTimeout(() => {
      setCurrentStage('DASHBOARD_TRANSITION');
      sceneRef.current?.setStage('DASHBOARD_TRANSITION');

      // Seamless transition to ForgeOS Dashboard
      setTimeout(() => {
        onAuthenticated(operatorId);
      }, 1000);
    }, 2800);
  }, [onAuthenticated]);

  // Direct Skip to Dashboard (Usability & Accessibility)
  const handleDirectPass = useCallback(() => {
    industrialAudio.stopCncMachining();
    onAuthenticated('Arindam Chatterjee (Prod. Mgr)');
  }, [onAuthenticated]);

  // Skip straight to Login form
  const handleSkipToLogin = useCallback(() => {
    setCurrentStage('LOGIN_READY');
    sceneRef.current?.setStage('LOGIN_READY');
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-forge-black select-none font-sans">
      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full z-0 cursor-grab active:cursor-grabbing"
      />

      {/* Top Swiss Status Bar */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-6 pointer-events-none">
        {/* Brand Monogram & Title */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <img
            src="/forgeos-logo.png"
            alt="FORGEOS"
            className="h-8 w-auto object-contain drop-shadow-md"
          />
          <div className="h-5 w-[1px] bg-white/20" />
          <div className="text-xs font-mono text-forge-aluminum tracking-wider uppercase">
            <span className="text-white font-semibold">FACTORY ENTRANCE</span> // SHUTTER BAY 01
          </div>
        </div>

        {/* Global Controls & Audio Indicator */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Stage Indicator Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-forge-black/80 backdrop-blur border border-forge-steel/30 text-xs font-mono text-forge-aluminum">
            <span className="text-forge-orange font-semibold">STATE:</span>
            <span>{currentStage}</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleAudio}
            title={isAudioMuted ? 'Unmute Industrial Audio' : 'Mute Industrial Audio'}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-forge-black/80 hover:bg-forge-steel/30 backdrop-blur border border-forge-steel/30 text-xs font-mono text-white transition-colors"
          >
            {isAudioMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-forge-steel-muted" />
                <span className="text-forge-steel-muted">MUTED</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-forge-orange" />
                <span>AUDIO ON</span>
              </>
            )}
          </button>

          {/* Instant Skip to Dashboard */}
          <button
            onClick={handleDirectPass}
            className="flex items-center gap-1 px-3 py-1.5 bg-forge-steel/20 hover:bg-forge-steel/40 backdrop-blur border border-forge-steel/30 text-xs font-mono text-forge-aluminum hover:text-white transition-colors"
          >
            <FastForward className="w-3.5 h-3.5 text-forge-orange" />
            <span>SKIP TO DASHBOARD</span>
          </button>
        </div>
      </header>

      {/* Dynamic Interaction Overlays based on Current Stage */}
      <div className="absolute inset-0 z-10 flex items-center justify-center p-6 pointer-events-none">
        {/* Stage 01: ARRIVAL — Call to Action to Open Shutter */}
        <AnimatePresence>
          {currentStage === 'ARRIVAL' && sceneReady && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="pointer-events-auto flex flex-col items-center text-center max-w-md bg-forge-black/85 backdrop-blur-md border border-forge-steel/30 p-8 shadow-2xl mt-48 sm:mt-64"
            >
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-forge-orange/15 border border-forge-orange/30 text-forge-orange text-[11px] font-mono tracking-widest uppercase mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-forge-orange animate-ping" />
                STATION 01 // INDUSTRIAL SHUTTER SECURED
              </div>

              <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight leading-tight">
                THE FACTORY COMES ALIVE
              </h1>
              <p className="text-xs font-mono text-forge-aluminum mt-2 leading-relaxed">
                Floor Manager Arindam is standing by. Authorize entry on tablet to disengage safety shutter and illuminate machining cells.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full mt-6">
                <button
                  onClick={handleOpenShutter}
                  className="w-full py-3 px-5 bg-forge-orange hover:bg-forge-orange-hover text-white font-display font-medium text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98]"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>INITIALIZE ENTRY & OPEN SHUTTER</span>
                </button>
                <button
                  onClick={handleSkipToLogin}
                  className="w-full sm:w-auto py-3 px-4 bg-forge-steel/20 hover:bg-forge-steel/30 border border-forge-steel/40 text-xs font-mono text-forge-aluminum hover:text-white transition-colors flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>JUMP TO LOGIN</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stage 02: MANAGER_APPROACH & SHUTTER_OPEN — Cinematic Telemetry Pill */}
        <AnimatePresence>
          {(currentStage === 'MANAGER_APPROACH' || currentStage === 'SHUTTER_OPEN') && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-none flex items-center gap-3 px-4 py-2 bg-forge-black/90 backdrop-blur border border-forge-steel/40 text-xs font-mono text-forge-aluminum"
            >
              <div className="w-2 h-2 rounded-full bg-forge-orange animate-ping" />
              <span>
                {currentStage === 'MANAGER_APPROACH'
                  ? 'MANAGER VERIFYING RFID ACCESS BADGE ON TABLET...'
                  : 'DISENGAGING HEAVY SHUTTER MOTOR... ILLUMINATING FACTORY BAY'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stage 03 & 04: LOGIN_READY & CNC_MACHINING — Swiss Modernist Form */}
        <AnimatePresence>
          {(currentStage === 'LOGIN_READY' || currentStage === 'CNC_MACHINING') && (
            <div className="w-full max-w-7xl mx-auto flex items-center justify-start pointer-events-none">
              <div className="pointer-events-auto">
                <LoginForm
                  isLoading={isCncAuthenticating}
                  telemetry={telemetry}
                  onLogin={handleLoginSubmit}
                  onSkip={handleDirectPass}
                />
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* Stage 05: DASHBOARD_TRANSITION — Full Screen Dissolve */}
        <AnimatePresence>
          {currentStage === 'DASHBOARD_TRANSITION' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 bg-forge-black flex flex-col items-center justify-center z-50 text-white"
            >
              <motion.img
                src="/forgeos-logo.png"
                alt="FORGEOS"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="h-10 w-auto mb-4"
              />
              <div className="text-xs font-mono text-forge-orange tracking-widest uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-forge-orange animate-ping" />
                <span>AUTHENTICATION VERIFIED // LOADING SHOP-FLOOR DASHBOARD</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Technical Watermark */}
      <footer className="absolute bottom-4 left-6 right-6 z-20 flex items-center justify-between text-[11px] font-mono text-forge-steel-muted pointer-events-none">
        <div className="flex items-center gap-4">
          <span>FORGEOS INDUSTRIAL PLATFORM // PLANT 04</span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">CNC VERTICAL MACHINING CENTER 01</span>
        </div>
        <div className="flex items-center gap-4">
          <span>LATENCY: 1.2ms</span>
          <span>FPS: 60</span>
        </div>
      </footer>
    </div>
  );
};
