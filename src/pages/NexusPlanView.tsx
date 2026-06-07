import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Dumbbell, Moon, Clock, ChevronRight, Play } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';

const DAY_NAMES  = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
const SHORT_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const MUSCLE_COLORS: Record<string, string> = {
  peito: '#3b82f6', costas: '#8b5cf6', ombros: '#06b6d4',
  biceps: '#10b981', triceps: '#f59e0b', abdomen: '#ef4444',
  quadriceps: '#ec4899', posterior: '#f97316', gluteos: '#84cc16', panturrilha: '#14b8a6',
};

const NexusPlanView = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [plan, setPlan]     = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number>(new Date().getDay());

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, 'nexus_plans', user.uid)).then(snap => {
      if (snap.exists()) setPlan(snap.data().plan);
      setLoading(false);
    });
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 gap-4">
        <Dumbbell className="w-14 h-14 text-slate-700" />
        <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">Nenhum plano ativo</h2>
        <p className="text-slate-400 text-sm">Faça o onboarding para gerar seu plano personalizado.</p>
        <Link to="/athlete/nexus-trainer/onboarding" className="px-6 py-3 rounded-2xl bg-blue-500 text-white font-black text-xs uppercase tracking-widest hover:bg-blue-400 transition-all">
          Criar Plano
        </Link>
      </div>
    );
  }

  const schedule  = plan.weeklySchedule ?? [];
  const selectedDay = schedule[selected];

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/athlete/nexus-trainer')} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-slate-400">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <div className="text-[8px] font-black uppercase tracking-[0.3em] text-blue-400">NEXUS TRAINER</div>
          <h1 className="text-xl font-black italic uppercase tracking-tighter text-white">{plan.title || 'Meu Plano Semanal'}</h1>
        </div>
      </div>

      {/* Plan Summary */}
      <div className="bg-slate-900/50 border border-blue-500/10 rounded-3xl p-5">
        <div className="text-[9px] font-black uppercase tracking-widest text-blue-400 mb-2">Objetivo: {plan.goal}</div>
        <p className="text-slate-400 text-sm leading-relaxed">{plan.description}</p>
        <div className="flex gap-4 mt-4 pt-4 border-t border-white/5">
          <div>
            <div className="text-[8px] text-slate-600 font-black uppercase">Semanas</div>
            <div className="text-lg font-black text-white">{plan.totalWeeks}</div>
          </div>
          <div>
            <div className="text-[8px] text-slate-600 font-black uppercase">Nível</div>
            <div className="text-lg font-black text-white capitalize">{plan.level}</div>
          </div>
          <div>
            <div className="text-[8px] text-slate-600 font-black uppercase">Treinos/semana</div>
            <div className="text-lg font-black text-white">{schedule.filter((d: any) => !d.isRest).length}x</div>
          </div>
        </div>
      </div>

      {/* Day Selector */}
      <div className="grid grid-cols-7 gap-1.5">
        {schedule.map((day: any, i: number) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={cn(
              "aspect-square rounded-xl flex flex-col items-center justify-center transition-all p-1",
              day.isRest
                ? selected === i
                  ? "bg-slate-700 border border-slate-600"
                  : "bg-slate-900/30 border border-white/5"
                : selected === i
                ? "bg-blue-500 border border-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.4)]"
                : "bg-slate-900/50 border border-white/5 hover:border-blue-500/30"
            )}
          >
            <div className={cn("text-[7px] font-black uppercase tracking-wider", selected === i ? "text-white" : "text-slate-500")}>
              {SHORT_DAYS[i]}
            </div>
            {day.isRest
              ? <Moon className={cn("w-2.5 h-2.5 mt-0.5", selected === i ? "text-slate-300" : "text-slate-700")} />
              : <Dumbbell className={cn("w-2.5 h-2.5 mt-0.5", selected === i ? "text-white" : "text-blue-500/50")} />
            }
          </button>
        ))}
      </div>

      {/* Selected Day Detail */}
      {selectedDay && (
        <motion.div
          key={selected}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {selectedDay.isRest ? (
            <div className="bg-slate-900/30 border border-white/5 rounded-3xl p-8 text-center">
              <Moon className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <div className="font-black italic uppercase text-white text-xl mb-2">{DAY_NAMES[selected]}</div>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Dia de Descanso</div>
              <p className="text-slate-500 text-sm mt-3">
                O descanso é fundamental para a recuperação muscular e crescimento.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Day Header */}
              <div className="bg-gradient-to-r from-blue-600/20 to-transparent border border-blue-500/20 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center shrink-0">
                  <Dumbbell className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="text-[9px] font-black text-blue-400 uppercase tracking-widest">{DAY_NAMES[selected]}</div>
                  <div className="font-black italic uppercase text-xl text-white">{selectedDay.focus}</div>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1 text-[9px] text-slate-500 font-bold">
                      <Clock className="w-3 h-3" /> ~{selectedDay.estimatedMinutes}min
                    </div>
                    <div className="text-[9px] text-slate-500">•</div>
                    <div className="text-[9px] text-slate-500 font-bold">
                      {selectedDay.exercises?.length} exercícios
                    </div>
                  </div>
                </div>
              </div>

              {/* Muscle Groups */}
              {selectedDay.muscleGroups?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedDay.muscleGroups.map((mg: string, i: number) => {
                    const color = Object.entries(MUSCLE_COLORS).find(([k]) => mg.toLowerCase().includes(k))?.[1] || '#3b82f6';
                    return (
                      <span
                        key={i}
                        className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full"
                        style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
                      >
                        {mg}
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Exercises */}
              <div className="space-y-2">
                {selectedDay.exercises?.map((ex: any, i: number) => (
                  <div key={i} className="bg-slate-900/50 border border-white/5 rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 text-[10px] font-black text-blue-400">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-black text-white text-sm">{ex.name}</div>
                        <div className="text-[9px] text-slate-500 uppercase font-bold mt-0.5">
                          {ex.series} séries × {ex.reps} • {ex.restSeconds}s descanso
                        </div>
                        {ex.notes && (
                          <div className="text-[10px] text-slate-400 mt-1 leading-relaxed">{ex.notes}</div>
                        )}
                        {ex.technique && (
                          <div className="mt-2 bg-blue-500/5 border border-blue-500/10 rounded-xl p-2">
                            <span className="text-[8px] font-black text-blue-400 uppercase">Técnica: </span>
                            <span className="text-[10px] text-slate-400">{ex.technique}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tips */}
              {selectedDay.tips?.length > 0 && (
                <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4">
                  <div className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-2">Dicas do Treino</div>
                  {selectedDay.tips.map((tip: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 mb-1">
                      <div className="w-1 h-1 bg-blue-400 rounded-full mt-1.5 shrink-0" />
                      <span className="text-[10px] text-slate-400 leading-relaxed">{tip}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Start Button */}
              <Link
                to={`/athlete/nexus-trainer/workout/${selected}`}
                className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-blue-500 hover:bg-blue-400 text-white font-black italic uppercase tracking-widest text-xs transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                Iniciar Este Treino
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </motion.div>
      )}

      {/* General Tips */}
      {plan.generalTips?.length > 0 && (
        <div className="bg-slate-900/30 border border-white/5 rounded-3xl p-5">
          <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-3">Dicas Gerais do Programa</div>
          {plan.generalTips.map((tip: string, i: number) => (
            <div key={i} className="flex items-start gap-2 mb-2">
              <div className="w-1 h-1 bg-blue-400 rounded-full mt-2 shrink-0" />
              <p className="text-[11px] text-slate-400 leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      )}

      {/* Nutrition Tips */}
      {plan.nutritionTips?.length > 0 && (
        <div className="bg-green-500/5 border border-green-500/10 rounded-3xl p-5">
          <div className="text-[9px] font-black uppercase tracking-widest text-green-400 mb-3">Nutrição</div>
          {plan.nutritionTips.map((tip: string, i: number) => (
            <div key={i} className="flex items-start gap-2 mb-2">
              <div className="w-1 h-1 bg-green-400 rounded-full mt-2 shrink-0" />
              <p className="text-[11px] text-slate-400 leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      )}

      {/* Progression */}
      {plan.progressionPlan && (
        <div className="bg-purple-500/5 border border-purple-500/10 rounded-3xl p-5">
          <div className="text-[9px] font-black uppercase tracking-widest text-purple-400 mb-2">Progressão de Cargas</div>
          <p className="text-[11px] text-slate-400 leading-relaxed">{plan.progressionPlan}</p>
        </div>
      )}
    </div>
  );
};

export default NexusPlanView;
