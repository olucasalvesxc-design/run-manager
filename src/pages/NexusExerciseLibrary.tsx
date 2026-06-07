import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, ChevronLeft, Filter, CheckCircle2, AlertTriangle, Lightbulb, Dumbbell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  EXERCISE_DATABASE, MUSCLE_GROUPS, ExerciseEntry,
  MuscleGroupId, searchExercises, getExercisesByMuscle
} from '../data/exerciseDatabase';
import { cn } from '../lib/utils';

const MuscleBodyMap = ({
  selected,
  onSelect
}: {
  selected: MuscleGroupId | null;
  onSelect: (id: MuscleGroupId | null) => void;
}) => {
  const muscleAreas: { id: MuscleGroupId; label: string; cx: number; cy: number; rx: number; ry: number }[] = [
    { id: 'ombros',      label: 'Ombros',      cx: 40,  cy: 92,  rx: 14, ry: 10 },
    { id: 'ombros',      label: 'Ombros',      cx: 110, cy: 92,  rx: 14, ry: 10 },
    { id: 'peito',       label: 'Peito',       cx: 75,  cy: 108, rx: 22, ry: 14 },
    { id: 'biceps',      label: 'Bíceps',      cx: 30,  cy: 118, rx: 9,  ry: 14 },
    { id: 'biceps',      label: 'Bíceps',      cx: 120, cy: 118, rx: 9,  ry: 14 },
    { id: 'triceps',     label: 'Tríceps',     cx: 26,  cy: 132, rx: 7,  ry: 10 },
    { id: 'triceps',     label: 'Tríceps',     cx: 124, cy: 132, rx: 7,  ry: 10 },
    { id: 'abdomen',     label: 'Abdômen',     cx: 75,  cy: 132, rx: 16, ry: 18 },
    { id: 'quadriceps',  label: 'Quad.',       cx: 57,  cy: 175, rx: 15, ry: 22 },
    { id: 'quadriceps',  label: 'Quad.',       cx: 93,  cy: 175, rx: 15, ry: 22 },
    { id: 'panturrilha', label: 'Pant.',       cx: 57,  cy: 218, rx: 10, ry: 14 },
    { id: 'panturrilha', label: 'Pant.',       cx: 93,  cy: 218, rx: 10, ry: 14 },
  ];

  // Back side
  const backAreas: { id: MuscleGroupId; cx: number; cy: number; rx: number; ry: number }[] = [
    { id: 'costas',    cx: 75,  cy: 112, rx: 22, ry: 20 },
    { id: 'gluteos',   cx: 75,  cy: 155, rx: 20, ry: 16 },
    { id: 'posterior', cx: 57,  cy: 180, rx: 14, ry: 20 },
    { id: 'posterior', cx: 93,  cy: 180, rx: 14, ry: 20 },
  ];

  const getColor = (id: MuscleGroupId) => {
    const mg = MUSCLE_GROUPS.find(m => m.id === id);
    return mg?.color || '#3b82f6';
  };

  const BodyShape = ({ side = 'front' }: { side?: 'front' | 'back' }) => (
    <svg viewBox="0 0 150 260" className="w-full h-full">
      {/* Body silhouette */}
      <g opacity="0.3">
        {/* Head */}
        <ellipse cx="75" cy="55" rx="22" ry="26" fill="#334155" />
        {/* Neck */}
        <rect x="67" y="78" width="16" height="10" rx="4" fill="#334155" />
        {/* Torso */}
        <path d="M42 88 Q30 95 28 140 Q28 155 35 158 L45 158 L45 240 Q45 248 57 248 L67 248 L67 200 L83 200 L83 248 L93 248 Q105 248 105 240 L105 158 L115 158 Q122 155 122 140 Q120 95 108 88 Z" fill="#334155" />
        {/* Arms */}
        <path d="M42 88 Q20 100 18 155 Q18 165 28 165 Q34 145 38 110 Z" fill="#334155" />
        <path d="M108 88 Q130 100 132 155 Q132 165 122 165 Q116 145 112 110 Z" fill="#334155" />
        {/* Forearms */}
        <path d="M18 155 Q12 180 15 195 Q22 195 28 165 Z" fill="#2d3748" />
        <path d="M132 155 Q138 180 135 195 Q128 195 122 165 Z" fill="#2d3748" />
      </g>

      {/* Muscle areas */}
      {side === 'front' ? muscleAreas.map((area, idx) => {
        const isSelected = selected === area.id;
        const color = getColor(area.id);
        return (
          <ellipse
            key={idx}
            cx={area.cx} cy={area.cy}
            rx={area.rx} ry={area.ry}
            fill={isSelected ? color : `${color}40`}
            stroke={isSelected ? color : `${color}80`}
            strokeWidth={isSelected ? 2 : 1}
            style={{ cursor: 'pointer', filter: isSelected ? `drop-shadow(0 0 6px ${color})` : 'none' }}
            onClick={() => onSelect(selected === area.id ? null : area.id)}
          />
        );
      }) : backAreas.map((area, idx) => {
        const isSelected = selected === area.id;
        const color = getColor(area.id);
        return (
          <ellipse
            key={idx}
            cx={area.cx} cy={area.cy}
            rx={area.rx} ry={area.ry}
            fill={isSelected ? color : `${color}40`}
            stroke={isSelected ? color : `${color}80`}
            strokeWidth={isSelected ? 2 : 1}
            style={{ cursor: 'pointer', filter: isSelected ? `drop-shadow(0 0 6px ${color})` : 'none' }}
            onClick={() => onSelect(selected === area.id ? null : area.id)}
          />
        );
      })}
    </svg>
  );

  return (
    <div className="flex gap-4 justify-center">
      <div className="w-28 h-48 relative">
        <div className="text-[7px] text-center text-slate-600 font-black uppercase tracking-widest mb-1">Frente</div>
        <BodyShape side="front" />
      </div>
      <div className="w-28 h-48 relative">
        <div className="text-[7px] text-center text-slate-600 font-black uppercase tracking-widest mb-1">Costas</div>
        <BodyShape side="back" />
      </div>
    </div>
  );
};

