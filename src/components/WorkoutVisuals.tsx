import React from 'react';
import { motion } from 'motion/react';
import { 
  Zap, 
  Dumbbell, 
  Activity, 
  Trophy, 
  Target, 
  Clock, 
  ShieldCheck,
  Timer,
  ChevronRight,
  ArrowUpRight,
  TrendingUp,
  Flame
} from 'lucide-react';
import { cn } from '../lib/utils';

const WorkoutVisuals = () => {
  const intensities = [
    { label: 'Z1 - RECUPERAÇÃO', height: '20%', active: false },
    { label: 'Z2 - AERÓBICO', height: '45%', active: false },
    { label: 'Z3 - LIMIAR', height: '70%', active: true },
    { label: 'Z4 - VO2 MAX', height: '90%', active: false },
    { label: 'Z5 - ANAERÓBICO', height: '100%', active: false },
  ];

  const stats = [
    { label: 'FAT BURN', value: '420', unit: 'KCAL', icon: Flame },
    { label: 'EFFORT', value: '8.5', unit: 'RPE', icon: Activity },
    { label: 'LOAD', value: '142', unit: 'TRIMP', icon: Zap },
  ];

  return (
    <div className="space-y-12 h-full flex flex-col justify-between">
      {/* Top Header */}
      <div className="flex items-start justify-between">
         <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#3B82F6]/10 border border-[#3B82F6]/20 rounded-full">
               <ShieldCheck className="w-3 h-3 text-[#3B82F6]" />
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3B82F6] italic">AI Performance Monitoring</span>
            </div>
            <h3 className="text-3xl font-display font-black italic uppercase tracking-tighter text-white">Análise Dinâmica do <span className="text-[#3B82F6]">Treino.</span></h3>
         </div>
         <div className="hidden sm:flex items-center gap-2 bg-black/40 p-4 rounded-3xl border border-white/5">
            <Timer className="w-5 h-5 text-[#3B82F6] animate-pulse" />
            <span className="text-xl font-display font-black italic tracking-tighter">00:42:15</span>
         </div>
      </div>

      {/* Main Charts area */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-8 items-end min-h-[300px]">
         {/* Intensity bars */}
         <div className="md:col-span-8 flex items-end justify-between h-full bg-[#05070A]/50 rounded-[3rem] p-10 border border-white/5 relative group">
            <div className="absolute top-8 left-8 flex items-center gap-2 text-[10px] font-black uppercase italic tracking-widest text-slate-700 group-hover:text-[#3B82F6] transition-colors">
               <TrendingUp className="w-3.5 h-3.5" />
               Zonas de Intensidade Sugeridas
            </div>
            {intensities.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-4 w-full px-2">
                 <div className="w-full relative group/bar">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: item.height }}
                      transition={{ delay: idx * 0.1, duration: 0.8, ease: "easeOut" }}
                      className={cn(
                        "w-full rounded-2xl relative transition-all duration-500",
                        item.active 
                          ? "bg-[#3B82F6] shadow-[0_0_30px_rgba(59,130,246,0.5)]" 
                          : "bg-white/5 group-hover/bar:bg-white/10"
                      )}
                    />
                    {item.active && (
                       <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-black text-[9px] font-black px-3 py-1.5 rounded-lg shadow-xl uppercase italic tracking-widest whitespace-nowrap">
                          Foco Atual
                       </div>
                    )}
                 </div>
                 <span className={cn(
                   "text-[8px] font-black uppercase tracking-widest italic text-center leading-tight",
                   item.active ? "text-[#3B82F6]" : "text-slate-700"
                 )}>{item.label}</span>
              </div>
            ))}
         </div>

         {/* Mini stats cards */}
         <div className="md:col-span-4 flex flex-col gap-6 h-full justify-between">
            {stats.map((s, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + (idx * 0.1) }}
                className="bg-[#11161D] p-8 rounded-[2.5rem] border border-white/5 flex items-center justify-between group hover:border-[#3B82F6]/30 transition-all cursor-crosshair overflow-hidden relative"
              >
                 <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform">
                    <s.icon className="w-16 h-16 text-[#3B82F6]" />
                 </div>
                 <div className="space-y-4 relative z-10">
                    <div className="flex items-center gap-2 text-[#3B82F6] text-[9px] font-black uppercase tracking-widest italic">
                       <s.icon className="w-3.5 h-3.5" />
                       {s.label}
                    </div>
                    <div className="flex items-baseline gap-2">
                       <span className="text-4xl font-display font-black text-white italic tracking-tighter leading-none">{s.value}</span>
                       <span className="text-[10px] font-bold text-slate-600 uppercase italic tracking-widest">{s.unit}</span>
                    </div>
                 </div>
                 <ArrowUpRight className="w-5 h-5 text-slate-700 group-hover:text-[#3B82F6] transition-colors" />
              </motion.div>
            ))}
         </div>
      </div>

      {/* Lower Banner CTA */}
      <div className="bg-[#11161D] rounded-[4rem] p-10 border border-t-[#3B82F6] border-white/5 relative overflow-hidden group shadow-2xl">
         <div className="absolute top-0 left-0 w-64 h-64 bg-[#3B82F6]/5 rounded-full blur-[100px] pointer-events-none" />
         
         <div className="flex flex-col sm:flex-row items-center justify-between gap-8 relative z-10">
            <div className="flex items-center gap-8">
               <div className="w-20 h-20 bg-[#05070A] rounded-[2rem] border border-[#3B82F6]/40 flex items-center justify-center p-5 group-hover:scale-110 transition-transform">
                  <Dumbbell className="w-full h-full text-[#3B82F6] fill-current" />
               </div>
               <div>
                  <h5 className="text-2xl font-display font-black italic uppercase tracking-widest text-white leading-none mb-2">Monitoramento <br /> <span className="text-[#3B82F6]">Live Pro.</span></h5>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic max-w-xs leading-relaxed opacity-60">Sincronize seu Garmin ou Strava para obter estas métricas ajustadas em tempo real durante o ciclo.</p>
               </div>
            </div>

            <button className="w-full sm:w-auto bg-[#3B82F6] text-white px-10 py-5 rounded-2xl font-black italic uppercase text-[10px] tracking-widest shadow-xl shadow-[#3B82F6]/10 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 font-bold">
               Conectar Dispositivos
               <ChevronRight className="w-4 h-4" />
            </button>
         </div>
      </div>
    </div>
  );
};

