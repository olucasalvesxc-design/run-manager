import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy, Star, Flame, Zap, Shield, Target, Award,
  CheckCircle2, Lock, ChevronLeft, Sparkles, TrendingUp, Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';

interface Achievement {
  id: string;
  title: string;
  description: string;
  xp: number;
  icon: React.ReactNode;
  color: string;
  glow: string;
  category: 'inicio' | 'consistencia' | 'volume' | 'forca';
  condition: (stats: AchStats) => boolean;
}

interface AchStats {
  totalWorkouts: number;
  currentStreak: number;
  longestStreak: number;
  xp: number;
}

const ACHIEVEMENTS: Achievement[] = [
  // Início
  {
    id: 'first_workout',
    title: 'Primeiro Passo',
    description: 'Complete seu primeiro treino',
    xp: 50,
    icon: <Star className="w-6 h-6" />,
    color: '#3b82f6',
    glow: 'rgba(59,130,246,0.4)',
    category: 'inicio',
    condition: s => s.totalWorkouts >= 1,
  },
  {
    id: 'week_1',
    title: 'Primeira Semana',
    description: 'Complete 5 treinos',
    xp: 150,
    icon: <Calendar className="w-6 h-6" />,
    color: '#22d3ee',
    glow: 'rgba(34,211,238,0.4)',
    category: 'inicio',
    condition: s => s.totalWorkouts >= 5,
  },
  {
    id: 'rookie',
    title: 'Novato',
    description: 'Complete 10 treinos',
    xp: 200,
    icon: <Target className="w-6 h-6" />,
    color: '#10b981',
    glow: 'rgba(16,185,129,0.4)',
    category: 'inicio',
    condition: s => s.totalWorkouts >= 10,
  },
  // Consistência
  {
    id: 'streak_3',
    title: 'Em Chamas',
    description: '3 dias consecutivos de treino',
    xp: 100,
    icon: <Flame className="w-6 h-6" />,
    color: '#f97316',
    glow: 'rgba(249,115,22,0.4)',
    category: 'consistencia',
    condition: s => s.longestStreak >= 3,
  },
  {
    id: 'streak_7',
    title: 'Semana Perfeita',
    description: '7 dias consecutivos de treino',
    xp: 300,
    icon: <Zap className="w-6 h-6" />,
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.4)',
    category: 'consistencia',
    condition: s => s.longestStreak >= 7,
  },
  {
    id: 'streak_30',
    title: 'Mês Imparável',
    description: '30 dias consecutivos de treino',
    xp: 1000,
    icon: <Shield className="w-6 h-6" />,
    color: '#8b5cf6',
    glow: 'rgba(139,92,246,0.4)',
    category: 'consistencia',
    condition: s => s.longestStreak >= 30,
  },
  {
    id: 'streak_60',
    title: 'Lenda Viva',
    description: '60 dias consecutivos de treino',
    xp: 2500,
    icon: <Sparkles className="w-6 h-6" />,
    color: '#ec4899',
    glow: 'rgba(236,72,153,0.4)',
    category: 'consistencia',
    condition: s => s.longestStreak >= 60,
  },
  // Volume
  {
    id: 'workouts_25',
    title: 'Dedicado',
    description: 'Complete 25 treinos',
    xp: 400,
    icon: <TrendingUp className="w-6 h-6" />,
    color: '#84cc16',
    glow: 'rgba(132,204,22,0.4)',
    category: 'volume',
    condition: s => s.totalWorkouts >= 25,
  },
  {
    id: 'workouts_50',
    title: 'Meio Século',
    description: 'Complete 50 treinos',
    xp: 750,
    icon: <Award className="w-6 h-6" />,
    color: '#14b8a6',
    glow: 'rgba(20,184,166,0.4)',
    category: 'volume',
    condition: s => s.totalWorkouts >= 50,
  },
  {
    id: 'workouts_100',
    title: 'Centenário',
    description: 'Complete 100 treinos',
    xp: 1500,
    icon: <Trophy className="w-6 h-6" />,
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.5)',
    category: 'volume',
    condition: s => s.totalWorkouts >= 100,
  },
  // XP
  {
    id: 'xp_500',
    title: 'Nível 2',
    description: 'Alcance 500 XP',
    xp: 0,
    icon: <Star className="w-6 h-6" />,
    color: '#6366f1',
    glow: 'rgba(99,102,241,0.4)',
    category: 'forca',
    condition: s => s.xp >= 500,
  },
  {
    id: 'xp_2000',
    title: 'Elite',
    description: 'Alcance 2000 XP',
    xp: 0,
    icon: <Zap className="w-6 h-6" />,
    color: '#db2777',
    glow: 'rgba(219,39,119,0.4)',
    category: 'forca',
    condition: s => s.xp >= 2000,
  },
];

