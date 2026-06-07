import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft, Play, Pause, CheckCircle2, Plus, Minus,
  Clock, Dumbbell, ChevronRight, Zap, Trophy, X, Timer,
  Star, RotateCcw, ChevronDown, ChevronUp, Flame
} from 'lucide-react';
import { db } from '../lib/firebase';
import {
  doc, getDoc, addDoc, updateDoc, collection,
  serverTimestamp, increment
} from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';

interface SetLog { reps: number; weight: number; completed: boolean; }
interface ExerciseLog { exerciseId: string; name: string; sets: SetLog[]; notes: string; }

const WORKOUT_XP = 100;
const PR_XP      = 50;

const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

const ExerciseAnimation = ({ type }: { type: string }) => {
  const colors: Record<string, string> = {
    press: '#3b82f6', pull: '#8b5cf6', squat: '#ec4899',
    hinge: '#f97316', push: '#10b981', curl: '#06b6d4',
    extend: '#f59e0b', raise: '#84cc16', plank: '#14b8a6', row: '#ef4444',
  };
  const color = colors[type] || '#3b82f6';

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Pulsing glow */}
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute w-24 h-24 rounded-full"
        style={{ background: `radial-gradient(circle, ${color}40 0%, transparent 70%)` }}
      />
      {/* Animated bars */}
      <div className="flex items-end gap-1.5 h-12">
        {[0.4, 0.7, 1, 0.85, 0.6, 0.45, 0.8, 1, 0.7, 0.5].map((h, i) => (
          <motion.div
            key={i}
            animate={{ scaleY: [h, h * 0.4, h] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.12, ease: 'easeInOut' }}
            className="w-2 rounded-t-sm origin-bottom"
            style={{ height: `${h * 48}px`, background: `linear-gradient(to top, ${color}80, ${color})` }}
          />
        ))}
      </div>
      <div className="absolute bottom-2 text-[8px] font-black uppercase tracking-widest" style={{ color: `${color}80` }}>
        {type}
      </div>
    </div>
  );
};

const RestTimer = ({ seconds, onDone }: { seconds: number; onDone: () => void }) => {
  const [remaining, setRemaining] = useState(seconds);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) { clearInterval(intervalRef.current); onDone(); return 0; }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [onDone]);

  const progress = ((seconds - remaining) / seconds) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-50 flex flex-col items-center justify-center p-8"
    >
      <div className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6">DESCANSO</div>
      <div className="relative w-40 h-40 mb-8">
        <svg className="w-full h-full -rotate-90">
          <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
          <motion.circle
            cx="80" cy="80" r="70" fill="none"
            stroke="#3b82f6" strokeWidth="6"
            strokeDasharray={`${2 * Math.PI * 70}`}
            strokeDashoffset={`${2 * Math.PI * 70 * (1 - progress / 100)}`}
            strokeLinecap="round"
            style={{ filter: 'drop-shadow(0 0 8px rgba(59,130,246,0.6))' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-black text-white">{remaining}</span>
          <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">seg</span>
        </div>
      </div>
      <button
        onClick={() => { clearInterval(intervalRef.current); onDone(); }}
        className="px-8 py-3 rounded-2xl bg-blue-500/20 border border-blue-500/30 text-blue-400 font-black text-xs uppercase tracking-widest hover:bg-blue-500/30 transition-all"
      >
        Pular Descanso
      </button>
    </motion.div>
  );
};