const ExerciseCard = ({ exercise, onClick }: { exercise: ExerciseEntry; onClick: () => void }) => {
  const mg = MUSCLE_GROUPS.find(m => m.id === exercise.primaryMuscle);
  const levelColors = {
    iniciante:     'bg-green-500/10 text-green-400 border-green-500/20',
    intermediario: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    avancado:      'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="w-full bg-slate-900/50 border border-white/5 hover:border-white/15 rounded-2xl p-4 text-left transition-all group"
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${mg?.color}20`, border: `1px solid ${mg?.color}40` }}
        >
          <Dumbbell className="w-5 h-5" style={{ color: mg?.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-black text-white text-sm leading-tight group-hover:text-blue-400 transition-colors">
            {exercise.name}
          </div>
          <div className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-0.5">
            {exercise.category}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className={cn(
              "text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border",
              levelColors[exercise.level]
            )}>
              {exercise.level}
            </span>
            {exercise.equipment.slice(0, 1).map((eq, i) => (
              <span key={i} className="text-[8px] text-slate-600 font-bold">{eq}</span>
            ))}
          </div>
        </div>
      </div>
    </motion.button>
  );
};

const ExerciseDetail = ({ exercise, onClose }: { exercise: ExerciseEntry; onClose: () => void }) => {
  const mg = MUSCLE_GROUPS.find(m => m.id === exercise.primaryMuscle);
  const levelColors = {
    iniciante:     'text-green-400',
    intermediario: 'text-yellow-400',
    avancado:      'text-red-400',
  };
  const [tab, setTab] = useState<'exec' | 'errors' | 'tips'>('exec');

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      className="fixed inset-0 z-50 bg-slate-950 overflow-y-auto"
    >
      {/* Exercise animation header */}
      <div className="relative h-48 overflow-hidden" style={{ background: `linear-gradient(135deg, ${mg?.color}10, transparent)` }}>
        <button onClick={onClose} className="absolute top-4 left-4 z-10 p-2 rounded-xl bg-black/40 text-white hover:bg-black/60 transition-all">
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Animated representation */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-32 h-32 rounded-full"
            style={{ background: `radial-gradient(circle, ${mg?.color}30 0%, transparent 70%)` }}
          />
          <Dumbbell className="absolute w-16 h-16" style={{ color: `${mg?.color}60` }} />
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Title */}
        <div>
          <div className="text-[8px] font-black uppercase tracking-[0.3em] mb-1" style={{ color: mg?.color }}>
            {exercise.category}
          </div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none">
            {exercise.name}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={cn("text-[9px] font-black uppercase", levelColors[exercise.level])}>
              ● {exercise.level}
            </span>
            <span className="text-[9px] text-slate-600">•</span>
            <span className="text-[9px] text-slate-500 font-bold">{exercise.equipment.join(', ')}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-slate-400 text-sm leading-relaxed">{exercise.description}</p>

        {/* Muscles */}
        <div>
          <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Músculos</div>
          <div className="flex flex-wrap gap-2">
            {exercise.muscles.map(m => {
              const muscleGroup = MUSCLE_GROUPS.find(mg => mg.id === m);
              const isPrimary = m === exercise.primaryMuscle;
              return (
                <span
                  key={m}
                  className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border"
                  style={{
                    color: muscleGroup?.color,
                    background: `${muscleGroup?.color}15`,
                    borderColor: `${muscleGroup?.color}${isPrimary ? '60' : '30'}`,
                  }}
                >
                  {isPrimary ? '★ ' : ''}{muscleGroup?.name}
                </span>
              );
            })}
          </div>
        </div>

        {/* Tabs */}
        <div>
          <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-white/5 mb-4">
            {([
              { id: 'exec',   label: 'Execução',   icon: <CheckCircle2 className="w-3 h-3" /> },
              { id: 'errors', label: 'Erros',       icon: <AlertTriangle className="w-3 h-3" /> },
              { id: 'tips',   label: 'Dicas',       icon: <Lightbulb className="w-3 h-3" /> },
            ] as const).map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                  tab === t.id ? "bg-blue-500 text-white shadow-lg" : "text-slate-500 hover:text-white"
                )}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              {tab === 'exec' && (
                <div className="space-y-2">
                  {exercise.execution.map((step, i) => (
                    <div key={i} className="flex items-start gap-3 bg-slate-900/50 rounded-xl p-3">
                      <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0 text-[10px] font-black text-blue-400">
                        {i + 1}
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              )}
              {tab === 'errors' && (
                <div className="space-y-2">
                  {exercise.commonMistakes.map((err, i) => (
                    <div key={i} className="flex items-start gap-3 bg-red-500/5 border border-red-500/10 rounded-xl p-3">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-300 leading-relaxed">{err}</p>
                    </div>
                  ))}
                </div>
              )}
              {tab === 'tips' && (
                <div className="space-y-2">
                  {exercise.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-3 bg-blue-500/5 border border-blue-500/10 rounded-xl p-3">
                      <Lightbulb className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-300 leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

const NexusExerciseLibrary = () => {
  const navigate = useNavigate();
  const [query, setQuery]           = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroupId | null>(null);
  const [selectedLevel, setSelectedLevel]   = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseEntry | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let list = query ? searchExercises(query) : EXERCISE_DATABASE;
    if (selectedMuscle) list = list.filter(e => e.muscles.includes(selectedMuscle));
    if (selectedLevel) list = list.filter(e => e.level === selectedLevel);
    return list;
  }, [query, selectedMuscle, selectedLevel]);

  const grouped = useMemo((): Record<string, ExerciseEntry[]> => {
    const groups: Record<string, ExerciseEntry[]> = {};
    filtered.forEach(ex => {
      if (!groups[ex.category]) groups[ex.category] = [];
      groups[ex.category].push(ex);
    });
    return groups;
  }, [filtered]);

  return (
    <div className="space-y-6 pb-20">
      <AnimatePresence>
        {selectedExercise && (
          <ExerciseDetail exercise={selectedExercise} onClose={() => setSelectedExercise(null)} />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/athlete/nexus-trainer')} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-slate-400">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <div className="text-[8px] font-black uppercase tracking-[0.3em] text-blue-400">NEXUS TRAINER</div>
          <h1 className="text-xl font-black italic uppercase tracking-tighter text-white">Biblioteca de Exercícios</h1>
        </div>
      </div>

      {/* Muscle Map */}
      <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-5">
        <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center justify-between">
          <span>Mapa Muscular — toque para filtrar</span>
          {selectedMuscle && (
            <button onClick={() => setSelectedMuscle(null)} className="text-blue-400 hover:text-blue-300 flex items-center gap-1">
              <X className="w-3 h-3" /> Limpar
            </button>
          )}
        </div>
        <MuscleBodyMap selected={selectedMuscle} onSelect={setSelectedMuscle} />

        {/* Muscle chips */}
        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          {MUSCLE_GROUPS.map(mg => (
            <button
              key={mg.id}
              onClick={() => setSelectedMuscle(selectedMuscle === mg.id ? null : mg.id)}
              className={cn(
                "text-[8px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border transition-all",
                selectedMuscle === mg.id
                  ? "border-transparent text-white"
                  : "border-white/10 text-slate-500 hover:border-white/20"
              )}
              style={selectedMuscle === mg.id ? {
                background: `${mg.color}30`,
                borderColor: mg.color,
                color: mg.color,
                boxShadow: `0 0 10px ${mg.glowColor}`
              } : {}}
            >
              {mg.name}
            </button>
          ))}
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar exercício..."
            className="w-full bg-slate-900/50 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "px-4 py-3 rounded-2xl border font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2",
            showFilters
              ? "bg-blue-500/20 border-blue-500/50 text-blue-400"
              : "bg-slate-900/50 border-white/10 text-slate-400 hover:border-white/20"
          )}
        >
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Level filter */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <div className="flex gap-2 flex-wrap">
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest self-center">Nível:</span>
              {['iniciante', 'intermediario', 'avancado'].map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(selectedLevel === lvl ? null : lvl)}
                  className={cn(
                    "text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all",
                    selectedLevel === lvl
                      ? lvl === 'iniciante' ? "bg-green-500/20 border-green-500 text-green-400" :
                        lvl === 'intermediario' ? "bg-yellow-500/20 border-yellow-500 text-yellow-400" :
                        "bg-red-500/20 border-red-500 text-red-400"
                      : "border-white/10 text-slate-500 hover:border-white/20"
                  )}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results count */}
      <div className="text-[9px] font-black uppercase tracking-widest text-slate-600">
        {filtered.length} exercício{filtered.length !== 1 ? 's' : ''}
        {selectedMuscle && ` em ${MUSCLE_GROUPS.find(m => m.id === selectedMuscle)?.name}`}
      </div>

      {/* Exercise List */}
      {Object.entries(grouped).map(([category, exercises]) => (
        <div key={category}>
          <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
            <div className="flex-1 h-px bg-white/5" />
            <span>{category}</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>
          <div className="space-y-2">
            {(exercises as ExerciseEntry[]).map(ex => (
              <React.Fragment key={ex.id}>
                <ExerciseCard exercise={ex} onClick={() => setSelectedExercise(ex)} />
              </React.Fragment>
            ))}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="py-20 text-center">
          <Dumbbell className="w-12 h-12 text-slate-800 mx-auto mb-4" />
          <p className="text-slate-600 font-black uppercase text-[10px] tracking-widest">Nenhum exercício encontrado</p>
          <button onClick={() => { setQuery(''); setSelectedMuscle(null); setSelectedLevel(null); }}
            className="mt-4 text-blue-400 text-[10px] font-black uppercase tracking-widest hover:text-blue-300">
            Limpar filtros
          </button>
        </div>
      )}
    </div>
  );
};

export default NexusExerciseLibrary;
