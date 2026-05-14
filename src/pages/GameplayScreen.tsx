import { motion, AnimatePresence } from 'motion/react';
import { useGameStore } from '../stores/useGameStore';
import { useEffect, useRef, useState } from 'react';
import { Pause, Target, Zap, Activity, Settings, ChevronLeft, Camera } from 'lucide-react';

export const GameplayScreen = () => {
  const setState = useGameStore((state) => state.setState);
  const score = useGameStore((state) => state.score);
  const updateScore = useGameStore((state) => state.updateScore);
  const matchConfig = useGameStore((state) => state.matchConfig);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [lastShot, setLastShot] = useState<any>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 640, height: 480, facingMode: 'user' } 
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (e) {
        console.error("Camera failed", e);
      }
    }
    setupCamera();
  }, []);

  const simulateShot = (runs: number) => {
    setLastShot({ runs, timing: 'PERFECT', type: 'DRIVE' });
    updateScore({ 
        runs: score.runs + runs, 
        balls: score.balls + 1,
        overProgress: `${Math.floor((score.balls + 1) / 6)}.${(score.balls + 1) % 6}`
    });
    setTimeout(() => setLastShot(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col relative bg-black overflow-hidden font-sans">
      {/* REAL WORLD PITCH POV (Screenshot 3 style) */}
      <div className="absolute inset-0">
        <img 
            src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&q=80&w=1200" 
            alt="Cricket Pitch POV" 
            className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />
      </div>

      {/* TOP HUD from Screenshot 3 */}
      <div className="absolute top-0 left-0 w-full p-4 grid grid-cols-3 gap-3 z-30">
        {/* Left: Score Card */}
        <div className="flex items-center space-x-3 bg-[#0d1930]/90 backdrop-blur-xl rounded-2xl p-4 border border-white/10 shadow-2xl">
          <div className="flex flex-col">
            <span className="text-4xl font-black italic tracking-tighter leading-none text-white">
                {score.runs}<span className="text-xl text-white/30 ml-1">-{score.wickets}</span>
            </span>
            <span className="text-[10px] font-black italic text-cyan-400 tracking-widest mt-1">
                OVER {score.overProgress}
            </span>
          </div>
        </div>

        {/* Center: Match Info */}
        <div className="flex flex-col items-center justify-center bg-[#0d1930]/90 backdrop-blur-xl rounded-2xl p-4 border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="flex items-center space-x-2 text-white/50 mb-1">
                <Zap size={12} className="fill-white/50" />
                <span className="text-[9px] font-black italic tracking-[0.2em] uppercase">POWER PLAY</span>
            </div>
            <div className="flex flex-col items-center leading-none">
                <span className="text-2xl font-black italic tracking-tighter text-white">
                    120 <span className="text-xs text-white/30 tracking-normal uppercase italic">balls left</span>
                </span>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-white/5">
                <motion.div 
                    initial={{ width: '100%' }}
                    animate={{ width: '40%' }}
                    className="h-full bg-cyan-400 shadow-[0_0_10px_cyan]"
                />
            </div>
        </div>

        {/* Right: Radar View */}
        <div className="flex items-center justify-center bg-[#0d1930]/90 backdrop-blur-xl rounded-2xl p-2 border border-white/10 shadow-2xl ml-auto w-32 aspect-square relative overflow-hidden group">
            <div className="w-full h-full rounded-full border border-white/10 relative flex items-center justify-center">
                {/* Radar sweep */}
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0deg,rgba(0,242,255,0.2)_90deg,transparent_90deg)] rounded-full"
                />
                {/* Center Pitch */}
                <div className="w-12 h-3 border border-white/20 rounded-sm bg-white/5" />
                {/* Players */}
                {[...Array(7)].map((_, i) => (
                    <div 
                        key={i} 
                        className="absolute w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_8px_cyan]"
                        style={{
                            left: `${50 + 35 * Math.cos(i * (Math.PI / 3))}%`,
                            top: `${50 + 35 * Math.sin(i * (Math.PI / 3))}%`,
                        }}
                    />
                ))}
            </div>
        </div>
      </div>

      {/* Gameplay elements */}
      <div className="relative flex-1 flex flex-col items-center justify-center">
        {/* Pitch Target Marker */}
        <div className="absolute bottom-[30%] w-32 h-10 bg-cyan-400/5 rounded-full border-2 border-cyan-400/20 flex items-center justify-center">
            <motion.div 
                animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0.4, 0.1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-24 h-4 bg-cyan-400 rounded-full blur-md"
            />
        </div>

        {/* Mini Webcam - Bottom Left */}
        <div className="absolute bottom-8 left-8 w-40 h-40 rounded-3xl border-2 border-white/10 overflow-hidden shadow-2xl z-20">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1] grayscale opacity-70" />
            <div className="absolute top-3 left-3 flex items-center space-x-1.5 px-2 py-1 bg-black/40 rounded-md backdrop-blur-sm">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                <span className="text-[7px] font-black tracking-widest text-white uppercase italic">LIVE POSE</span>
            </div>
        </div>

        {/* Shot Indicators */}
        <AnimatePresence>
            {lastShot && (
                <motion.div
                    initial={{ scale: 0.5, opacity: 0, y: 50 }}
                    animate={{ scale: 1.2, opacity: 1, y: -20 }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    className="z-50 text-center"
                >
                    <h1 className="text-8xl font-black italic tracking-tighter neon-text drop-shadow-[0_0_30px_rgba(0,242,255,0.8)]">
                        {lastShot.runs === 6 ? 'MASSIVE SIX!' : lastShot.runs === 4 ? 'CRACKING FOUR!' : 'RUNNING...'}
                    </h1>
                    <div className="inline-block mt-4 px-8 py-2 bg-white text-black font-black italic tracking-[0.3em] uppercase transform -skew-x-12">
                        {lastShot.timing} TIMING
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      {/* Floating Controls */}
      <div className="absolute right-6 bottom-10 flex flex-col space-y-4">
        <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsPaused(true)}
            className="w-16 h-16 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white"
        >
            <Pause size={28} />
        </motion.button>
        <button 
            onClick={() => simulateShot(Math.random() > 0.5 ? 4 : 6)}
            className="w-16 h-16 rounded-2xl bg-cyan-500 border border-cyan-400 flex items-center justify-center text-white shadow-[0_0_20px_rgba(0,242,255,0.4)]"
        >
            <Zap size={28} className="fill-white" />
        </button>
      </div>

      {/* PAUSE OVERLAY WITH FEATURES (User request) */}
      <AnimatePresence>
        {isPaused && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center p-10"
          >
            <button 
                onClick={() => setIsPaused(false)}
                className="absolute top-10 right-10 p-4 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
            >
                <ChevronLeft size={32} className="rotate-180" />
            </button>

            <div className="max-w-2xl w-full">
                <header className="text-center mb-16">
                    <h1 className="text-6xl font-black italic tracking-tighter neon-text mb-4">MATCH PAUSED</h1>
                    <p className="text-gray-400 font-black italic uppercase tracking-[0.3em]">Simulation Active • Analyzing Biometrics</p>
                </header>

                <div className="grid grid-cols-2 gap-6 mb-16">
                    {[
                        { title: 'PRO CAMERA', desc: 'Real-time movement analysis using advanced pose detection.', icon: Camera, color: 'text-cyan-400' },
                        { title: 'VR VENUES', desc: 'Photorealistic world-class stadiums with dynamic lighting.', icon: Target, color: 'text-fuchsia-500' },
                        { title: 'BALL PHYSICS', desc: 'Professional ball trajectory & collision math engine.', icon: Zap, color: 'text-amber-400' },
                        { title: 'PRO HUD', desc: 'Next-gen match statistics and real-time fielding radar.', icon: Activity, color: 'text-emerald-400' },
                    ].map((feature, i) => (
                        <div key={i} className="p-6 glass-card border-white/5 hover:border-white/20 transition-all group">
                            <feature.icon size={32} className={`${feature.color} mb-4 group-hover:scale-110 transition-transform`} />
                            <h3 className="text-lg font-black italic uppercase mb-1 tracking-tight">{feature.title}</h3>
                            <p className="text-xs text-gray-500 font-medium leading-relaxed italic">{feature.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col space-y-4">
                    <button 
                        onClick={() => setIsPaused(false)}
                        className="gradient-btn w-full py-5 text-2xl uppercase tracking-[0.2em]"
                    >
                        RESUME SIMULATION
                    </button>
                    <button 
                        onClick={() => setState('MATCH_SETTINGS')}
                        className="w-full py-5 text-gray-500 font-bold uppercase tracking-widest hover:text-white transition-colors"
                    >
                        ABORT MATCH
                    </button>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
