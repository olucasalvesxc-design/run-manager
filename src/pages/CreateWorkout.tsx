import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { 
  Dumbbell, 
  ArrowLeft, 
  Save, 
  Calendar,
  Type,
  FileText,
  Activity as ActivityIcon,
  Award,
  Loader2,
  CheckCircle2,
  Plus,
  Trash2,
  Video,
  Target,
  Layout
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { TrainerClient, Exercise, WorkoutGoal } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const CreateWorkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clientIdFromUrl = searchParams.get('clientId');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [clients, setClients] = useState<TrainerClient[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);

  const [formData, setFormData] = useState({
    clientId: clientIdFromUrl || '',
    title: '',
    goal: 'hipertrofia' as WorkoutGoal,
    division: 'Treino A',
    notes: '',
  });

  const [exercises, setExercises] = useState<Exercise[]>([
    { id: '1', name: '', series: 3, reps: '12', rest: '60s' }
  ]);

  useEffect(() => {
    if (!user) return;
    const fetchClients = async () => {
      try {
        const q = query(collection(db, 'trainer_clients'), where('trainerId', '==', user.uid));
        const snap = await getDocs(q);
        setClients(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TrainerClient[]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingClients(false);
      }
    };
    fetchClients();
  }, [user]);

  const addExercise = () => {
    setExercises([...exercises, { id: Math.random().toString(), name: '', series: 3, reps: '12', rest: '60s' }]);
  };

  const removeExercise = (id: string) => {
    if (exercises.length === 1) return;
    setExercises(exercises.filter(e => e.id !== id));
  };

  const updateExercise = (id: string, field: keyof Exercise, value: any) => {
    setExercises(exercises.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.clientId) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'workouts'), {
        trainerId: user.uid,
        ...formData,
        exercises,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setSuccess(true);
      setTimeout(() => navigate(-1), 2000);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar treino');
    } finally {
      setLoading(false);
    }
  };

  const goals: WorkoutGoal[] = ['emagrecimento', 'hipertrofia', 'resistencia', 'corrida', 'mobilidade', 'reabilitacao'];

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      <Link 
        to="/organizer/training-consulting"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="text-[10px] font-black uppercase tracking-widest italic">Voltar ao Painel</span>
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-white/5 px-4 sm:px-0">
        <div className="space-y-4">
           <div className="flex items-center gap-3 text-yellow-400">
              <Dumbbell className="w-5 h-5" />
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] italic">Nova Prescrição</span>
           </div>
           <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-black italic uppercase tracking-tighter leading-none">
             Configurar <span className="text-yellow-400">Treino.</span>
           </h1>
        </div>
      </div>

      <AnimatePresence>
        {success ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-500/10 border-2 border-green-500/20 p-12 rounded-[3.5rem] text-center space-y-6"
          >
             <div className="w-20 h-20 bg-green-500 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                <CheckCircle2 className="w-10 h-10 text-slate-950" />
             </div>
             <h2 className="text-3xl font-display font-black italic uppercase tracking-wider text-green-500">Treino Enviado!</h2>
             <p className="text-slate-400 text-xs font-black uppercase tracking-widest italic">O atleta já pode visualizar no painel dele.</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Sidebar Config */}
              <div className="space-y-6">
                <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-white/5 space-y-8 backdrop-blur-md">
                  <div className="space-y-4">
                     <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2 ml-2">
                           <ActivityIcon className="w-4 h-4 text-slate-600" />
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Aluno / Atleta</label>
                        </div>
                        <select 
                          required
                          value={formData.clientId}
                          onChange={e => setFormData({...formData, clientId: e.target.value})}
                          className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:border-yellow-400 transition-colors appearance-none text-white lg:text-xs"
                        >
                          <option value="">Selecione o aluno...</option>
                          {clients.map(client => (
                            <option key={client.id} value={client.id} className="bg-slate-900">{client.name}</option>
                          ))}
                        </select>
                     </div>

                     <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2 ml-2">
                           <Target className="w-4 h-4 text-slate-600" />
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Objetivo do Treino</label>
                        </div>
                        <select 
                          required
                          value={formData.goal}
                          onChange={e => setFormData({...formData, goal: e.target.value as WorkoutGoal})}
                          className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:border-yellow-400 transition-colors appearance-none text-white lg:text-xs"
                        >
                          <option value="hipertrofia">Hipertrofia</option>
                          <option value="ganho_massa">Ganho de Massa</option>
                          <option value="emagrecimento">Emagrecimento</option>
                          <option value="resistencia">Resistência Muscular</option>
                          <option value="vo2_max">Melhora de VO2 Max</option>
                          <option value="corrida">Foco em Corrida</option>
                          <option value="fortalecimento">Fortalecimento</option>
                          <option value="potencia">Potência / Explosão</option>
                          <option value="recuperacao_ativa">Recuperação Ativa</option>
                          <option value="mobilidade">Mobilidade & Flexibilidade</option>
                          <option value="reabilitacao">Reabilitação</option>
                        </select>
                     </div>

                     <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2 ml-2">
                           <Layout className="w-4 h-4 text-slate-600" />
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Divisão do Treino</label>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                           {['A', 'B', 'C', 'D'].map(letter => (
                             <button
                               key={letter}
                               type="button"
                               onClick={() => setFormData({...formData, division: `Treino ${letter}`})}
                               className={cn(
                                 "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                 formData.division === `Treino ${letter}` 
                                   ? "bg-yellow-400 text-black border-yellow-400" 
                                   : "bg-black/20 text-slate-500 border-white/5 hover:border-white/20"
                               )}
                             >
                               {letter}
                             </button>
                           ))}
                        </div>
                        <input 
                          required
                          value={formData.division}
                          onChange={e => setFormData({...formData, division: e.target.value})}
                          className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:border-yellow-400 transition-colors"
                          placeholder="Ex: Treino A ou Full Body"
                        />
                     </div>
                  </div>
                </div>
              </div>

              {/* Exercises List */}
              <div className="lg:col-span-2 space-y-8">
                 <div className="bg-slate-900/50 p-8 rounded-[3rem] border border-white/5 backdrop-blur-md">
                    <div className="flex items-center justify-between mb-10">
                       <h3 className="text-xl font-display font-black italic uppercase tracking-wider">Exercícios</h3>
                       <button 
                         type="button"
                         onClick={addExercise}
                         className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10"
                       >
                          <Plus className="w-4 h-4" />
                          Adicionar
                       </button>
                    </div>

                    <div className="space-y-6">
                       <AnimatePresence mode="popLayout">
                          {exercises.map((ex, index) => (
                            <motion.div 
                              layout
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              key={ex.id} 
                              className="bg-black/40 p-6 rounded-[2rem] border border-white/5 space-y-4 relative group"
                            >
                               <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                  <div className="md:col-span-2 space-y-2">
                                     <label className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Nome do Exercício</label>
                                     <input 
                                       required
                                       value={ex.name}
                                       onChange={e => updateExercise(ex.id, 'name', e.target.value)}
                                       className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-yellow-400 transition-colors"
                                       placeholder="Ex: Supino Reto"
                                     />
                                  </div>
                                  <div className="space-y-2">
                                     <label className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Séries</label>
                                     <input 
                                       type="number"
                                       value={ex.series}
                                       onChange={e => updateExercise(ex.id, 'series', parseInt(e.target.value))}
                                       className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-yellow-400 transition-colors"
                                     />
                                  </div>
                                  <div className="space-y-2">
                                     <label className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Repetições</label>
                                     <input 
                                       value={ex.reps}
                                       onChange={e => updateExercise(ex.id, 'reps', e.target.value)}
                                       className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-yellow-400 transition-colors"
                                       placeholder="12-15"
                                     />
                                  </div>
                               </div>

                               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="space-y-2">
                                     <label className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Descanso</label>
                                     <input 
                                       value={ex.rest}
                                       onChange={e => updateExercise(ex.id, 'rest', e.target.value)}
                                       className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-yellow-400 transition-colors"
                                       placeholder="60s"
                                     />
                                  </div>
                                  <div className="md:col-span-2 space-y-2">
                                     <label className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Vídeo demonstrativo (Opcional)</label>
                                     <div className="relative">
                                        <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600" />
                                        <input 
                                          value={ex.videoUrl}
                                          onChange={e => updateExercise(ex.id, 'videoUrl', e.target.value)}
                                          className="w-full bg-slate-900 border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold focus:outline-none focus:border-yellow-400 transition-colors"
                                          placeholder="URL do Youtube/Instagram"
                                        />
                                     </div>
                                  </div>
                               </div>
                               
                               <button 
                                 type="button"
                                 onClick={() => removeExercise(ex.id)}
                                 className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400/10 text-yellow-400 rounded-full border border-yellow-400/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-yellow-400 hover:text-black"
                               >
                                  <Trash2 className="w-4 h-4" />
                               </button>
                            </motion.div>
                          ))}
                       </AnimatePresence>
                    </div>
                 </div>

                 <div className="bg-slate-900/50 p-8 rounded-[3rem] border border-white/5 backdrop-blur-md">
                    <h3 className="text-xl font-display font-black italic uppercase tracking-wider mb-6">Informações Gerais</h3>
                    <div className="space-y-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Título do Treino</label>
                          <input 
                            required
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:border-yellow-400 transition-colors"
                            placeholder="Ex: Superiores A"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Observações Adicionais</label>
                          <textarea 
                            rows={4}
                            value={formData.notes}
                            onChange={e => setFormData({...formData, notes: e.target.value})}
                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:border-yellow-400 transition-colors resize-none"
                            placeholder="Dicas de execução, carga sugerida, etc..."
                          />
                       </div>
                    </div>
                 </div>
              </div>
            </div>

            <div className="pt-8 px-4 sm:px-0 pb-12">
               <button 
                type="submit"
                disabled={loading}
                className="w-full bg-yellow-400 text-black py-5 sm:py-6 rounded-2xl sm:rounded-3xl font-black italic uppercase text-xs sm:text-base tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(250,204,21,0.3)] disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                  <>
                    <Save className="w-5 h-5" />
                    Enviar Treino para o Aluno
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreateWorkout;