const XP_PER_LEVEL = 500;

const CHALLENGES = [
  { id: 'ch_7d',  title: 'Desafio 7 Dias',  desc: 'Treine 7 dias consecutivos',         target: 7,   unit: 'dias',   icon: '⚡', xp: 350 },
  { id: 'ch_21d', title: 'Desafio 21 Dias', desc: 'Treine 21 dias consecutivos',         target: 21,  unit: 'dias',   icon: '🔥', xp: 1050 },
  { id: 'ch_30d', title: 'Desafio 30 Dias', desc: 'Treine 30 dias consecutivos',         target: 30,  unit: 'dias',   icon: '💪', xp: 1500 },
  { id: 'ch_30t', title: '30 Treinos',       desc: 'Complete 30 treinos no total',        target: 30,  unit: 'treinos',icon: '🏆', xp: 900 },
  { id: 'ch_100', title: '100 Flexões',      desc: 'Complete 100 flexões em uma sessão',  target: 100, unit: 'reps',   icon: '💯', xp: 500 },
];

const AchievementBadge = ({ ach, unlocked }: { ach: Achievement; unlocked: boolean }) => (
  <motion.div
    whileHover={unlocked ? { scale: 1.02 } : undefined}
    className={cn(
      "relative bg-slate-900/50 border rounded-2xl p-4 flex items-center gap-4 transition-all",
      unlocked ? "border-white/10 hover:border-white/20" : "border-white/5 opacity-60"
    )}
  >
    {unlocked && (
      <div
        className="absolute inset-0 rounded-2xl opacity-10 pointer-events-none"
        style={{ background: `radial-gradient(circle at top left, ${ach.color}, transparent 60%)` }}
      />
    )}
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 relative"
      style={unlocked ? {
        background: `${ach.color}20`,
        border: `1px solid ${ach.color}50`,
        boxShadow: `0 0 15px ${ach.glow}`,
        color: ach.color,
      } : { background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)', color: '#475569' }}
    >
      {unlocked ? ach.icon : <Lock className="w-5 h-5" />}
    </div>
    <div className="flex-1 min-w-0">
      <div className={cn("font-black italic uppercase tracking-tight text-sm", unlocked ? "text-white" : "text-slate-600")}>
        {ach.title}
      </div>
      <div className="text-[9px] text-slate-500 mt-0.5">{ach.description}</div>
      {ach.xp > 0 && (
        <div className={cn("text-[8px] font-black uppercase tracking-widest mt-1", unlocked ? "text-blue-400" : "text-slate-700")}>
          +{ach.xp} XP
        </div>
      )}
    </div>
    {unlocked && (
      <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
    )}
  </motion.div>
);

const NexusAchievements = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData]         = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'conquistas' | 'desafios'>('conquistas');

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, 'nexus_achievements', user.uid), snap => {
      if (snap.exists()) setData(snap.data());
    });
    return unsub;
  }, [user]);

  const stats: AchStats = {
    totalWorkouts: data?.totalWorkouts ?? 0,
    currentStreak: data?.currentStreak ?? 0,
    longestStreak: data?.longestStreak ?? 0,
    xp:            data?.xp ?? 0,
  };

  const unlocked = ACHIEVEMENTS.filter(a => a.condition(stats));
  const locked   = ACHIEVEMENTS.filter(a => !a.condition(stats));

  const xp    = stats.xp;
  const lvl   = Math.floor(xp / XP_PER_LEVEL) + 1;
  const xpInL = xp % XP_PER_LEVEL;

  const categories: { id: string; label: string }[] = [
    { id: 'inicio',      label: 'Início' },
    { id: 'consistencia',label: 'Consistência' },
    { id: 'volume',      label: 'Volume' },
    { id: 'forca',       label: 'XP' },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/athlete/nexus-trainer')} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-slate-400">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <div className="text-[8px] font-black uppercase tracking-[0.3em] text-blue-400">NEXUS TRAINER</div>
          <h1 className="text-xl font-black italic uppercase tracking-tighter text-white">Conquistas & XP</h1>
        </div>
      </div>

      {/* Level Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/20 rounded-3xl p-6">
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 blur-[60px] rounded-full pointer-events-none" />
        <div className="flex items-center gap-5 relative z-10">
          <motion.div
            animate={{ boxShadow: ['0 0 15px rgba(59,130,246,0.3)', '0 0 30px rgba(59,130,246,0.6)', '0 0 15px rgba(59,130,246,0.3)'] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex flex-col items-center justify-center shrink-0"
          >
            <span className="text-[8px] font-black text-blue-200 uppercase tracking-widest">Nível</span>
            <span className="text-3xl font-black text-white leading-none">{lvl}</span>
          </motion.div>
          <div className="flex-1 min-w-0">
            <div className="font-black italic uppercase tracking-tight text-xl text-white mb-1">
              {lvl < 3 ? 'Atleta Iniciante' : lvl < 6 ? 'Atleta Intermediário' : lvl < 10 ? 'Atleta Avançado' : 'Atleta Elite'}
            </div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{xpInL}/{XP_PER_LEVEL} XP</span>
              <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Nível {lvl + 1}</span>
            </div>
            <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(xpInL / XP_PER_LEVEL) * 100}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full"
                style={{ boxShadow: '0 0 8px rgba(59,130,246,0.6)' }}
              />
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex gap-4 mt-5 pt-5 border-t border-white/5 relative z-10">
          {[
            { label: 'XP Total',     value: xp },
            { label: 'Conquistas',   value: `${unlocked.length}/${ACHIEVEMENTS.length}` },
            { label: 'Sequência',    value: `${stats.currentStreak}d` },
            { label: 'Treinos',      value: stats.totalWorkouts },
          ].map(stat => (
            <div key={stat.label} className="flex-1 text-center">
              <div className="text-lg font-black text-white">{stat.value}</div>
              <div className="text-[7px] font-black text-slate-600 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab Toggle */}
      <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-white/5">
        {(['conquistas', 'desafios'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2",
              activeTab === tab ? "bg-blue-500 text-white shadow-lg" : "text-slate-500 hover:text-white"
            )}
          >
            {tab === 'conquistas' ? <><Trophy className="w-3.5 h-3.5" /> Conquistas</> : <><Zap className="w-3.5 h-3.5" /> Desafios</>}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'conquistas' ? (
          <motion.div key="conquistas" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
            {/* Unlocked */}
            {unlocked.length > 0 && (
              <div>
                <div className="text-[9px] font-black uppercase tracking-widest text-green-400 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3" /> Desbloqueadas ({unlocked.length})
                </div>
                <div className="space-y-2">
                  {unlocked.map(ach => (
                    <React.Fragment key={ach.id}>
                      <AchievementBadge ach={ach} unlocked />
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            {/* By category (locked) */}
            {categories.map(cat => {
              const catLocked = locked.filter(a => a.category === cat.id);
              if (!catLocked.length) return null;
              return (
                <div key={cat.id}>
                  <div className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-3 flex items-center gap-2">
                    <Lock className="w-3 h-3" /> {cat.label}
                  </div>
                  <div className="space-y-2">
                    {catLocked.map(ach => (
                      <React.Fragment key={ach.id}>
                        <AchievementBadge ach={ach} unlocked={false} />
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div key="desafios" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-3">
            {CHALLENGES.map(ch => {
              let progress = 0;
              if (ch.unit === 'dias') progress = Math.min(stats.currentStreak, ch.target);
              else if (ch.unit === 'treinos') progress = Math.min(stats.totalWorkouts, ch.target);
              const pct = (progress / ch.target) * 100;
              const done = pct >= 100;

              return (
                <div key={ch.id} className={cn(
                  "bg-slate-900/50 border rounded-2xl p-5 transition-all",
                  done ? "border-green-500/20 bg-green-500/5" : "border-white/5"
                )}>
                  <div className="flex items-start gap-4">
                    <div className="text-3xl shrink-0">{ch.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-black italic uppercase tracking-tight text-white text-sm">{ch.title}</span>
                        {done && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                      </div>
                      <div className="text-[9px] text-slate-500 mb-3">{ch.desc}</div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-1">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className={cn(
                            "h-full rounded-full",
                            done ? "bg-green-400" : "bg-blue-500"
                          )}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] font-black text-slate-600 uppercase">
                          {progress}/{ch.target} {ch.unit}
                        </span>
                        <span className="text-[8px] font-black text-blue-400 uppercase">+{ch.xp} XP</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NexusAchievements;
