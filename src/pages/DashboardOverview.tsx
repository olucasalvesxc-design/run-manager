import React, { useEffect, useState, memo, useMemo } from 'react';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc, onSnapshot, limit, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { Race, Registration } from '../types';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  TrendingUp, 
  Trophy, 
  Plus, 
  Calendar, 
  MapPin, 
  ChevronRight,
  PieChart,
  Zap,
  Copy,
  Check,
  Share2,
  Trash2,
  Loader2,
  AlertCircle,
  Dumbbell,
  Star,
  ShieldCheck,
  Activity,
  ArrowRight
} from 'lucide-react';
import { formatCurrency, formatDate, cn, getPublicRaceLink, handleFirestoreError, OperationType } from '../lib/utils';
import { auth } from '../lib/firebase';
import { StatsCardSkeleton, RaceCardSkeleton } from '../components/Skeleton';

const DashboardOverview = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [races, setRaces] = useState<Race[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.email?.toLowerCase() === 'lukas.alvesr7@gmail.com';

  useEffect(() => {
    if (!user) return;

    // Listen to races - Limit to 12 for dashboard
    const racesQuery = query(
      collection(db, 'races'),
      where('organizerId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(12)
    );
    
    const unsubRaces = onSnapshot(racesQuery, (snapshot) => {
      const racesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Race));
      setRaces(racesData);
    }, (err) => {
      console.error('Error listening to races:', err);
      handleFirestoreError(err, OperationType.GET, 'races', auth);
    });

    // Listen to registrations - Limit to 20 recent for status, 
    // but for overall stats we might need more or use a dedicated counters doc (Scalability improvement)
    const regsQuery = query(
      collection(db, 'registrations'),
      where('organizerId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(100) // Moderate limit for stats
    );
    
    const unsubRegs = onSnapshot(regsQuery, (snapshot) => {
      const regsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Registration));
      setRegistrations(regsData);
      setLoading(false);
    }, (err) => {
      console.error('Error listening to registrations:', err);
      handleFirestoreError(err, OperationType.GET, 'registrations', auth);
      setLoading(false);
    });

    return () => {
      unsubRaces();
      unsubRegs();
    };
  }, [user]);

  const stats = useMemo(() => {
    const totalInscritos = registrations.length;
    const valorArrecadado = registrations
      .filter(r => r.paymentStatus === 'confirmed')
      .reduce((acc, curr) => {
        const race = races.find(r => r.id === curr.raceId);
        if (race?.participationType === 'free') return acc;
        return acc + (race?.price || 0);
      }, 0);

    const mascCount = registrations.filter(r => r.gender === 'male').length;
    const femCount = registrations.filter(r => r.gender === 'female').length;

    return { totalInscritos, valorArrecadado, mascCount, femCount };
  }, [registrations, races]);

  if (loading) {
    return (
      <div className="space-y-12">
        <div className="h-48 bg-slate-950 border border-slate-900 rounded-[2rem] animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <StatsCardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {[1,2,3].map(i => <RaceCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Premium Header */}
      <div className="relative overflow-hidden bg-slate-950 border border-slate-800 p-8 rounded-[2rem] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-yellow-400 mb-4 italic">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            Online Agora
          </div>
          <h1 className="text-4xl lg:text-5xl font-display font-black text-white italic uppercase tracking-tighter mb-2">
            Olá, <span className="text-yellow-400">{user?.displayName?.split(' ')[0]}</span>.
          </h1>
          <p className="text-slate-500 font-medium">Você tem {races.length} corridas sob sua gestão profissional.</p>
        </div>
        <Link 
          to="/organizer/races/create"
          className="relative z-10 bg-white text-black px-10 py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-yellow-400 transition-all shadow-xl group uppercase italic text-sm"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          Nova Corrida
        </Link>
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
           <Zap className="w-full h-full text-white fill-current translate-x-1/4 scale-150 rotate-12" />
        </div>
      </div>

      {/* Master View / Admin Entry */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-yellow-950/20 p-8 rounded-[2.5rem] border-2 border-yellow-400/20 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group shadow-[0_0_50px_-12px_rgba(250,204,21,0.2)]">
           <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-1000 rotate-12">
             <ShieldCheck className="w-64 h-64 text-yellow-400 fill-current" />
           </div>
           <div className="flex items-center gap-6 relative z-10">
              <div className="w-20 h-20 bg-yellow-400 rounded-3xl flex items-center justify-center shadow-2xl group-hover:rotate-12 transition-transform">
                 <ShieldCheck className="w-10 h-10 text-slate-950" />
              </div>
              <div>
                 <div className="flex items-center gap-3 mb-1">
                   <h2 className="text-3xl font-display font-black text-white italic uppercase tracking-tighter">Conta Master</h2>
                   <span className="bg-yellow-400 text-black text-[9px] font-black px-2 py-0.5 rounded-full uppercase italic">Administrador</span>
                 </div>
                 <p className="text-slate-400 text-sm font-medium italic">Gerencie treinadores, usuários e métricas globais da plataforma.</p>
              </div>
           </div>
           <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto relative z-10">
              <Link 
                to="/admin" 
                className="bg-white text-black px-8 py-4 rounded-2xl font-black text-sm hover:bg-yellow-400 transition-all uppercase italic tracking-widest flex items-center justify-center gap-3 shadow-xl"
              >
                Acessar Painel Master
                <ChevronRight className="w-5 h-5" />
              </Link>
           </div>
        </div>
           )}
      {/* Trainer Promotion / Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {!profile?.isTrainer && !isAdmin ? (
          <>
            <div className="bg-gradient-to-r from-slate-900 to-indigo-900/40 p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                 <Dumbbell className="w-40 h-40 text-white fill-current" />
               </div>
               <div className="relative z-10 space-y-6 max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 rounded-full border border-indigo-500/20 text-indigo-400">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="text-[10px] font-black uppercase tracking-widest italic">Novo Módulo</span>
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-display font-black text-white italic uppercase tracking-tighter">
                     Sua consultoria, <br /> mais profissional.
                  </h2>
                  <p className="text-slate-400 text-sm font-medium italic">
                    Crie treinos para seus atletas, gerencie mensalidades e integre tudo com suas corridas em um único lugar.
                  </p>
                  <Link 
                    to="/organizer/trainer/plans"
                    className="inline-flex bg-indigo-500 text-white px-8 py-3.5 rounded-2xl font-black text-sm hover:bg-indigo-400 transition-all uppercase italic tracking-widest"
                  >
                    Ativar Consultoria Grátis
                  </Link>
               </div>
            </div>

            <div className="bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Users className="w-40 h-40 text-white" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-yellow-400 mb-6 italic">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  Identidade do Atleta
                </div>
                <h2 className="text-3xl font-display font-black text-white italic uppercase tracking-tighter mb-4">
                  Seu Código <span className="text-yellow-400">Exclusivo.</span>
                </h2>
                <p className="text-slate-500 text-sm font-medium italic mb-10 max-w-sm">
                  Passe este código para o seu treinador para que ele possa enviar seus treinos diretamente para o seu painel.
                </p>
                
                <div className="flex items-center gap-4 bg-slate-950 p-6 rounded-[2rem] border border-white/5 shadow-2xl relative group/code overflow-hidden">
                   <div className="absolute inset-0 bg-yellow-400/5 opacity-0 group-hover/code:opacity-100 transition-opacity" />
                   <div className="w-16 h-16 bg-yellow-400/10 rounded-2xl flex items-center justify-center shrink-0">
                      <Zap className="w-8 h-8 text-yellow-400 fill-current" />
                   </div>
                   <div className="flex-1">
                      <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest italic mb-1">Código de Atleta</span>
                      <span className="text-4xl font-display font-black text-white tracking-[0.2em] italic uppercase">{profile?.athleteCode || '------'}</span>
                   </div>
                   <button 
                    onClick={() => {
                      if (profile?.athleteCode) {
                        navigator.clipboard.writeText(profile.athleteCode);
                        // Using alert as it's a simple feedback mechanism here
                        alert('Código copiado para a área de transferência!');
                      }
                    }}
                    className="w-12 h-12 bg-white text-black rounded-xl flex items-center justify-center hover:bg-yellow-400 transition-colors shadow-xl"
                   >
                     <Copy className="w-5 h-5" />
                   </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-white/5 flex flex-col items-start justify-between gap-6 group hover:bg-slate-900 transition-colors relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-500">
               <Dumbbell className="w-32 h-32 text-white fill-current" />
             </div>
             <div className="relative z-10 flex items-center gap-6">
                <div className="w-16 h-16 bg-yellow-400 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                   <Dumbbell className="w-8 h-8 text-slate-950" />
                </div>
                <div>
                   <h2 className="text-2xl font-display font-black text-white italic uppercase tracking-tighter">Consultoria & Treinos</h2>
                   <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest italic">Gestão de Alunos e Planilhas</p>
                </div>
             </div>
             <div className="flex flex-col sm:flex-row gap-4 w-full relative z-10">
               <Link 
                to="/organizer/training-consulting"
                className="flex-1 bg-white text-black px-8 py-3.5 rounded-2xl font-black text-[10px] hover:bg-yellow-400 transition-all uppercase italic tracking-widest flex items-center justify-center gap-3 shadow-lg"
              >
                Gerenciar Alunos
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link 
                to="/organizer/trainer/workout/new"
                className="flex-1 bg-slate-800 text-white px-8 py-3.5 rounded-2xl font-black text-[10px] border border-white/10 hover:bg-slate-700 transition-all uppercase italic tracking-widest flex items-center justify-center gap-3"
              >
                <Plus className="w-4 h-4" />
                Novo Treino
              </Link>
             </div>
          </div>
        )}

        {/* IA Generator Shortcut */}
        <div className="bg-gradient-to-br from-indigo-900/40 to-slate-950 p-8 rounded-[2.5rem] border border-indigo-500/10 flex flex-col items-start justify-between gap-6 group hover:border-indigo-500/30 transition-all relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-1000">
             <Zap className="w-32 h-32 text-indigo-400 fill-current" />
           </div>
           <div className="relative z-10 flex items-center gap-6">
              <div className="w-16 h-16 bg-indigo-500 rounded-3xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-xl">
                 <Activity className="w-8 h-8 text-white" />
              </div>
              <div>
                 <h2 className="text-2xl font-display font-black text-white italic uppercase tracking-tighter">Gerador de IA</h2>
                 <p className="text-indigo-400/70 text-[10px] font-black uppercase tracking-widest italic">Planilhas Inteligentes por PIX</p>
              </div>
           </div>
           <Link 
            to="/training-generator" 
            className="w-full bg-indigo-500 hover:bg-indigo-400 text-white px-8 py-3.5 rounded-2xl font-black text-[10px] transition-all uppercase italic tracking-widest flex items-center justify-center gap-3 shadow-lg"
          >
            Gerar Treino com IA
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="TOTAL INSCRITOS" 
          value={stats.totalInscritos} 
          icon={<Users className="w-6 h-6" />} 
          subtitle="Geral acumulado"
          accent="yellow"
        />
        <StatsCard 
          title="ARRECADAÇÃO" 
          value={formatCurrency(stats.valorArrecadado)} 
          icon={<TrendingUp className="w-6 h-6" />} 
          subtitle="Valores confirmados"
          accent="green"
        />
        <StatsCard 
          title="PART. MASCULINA" 
          value={`${Math.round((stats.mascCount / (stats.totalInscritos || 1)) * 100)}%`} 
          icon={<PieChart className="w-6 h-6" />} 
          subtitle={`${stats.mascCount} atletas`}
          accent="blue"
        />
        <StatsCard 
          title="PART. FEMININA" 
          value={`${Math.round((stats.femCount / (stats.totalInscritos || 1)) * 100)}%`} 
          icon={<PieChart className="w-6 h-6" />} 
          subtitle={`${stats.femCount} atletas`}
          accent="pink"
        />
      </div>

      {/* Races List */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-display font-black text-white flex items-center gap-3 uppercase tracking-[0.2em] italic">
            <Trophy className="w-6 h-6 text-yellow-400" />
            Minhas Corridas
          </h2>
          {races.length > 0 && (
             <div className="h-px flex-1 bg-slate-900 mx-8"></div>
          )}
          {races.length > 5 && (
            <Link to="/organizer/races" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-yellow-400 transition-colors">Ver catálogo</Link>
          )}
        </div>

        {races.length === 0 ? (
          <div className="bg-slate-950 border border-slate-900 rounded-[3rem] p-20 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-400/5 via-transparent to-transparent"></div>
            <Calendar className="w-20 h-20 text-slate-800 mx-auto mb-8 animate-pulse" />
            <h3 className="text-3xl font-display font-black text-white italic uppercase tracking-tight mb-4">Solo sagrado aguarda</h3>
            <p className="text-slate-500 mb-10 max-w-sm mx-auto font-medium">Sua jornada como organizador profissional começa com a criação do seu primeiro evento épico.</p>
            <Link to="/organizer/races/create" className="inline-flex bg-yellow-400 text-black px-12 py-4 rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-xl italic uppercase">
              Criar Agora
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {races.slice(0, 6).map((race) => (
              <RaceCard 
                key={race.id} 
                race={race} 
                registrationsCount={registrations.filter(r => r.raceId === race.id).length}
                onDelete={() => {
                  setRaces(prev => prev.filter(r => r.id !== race.id));
                  setRegistrations(prev => prev.filter(reg => reg.raceId !== race.id));
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="space-y-8 pb-12">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-display font-black text-white flex items-center gap-3 uppercase tracking-[0.2em] italic">
            <Zap className="w-6 h-6 text-yellow-400" />
            Atividade Recente
          </h2>
          <div className="h-px flex-1 bg-slate-900 mx-8"></div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-[2.5rem] overflow-hidden">
          {registrations.length === 0 ? (
            <div className="p-12 text-center text-slate-500 italic font-medium">Aguardando o primeiro atleta largar...</div>
          ) : (
            <div className="divide-y divide-slate-900">
              {registrations.slice(0, 5).map((reg) => {
                const race = races.find(r => r.id === reg.raceId);
                return (
                  <div key={reg.id} className="p-6 flex items-center justify-between hover:bg-slate-900/30 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-yellow-400/10 flex items-center justify-center text-yellow-400 font-black italic">
                        {reg.runnerName[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-white font-bold">{reg.runnerName}</div>
                        <div className="text-xs text-slate-500 font-medium">Inscreveu-se em <span className="text-slate-300">{race?.name || 'Carregando...'}</span></div>
                      </div>
                    </div>
                    <div className="text-right">
                       <div className={cn(
                         "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-1",
                         reg.paymentStatus === 'confirmed' ? "text-green-400 bg-green-400/10" : "text-yellow-400 bg-yellow-400/10"
                       )}>
                         {reg.paymentStatus === 'confirmed' ? 'Confirmado' : 'Pendente'}
                       </div>
                       <div className="text-[10px] text-slate-600 font-bold">
                         {reg.createdAt?.toDate 
                           ? reg.createdAt.toDate().toLocaleDateString('pt-BR') 
                           : new Date(reg.createdAt).toLocaleDateString('pt-BR')}
                       </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatsCard = memo(({ title, value, icon, subtitle, accent }: { title: string; value: string | number; icon: React.ReactNode; subtitle: string; accent: 'yellow' | 'green' | 'blue' | 'pink' }) => {
  const accentColors = {
    yellow: "text-yellow-400 bg-yellow-400/10",
    green: "text-green-400 bg-green-400/10",
    blue: "text-blue-400 bg-blue-400/10",
    pink: "text-pink-400 bg-pink-400/10"
  };

  return (
    <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl hover:border-slate-700 transition-all duration-300 group shadow-sm">
      <div className={cn("inline-flex items-center justify-center p-3 rounded-2xl mb-6 transition-all group-hover:scale-110", accentColors[accent])}>
        {icon}
      </div>
      <div className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{title}</div>
      <div className="text-4xl font-display font-black text-white mb-3 italic tracking-tighter">{value}</div>
      <div className="text-slate-600 text-[10px] font-black uppercase tracking-widest">{subtitle}</div>
    </div>
  );
});

const RaceCard = memo(({ race, registrationsCount, onDelete }: { race: Race; registrationsCount: number; onDelete?: () => void }) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const typeLabels = {
    street: "Asfalto",
    treadmill: "Indoor",
    online: "Virtual"
  };
  
  const typeImgs = {
    street: "https://images.unsplash.com/photo-1596464531135-2655637f41e9?q=80&w=400&auto=format&fit=crop",
    treadmill: "https://images.unsplash.com/photo-1541534741688-6078c64b5cc5?q=80&w=400&auto=format&fit=crop",
    online: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=400&auto=format&fit=crop"
  };

  const copyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const link = getPublicRaceLink(race.id);
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const link = getPublicRaceLink(race.id);
    const text = encodeURIComponent(`Fala atleta! Inscrição liberada para a corrida: ${race.name}. Garanta sua vaga pelo link: ${link}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const isNearingCapacity = registrationsCount >= race.capacity * 0.8;
  const isFull = registrationsCount >= race.capacity;

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirmDelete(true);
  };

  const deleteRace = async () => {
    setIsDeleting(true);
    try {
      // 1. Deletar todas as inscrições associadas
      const regsQuery = query(
        collection(db, 'registrations'), 
        where('raceId', '==', race.id),
        where('organizerId', '==', user?.uid)
      );
      const regsSnap = await getDocs(regsQuery);
      
      const deletePromises = regsSnap.docs.map(regDoc => deleteDoc(regDoc.ref));
      await Promise.allSettled(deletePromises);

      // 2. Deletar a corrida
      await deleteDoc(doc(db, 'races', race.id));
      
      setShowConfirmDelete(false);
      if (onDelete) {
        onDelete();
      } else {
        window.location.reload(); 
      }
    } catch (err) {
      console.error('Error deleting race:', err);
      alert('Falha ao excluir corrida. Verifique suas permissões ou tente novamente.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={!showConfirmDelete ? { y: -8 } : {}}
      className={cn(
        "bg-slate-950 border rounded-[2.5rem] overflow-hidden hover:border-yellow-400 transition-all duration-500 group flex flex-col shadow-xl relative",
        isFull ? "border-yellow-400 shadow-yellow-400/10" : isNearingCapacity ? "border-yellow-400/50 animate-pulse-border" : "border-slate-800"
      )}
    >
      {/* Confirmation Overlay */}
      <AnimatePresence>
        {showConfirmDelete && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 bg-slate-950/95 backdrop-blur-sm p-8 flex flex-col items-center justify-center text-center"
          >
            <Trash2 className="w-12 h-12 text-yellow-500 mb-4 animate-bounce" />
            <h4 className="text-xl font-display font-black text-white italic uppercase mb-2">Excluir Corrida?</h4>
            <p className="text-slate-500 text-xs mb-8">Esta ação é irreversível e excluirá todos os inscritos.</p>
            <div className="flex flex-col w-full gap-3">
              <button 
                onClick={deleteRace}
                disabled={isDeleting}
                className="w-full bg-yellow-400 text-slate-950 py-4 rounded-2xl font-black uppercase italic tracking-widest text-sm hover:bg-yellow-300 transition-all disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Confirmar Exclusão'}
              </button>
              <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowConfirmDelete(false); }}
                disabled={isDeleting}
                className="w-full bg-slate-900 text-slate-400 py-4 rounded-2xl font-black uppercase italic tracking-widest text-sm hover:bg-slate-800 transition-all"
              >
                Manter Corrida
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative h-48 overflow-hidden">
        <img 
          src={typeImgs[race.type as keyof typeof typeImgs] || typeImgs.street} 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0 brightness-50"
          alt={race.name}
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
        
        {/* Logo Overlay */}
        {race.logoUrl && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white p-2.5 rounded-[2rem] shadow-2xl overflow-hidden z-10 ring-4 ring-slate-950/50 group-hover:scale-110 transition-transform duration-500">
             <img src={race.logoUrl} alt="Logo" className="w-full h-full object-contain" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-6 left-6 flex flex-col gap-2 items-start">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
              <div className={cn(
                "w-2 h-2 rounded-full",
                race.type === 'street' ? "bg-yellow-400" : race.type === 'treadmill' ? "bg-yellow-400" : "bg-yellow-400"
              )}></div>
              <span className="text-[10px] font-black text-white uppercase tracking-widest">{typeLabels[race.type as keyof typeof typeLabels]}</span>
           </div>
           
           {isFull ? (
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400 text-slate-950 shadow-lg">
                <AlertCircle className="w-3 h-3" />
                <span className="text-[8px] font-black uppercase tracking-[0.2em]">Esgotado</span>
             </div>
           ) : isNearingCapacity ? (
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400 text-slate-950 shadow-lg">
                <Zap className="w-3 h-3 animate-pulse" />
                <span className="text-[8px] font-black uppercase tracking-[0.2em]">80% Ocupado</span>
             </div>
           ) : null}
        </div>
        
        {/* Quick Actions Overlay (Simplified) */}
        <div className="absolute top-6 right-6 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
          <button 
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center text-yellow-400 hover:bg-yellow-100 hover:text-slate-950 transition-all shadow-lg disabled:opacity-50"
            title="Excluir Corrida"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>

        <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between">
           <div className="text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-yellow-400" />
              <span className="text-lg font-display font-black italic tracking-tighter">{registrationsCount} <span className="text-slate-500 text-xs">/ {race.capacity}</span></span>
           </div>
        </div>
      </div>

      <div className="p-8 flex-1 flex flex-col">
        <h3 className="text-2xl font-display font-black text-white mb-6 group-hover:text-yellow-400 transition-colors leading-tight italic uppercase tracking-tighter">{race.name}</h3>
        
        <div className="space-y-4 mb-8 text-[11px] font-bold uppercase tracking-widest">
          <div className="flex items-center gap-3 text-slate-500 group-hover:text-slate-300 transition-colors">
            <Calendar className="w-4 h-4 text-yellow-400/50" />
            {formatDate(race.date)} • {race.time}
          </div>
          <div className="flex items-center gap-3 text-slate-500 group-hover:text-slate-300 transition-colors">
            <MapPin className="w-4 h-4 text-yellow-400/50" />
            {race.location}
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-slate-900 flex items-center justify-between">
          <div className="font-display font-black text-2xl text-white italic group-hover:text-yellow-400 transition-colors">
            {race.participationType === 'beneficent' ? 'DOAÇÃO' : race.participationType === 'free' ? 'GRÁTIS' : formatCurrency(race.price)}
          </div>
          <Link to={`/organizer/race/${race.id}`} className="inline-flex items-center gap-2 bg-slate-900 text-yellow-400 px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-yellow-400 hover:text-slate-950 transition-all">
            GESTÃO
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
});

export default DashboardOverview;
