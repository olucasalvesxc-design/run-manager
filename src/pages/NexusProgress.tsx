import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft, TrendingUp, Scale, Ruler, Plus, Calendar,
  BarChart2, Camera, CheckCircle2, X, ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts';
import { db } from '../lib/firebase';
import {
  collection, query, where, orderBy, getDocs, addDoc,
  serverTimestamp, limit
} from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';

const MEASURE_FIELDS = [
  { id: 'weight',    label: 'Peso',        unit: 'kg',  icon: <Scale className="w-4 h-4" /> },
  { id: 'waist',     label: 'Cintura',     unit: 'cm',  icon: <Ruler className="w-4 h-4" /> },
  { id: 'chest',     label: 'Peito',       unit: 'cm',  icon: <Ruler className="w-4 h-4" /> },
  { id: 'arm',       label: 'Braço',       unit: 'cm',  icon: <Ruler className="w-4 h-4" /> },
  { id: 'hip',       label: 'Quadril',     unit: 'cm',  icon: <Ruler className="w-4 h-4" /> },
  { id: 'thigh',     label: 'Coxa',        unit: 'cm',  icon: <Ruler className="w-4 h-4" /> },
  { id: 'calf',      label: 'Panturrilha', unit: 'cm',  icon: <Ruler className="w-4 h-4" /> },
  { id: 'abdomen',   label: 'Abdômen',     unit: 'cm',  icon: <Ruler className="w-4 h-4" /> },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 shadow-2xl">
      <div className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="text-sm font-black text-white">
          {p.value} <span className="text-slate-400 text-[10px]">{p.unit || ''}</span>
        </div>
      ))}
    </div>
  );
};

