import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Target, Flame, Dumbbell, Activity, Wind, Heart, Zap, Shield,
  User, Scale, Ruler, BarChart2, MapPin, Calendar, Clock,
  AlertTriangle, ChevronRight, ChevronLeft, Cpu, CheckCircle2,
  Trophy
} from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { generateFitnessPlan, FitnessProfile } from '../services/geminiTrainerService';
import { cn } from '../lib/utils';

const GOALS = [
  { id: 'hipertrofia',    label: 'Hipertrofia',      sub: 'Ganho de massa muscular',    icon: <Dumbbell className="w-6 h-6" />,  color: 'blue' },
  { id: 'emagrecimento',  label: 'Emagrecimento',    sub: 'Perda de gordura',            icon: <Flame className="w-6 h-6" />,     color: 'orange' },
  { id: 'forca',          label: 'Força',            sub: 'Ganhar força máxima',         icon: <Shield className="w-6 h-6" />,    color: 'purple' },
  { id: 'condicionamento',label: 'Condicionamento',  sub: 'Resistência e fôlego',        icon: <Activity className="w-6 h-6" />,  color: 'green' },
  { id: 'corrida',        label: 'Corrida',          sub: 'Performance em corrida',      icon: <Wind className="w-6 h-6" />,      color: 'cyan' },
  { id: 'saude_geral',    label: 'Saúde Geral',      sub: 'Bem-estar e qualidade de vida',icon: <Heart className="w-6 h-6" />,   color: 'red' },
  { id: 'calistenia',     label: 'Calistenia',       sub: 'Peso corporal e habilidade',  icon: <Zap className="w-6 h-6" />,      color: 'yellow' },
  { id: 'funcional',      label: 'Funcional',        sub: 'Mobilidade e movimento',      icon: <Target className="w-6 h-6" />,   color: 'teal' },
];

const LEVELS = [
  { id: 'iniciante',     label: 'Iniciante',     sub: 'Menos de 1 ano de treino',  stars: 1 },
  { id: 'intermediario', label: 'Intermediário', sub: '1 a 3 anos de treino',       stars: 2 },
  { id: 'avancado',      label: 'Avançado',      sub: 'Mais de 3 anos de treino',   stars: 3 },
];

const LOCATIONS = [
  { id: 'academia',   label: 'Academia',     sub: 'Todos os equipamentos', icon: '🏋️' },
  { id: 'casa',       label: 'Casa',         sub: 'Sem equipamentos',       icon: '🏠' },
  { id: 'condominio', label: 'Condomínio',   sub: 'Academia básica',        icon: '🏢' },
  { id: 'ar_livre',   label: 'Ar Livre',     sub: 'Parques e espaços',      icon: '🌳' },
];

const SESSION_TIMES = [
  { id: 30,  label: '30 min', sub: 'Treino rápido e intenso' },
  { id: 45,  label: '45 min', sub: 'Sessão moderada' },
  { id: 60,  label: '60 min', sub: 'Sessão completa' },
  { id: 90,  label: '90 min', sub: 'Treino extenso' },
];

const goalColors: Record<string, string> = {
  blue: 'border-blue-500 bg-blue-500/10 text-blue-400',
  orange: 'border-orange-500 bg-orange-500/10 text-orange-400',
  purple: 'border-purple-500 bg-purple-500/10 text-purple-400',
  green: 'border-green-500 bg-green-500/10 text-green-400',
  cyan: 'border-cyan-500 bg-cyan-500/10 text-cyan-400',
  red: 'border-red-500 bg-red-500/10 text-red-400',
  yellow: 'border-yellow-500 bg-yellow-500/10 text-yellow-400',
  teal: 'border-teal-500 bg-teal-500/10 text-teal-400',
};

const NexusOnboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<FitnessProfile>({
    goal: '',
    age: 25,
    weight: 75,
    height: 175,
    level: 'iniciante',
    location: 'academia',
    daysPerWeek: 4,
    minutesPerSession: 60,
    limitations: '',
    injuries: '',
    gender: 'masculino',
  });

  const steps = [
    'Objetivo', 'Perfil', 'Nível', 'Local', 'Frequência', 'Saúde'
  ];

  const canAdvance = () => {
    if (step === 0) return !!form.goal;
    if (step === 1) return form.age > 0 && form.weight > 0 && form.height > 0;
    return true;
  };

  const handleGenerate = async () => {
    if (!user) return;
    setGenerating(true);
    setError('');
    try {
      const plan = await generateFitnessPlan(form);
      await setDoc(doc(db, 'nexus_profiles', user.uid), {
        ...form,
        onboardingCompleted: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await setDoc(doc(db, 'nexus_plans', user.uid), {
        userId: user.uid,
        plan,
        isActive: true,
        generatedAt: serverTimestamp(),
      });
      await setDoc(doc(db, 'nexus_achievements', user.uid), {
        userId: user.uid,
        xp: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        totalWorkouts: 0,
        unlocked: [],
        createdAt: serverTimestamp(),
      }, { merge: true });
      navigate('/athlete/nexus-trainer');
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar plano. Verifique a conexão e tente novamente.');
      setGenerating(false);
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  };
  const [direction, setDirection] = useState(1);

  const goNext = () => { if (!canAdvance()) return; setDirection(1); setStep(s => s + 1); };
  const goBack = () => { setDirection(-1); setStep(s => s - 1); };

  if (generating) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="w-20 h-20 rounded-full border-4 border-blue-500/20 border-t-blue-500 mb-8"
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Cpu className="w-6 h-6 text-blue-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">NEXUS TRAINER AI</span>
          </div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-3">
            Criando seu Plano...
          </h2>
          <p className="text-slate-400 text-sm">
            A IA está analisando seu perfil e criando um programa personalizado exclusivo para você.
          </p>
          {error && (
            <div className="mt-6 bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-red-400 text-sm">
              {error}
              <button
                onClick={() => { setGenerating(false); setError(''); }}
                className="block mt-2 text-[10px] uppercase font-black underline"
              >
                Tentar novamente
              </button>
            </div>
          )}
          <div className="mt-8 flex gap-2 justify-center">
            {['Analisando perfil', 'Criando divisão', 'Selecionando exercícios', 'Finalizando plano'].map((label, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.8 }}
                className="text-[8px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ delay: i * 0.8, duration: 0.5 }}
                  className="w-1.5 h-1.5 bg-blue-500 rounded-full"
                />
                {label}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="p-6 sm:p-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="text-[8px] font-black uppercase tracking-[0.3em] text-blue-400">NEXUS TRAINER AI</div>
            <div className="text-xs font-black italic uppercase tracking-tighter text-white">Configuração Inicial</div>
          </div>
        </div>
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
          {step + 1} / {steps.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-6 sm:px-8 mb-8">
        <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
            className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
          />
        </div>
        <div className="flex justify-between mt-2">
          {steps.map((s, i) => (
            <span key={i} className={cn(
              "text-[8px] font-black uppercase tracking-widest",
              i === step ? "text-blue-400" : i < step ? "text-slate-500" : "text-slate-700"
            )}>
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 px-6 sm:px-8 pb-32 max-w-2xl mx-auto w-full">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25 }}
          >
            {/* STEP 0: Objetivo */}
            {step === 0 && (
              <div>
                <h1 className="text-3xl sm:text-4xl font-black italic uppercase tracking-tighter text-white mb-2">
                  Qual é o seu <span className="text-blue-400">objetivo?</span>
                </h1>
                <p className="text-slate-400 text-sm mb-8">Seja honesto — seu plano será totalmente personalizado.</p>
                <div className="grid grid-cols-2 gap-3">
                  {GOALS.map(goal => (
                    <button
                      key={goal.id}
                      onClick={() => setForm(f => ({ ...f, goal: goal.id }))}
                      className={cn(
                        "p-4 rounded-2xl border-2 text-left transition-all active:scale-95",
                        form.goal === goal.id
                          ? goalColors[goal.color]
                          : "border-white/5 bg-white/5 hover:border-white/15 hover:bg-white/10"
                      )}
                    >
                      <div className={cn("mb-2", form.goal === goal.id ? "" : "text-slate-500")}>
                        {goal.icon}
                      </div>
                      <div className="text-xs font-black uppercase italic tracking-tight text-white">{goal.label}</div>
                      <div className="text-[9px] text-slate-500 mt-0.5">{goal.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 1: Perfil */}
            {step === 1 && (
              <div>
                <h1 className="text-3xl sm:text-4xl font-black italic uppercase tracking-tighter text-white mb-2">
                  Seu <span className="text-blue-400">perfil físico</span>
                </h1>
                <p className="text-slate-400 text-sm mb-8">Esses dados permitem que a IA calcule seu plano com precisão.</p>

                <div className="space-y-4">
                  {/* Gender */}
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Sexo</label>
                    <div className="flex gap-3">
                      {(['masculino', 'feminino'] as const).map(g => (
                        <button
                          key={g}
                          onClick={() => setForm(f => ({ ...f, gender: g }))}
                          className={cn(
                            "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all",
                            form.gender === g
                              ? "bg-blue-500/20 border-blue-500 text-blue-400"
                              : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20"
                          )}
                        >
                          {g === 'masculino' ? '♂ Masculino' : '♀ Feminino'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Age */}
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block flex items-center gap-2">
                      <User className="w-3 h-3" /> Idade
                    </label>
                    <div className="flex items-center gap-4 bg-slate-900/50 border border-white/10 rounded-2xl p-4">
                      <button onClick={() => setForm(f => ({ ...f, age: Math.max(10, f.age - 1) }))}
                        className="w-10 h-10 rounded-xl bg-slate-800 text-white font-black text-lg hover:bg-slate-700 active:scale-90 transition-all">−</button>
                      <div className="flex-1 text-center">
                        <span className="text-4xl font-black text-white">{form.age}</span>
                        <span className="text-slate-500 text-sm ml-2">anos</span>
                      </div>
                      <button onClick={() => setForm(f => ({ ...f, age: Math.min(80, f.age + 1) }))}
                        className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 font-black text-lg hover:bg-blue-500/30 active:scale-90 transition-all">+</button>
                    </div>
                  </div>

                  {/* Weight */}
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block flex items-center gap-2">
                      <Scale className="w-3 h-3" /> Peso (kg)
                    </label>
                    <div className="flex items-center gap-4 bg-slate-900/50 border border-white/10 rounded-2xl p-4">
                      <button onClick={() => setForm(f => ({ ...f, weight: Math.max(30, f.weight - 1) }))}
                        className="w-10 h-10 rounded-xl bg-slate-800 text-white font-black text-lg hover:bg-slate-700 active:scale-90 transition-all">−</button>
                      <div className="flex-1 text-center">
                        <span className="text-4xl font-black text-white">{form.weight}</span>
                        <span className="text-slate-500 text-sm ml-2">kg</span>
                      </div>
                      <button onClick={() => setForm(f => ({ ...f, weight: Math.min(250, f.weight + 1) }))}
                        className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 font-black text-lg hover:bg-blue-500/30 active:scale-90 transition-all">+</button>
                    </div>
                  </div>

                  {/* Height */}
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block flex items-center gap-2">
                      <Ruler className="w-3 h-3" /> Altura (cm)
                    </label>
                    <div className="flex items-center gap-4 bg-slate-900/50 border border-white/10 rounded-2xl p-4">
                      <button onClick={() => setForm(f => ({ ...f, height: Math.max(100, f.height - 1) }))}
                        className="w-10 h-10 rounded-xl bg-slate-800 text-white font-black text-lg hover:bg-slate-700 active:scale-90 transition-all">−</button>
                      <div className="flex-1 text-center">
                        <span className="text-4xl font-black text-white">{form.height}</span>
                        <span className="text-slate-500 text-sm ml-2">cm</span>
                      </div>
                      <button onClick={() => setForm(f => ({ ...f, height: Math.min(250, f.height + 1) }))}
                        className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 font-black text-lg hover:bg-blue-500/30 active:scale-90 transition-all">+</button>
                    </div>
                  </div>
                  <div className="text-center text-[10px] text-slate-500 font-black uppercase tracking-widest">
                    IMC: {(form.weight / ((form.height / 100) ** 2)).toFixed(1)}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Nível */}
            {step === 2 && (
              <div>
                <h1 className="text-3xl sm:text-4xl font-black italic uppercase tracking-tighter text-white mb-2">
                  Qual seu <span className="text-blue-400">nível?</span>
                </h1>
                <p className="text-slate-400 text-sm mb-8">Seja honesto — um plano adequado ao seu nível é mais eficaz e seguro.</p>
                <div className="space-y-3">
                  {LEVELS.map(lvl => (
                    <button
                      key={lvl.id}
                      onClick={() => setForm(f => ({ ...f, level: lvl.id as any }))}
                      className={cn(
                        "w-full p-5 rounded-2xl border-2 text-left flex items-center gap-5 transition-all active:scale-95",
                        form.level === lvl.id
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-white/5 bg-white/5 hover:border-white/15"
                      )}
                    >
                      <div className="flex gap-1">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className={cn(
                            "w-3 h-3 rounded-full",
                            i < lvl.stars ? (form.level === lvl.id ? "bg-blue-400" : "bg-slate-400") : "bg-slate-800"
                          )} />
                        ))}
                      </div>
                      <div className="flex-1">
                        <div className={cn("font-black italic uppercase tracking-tight", form.level === lvl.id ? "text-blue-400" : "text-white")}>
                          {lvl.label}
                        </div>
                        <div className="text-[10px] text-slate-500">{lvl.sub}</div>
                      </div>
                      {form.level === lvl.id && <CheckCircle2 className="w-5 h-5 text-blue-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: Local */}
            {step === 3 && (
              <div>
                <h1 className="text-3xl sm:text-4xl font-black italic uppercase tracking-tighter text-white mb-2">
                  Onde você <span className="text-blue-400">treina?</span>
                </h1>
                <p className="text-slate-400 text-sm mb-8">Os exercícios serão adaptados ao ambiente disponível.</p>
                <div className="grid grid-cols-2 gap-3">
                  {LOCATIONS.map(loc => (
                    <button
                      key={loc.id}
                      onClick={() => setForm(f => ({ ...f, location: loc.id as any }))}
                      className={cn(
                        "p-5 rounded-2xl border-2 text-center transition-all active:scale-95",
                        form.location === loc.id
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-white/5 bg-white/5 hover:border-white/15"
                      )}
                    >
                      <div className="text-4xl mb-2">{loc.icon}</div>
                      <div className={cn("font-black italic uppercase text-sm", form.location === loc.id ? "text-blue-400" : "text-white")}>
                        {loc.label}
                      </div>
                      <div className="text-[9px] text-slate-500 mt-0.5">{loc.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: Frequência */}
            {step === 4 && (
              <div>
                <h1 className="text-3xl sm:text-4xl font-black italic uppercase tracking-tighter text-white mb-2">
                  Sua <span className="text-blue-400">frequência</span>
                </h1>
                <p className="text-slate-400 text-sm mb-8">Quantos dias por semana e por quanto tempo?</p>

                <div className="space-y-8">
                  {/* Days per week */}
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> Dias por semana
                    </label>
                    <div className="grid grid-cols-7 gap-2">
                      {[1, 2, 3, 4, 5, 6, 7].map(d => (
                        <button
                          key={d}
                          onClick={() => setForm(f => ({ ...f, daysPerWeek: d }))}
                          className={cn(
                            "aspect-square rounded-xl font-black text-sm transition-all active:scale-90",
                            form.daysPerWeek === d
                              ? "bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                              : "bg-slate-900 border border-white/10 text-slate-400 hover:border-blue-500/30"
                          )}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                    <div className="text-center mt-2 text-[10px] text-slate-500 font-black uppercase">
                      {form.daysPerWeek} dia{form.daysPerWeek > 1 ? 's' : ''} de treino + {7 - form.daysPerWeek} descanso
                    </div>
                  </div>

                  {/* Session duration */}
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block flex items-center gap-2">
                      <Clock className="w-3 h-3" /> Tempo por sessão
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {SESSION_TIMES.map(t => (
                        <button
                          key={t.id}
                          onClick={() => setForm(f => ({ ...f, minutesPerSession: t.id }))}
                          className={cn(
                            "p-4 rounded-2xl border-2 text-left transition-all active:scale-95",
                            form.minutesPerSession === t.id
                              ? "border-blue-500 bg-blue-500/10"
                              : "border-white/5 bg-white/5 hover:border-white/15"
                          )}
                        >
                          <div className={cn("text-xl font-black italic", form.minutesPerSession === t.id ? "text-blue-400" : "text-white")}>
                            {t.label}
                          </div>
                          <div className="text-[9px] text-slate-500">{t.sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: Saúde */}
            {step === 5 && (
              <div>
                <h1 className="text-3xl sm:text-4xl font-black italic uppercase tracking-tighter text-white mb-2">
                  Sua <span className="text-blue-400">saúde</span>
                </h1>
                <p className="text-slate-400 text-sm mb-8">Essas informações garantem que seu plano seja seguro e eficaz.</p>

                <div className="space-y-5">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block flex items-center gap-2">
                      <AlertTriangle className="w-3 h-3 text-yellow-400" /> Limitações físicas
                    </label>
                    <textarea
                      value={form.limitations}
                      onChange={e => setForm(f => ({ ...f, limitations: e.target.value }))}
                      placeholder="Ex: dor no joelho, problemas na coluna, não consigo agachar fundo..."
                      className="w-full bg-slate-900/50 border border-white/10 rounded-2xl p-4 text-white text-sm placeholder-slate-600 resize-none focus:outline-none focus:border-blue-500/50 transition-colors"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block flex items-center gap-2">
                      <Shield className="w-3 h-3 text-red-400" /> Lesões anteriores
                    </label>
                    <textarea
                      value={form.injuries}
                      onChange={e => setForm(f => ({ ...f, injuries: e.target.value }))}
                      placeholder="Ex: lesão no manguito rotador em 2022, entorse de tornozelo recorrente..."
                      className="w-full bg-slate-900/50 border border-white/10 rounded-2xl p-4 text-white text-sm placeholder-slate-600 resize-none focus:outline-none focus:border-blue-500/50 transition-colors"
                      rows={3}
                    />
                  </div>

                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                      <BarChart2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-black text-blue-400 uppercase italic mb-1">Resumo do seu plano</div>
                        <div className="text-[10px] text-slate-400 space-y-1">
                          <div>• Objetivo: <span className="text-white font-bold">{GOALS.find(g => g.id === form.goal)?.label}</span></div>
                          <div>• Nível: <span className="text-white font-bold">{LEVELS.find(l => l.id === form.level)?.label}</span></div>
                          <div>• Local: <span className="text-white font-bold">{LOCATIONS.find(l => l.id === form.location)?.label}</span></div>
                          <div>• Frequência: <span className="text-white font-bold">{form.daysPerWeek}x/semana, {form.minutesPerSession}min</span></div>
                          <div>• Perfil: <span className="text-white font-bold">{form.age} anos, {form.weight}kg, {form.height}cm</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-xl border-t border-white/5 p-6 flex gap-4 max-w-2xl mx-auto w-full">
        {step > 0 && (
          <button
            onClick={goBack}
            className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
          >
            <ChevronLeft className="w-4 h-4" /> Voltar
          </button>
        )}
        {step < steps.length - 1 ? (
          <button
            onClick={goNext}
            disabled={!canAdvance()}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all",
              canAdvance()
                ? "bg-blue-500 text-white hover:bg-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.4)] active:scale-95"
                : "bg-slate-900 text-slate-600 cursor-not-allowed border border-white/5"
            )}
          >
            Continuar <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleGenerate}
            className="flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-500 hover:to-cyan-400 shadow-[0_0_30px_rgba(59,130,246,0.4)] active:scale-95 transition-all"
          >
            <Cpu className="w-5 h-5" />
            Gerar Meu Plano com IA
            <Trophy className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default NexusOnboarding;
