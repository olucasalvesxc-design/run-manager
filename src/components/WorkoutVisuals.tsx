import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  ChevronRight, 
  Timer, 
  Zap, 
  Trophy, 
  ArrowRight,
  X,
  Star,
  Activity
} from 'lucide-react';
import { cn } from '../lib/utils';

// --- ANIMATED GRAPHS ---

interface WorkoutGraphProps {
  type: 'Intervalado' | 'Tempo Run' | 'Longão' | string;
  intensity: 'low' | 'medium' | 'high' | 'rest';
  className?: string;
}

export const WorkoutGraph = ({ type, intensity, className }: WorkoutGraphProps) => {
  const isInterval = type.toLowerCase().includes('interval') || type.toLowerCase().includes('tiros') || type.toLowerCase().includes('sprints');
  const isTempo = type.toLowerCase().includes('tempo') || type.toLowerCase().includes('ritmo') || type.toLowerCase().includes('steady');
  const isLong = type.toLowerCase().includes('long') || type.toLowerCase().includes('rodagem') || type.toLowerCase().includes('base');

  const getColor = () => {
    return '#ef4444'; // Red for everything to keep it premium and consistent as requested
  };

  const color = getColor();

  return (
    <div className={cn("relative w-full h-full flex items-center justify-center px-4 overflow-hidden", className)}>
      <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
        {/* Glow effect */}
        <defs>
          <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {isInterval && (
          <motion.path
            // Symmetrical peaks: fast up, fast down
            d="M 0 32 L 10 32 L 12 10 L 14 32 L 24 32 L 26 10 L 28 32 L 38 32 L 40 10 L 42 32 L 52 32 L 54 10 L 56 32 L 66 32 L 68 10 L 70 32 L 80 32 L 82 10 L 84 32 L 94 32 L 96 10 L 98 32 L 100 32"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow-red)"
            initial={{ pathLength: 0 }}
            animate={{ 
              pathLength: 1,
              opacity: [0.7, 1, 0.7]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut"
            }}
          />
        )}

        {isTempo && (
          <motion.path
            // Constant rhythm: thin pulse
            d="M 0 20 L 100 20"
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="url(#glow-red)"
            animate={{ 
              strokeWidth: [2.5, 3.2, 2.5],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              ease: "easeInOut"
            }}
          />
        )}

        {isLong && (
          <motion.path
            // Smooth progressive ascending line: linear continuous
            d="M 0 35 C 20 35, 80 15, 100 5"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            filter="url(#glow-red)"
            initial={{ pathLength: 0 }}
            animate={{ 
              pathLength: 1,
            }}
            transition={{ 
              duration: 10, 
              repeat: Infinity,
              ease: "linear"
            }}
          />
        )}

        {!isInterval && !isTempo && !isLong && (
          <motion.path
            d="M 0 30 C 20 30 30 25 50 25 C 70 25 80 30 100 30"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            filter="url(#glow-red)"
            animate={{ 
              opacity: [0.4, 0.7, 0.4]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        )}
      </svg>
      
      {/* Dynamic particles / bubbles based on intensity */}
      {intensity !== 'rest' && (
        <div className="absolute inset-x-0 bottom-0 top-0 pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-white/20"
              initial={{ x: Math.random() * 100 + "%", y: "100%", opacity: 0 }}
              animate={{ 
                y: "0%", 
                opacity: [0, 0.5, 0],
                x: (Math.random() * 10 - 5) + (i * 20) + "%"
              }}
              transition={{ 
                duration: 2 + Math.random() * 2, 
                repeat: Infinity, 
                delay: Math.random() * 2 
              }}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// --- TRAINING EXECUTION ENGINE ---

interface Step {
  id: string;
  title: string;
  description: string;
  type: 'warmup' | 'main' | 'cooldown' | 'rest';
  duration?: number;
  distance?: number;
}

interface TrainingPlayerProps {
  training: {
    id: string;
    activity: string;
    details: string;
    intensity: string;
    steps?: Step[];
  };
  onClose: () => void;
  onFinish: (data: any) => void;
}

export const TrainingPlayer = ({ training, onClose, onFinish }: TrainingPlayerProps) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [stepSeconds, setStepSeconds] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<'easy' | 'medium' | 'hard' | null>(null);

  const steps = training.steps || [
    { id: '1', title: 'Aquecimento', description: 'Atividade leve para preparar o corpo', type: 'warmup' },
    { id: '2', title: 'Parte Principal', description: training.details, type: 'main' },
    { id: '3', title: 'Desaquecimento', description: 'Trotes regenerativos e alongamento', type: 'cooldown' }
  ];

  const currentStep = steps[currentStepIndex];
  
  useEffect(() => {
    let interval: any;
    if (!isPaused && !showFeedback) {
      interval = setInterval(() => {
        setTotalSeconds(s => s + 1);
        setStepSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPaused, showFeedback]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? hrs + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNextStep = () => {
    setCompletedSteps([...completedSteps, currentStep.id]);
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setStepSeconds(0);
    } else {
      setShowFeedback(true);
    }
  };

  const handleFinish = () => {
    onFinish({
      duration: totalSeconds,
      feedback,
      completedAt: new Date(),
      stepsCompleted: completedSteps.length + 1
    });
  };

  const progress = ((completedSteps.length) / steps.length) * 100;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-slate-950 flex flex-col md:p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 md:p-0 mb-8 border-b border-white/5 md:border-none">
        <div>
           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500 mb-1">
              <Activity className="w-3 h-3" />
              Treino em Andamento
           </div>
           <h2 className="text-2xl font-display font-black italic uppercase tracking-tighter text-white truncate max-w-[200px] md:max-w-none">
             {training.activity}
           </h2>
        </div>
        <button 
          onClick={onClose}
          className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-slate-500 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-8 max-w-6xl mx-auto w-full">
        {/* Left: Progress & Steps */}
        <div className="flex-1 order-2 md:order-1 px-6 md:px-0">
           <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Progresso Geral</span>
                 <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">{Math.round(progress)}%</span>
              </div>
              <div className="h-3 bg-slate-900 rounded-full overflow-hidden border border-white/5 p-0.5">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${progress}%` }}
                   className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                 />
              </div>
           </div>

           <div className="space-y-4">
              {steps.map((step, idx) => {
                 const isCompleted = completedSteps.includes(step.id);
                 const isActive = idx === currentStepIndex;

                 return (
                   <div 
                    key={step.id}
                    className={cn(
                      "p-5 rounded-3xl border transition-all duration-500",
                      isActive ? "bg-red-600/10 border-red-500/30 ring-1 ring-red-500/20" : 
                      isCompleted ? "bg-slate-900/40 border-green-500/20 opacity-60" : "bg-slate-900/20 border-white/5 opacity-40"
                    )}
                   >
                      <div className="flex items-center gap-4">
                         <div className={cn(
                           "w-10 h-10 rounded-2xl flex items-center justify-center font-black",
                           isActive ? "bg-red-500 text-white" : 
                           isCompleted ? "bg-green-500/20 text-green-500" : "bg-slate-800 text-slate-500"
                         )}>
                            {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                         </div>
                         <div className="flex-1">
                            <h4 className={cn(
                              "text-sm font-black uppercase italic tracking-wider",
                              isActive ? "text-white" : "text-slate-400"
                            )}>
                              {step.title}
                            </h4>
                            <p className="text-[10px] font-medium text-slate-500 italic mt-0.5">{step.description}</p>
                         </div>
                         {isActive && (
                           <motion.div 
                            animate={{ scale: [1, 1.2, 1] }} 
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="w-2 h-2 bg-red-500 rounded-full"
                           />
                         )}
                      </div>
                   </div>
                 );
              })}
           </div>
        </div>

        {/* Right: Timer & Controls */}
        <div className="w-full md:w-[400px] order-1 md:order-2 flex flex-col">
           <div className="bg-slate-900/50 border border-white/5 rounded-[3rem] p-10 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              
              <Timer className="w-10 h-10 text-red-500/40 mb-6" />
              
              <div className="font-display font-black italic text-7xl md:text-8xl text-white tracking-tighter mb-4 tabular-nums">
                {formatTime(totalSeconds)}
              </div>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic mb-10">Tempo Total de Treino</div>

              <div className="flex items-center gap-6">
                 <button 
                  onClick={() => setIsPaused(!isPaused)}
                  className={cn(
                    "w-20 h-20 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-2xl",
                    isPaused ? "bg-red-600 text-white hover:bg-red-500" : "bg-white/5 text-white hover:bg-white/10"
                  )}
                 >
                    {isPaused ? <Play className="w-8 h-8 ml-1" /> : <Pause className="w-8 h-8" />}
                 </button>
                 <button 
                  onClick={handleNextStep}
                  className="px-10 py-5 bg-white text-slate-950 rounded-[2rem] font-black italic uppercase tracking-widest text-xs flex items-center gap-3 hover:translate-x-1 transition-all"
                 >
                    {currentStepIndex === steps.length - 1 ? 'Finalizar' : 'Próxima Etapa'}
                    <ChevronRight className="w-4 h-4" />
                 </button>
              </div>
           </div>

           <div className="mt-8 bg-slate-900/30 p-8 rounded-[2.5rem] border border-white/5 space-y-4">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-slate-800 rounded-xl flex items-center justify-center">
                    <Zap className="w-4 h-4 text-yellow-400" />
                 </div>
                 <div>
                    <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">Intensidade</div>
                    <div className="text-xs font-black uppercase text-white italic">{training.intensity}</div>
                 </div>
              </div>
              <p className="text-[11px] text-slate-400 font-medium italic leading-relaxed">
                {currentStep.description}
              </p>
           </div>
        </div>
      </div>

      {/* FEEDBACK MODAL */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[70] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6"
          >
             <div className="bg-slate-900 border border-white/10 p-12 rounded-[4rem] max-w-md w-full text-center space-y-8 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-red-600" />
                
                <Trophy className="w-20 h-20 text-yellow-400 mx-auto" />
                
                <div>
                   <h3 className="text-3xl font-display font-black text-white italic uppercase tracking-tighter mb-2">Treino Concluído!</h3>
                   <p className="text-slate-500 text-sm italic font-medium">Você completou {formatTime(totalSeconds)} de puro suor.</p>
                </div>

                <div className="space-y-4">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Como foi o esforço?</p>
                   <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'easy', label: 'Fácil', icon: '😊' },
                        { id: 'medium', label: 'Médio', icon: '🔥' },
                        { id: 'hard', label: 'Difícil', icon: '💀' }
                      ].map((lvl) => (
                        <button
                          key={lvl.id}
                          onClick={() => setFeedback(lvl.id as any)}
                          className={cn(
                            "p-4 rounded-2xl border transition-all text-center group",
                            feedback === lvl.id ? "bg-red-600 border-red-500 text-white" : "bg-slate-800 border-white/5 text-slate-400 hover:border-white/20"
                          )}
                        >
                           <div className="text-2xl mb-1">{lvl.icon}</div>
                           <div className="text-[9px] font-black uppercase tracking-widest">{lvl.label}</div>
                        </button>
                      ))}
                   </div>
                </div>

                <button 
                  onClick={handleFinish}
                  disabled={!feedback}
                  className="w-full bg-white text-slate-950 py-5 rounded-2xl font-black italic uppercase tracking-widest text-xs disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                   Salvar Treino
                   <ArrowRight className="w-4 h-4" />
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