export const WorkoutGraph = ({ type, intensity }: { type?: string, intensity?: string }) => {
  return (
    <div className="w-full h-full p-6 flex items-end justify-between gap-1">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${Math.random() * 80 + 20}%` }}
          className="flex-1 bg-[#3B82F6]/40 rounded-t-sm"
        />
      ))}
    </div>
  );
};

export const TrainingPlayer = ({ training, onClose, onFinish }: { training: any, onClose: () => void, onFinish: (id: string) => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl"
    >
      <div className="bg-[#11161D] w-full max-w-2xl rounded-[3rem] p-12 border border-white/5 relative overflow-hidden text-center">
        <div className="absolute top-0 right-0 p-8">
           <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">Fechar</button>
        </div>
        <Dumbbell className="w-16 h-16 text-[#3B82F6] mx-auto mb-8 animate-bounce" />
        <h2 className="text-4xl font-display font-black italic uppercase tracking-tighter text-white mb-4">{training.title}</h2>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] italic mb-12">Treino em execução. Siga as orientações na tela do seu dispositivo.</p>
        
        <div className="grid grid-cols-2 gap-8 mb-12">
           <div className="bg-black/40 p-8 rounded-3xl border border-white/5">
              <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest italic mb-2">Pace Alvo</span>
              <span className="text-3xl font-display font-black text-white italic tracking-tighter">04:45</span>
           </div>
           <div className="bg-black/40 p-8 rounded-3xl border border-white/5">
              <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest italic mb-2">Tempo Restante</span>
              <span className="text-3xl font-display font-black text-[#3B82F6] italic tracking-tighter">24:12</span>
           </div>
        </div>

        <button 
          onClick={() => {
            onFinish(training.id);
            onClose();
          }}
          className="w-full bg-[#3B82F6] text-white py-6 rounded-2xl font-black italic uppercase text-xs tracking-widest shadow-xl shadow-[#3B82F6]/10"
        >
          Finalizar Sessão
        </button>
      </div>
    </motion.div>
  );
};

export default WorkoutVisuals;
