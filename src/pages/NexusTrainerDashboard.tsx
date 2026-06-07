import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Cpu, Dumbbell, Trophy, Flame, Zap, ChevronRight, Play,
  Calendar, Clock, Target, TrendingUp, Star, CheckCircle2,
  Activity, BarChart2, Brain, Sparkles, RefreshCw, AlertTriangle,
  Plus, Award, Medal
} from 'lucide-react';
import { db } from '../lib/firebase';
import {
  doc, getDoc, onSnapshot, collection, query, where,
  orderBy, limit, getDocs, addDoc, updateDoc, serverTimestamp, Timestamp
} from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { generateAIInsight } from '../services/geminiTrainerService';
import { cn } from '../lib/utils';

const DAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const SHORT_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const XP_PER_LEVEL = 500;

const NexusTrainerDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [nexusProfile, setNexusProfile]   = useState<any>(null);
  const [plan, setPlan]                   = useState<any>(null);
  const [achievements, setAchievements]   = useState<any>(null);
  const [recentLogs, setRecentLogs]       = useState<any[]>([]);
  const [insight, setInsight]             = useState<any>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [loading, setLoading]             = useState(true);
  const [todayLog, setTodayLog]           = useState<any>(null);

  const todayIndex = new Date().getDay();
  const todayName  = DAY_NAMES[todayIndex];

  useEffect(() => {
    if (!user) return;

    const profileUnsub = onSnapshot(doc(db, 'nexus_profiles', user.uid), snap => {
      if (!snap.exists()) {
        navigate('/athlete/nexus-trainer/onboarding');
        return;
      }
      setNexusProfile(snap.data());
    });

    const planUnsub = onSnapshot(doc(db, 'nexus_plans', user.uid), snap => {
      if (snap.exists()) setPlan(snap.data());
      setLoading(false);
    });

    const achUnsub = onSnapshot(doc(db, 'nexus_achievements', user.uid), snap => {
      if (snap.exists()) setAchievements(snap.data());
    });

    return () => { profileUnsub(); planUnsub(); achUnsub(); };
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;
    const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
    const q = query(
      collection(db, 'nexus_workout_logs'),
      where('userId', '==', user.uid),
      where('completedAt', '>=', Timestamp.fromDate(startOfToday)),
      limit(1)
    );
    getDocs(q).then(snap => {
      if (!snap.empty) setTodayLog({ id: snap.docs[0].id, ...snap.docs[0].data() });
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'nexus_workout_logs'),
      where('userId', '==', user.uid),
      orderBy('completedAt', 'desc'),
      limit(7)
    );
    getDocs(q).then(snap => {
      setRecentLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, [user]);

  const fetchInsight = useCallback(async () => {
    if (!user || !nexusProfile || !achievements) return;
    setLoadingInsight(true);
    try {
      const startOfWeek = new Date(); startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); startOfWeek.setHours(0, 0, 0, 0);
      const weekQ = query(
        collection(db, 'nexus_workout_logs'),
        where('userId', '==', user.uid),
        where('completedAt', '>=', Timestamp.fromDate(startOfWeek))
      );
      const weekSnap = await getDocs(weekQ);

      let daysSinceLast = 0;
      if (recentLogs[0]?.completedAt) {
        const lastDate = recentLogs[0].completedAt.toDate();
        daysSinceLast = Math.floor((Date.now() - lastDate.getTime()) / 86400000);
      }

      const result = await generateAIInsight({
        totalWorkouts:       achievements.totalWorkouts ?? 0,
        currentStreak:       achievements.currentStreak ?? 0,
        thisWeekWorkouts:    weekSnap.size,
        goalDaysPerWeek:     nexusProfile.daysPerWeek ?? 4,
        recentPRs:           0,
        userName:            profile?.organizerName || user.displayName || 'Atleta',
        goal:                nexusProfile.goal ?? '',
        daysSinceLastWorkout: daysSinceLast,
      });
      setInsight(result);
    } catch {
      /* silent */
    } finally {
      setLoadingInsight(false);
    }
  }, [user, nexusProfile, achievements, recentLogs, profile]);

  useEffect(() => {
    if (nexusProfile && achievements && !insight) fetchInsight();
  }, [nexusProfile, achievements]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full" />
      </div>
    );
  }

  const todayWorkout = plan?.plan?.weeklySchedule?.[todayIndex];
  const xp           = achievements?.xp ?? 0;
  const lvl          = achievements?.level ?? 1;
  const streak       = achievements?.currentStreak ?? 0;
  const totalWk      = achievements?.totalWorkouts ?? 0;
  const xpInLevel    = xp % XP_PER_LEVEL;
  const xpProgress   = (xpInLevel / XP_PER_LEVEL) * 100;

  const insightColors = {
    success: 'border-green-500/30 bg-green-500/5',
    warning: 'border-yellow-500/30 bg-yellow-500/5',
    info:    'border-blue-500/30 bg-blue-500/5',
  };
  const insightIconColors = {
    success: 'text-green-400',
    warning: 'text-yellow-400',
    info:    'text-blue-400',
  };

  return (
    <div className="space-y-6 pb-20">

      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950/20 to-slate-900 border border-blue-500/10 rounded-3xl p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/5 blur-[60px] rounded-full pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-blue-400">NEXUS TRAINER AI</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black italic uppercase tracking-tighter text-white leading-none">
              Bom dia, <span className="text-blue-400">{(profile?.organizerName || user?.displayName || 'Atleta').split(' ')[0]}.</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {todayWorkout?.isRest ? 'Hoje é seu dia de descanso ativo.' : `Treino de hoje: ${todayWorkout?.focus || 'Aguardando plano'}`}
            </p>
          </div>
          {/* XP Bar */}
          <div className="sm:min-w-[200px]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Nível {lvl}</span>
              <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">{xpInLevel}/{XP_PER_LEVEL} XP</span>
            </div>
            <div className="h-2 bg-slate-900 rounded-full border border-white/5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"
              />
            </div>
            <div className="text-[8px] text-slate-600 mt-1 font-black uppercase tracking-widest">
              {XP_PER_LEVEL - xpInLevel} XP para nível {lvl + 1}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Sequência', value: `${streak}d`, icon: <Flame className="w-4 h-4" />, color: 'orange' },
          { label: 'Treinos',   value: totalWk,       icon: <Dumbbell className="w-4 h-4" />, color: 'blue' },
          { label: 'XP Total',  value: xp,            icon: <Star className="w-4 h-4" />,    color: 'yellow' },
        ].map(stat => (
          <div key={stat.label} className="bg-slate-900/50 border border-white/5 rounded-2xl p-4 text-center">
            <div className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-2",
              stat.color === 'orange' ? "bg-orange-500/10 text-orange-400" :
              stat.color === 'blue'   ? "bg-blue-500/10 text-blue-400" :
                                        "bg-yellow-500/10 text-yellow-400"
            )}>
              {stat.icon}
            </div>
            <div className="text-xl font-black text-white">{stat.value}</div>
            <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* NEXUS AI Insight */}
      <AnimatePresence mode="wait">
        {insight ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "border rounded-3xl p-5 relative overflow-hidden",
              insightColors[insight.alertLevel as keyof typeof insightColors] || insightColors.info
            )}
          >
            <div className="absolute top-0 right-0 w-24 h-24 opacity-10 pointer-events-none">
              <Cpu className="w-full h-full" />
            </div>
            <div className="flex items-start gap-4">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                insight.alertLevel === 'success' ? "bg-green-500/20" :
                insight.alertLevel === 'warning' ? "bg-yellow-500/20" : "bg-blue-500/20"
              )}>
                <Brain className={cn("w-5 h-5", insightIconColors[insight.alertLevel as keyof typeof insightIconColors] || insightIconColors.info)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">NEXUS AI</span>
                  <span className={cn("text-[8px] font-black uppercase tracking-widest",
                    insight.alertLevel === 'success' ? "text-green-400" :
                    insight.alertLevel === 'warning' ? "text-yellow-400" : "text-blue-400"
                  )}>• {insight.alertLevel === 'success' ? 'Ótimo' : insight.alertLevel === 'warning' ? 'Atenção' : 'Info'}</span>
                </div>
                <div className="font-black italic uppercase tracking-tight text-white text-sm mb-1">{insight.headline}</div>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-3">{insight.message}</p>
                {insight.recommendations?.slice(0, 2).map((rec: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 mb-1">
                    <div className="w-1 h-1 bg-blue-400 rounded-full mt-1.5 shrink-0" />
                    <span className="text-[10px] text-slate-400">{rec}</span>
                  </div>
                ))}
                <div className="mt-3 pt-3 border-t border-white/5 text-[10px] italic text-slate-500">
                  "{insight.motivationalPhrase}"
                </div>
              </div>
            </div>
            <button
              onClick={fetchInsight}
              disabled={loadingInsight}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white transition-all"
            >
              <RefreshCw className={cn("w-3 h-3", loadingInsight && "animate-spin")} />
            </button>
          </motion.div>
        ) : loadingInsight ? (
          <div className="border border-blue-500/10 bg-blue-500/5 rounded-3xl p-5 flex items-center gap-4">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full shrink-0" />
            <div>
              <div className="text-[8px] font-black uppercase tracking-widest text-blue-400 mb-1">NEXUS AI</div>
              <div className="text-xs text-slate-400">Analisando seu desempenho...</div>
            </div>
          </div>
        ) : null}
      </AnimatePresence>

      {/* Today's Workout */}
      {todayWorkout && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Calendar className="w-3 h-3" /> Treino de Hoje — {todayName}
            </h2>
          </div>
          {todayWorkout.isRest ? (
            <div className="bg-slate-900/30 border border-white/5 rounded-3xl p-8 text-center">
              <div className="text-5xl mb-4">😴</div>
              <div className="font-black italic uppercase text-xl text-white mb-2">Dia de Descanso</div>
              <p className="text-slate-400 text-sm">O descanso é parte do treino. Recupere-se bem para amanhã.</p>
              <div className="mt-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                Dica: caminhada leve ou alongamento são ótimas opções para recuperação ativa.
              </div>
            </div>
          ) : todayLog ? (
            <div className="bg-green-500/5 border border-green-500/20 rounded-3xl p-6 flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-7 h-7 text-green-400" />
              </div>
              <div className="flex-1">
                <div className="font-black italic uppercase text-green-400 text-sm mb-0.5">Treino Concluído!</div>
                <div className="text-white font-black text-lg">{todayWorkout.focus}</div>
                <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">+100 XP conquistados hoje</div>
              </div>
              <Trophy className="w-8 h-8 text-yellow-400" />
            </div>
          ) : (
            <div className="bg-slate-900/50 border border-blue-500/20 rounded-3xl overflow-hidden">
              {/* Workout Header */}
              <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/10 border-b border-blue-500/10 p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                  <Dumbbell className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[8px] font-black uppercase tracking-[0.2em] text-blue-400 mb-0.5">Seu Treino</div>
                  <div className="font-black italic uppercase tracking-tight text-white text-xl leading-none">{todayWorkout.focus}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 font-bold">
                    {todayWorkout.muscleGroups?.join(' + ')} • ~{todayWorkout.estimatedMinutes}min
                  </div>
                </div>
              </div>

              {/* Exercises List */}
              <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                {todayWorkout.exercises?.slice(0, 5).map((ex: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 bg-black/20 rounded-2xl px-4 py-3 border border-white/5">
                    <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                      <span className="text-[9px] font-black text-blue-400">{i + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-black text-white truncate">{ex.name}</div>
                      <div className="text-[9px] text-slate-500 uppercase font-black tracking-wider">
                        {ex.series} × {ex.reps} • {Math.round(ex.restSeconds / 60)}min descanso
                      </div>
                    </div>
                  </div>
                ))}
                {todayWorkout.exercises?.length > 5 && (
                  <div className="text-center text-[9px] text-slate-600 font-black uppercase tracking-widest py-1">
                    + {todayWorkout.exercises.length - 5} exercícios
                  </div>
                )}
              </div>

              {/* Start Button */}
              <div className="p-4 pt-0">
                <Link
                  to={`/athlete/nexus-trainer/workout/${todayIndex}`}
                  className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-blue-500 hover:bg-blue-400 text-white font-black italic uppercase tracking-widest text-xs transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Iniciar Treino
                  <Zap className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Weekly Overview */}
      {plan?.plan?.weeklySchedule && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Calendar className="w-3 h-3" /> Semana Completa
            </h2>
            <Link to="/athlete/nexus-trainer/plan" className="text-[9px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-1 hover:text-blue-300">
              Ver plano <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {plan.plan.weeklySchedule.map((day: any, i: number) => {
              const isToday = i === todayIndex;
              const isPast  = i < todayIndex;
              return (
                <Link
                  key={i}
                  to={day.isRest ? '#' : `/athlete/nexus-trainer/workout/${i}`}
                  className={cn(
                    "aspect-square rounded-xl flex flex-col items-center justify-center text-center transition-all p-1",
                    day.isRest
                      ? "bg-slate-900/30 border border-white/5 cursor-default"
                      : isToday
                      ? "bg-blue-500 border border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                      : isPast
                      ? "bg-slate-900/50 border border-white/5 hover:border-white/15"
                      : "bg-slate-900/30 border border-white/5 hover:border-blue-500/20"
                  )}
                >
                  <div className={cn(
                    "text-[7px] font-black uppercase tracking-wider",
                    isToday ? "text-white" : "text-slate-500"
                  )}>
                    {SHORT_DAYS[i]}
                  </div>
                  {day.isRest ? (
                    <div className="text-slate-700 text-[10px] mt-0.5">—</div>
                  ) : (
                    <Dumbbell className={cn("w-3 h-3 mt-0.5", isToday ? "text-white" : isPast ? "text-slate-600" : "text-blue-500/50")} />
                  )}
                </Link>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-4 mt-2 text-[8px] font-black uppercase tracking-widest text-slate-600">
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-blue-500" /> Hoje</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-slate-700" /> Descanso</span>
          </div>
        </div>
      )}

      {/* Recent Workouts */}
      {recentLogs.length > 0 && (
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
            <Activity className="w-3 h-3" /> Histórico Recente
          </h2>
          <div className="space-y-2">
            {recentLogs.slice(0, 4).map(log => (
              <div key={log.id} className="flex items-center gap-4 bg-slate-900/30 border border-white/5 rounded-2xl px-4 py-3">
                <div className="w-8 h-8 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-black text-white truncate">{log.focus || 'Treino'}</div>
                  <div className="text-[9px] text-slate-500 uppercase font-black tracking-widest">
                    {log.completedAt?.toDate
                      ? log.completedAt.toDate().toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })
                      : 'Recente'
                    }
                    {log.durationMinutes ? ` • ${log.durationMinutes}min` : ''}
                  </div>
                </div>
                <div className="text-[9px] font-black text-blue-400">+{log.xp ?? 100} XP</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Exercícios',   icon: <Dumbbell className="w-5 h-5" />,   to: '/athlete/nexus-trainer/exercises', color: 'blue' },
          { label: 'Progresso',    icon: <TrendingUp className="w-5 h-5" />, to: '/athlete/nexus-trainer/progress',  color: 'green' },
          { label: 'Conquistas',   icon: <Trophy className="w-5 h-5" />,     to: '/athlete/nexus-trainer/achievements', color: 'yellow' },
          { label: 'Meu Plano',    icon: <BarChart2 className="w-5 h-5" />,  to: '/athlete/nexus-trainer/plan',      color: 'purple' },
        ].map(action => (
          <Link
            key={action.label}
            to={action.to}
            className={cn(
              "flex items-center gap-3 bg-slate-900/50 border border-white/5 rounded-2xl p-4 hover:border-white/15 transition-all group active:scale-95"
            )}
          >
            <div className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center",
              action.color === 'blue'   ? "bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20" :
              action.color === 'green'  ? "bg-green-500/10 text-green-400 group-hover:bg-green-500/20" :
              action.color === 'yellow' ? "bg-yellow-500/10 text-yellow-400 group-hover:bg-yellow-500/20" :
                                          "bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20"
            )}>
              {action.icon}
            </div>
            <span className="text-xs font-black uppercase italic tracking-tight text-white">{action.label}</span>
            <ChevronRight className="w-3 h-3 text-slate-600 ml-auto group-hover:text-slate-400 transition-colors" />
          </Link>
        ))}
      </div>

      {/* Regenerate Plan */}
      <div className="text-center pt-2">
        <Link
          to="/athlete/nexus-trainer/onboarding"
          className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-600 hover:text-slate-400 transition-colors"
        >
          <RefreshCw className="w-3 h-3" /> Reconfigurar plano
        </Link>
      </div>
    </div>
  );
};

export default NexusTrainerDashboard;