const NexusWorkoutSession = () => {
  const { dayIndex } = useParams<{ dayIndex: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [workout, setWorkout]         = useState<any>(null);
  const [loading, setLoading]         = useState(true);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [currentEx, setCurrentEx]     = useState(0);
  const [showRest, setShowRest]       = useState(false);
  const [restSeconds, setRestSeconds] = useState(60);
  const [started, setStarted]         = useState(false);
  const [finished, setFinished]       = useState(false);
  const [saving, setSaving]           = useState(false);
  const [elapsed, setElapsed]         = useState(0);
  const [expandedEx, setExpandedEx]   = useState<number | null>(null);
  const [effort, setEffort]           = useState(3);
  const timerRef = useRef<NodeJS.Timeout>();

  // Workout timer
  useEffect(() => {
    if (started && !finished) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [started, finished]);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, 'nexus_plans', user.uid)).then(snap => {
      if (!snap.exists()) { navigate('/athlete/nexus-trainer'); return; }
      const idx = Number(dayIndex);
      const schedule = snap.data().plan?.weeklySchedule;
      const day = schedule?.[idx];
      if (!day || day.isRest) { navigate('/athlete/nexus-trainer'); return; }
      setWorkout(day);
      setExerciseLogs(
        day.exercises.map((ex: any) => ({
          exerciseId: ex.id,
          name: ex.name,
          notes: '',
          sets: Array.from({ length: ex.series }, () => ({
            reps: parseInt(ex.reps) || 10,
            weight: 0,
            completed: false,
          }))
        }))
      );
      setLoading(false);
    });
  }, [user, dayIndex, navigate]);

  const updateSet = (exIdx: number, setIdx: number, field: 'reps' | 'weight' | 'completed', value: any) => {
    setExerciseLogs(logs => logs.map((log, i) =>
      i === exIdx ? {
        ...log,
        sets: log.sets.map((s, j) => j === setIdx ? { ...s, [field]: value } : s)
      } : log
    ));
  };

  const completeSet = (exIdx: number, setIdx: number) => {
    updateSet(exIdx, setIdx, 'completed', true);
    const ex = workout.exercises[exIdx];
    const rest = ex.restSeconds ?? 60;
    setRestSeconds(rest);
    setShowRest(true);
  };

  const allCompleted = exerciseLogs.every(log => log.sets.every(s => s.completed));

  const handleFinish = async () => {
    if (!user || saving) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'nexus_workout_logs'), {
        userId:          user.uid,
        dayIndex:        Number(dayIndex),
        focus:           workout.focus,
        muscleGroups:    workout.muscleGroups,
        exerciseLogs,
        durationMinutes: Math.round(elapsed / 60),
        effort,
        xp:              WORKOUT_XP,
        completedAt:     serverTimestamp(),
      });

      await updateDoc(doc(db, 'nexus_achievements', user.uid), {
        xp:             increment(WORKOUT_XP),
        totalWorkouts:  increment(1),
        currentStreak:  increment(1),
        updatedAt:      serverTimestamp(),
      }).catch(() => {});

      setFinished(true);
    } catch (err) {
      console.error('Save workout error:', err);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full" />
      </div>
    );
  }

  if (finished) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-8 space-y-8">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 12 }}
          className="w-28 h-28 rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-[0_0_60px_rgba(59,130,246,0.5)]"
        >
          <Trophy className="w-14 h-14 text-white" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="text-[8px] font-black uppercase tracking-[0.4em] text-blue-400 mb-2">TREINO CONCLUÍDO</div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-2">Missão Cumprida!</h1>
          <p className="text-slate-400 text-sm mb-6">{workout.focus} — {formatTime(elapsed)}</p>
          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="text-center">
              <div className="text-2xl font-black text-blue-400">+{WORKOUT_XP}</div>
              <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest">XP</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <div className="text-2xl font-black text-white">{Math.round(elapsed / 60)}</div>
              <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Minutos</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <div className="text-2xl font-black text-white">{exerciseLogs.reduce((acc, l) => acc + l.sets.filter(s => s.completed).length, 0)}</div>
              <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Séries</div>
            </div>
          </div>
        </motion.div>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={() => navigate('/athlete/nexus-trainer')}
          className="px-10 py-4 rounded-2xl bg-blue-500 text-white font-black italic uppercase tracking-widest text-sm hover:bg-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all active:scale-95"
        >
          Voltar ao Painel
        </motion.button>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="flex flex-col gap-6 pb-20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/athlete/nexus-trainer')} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-slate-400">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="text-[8px] font-black uppercase tracking-widest text-blue-400">Treino de Hoje</div>
            <div className="text-lg font-black italic uppercase tracking-tight text-white">{workout.focus}</div>
          </div>
        </div>

        {/* Workout Preview */}
        <div className="bg-slate-900/50 border border-blue-500/20 rounded-3xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600/20 to-transparent border-b border-blue-500/10 p-5 flex items-center gap-4">
            <div className="w-14 h-14 bg-black/40 rounded-2xl overflow-hidden border border-blue-500/20">
              <ExerciseAnimation type="press" />
            </div>
            <div>
              <div className="text-white font-black italic uppercase text-xl">{workout.focus}</div>
              <div className="text-slate-400 text-[10px] font-bold mt-1">
                {workout.muscleGroups?.join(' + ')} • {workout.exercises?.length} exercícios • ~{workout.estimatedMinutes}min
              </div>
            </div>
          </div>

          <div className="p-4 space-y-2">
            {workout.exercises?.map((ex: any, i: number) => (
              <div key={i} className="flex items-center gap-3 bg-black/20 rounded-2xl px-4 py-3 border border-white/5">
                <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <span className="text-[9px] font-black text-blue-400">{i + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="text-xs font-black text-white">{ex.name}</div>
                  <div className="text-[9px] text-slate-500 uppercase font-bold">{ex.series}×{ex.reps} • {ex.restSeconds}s descanso</div>
                </div>
              </div>
            ))}
          </div>

          {workout.tips?.length > 0 && (
            <div className="px-4 pb-4">
              <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-3">
                <div className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1">Dicas do Treino</div>
                {workout.tips.slice(0, 2).map((tip: string, i: number) => (
                  <div key={i} className="text-[10px] text-slate-400 flex items-start gap-2">
                    <span className="text-blue-400 shrink-0">•</span> {tip}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => setStarted(true)}
          className="flex items-center justify-center gap-3 py-5 rounded-2xl bg-blue-500 hover:bg-blue-400 text-white font-black italic uppercase tracking-widest text-sm shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all active:scale-95"
        >
          <Play className="w-5 h-5 fill-current" />
          Iniciar Treino
          <Zap className="w-5 h-5" />
        </button>
      </div>
    );
  }

  const currentExercise = workout.exercises[currentEx];
  const currentLog      = exerciseLogs[currentEx];
  const completedSets   = currentLog?.sets.filter(s => s.completed).length ?? 0;

  return (
    <div className="flex flex-col gap-4 pb-28">
      {/* Rest Timer Overlay */}
      <AnimatePresence>
        {showRest && (
          <RestTimer seconds={restSeconds} onDone={() => setShowRest(false)} />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => { if (window.confirm('Abandonar o treino?')) navigate('/athlete/nexus-trainer'); }}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-slate-400"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="text-[8px] font-black uppercase tracking-widest text-blue-400">{workout.focus}</div>
          <div className="text-xs text-slate-400 font-bold">{formatTime(elapsed)} • {completedSets}/{currentLog?.sets.length} séries</div>
        </div>
        {/* Exercise counter */}
        <div className="flex items-center gap-1">
          {workout.exercises.map((_: any, i: number) => (
            <div key={i} className={cn(
              "w-1.5 h-1.5 rounded-full transition-all",
              i < currentEx   ? "bg-green-400" :
              i === currentEx ? "bg-blue-400 w-3" : "bg-slate-700"
            )} />
          ))}
        </div>
      </div>

      {/* Current Exercise Card */}
      <div className="bg-slate-900/50 border border-blue-500/20 rounded-3xl overflow-hidden">
        <div className="h-32 bg-black/40 border-b border-white/5 relative">
          <ExerciseAnimation type={currentExercise?.animationType || 'press'} />
        </div>
        <div className="p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="flex-1">
              <div className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1">
                Exercício {currentEx + 1} de {workout.exercises.length}
              </div>
              <div className="text-xl font-black italic uppercase tracking-tight text-white leading-none">
                {currentExercise?.name}
              </div>
              <div className="text-[10px] text-slate-500 font-bold mt-1">
                {currentExercise?.series} séries × {currentExercise?.reps} reps
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-2xl font-black text-white">{completedSets}/{currentLog?.sets.length}</div>
              <div className="text-[8px] text-slate-500 font-black uppercase">Séries</div>
            </div>
          </div>

          {/* Technique tip */}
          {currentExercise?.technique && (
            <div className="mb-4 bg-blue-500/5 border border-blue-500/10 rounded-xl p-3">
              <div className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1">Técnica</div>
              <div className="text-[10px] text-slate-400">{currentExercise.technique}</div>
            </div>
          )}

          {/* Sets */}
          <div className="space-y-2">
            {currentLog?.sets.map((s, setIdx) => (
              <div key={setIdx} className={cn(
                "rounded-2xl border p-3 transition-all",
                s.completed ? "bg-green-500/5 border-green-500/20" : "bg-black/20 border-white/5"
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-[10px] font-black",
                    s.completed ? "bg-green-500 text-white" : "bg-slate-800 text-slate-400"
                  )}>
                    {s.completed ? <CheckCircle2 className="w-4 h-4" /> : setIdx + 1}
                  </div>

                  {/* Reps control */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => !s.completed && updateSet(currentEx, setIdx, 'reps', Math.max(1, s.reps - 1))}
                      className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 font-black hover:bg-slate-700 active:scale-90 transition-all disabled:opacity-30"
                      disabled={s.completed}
                    >−</button>
                    <div className="text-center min-w-[2rem]">
                      <div className="text-sm font-black text-white">{s.reps}</div>
                      <div className="text-[7px] text-slate-600 font-black uppercase">reps</div>
                    </div>
                    <button
                      onClick={() => !s.completed && updateSet(currentEx, setIdx, 'reps', s.reps + 1)}
                      className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 font-black hover:bg-slate-700 active:scale-90 transition-all disabled:opacity-30"
                      disabled={s.completed}
                    >+</button>
                  </div>

                  <div className="w-px h-6 bg-white/5" />

                  {/* Weight control */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => !s.completed && updateSet(currentEx, setIdx, 'weight', Math.max(0, s.weight - 2.5))}
                      className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 font-black hover:bg-slate-700 active:scale-90 transition-all disabled:opacity-30 text-xs"
                      disabled={s.completed}
                    >−</button>
                    <div className="text-center min-w-[2.5rem]">
                      <div className="text-sm font-black text-white">{s.weight}</div>
                      <div className="text-[7px] text-slate-600 font-black uppercase">kg</div>
                    </div>
                    <button
                      onClick={() => !s.completed && updateSet(currentEx, setIdx, 'weight', s.weight + 2.5)}
                      className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 font-black hover:bg-slate-700 active:scale-90 transition-all disabled:opacity-30 text-xs"
                      disabled={s.completed}
                    >+</button>
                  </div>

                  {/* Complete button */}
                  {!s.completed && (
                    <button
                      onClick={() => completeSet(currentEx, setIdx)}
                      className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                    >
                      <CheckCircle2 className="w-3 h-3" /> OK
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* All sets done for this exercise */}
      {completedSets === currentLog?.sets.length && currentEx < workout.exercises.length - 1 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <button
            onClick={() => { setCurrentEx(e => e + 1); setExpandedEx(null); }}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-green-500/20 border border-green-500/30 text-green-400 font-black italic uppercase tracking-widest text-xs hover:bg-green-500/30 transition-all active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            Próximo Exercício
            <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Exercise list (collapsed navigation) */}
      <div className="space-y-1">
        <div className="text-[8px] font-black uppercase tracking-widest text-slate-600 px-1">Exercícios</div>
        {workout.exercises.map((ex: any, i: number) => {
          const exLog = exerciseLogs[i];
          const exDone = exLog?.sets.every(s => s.completed);
          return (
            <button
              key={i}
              onClick={() => setCurrentEx(i)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all text-left",
                i === currentEx
                  ? "bg-blue-500/10 border-blue-500/30"
                  : exDone
                  ? "bg-green-500/5 border-green-500/10"
                  : "bg-white/5 border-white/5 hover:border-white/10"
              )}
            >
              <div className={cn(
                "w-6 h-6 rounded-lg flex items-center justify-center shrink-0",
                exDone ? "bg-green-500 text-white" :
                i === currentEx ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-500"
              )}>
                {exDone ? <CheckCircle2 className="w-3 h-3" /> : <span className="text-[9px] font-black">{i + 1}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className={cn("text-[10px] font-black truncate", i === currentEx ? "text-blue-400" : exDone ? "text-green-400" : "text-slate-400")}>
                  {ex.name}
                </div>
                <div className="text-[8px] text-slate-600 font-bold">{ex.series}×{ex.reps}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Finish Workout */}
      {allCompleted && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Effort rating */}
          <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
              <Flame className="w-3 h-3" /> Como foi a intensidade?
            </div>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map(v => (
                <button key={v} onClick={() => setEffort(v)}
                  className={cn("w-10 h-10 rounded-xl font-black text-sm transition-all", v <= effort ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-500")}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleFinish}
            disabled={saving}
            className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black italic uppercase tracking-widest text-sm shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
            ) : (
              <>
                <Trophy className="w-5 h-5" />
                Concluir Treino (+{WORKOUT_XP} XP)
                <Zap className="w-5 h-5" />
              </>
            )}
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default NexusWorkoutSession;