const NexusProgress = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [measurements, setMeasurements]   = useState<any[]>([]);
  const [workoutLogs, setWorkoutLogs]     = useState<any[]>([]);
  const [showForm, setShowForm]           = useState(false);
  const [saving, setSaving]               = useState(false);
  const [activeChart, setActiveChart]     = useState<string>('weight');
  const [form, setForm]                   = useState<Record<string, number>>({});
  const [notes, setNotes]                 = useState('');
  const [expandStats, setExpandStats]     = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchMeasurements();
    fetchWorkoutLogs();
  }, [user]);

  const fetchMeasurements = async () => {
    const q = query(
      collection(db, 'nexus_measurements'),
      where('userId', '==', user!.uid),
      orderBy('createdAt', 'asc'),
      limit(50)
    );
    const snap = await getDocs(q);
    setMeasurements(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const fetchWorkoutLogs = async () => {
    const q = query(
      collection(db, 'nexus_workout_logs'),
      where('userId', '==', user!.uid),
      orderBy('completedAt', 'asc'),
      limit(30)
    );
    const snap = await getDocs(q);
    setWorkoutLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const handleSaveMeasurement = async () => {
    if (!user || saving) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'nexus_measurements'), {
        userId: user.uid,
        ...form,
        notes,
        date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        createdAt: serverTimestamp(),
      });
      setShowForm(false);
      setForm({});
      setNotes('');
      await fetchMeasurements();
    } finally {
      setSaving(false);
    }
  };

  const chartData = measurements.map(m => ({
    date: m.date || '—',
    value: m[activeChart] ?? null,
  })).filter(d => d.value !== null);

  const latest   = measurements[measurements.length - 1];
  const previous = measurements[measurements.length - 2];

  const getDelta = (field: string) => {
    if (!latest || !previous) return null;
    const diff = (latest[field] ?? 0) - (previous[field] ?? 0);
    return diff;
  };

  // Weekly workout frequency
  const weeklyFrequency = (() => {
    const last8Weeks: { week: string; count: number }[] = [];
    for (let w = 7; w >= 0; w--) {
      const start = new Date();
      start.setDate(start.getDate() - w * 7 - start.getDay());
      start.setHours(0, 0, 0, 0);
      const end = new Date(start); end.setDate(end.getDate() + 7);

      const count = workoutLogs.filter(log => {
        if (!log.completedAt?.toDate) return false;
        const d = log.completedAt.toDate();
        return d >= start && d < end;
      }).length;

      const label = `${start.getDate().toString().padStart(2, '0')}/${(start.getMonth() + 1).toString().padStart(2, '0')}`;
      last8Weeks.push({ week: label, count });
    }
    return last8Weeks;
  })();

  return (
    <div className="space-y-6 pb-20">
      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl overflow-y-auto"
          >
            <div className="p-6 max-w-lg mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">Nova Medição</h2>
                <button onClick={() => setShowForm(false)} className="p-2 rounded-xl bg-white/5 text-slate-400 hover:bg-white/10">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {MEASURE_FIELDS.map(field => (
                  <div key={field.id}>
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-1">
                      {field.icon} {field.label} ({field.unit})
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={form[field.id] ?? ''}
                      onChange={e => setForm(f => ({ ...f, [field.id]: parseFloat(e.target.value) || 0 }))}
                      placeholder={latest?.[field.id] ? `Último: ${latest[field.id]}` : '—'}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-700 focus:outline-none focus:border-blue-500/50 transition-colors"
                    />
                  </div>
                ))}
              </div>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Observações (opcional)..."
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-700 resize-none focus:outline-none focus:border-blue-500/50 mb-4"
                rows={2}
              />
              <button
                onClick={handleSaveMeasurement}
                disabled={saving || Object.keys(form).length === 0}
                className="w-full py-4 rounded-2xl bg-blue-500 text-white font-black italic uppercase tracking-widest text-sm hover:bg-blue-400 transition-all disabled:opacity-50 active:scale-95"
              >
                {saving ? 'Salvando...' : 'Salvar Medição'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/athlete/nexus-trainer')} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-slate-400">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="text-[8px] font-black uppercase tracking-[0.3em] text-blue-400">NEXUS TRAINER</div>
            <h1 className="text-xl font-black italic uppercase tracking-tighter text-white">Meu Progresso</h1>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-500/20 border border-blue-500/30 text-blue-400 font-black text-xs uppercase tracking-widest hover:bg-blue-500/30 transition-all"
        >
          <Plus className="w-4 h-4" /> Medição
        </button>
      </div>

      {/* Latest stats */}
      {latest && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">Última Medição — {latest.date}</div>
            <button onClick={() => setExpandStats(!expandStats)} className="text-slate-500 hover:text-white transition-colors">
              {expandStats ? <ChevronDown className="w-4 h-4 rotate-180" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
          <div className={cn("grid gap-2", expandStats ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-4")}>
            {MEASURE_FIELDS.slice(0, expandStats ? undefined : 4).map(field => {
              const val   = latest[field.id];
              const delta = getDelta(field.id);
              if (!val) return null;
              const isGood = field.id === 'weight'
                ? delta !== null && delta <= 0
                : delta !== null && delta >= 0;
              return (
                <div key={field.id} className="bg-slate-900/50 border border-white/5 rounded-2xl p-3">
                  <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{field.label}</div>
                  <div className="text-xl font-black text-white">{val}<span className="text-[10px] text-slate-500 ml-1">{field.unit}</span></div>
                  {delta !== null && (
                    <div className={cn("text-[9px] font-black mt-0.5", isGood ? "text-green-400" : "text-red-400")}>
                      {delta > 0 ? '+' : ''}{delta.toFixed(1)} {field.unit}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-blue-400">
            <TrendingUp className="w-4 h-4" />
            <span className="text-[9px] font-black uppercase tracking-widest">Evolução</span>
          </div>
        </div>

        {/* Metric selector */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {MEASURE_FIELDS.map(f => (
            <button
              key={f.id}
              onClick={() => setActiveChart(f.id)}
              className={cn(
                "shrink-0 text-[8px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all",
                activeChart === f.id
                  ? "bg-blue-500/20 border-blue-500 text-blue-400"
                  : "border-white/10 text-slate-500 hover:border-white/20"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {chartData.length > 1 ? (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="date" stroke="#475569" fontSize={9} fontWeight={900} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={9} fontWeight={900} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#60a5fa' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center">
            <div className="text-center">
              <BarChart2 className="w-10 h-10 text-slate-800 mx-auto mb-3" />
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                Registre pelo menos 2 medições para ver o gráfico
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Workout Frequency */}
      <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-5">
        <div className="flex items-center gap-2 text-blue-400 mb-4">
          <Calendar className="w-4 h-4" />
          <span className="text-[9px] font-black uppercase tracking-widest">Frequência de Treinos (8 semanas)</span>
        </div>
        {workoutLogs.length > 0 ? (
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyFrequency} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="week" stroke="#475569" fontSize={9} fontWeight={900} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={9} fontWeight={900} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={4} stroke="rgba(59,130,246,0.2)" strokeDasharray="4 4" />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  dot={{ fill: '#22d3ee', r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest text-center">
              Complete treinos para ver sua frequência
            </p>
          </div>
        )}
      </div>

      {/* Measurement history */}
      {measurements.length > 0 && (
        <div>
          <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-3">Histórico de Medições</div>
          <div className="space-y-2">
            {[...measurements].reverse().slice(0, 8).map(m => (
              <div key={m.id} className="bg-slate-900/30 border border-white/5 rounded-2xl px-4 py-3 flex items-center gap-4">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Scale className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{m.date}</div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {MEASURE_FIELDS.filter(f => m[f.id]).map(f => (
                      <span key={f.id} className="text-[9px] text-slate-400 font-bold">
                        {f.label}: <span className="text-white">{m[f.id]}{f.unit}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {measurements.length === 0 && workoutLogs.length === 0 && (
        <div className="py-20 text-center">
          <TrendingUp className="w-14 h-14 text-slate-800 mx-auto mb-4" />
          <h3 className="text-lg font-black italic uppercase text-slate-500">Nenhum dado ainda</h3>
          <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest mt-2">
            Complete treinos e registre medições para acompanhar sua evolução.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-500/20 border border-blue-500/30 text-blue-400 font-black text-xs uppercase tracking-widest hover:bg-blue-500/30 transition-all"
          >
            <Plus className="w-4 h-4" /> Primeira Medição
          </button>
        </div>
      )}
    </div>
  );
};

export default NexusProgress;
