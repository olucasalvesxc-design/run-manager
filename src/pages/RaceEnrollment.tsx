import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, query, where, getDocs, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Race, Gender, Registration } from '../types';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Zap, 
  ArrowRight, 
  Trophy, 
  Info, 
  Phone, 
  Mail, 
  User, 
  CheckCircle2,
  Loader2,
  Users,
  ShieldCheck,
  AlertCircle,
  Instagram,
  Activity as ActivityIcon,
  Copy,
  Check,
  CreditCard,
  QrCode
} from 'lucide-react';
import { formatCurrency, formatDate, handleFirestoreError, OperationType, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { IMaskInput } from 'react-imask';
import ParticipantsTable from '../components/ParticipantsTable';
import MapSection from '../components/MapSection';

import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';

const Countdown = ({ targetDate, time }: { targetDate: string; time?: string }) => {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number }>({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!targetDate) return { d: 0, h: 0, m: 0, s: 0 };

      try {
        // Robust parsing: Combine date and time, replacing dashes with slashes for better cross-browser local time support
        const normalizedDate = targetDate.replace(/-/g, '/');
        const normalizedTime = time || '00:00';
        const target = new Date(`${normalizedDate} ${normalizedTime}`);
        const now = new Date();
        
        const targetTime = target.getTime();
        if (isNaN(targetTime)) {
          console.error('Invalid countdown date:', targetDate, time);
          return { d: 0, h: 0, m: 0, s: 0 };
        }
        
        const diff = targetTime - now.getTime();

        if (diff <= 0) {
          return { d: 0, h: 0, m: 0, s: 0 };
        }

        return {
          d: Math.floor(diff / (1000 * 60 * 60 * 24)),
          h: Math.floor((diff / (1000 * 60 * 60)) % 24),
          m: Math.floor((diff / (1000 * 60)) % 60),
          s: Math.floor((diff / 1000) % 60)
        };
      } catch (err) {
        console.error('Error calculating time left:', err);
        return { d: 0, h: 0, m: 0, s: 0 };
      }
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3 w-full max-w-[400px] mx-auto">
      <div className="bg-slate-950/80 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/5 flex flex-col items-center justify-center shadow-lg group-hover:border-yellow-400/30 transition-colors">
        <span className="text-2xl sm:text-3xl md:text-4xl font-display font-black italic tracking-tighter text-white tabular-nums leading-none">
          {String(timeLeft.d).padStart(2, '0')}
        </span>
        <span className="text-[6px] sm:text-[8px] font-black uppercase text-slate-500 tracking-widest mt-2">D</span>
      </div>
      
      <div className="bg-slate-950/80 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/5 flex flex-col items-center justify-center shadow-lg group-hover:border-yellow-400/30 transition-colors">
        <span className="text-2xl sm:text-3xl md:text-4xl font-display font-black italic tracking-tighter text-white tabular-nums leading-none">
          {String(timeLeft.h).padStart(2, '0')}
        </span>
        <span className="text-[6px] sm:text-[8px] font-black uppercase text-slate-500 tracking-widest mt-2">H</span>
      </div>

      <div className="bg-slate-950/80 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/5 flex flex-col items-center justify-center shadow-lg group-hover:border-yellow-400/30 transition-colors">
        <span className="text-2xl sm:text-3xl md:text-4xl font-display font-black italic tracking-tighter text-white tabular-nums leading-none">
          {String(timeLeft.m).padStart(2, '0')}
        </span>
        <span className="text-[6px] sm:text-[8px] font-black uppercase text-slate-500 tracking-widest mt-2">M</span>
      </div>

      <div className="bg-slate-950/80 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/5 flex flex-col items-center justify-center shadow-lg group-hover:border-yellow-400/30 transition-colors border-yellow-400/20">
        <span className="text-2xl sm:text-3xl md:text-4xl font-display font-black italic tracking-tighter text-yellow-400 tabular-nums leading-none">
          {String(timeLeft.s).padStart(2, '0')}
        </span>
        <span className="text-[6px] sm:text-[8px] font-black uppercase text-yellow-400/40 tracking-widest mt-2">S</span>
      </div>
    </div>
  );
};

const RaceEnrollment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [race, setRace] = useState<Race | null>(null);
  const [organizer, setOrganizer] = useState<{ organizerName?: string; profileImageUrl?: string; bio?: string; whatsapp?: string; instagram?: string } | null>(null);
  const [registrationsCount, setRegistrationsCount] = useState(0);
  const [allRegistrations, setAllRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState<'form' | 'payment'>('form');
  const [formData, setFormData] = useState({
    runnerName: '',
    email: '',
    whatsapp: '',
    gender: 'male' as Gender,
    birthDate: '',
    cpf: '',
    jerseySize: 'M',
    emergencyContact: '',
    team: '',
    city: ''
  });

  useEffect(() => {
    const fetchRaceDetails = async () => {
      if (!id) return;
      try {
        const raceRef = doc(db, 'races', id);
        const raceSnap = await getDoc(raceRef);
        if (raceSnap.exists()) {
          const raceData = { id: raceSnap.id, ...raceSnap.data() } as Race;
          setRace(raceData);

          // Escutar inscritos em tempo real para a lista pública
          const regsQuery = query(
            collection(db, 'registrations'),
            where('raceId', '==', id)
          );
          
          const unsubscribe = onSnapshot(regsQuery, (snap) => {
            const regs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Registration));
            setAllRegistrations(regs);
            setRegistrationsCount(regs.length);
          });

          // Buscar perfil do organizador
          try {
            const profileSnap = await getDoc(doc(db, 'profiles', raceData.organizerId));
            if (profileSnap.exists()) {
              setOrganizer(profileSnap.data());
            }
          } catch (profileErr) {
            console.error('Error fetching organizer profile:', profileErr);
          }

          return () => unsubscribe();
        }
      } catch (err) {
        console.error('Error fetching race:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRaceDetails();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!race || !id) return;
    
    // Verificações finais
    if (race.status === 'paused') {
      setError('As inscrições para esta corrida estão temporariamente suspensas.');
      return;
    }
    if (race.status === 'closed') {
      setError('As inscrições para esta corrida estão encerradas.');
      return;
    }
    if (registrationsCount >= race.capacity) {
      setError('Desculpe, as vagas para esta corrida acabaram!');
      return;
    }

    const birth = new Date(formData.birthDate);
    if (birth > new Date()) {
      setError('Data de nascimento inválida.');
      return;
    }

    setSubmitting(true);
    setError(null);

    if (race.participationType === 'paid' && step === 'form') {
      setTimeout(() => {
        setStep('payment');
        setSubmitting(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 500);
      return;
    }

    try {
      const regData = {
        ...formData,
        raceId: id,
        organizerId: race.organizerId,
        status: race.participationType === 'free' ? 'confirmado' : 
                race.participationType === 'beneficent' ? 'aguardando_doacao' : 
                'aguardando_pagamento',
        paymentStatus: race.participationType === 'free' ? 'confirmed' : 'pending',
        paymentMethod: race.participationType === 'paid' ? 'pix' : 'none',
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, 'registrations'), regData);

      // Notificação de 80% da capacidade
      const newCount = registrationsCount + 1;
      const threshold = race.capacity * 0.8;
      if (newCount >= threshold) {
         try {
           const notifQuery = query(
             collection(db, 'notifications'),
             where('raceId', '==', id),
             where('type', '==', 'capacity_alert')
           );
           const notifSnap = await getDocs(notifQuery);
           if (notifSnap.empty) {
              await addDoc(collection(db, 'notifications'), {
                 userId: race.organizerId,
                 raceId: id,
                 type: 'capacity_alert',
                 title: 'Capacidade Crítica reached!',
                 message: `A corrida "${race.name}" atingiu 80% da sua capacidade (${newCount}/${race.capacity}).`,
                 read: false,
                 createdAt: serverTimestamp()
              });
           }
         } catch (notifErr) {
           console.error('Error creating capacity notification:', notifErr);
         }
      }

      navigate(`/registration/${docRef.id}`);
    } catch (err) {
      console.error('Error submitting registration:', err);
      try {
        handleFirestoreError(err, OperationType.WRITE, 'registrations', auth);
      } catch (formattedErr: any) {
        setError(formattedErr.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-yellow-400" /></div>;
  if (!race) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Evento não encontrado.</div>;

  const typeImgs = {
    street: "https://images.unsplash.com/photo-1596464531135-2655637f41e9?q=80&w=1200&auto=format&fit=crop",
    treadmill: "https://images.unsplash.com/photo-1541534741688-6078c64b5cc5?q=80&w=1200&auto=format&fit=crop",
    online: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop"
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-yellow-400 selection:text-black overflow-x-hidden">
      {/* Header Visual - Cinematic */}
      <div className="min-h-[500px] md:min-h-[600px] lg:min-h-[700px] relative overflow-hidden flex items-center justify-center pt-20 pb-32 lg:pt-32 lg:pb-48">
         <img 
            src={race.bannerUrl || typeImgs[race.type as keyof typeof typeImgs] || typeImgs.street} 
            className={cn(
              "absolute inset-0 w-full h-full object-cover scale-105 brightness-[0.3]",
              !race.bannerUrl && "blur-sm"
            )} 
            alt="Background" 
            referrerPolicy="no-referrer"
         />
         <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
         
         <motion.div 
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
           className="relative z-10 text-center px-4 md:px-6 max-w-6xl"
         >
           {race.logoUrl && (
             <motion.div 
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               className="mb-8 flex justify-center"
             >
               <div className="w-14 h-14 md:w-28 md:h-28 lg:w-40 lg:h-40 rounded-2xl md:rounded-[2rem] lg:rounded-[2.5rem] bg-white p-2.5 md:p-4 shadow-2xl overflow-hidden ring-4 md:ring-8 ring-yellow-400/20">
                 <img src={race.logoUrl} alt="Logo" className="w-full h-full object-contain" />
               </div>
             </motion.div>
           )}
           <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-full bg-yellow-400 text-black font-black text-[9px] md:text-[10px] uppercase tracking-[0.3em] italic mb-8">
              <Trophy className="w-4 h-4" />
              Inscrições Abertas
           </div>
           <h1 className="text-3xl md:text-7xl lg:text-8xl font-display font-black text-white italic tracking-tighter uppercase mb-10 leading-[0.85] lg:leading-none break-words px-4">
              {race.name}
           </h1>
           <div className="flex flex-wrap justify-center gap-3 md:gap-4 lg:gap-10 text-slate-300 font-bold text-[8px] md:text-[10px] lg:text-sm uppercase tracking-widest bg-black/40 backdrop-blur-xl px-4 md:px-6 lg:px-12 py-3 md:py-4 lg:py-6 rounded-2xl lg:rounded-[2rem] border border-white/10">
              <span className="flex items-center gap-2 lg:gap-4"><Calendar className="w-4 h-4 lg:w-6 lg:h-6 text-yellow-400" /> {formatDate(race.date)}</span>
              <span className="flex items-center gap-2 lg:gap-4"><Clock className="w-4 h-4 lg:w-6 lg:h-6 text-yellow-400" /> {race.time}</span>
              <span className="flex items-center gap-2 lg:gap-4"><MapPin className="w-4 h-4 lg:w-6 lg:h-6 text-yellow-400" /> {race.location}</span>
           </div>
         </motion.div>
      </div>

      <div className="container mx-auto px-4 md:px-6 -mt-20 md:-mt-24 lg:-mt-32 pb-32 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Info Side */}
          <div className="lg:col-span-1 space-y-6 sm:space-y-8">
            <motion.button 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={copyLink}
              className="w-full bg-slate-900 border border-white/5 p-6 rounded-[2rem] flex items-center justify-between group hover:border-yellow-400/30 transition-all shadow-xl"
            >
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center border border-yellow-400/20 group-hover:bg-yellow-400 group-hover:text-black transition-all">
                    {copied ? <Check className="w-5 h-5 text-green-400 group-hover:text-black" /> : <Copy className="w-5 h-5 text-yellow-400 group-hover:text-black" />}
                 </div>
                 <div className="text-left">
                    <div className="text-[9px] font-black uppercase text-slate-500 tracking-widest leading-none mb-1">Compartilhar</div>
                    <div className="text-xs font-black text-white italic uppercase tracking-widest">{copied ? 'Link Copiado!' : 'Copiar Link'}</div>
                 </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-700 group-hover:text-yellow-400 group-hover:translate-x-1 transition-all" />
            </motion.button>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-900 border border-white/5 p-6 sm:p-8 lg:p-12 rounded-[2.5rem] sm:rounded-[3.5rem] lg:rounded-[4rem] shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 rounded-full blur-[60px]"></div>
              <h3 className="text-xl lg:text-2xl font-display font-black mb-6 lg:mb-10 italic text-yellow-400 uppercase tracking-widest text-center">A Corrida</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-10 font-medium text-center">{race.description}</p>
              
              <div className="space-y-8">
                  <div className="bg-yellow-400 px-4 py-8 md:p-10 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-900 transform hover:scale-[1.02] transition-all shadow-xl group overflow-hidden">
                    <div className="text-[9px] font-black uppercase tracking-[0.4em] mb-6 opacity-40 italic">Largada em</div>
                    <div className="w-full">
                       <Countdown targetDate={race.date} time={race.time} />
                    </div>
                  </div>
                 
                 <div className="grid grid-cols-1 gap-4">
                    <DetailBox icon={<Trophy className="w-5 h-5" />} label="Categoria" value={race.type === 'street' ? 'Rua / Asfalto' : race.type === 'treadmill' ? 'Indoor / Esteira' : 'Online / Virtual'} />
                    <DetailBox icon={<Users className="w-5 h-5" />} label="Vagas Totais" value={`${race.capacity} Atletas`} />
                 </div>
              </div>
            </motion.div>

            {/* AI Training Highlight Benefit */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-yellow-400 p-8 rounded-[3rem] text-slate-950 relative overflow-hidden group"
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-black/10 rounded-full blur-[40px] -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>
               <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/10 rounded-full">
                      <Zap className="w-3 h-3 fill-current" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Preparação de Elite</span>
                    </div>
                    <span className="text-[10px] font-black bg-slate-950 text-yellow-400 px-3 py-1 rounded-full border border-yellow-400/20">R$ 30,00</span>
                  </div>
                  <h4 className="text-2xl font-display font-black italic uppercase tracking-tighter leading-[0.9] mb-4">Gerador de <br /> Treinos IA</h4>
                  <p className="text-[11px] font-bold italic mb-6 opacity-70">Prepare-se para este evento com planilhas técnicas exclusivas de 30 dias.</p>
                  <Link 
                    to="/training-generator" 
                    className="flex shrink-0 w-fit items-center gap-3 text-[10px] font-black uppercase tracking-widest bg-slate-950 text-white px-6 py-3 rounded-xl hover:translate-x-1 transition-transform"
                  >
                    ACESSAR AGORA
                    <ArrowRight className="w-3 h-3" />
                  </Link>
               </div>
               <ActivityIcon className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10" />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-slate-900 border border-white/5 p-10 rounded-[3rem] shadow-2xl relative group"
            >
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4">Investimento</div>
              <div className="text-5xl font-display font-black text-white italic tracking-tighter mb-4 group-hover:text-yellow-400 transition-colors">
                {race.participationType === 'paid' ? formatCurrency(race.price) : 'SOLIDÁRIO'}
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl flex items-center gap-3 text-slate-500">
                <Info className="w-4 h-4 text-yellow-400" />
                <p className="text-[10px] font-black leading-relaxed uppercase tracking-widest">
                  {race.participationType === 'paid' 
                    ? 'Pagamento via PIX direto ao organizador.' 
                    : 'Leve sua doação no dia do evento.'}
                </p>
              </div>
            </motion.div>

            {/* Organizer Profile Card */}
            {organizer && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-slate-900 border border-white/5 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden"
              >
                <div className="flex items-center gap-6 mb-6">
                   <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                      {organizer.profileImageUrl ? (
                        <img src={organizer.profileImageUrl} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl font-display font-black text-slate-800 italic uppercase">
                           {organizer.organizerName?.[0] || 'R'}
                        </div>
                      )}
                   </div>
                   <div>
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Organizado por</div>
                      <h4 className="text-lg font-display font-black text-white italic uppercase tracking-tighter">{organizer.organizerName}</h4>
                   </div>
                </div>
                
                {organizer.bio && (
                  <p className="text-slate-500 text-xs font-medium leading-relaxed mb-8 italic">
                    "{organizer.bio}"
                  </p>
                )}

                <div className="flex flex-col gap-3">
                   {organizer.whatsapp && (
                     <a 
                       href={`https://wa.me/55${organizer.whatsapp}`} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="flex items-center justify-center gap-3 bg-green-500/10 text-green-500 border border-green-500/20 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all shadow-lg"
                     >
                        <Phone className="w-4 h-4" /> WhatsApp de Suporte
                     </a>
                   )}
                   {organizer.instagram && (
                     <a 
                       href={`https://instagram.com/${organizer.instagram.replace('@', '')}`} 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       className="flex items-center justify-center gap-3 bg-pink-500/10 text-pink-500 border border-pink-500/20 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-pink-500 hover:text-white transition-all shadow-lg"
                     >
                        <Instagram className="w-4 h-4" /> @{organizer.instagram.replace('@', '')}
                     </a>
                   )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Form Side */}
          <div className="lg:col-span-2">
             <motion.div 
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-slate-900 border border-white/5 p-6 md:p-16 lg:p-20 rounded-[2.5rem] md:rounded-[3.5rem] lg:rounded-[4.5rem] shadow-2xl"
             >
                <div className="mb-10 lg:mb-28 flex flex-col items-center px-1 sm:px-2 w-full">
                   <div className="flex items-center gap-2 sm:gap-3 lg:gap-10 w-full justify-center">
                      <div className="h-[2px] flex-1 bg-slate-800 hidden md:block max-w-[120px]"></div>
                      <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-display font-black italic uppercase tracking-tighter text-center leading-[0.9] py-2">
                         {step === 'form' ? 'Inscrição' : 'Pagamento'}
                       </h2>
                      <div className="h-[2px] flex-1 bg-slate-800 hidden md:block max-w-[120px]"></div>
                   </div>
                   <p className="text-slate-500/30 text-center font-black uppercase text-[6px] sm:text-[10px] lg:text-[14px] tracking-[0.3em] sm:tracking-[0.6em] md:tracking-[1.2em] italic mt-4 md:mt-8">
                      {step === 'form' ? 'Ficha de Atleta Oficial' : 'Confirmação do Investimento'}
                    </p>
                </div>



                                 <AnimatePresence mode="wait">
                   {step === 'form' ? (
                     <motion.form 
                       key="enroll-form"
                       initial={{ opacity: 0, x: -20 }}
                       animate={{ opacity: 1, x: 0 }}
                       exit={{ opacity: 0, x: 20 }}
                       onSubmit={handleSubmit} 
                       className="space-y-8 lg:space-y-12"
                     >
                  <AnimatePresence>
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-yellow-400/10 border border-yellow-400/50 p-6 rounded-3xl flex items-start gap-4"
                      >
                        <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                        <div className="space-y-2">
                           <h4 className="text-yellow-400 font-black uppercase text-xs tracking-widest">Erro na Inscrição</h4>
                           <p className="text-slate-400 text-xs leading-relaxed">
                             Não foi possível processar sua inscrição. Verifique se todos os campos estão preenchidos corretamente. 
                             <span className="block mt-2 font-mono opacity-50">{error}</span>
                           </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Dados Pessoais */}
                  <div className="space-y-10">
                    <div className="flex items-center gap-3 opacity-50">
                      <div className="w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center text-[10px] font-black">01</div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">Identificação</span>
                      <div className="h-px flex-1 bg-slate-800"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <InputField 
                        label="Nome Completo" 
                        icon={<User className="w-4 h-4" />}
                        value={formData.runnerName}
                        onChange={(e: any) => setFormData({ ...formData, runnerName: e.target.value })}
                        placeholder="Como aparecerá no ranking"
                      />
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic ml-2 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4" /> CPF
                        </label>
                        <IMaskInput
                          mask="000.000.000-00"
                          unmask={true}
                          value={formData.cpf}
                          onAccept={(value) => setFormData({ ...formData, cpf: value })}
                          placeholder="000.000.000-00"
                          className="w-full bg-slate-950 border-2 border-slate-800 rounded-3xl px-6 sm:px-8 py-4 sm:py-5 focus:outline-none focus:border-yellow-400 transition-all text-white placeholder:text-slate-800 font-bold italic"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <InputField 
                        label="E-mail" 
                        icon={<Mail className="w-4 h-4" />}
                        value={formData.email}
                        type="email"
                        onChange={(e: any) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="atleta@premium.com"
                      />
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic ml-2 flex items-center gap-2">
                          <Phone className="w-4 h-4" /> WhatsApp (Com DDD)
                        </label>
                        <IMaskInput
                          mask="(00) 00000-0000"
                          unmask={true}
                          value={formData.whatsapp}
                          onAccept={(value) => setFormData({ ...formData, whatsapp: value })}
                          placeholder="(00) 00000-0000"
                          className="w-full bg-slate-950 border-2 border-slate-800 rounded-3xl px-6 sm:px-8 py-4 sm:py-5 focus:outline-none focus:border-yellow-400 transition-all text-white placeholder:text-slate-800 font-bold italic"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Detalhes Técnicos */}
                  <div className="space-y-10">
                    <div className="flex items-center gap-3 opacity-50">
                      <div className="w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center text-[10px] font-black">02</div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">Técnico & Físico</span>
                      <div className="h-px flex-1 bg-slate-800"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                      <InputField 
                        label="Data de Nascimento" 
                        icon={<Calendar className="w-4 h-4" />}
                        value={formData.birthDate}
                        type="date"
                        onChange={(e: any) => setFormData({ ...formData, birthDate: e.target.value })}
                      />
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic ml-2">Gênero</label>
                        <select 
                          required
                          value={formData.gender}
                          onChange={e => setFormData({ ...formData, gender: e.target.value as Gender })}
                          className="w-full bg-slate-950 border-2 border-slate-800 rounded-3xl px-6 sm:px-8 py-4 sm:py-5 focus:outline-none focus:border-yellow-400 transition-all text-white font-black italic appearance-none cursor-pointer uppercase tracking-widest text-sm"
                        >
                          <option value="male">Masculino</option>
                          <option value="female">Feminino</option>
                        </select>
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic ml-2">Tamanho da Camisa</label>
                        <select 
                          required
                          value={formData.jerseySize}
                          onChange={e => setFormData({ ...formData, jerseySize: e.target.value })}
                          className="w-full bg-slate-950 border-2 border-slate-800 rounded-3xl px-6 sm:px-8 py-4 sm:py-5 focus:outline-none focus:border-yellow-400 transition-all text-white font-black italic appearance-none cursor-pointer uppercase tracking-widest text-sm"
                        >
                          <option value="PP">PP (Extra small)</option>
                          <option value="P">P (Small)</option>
                          <option value="M">M (Medium)</option>
                          <option value="G">G (Large)</option>
                          <option value="GG">GG (Extra Large)</option>
                          <option value="EXG">EXG (Double Extra Large)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <InputField 
                        label="Equipe / Assessoria" 
                        icon={<Users className="w-4 h-4" />}
                        value={formData.team}
                        onChange={(e: any) => setFormData({ ...formData, team: e.target.value })}
                        placeholder="Nome da sua equipe (opcional)"
                        required={false}
                      />
                      <InputField 
                        label="Cidade" 
                        icon={<MapPin className="w-4 h-4" />}
                        value={formData.city}
                        onChange={(e: any) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="Sua cidade / UF"
                      />
                    </div>
                  </div>

                  {/* Segurança */}
                  <div className="space-y-10">
                    <div className="flex items-center gap-3 opacity-50">
                      <div className="w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center text-[10px] font-black">03</div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">Segurança</span>
                      <div className="h-px flex-1 bg-slate-800"></div>
                    </div>
                    <InputField 
                      label="Contato de Emergência (Nome e Telefone)" 
                      icon={<Phone className="w-4 h-4" />}
                      value={formData.emergencyContact}
                      onChange={(e: any) => setFormData({ ...formData, emergencyContact: e.target.value })}
                      placeholder="Ex: Maria (Esposa) - (11) 98888-7777"
                    />
                  </div>

                  <div className="flex flex-col md:flex-row items-center gap-10 pt-4">
                    <div className="flex-1 flex items-center gap-4 text-slate-500">
                      <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                         <ShieldCheck className="w-6 h-6 text-green-500" />
                      </div>
                      <p className="text-[10px] font-black leading-relaxed uppercase tracking-widest">
                        Inscrição segura. Ao prosseguir, você confirma que está em condições físicas para o evento.
                      </p>
                    </div>
                      <button 
                        type="submit" 
                        disabled={submitting || (race && (registrationsCount >= race.capacity || race.status !== 'active'))}
                        className="w-full md:w-auto px-6 sm:px-10 lg:px-16 py-5 sm:py-6 lg:py-8 bg-yellow-400 text-slate-950 rounded-3xl lg:rounded-[2.5rem] font-black text-lg sm:text-xl lg:text-2xl flex items-center justify-center gap-4 hover:bg-yellow-300 transition-all shadow-[0_30px_60px_rgba(250,204,21,0.3)] hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale uppercase italic tracking-tighter"
                      >
                        {submitting ? <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin" /> : (
                        race && (registrationsCount >= race.capacity || race.status !== 'active') ? (
                          race.status === 'paused' ? 'INSCRIÇÕES PAUSADAS' : 
                          race.status === 'closed' ? 'INSCRIÇÕES ENCERRADAS' : 
                          'VAGAS ESGOTADAS'
                        ) : (
                          <>
                            {race.participationType === 'paid' ? 'IR PARA PAGAMENTO' : 'CONFIRMAR'}
                            <ArrowRight className="w-8 h-8" />
                          </>
                        )
                      )}
                    </button>
                  </div>
                                     </motion.form>
                   ) : (
                     <motion.div 
                       key="payment-step"
                       initial={{ opacity: 0, x: 20 }}
                       animate={{ opacity: 1, x: 0 }}
                       exit={{ opacity: 0, x: -20 }}
                       className="flex flex-col items-center py-4"
                     >
                        <div className="w-20 h-20 bg-yellow-400/10 rounded-3xl flex items-center justify-center mb-10 mx-auto transform hover:rotate-12 transition-transform">
                          <CreditCard className="w-10 h-10 text-yellow-400" />
                        </div>

                        <div className="text-center mb-12">
                           <h3 className="text-3xl md:text-5xl font-display font-black italic uppercase tracking-tighter mb-4">Investimento do Atleta</h3>
                           <div className="inline-block bg-slate-950 px-8 py-4 rounded-2xl border-2 border-yellow-400/20">
                             <span className="text-4xl md:text-6xl font-display font-black text-yellow-400 tracking-tighter italic">
                               {formatCurrency(race.price)}
                             </span>
                           </div>
                        </div>

                        <div className="w-full max-w-lg space-y-8">
                           <div className="bg-yellow-400/10 p-8 rounded-[3rem] mx-auto inline-block border-2 border-yellow-400/20">
                             <CreditCard className="w-16 h-16 md:w-20 md:h-20 text-yellow-400" />
                           </div>

                           <div className="bg-slate-950 border-2 border-slate-800 rounded-3xl p-8 relative group overflow-hidden shadow-2xl">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block italic">Chave PIX / Recebedor</span>
                              <div className="flex flex-col gap-2 relative z-10">
                                 <div className="flex items-center justify-between gap-4">
                                   <code className="text-xl md:text-2xl font-mono font-bold text-yellow-400 tracking-wider break-all">
                                     {race.pixKey || 'Chave não cadastrada'}
                                   </code>
                                   <button 
                                     type="button"
                                     onClick={() => {
                                       if (race.pixKey) {
                                         navigator.clipboard.writeText(race.pixKey);
                                         setCopied(true);
                                         setTimeout(() => setCopied(false), 2000);
                                       }
                                     }}
                                     className="bg-yellow-400 text-slate-950 px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-lg shrink-0"
                                   >
                                     {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                     {copied ? 'COPIADO' : 'COPIAR'}
                                   </button>
                                 </div>
                                 <div className="text-[10px] font-bold text-slate-500 mt-2 italic">
                                   Confirmar se o recebedor é o organizador oficial antes de pagar.
                                 </div>
                              </div>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <button 
                                type="button"
                                onClick={() => setStep('form')}
                                className="w-full bg-slate-950 border-2 border-white/5 text-white py-6 rounded-3xl font-black italic uppercase tracking-widest transition-all hover:bg-slate-900"
                              >
                                Voltar aos Dados
                              </button>
                              <button 
                                type="button"
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="w-full bg-yellow-400 text-slate-950 py-6 rounded-3xl font-black italic uppercase tracking-widest transition-all hover:bg-yellow-300 shadow-xl flex items-center justify-center gap-2"
                              >
                                {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                  <>
                                    <CheckCircle2 className="w-5 h-5" />
                                    Finalizar Inscrição
                                  </>
                                )}
                              </button>
                           </div>

                           <p className="text-[10px] font-black text-slate-600 uppercase text-center tracking-widest leading-relaxed">
                             Após o pagamento, sua inscrição ficará com status "Pendente" <br /> até a conferência manual do organizador.
                           </p>
                        </div>
                     </motion.div>
                   )}
                 </AnimatePresence>
             </motion.div>
          </div>
        </div>

        {/* Map Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 md:mt-20"
        >
          <MapSection location={race.location} />
        </motion.div>

        {/* Public Participants List Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 bg-slate-900/40 border border-white/5 p-8 md:p-12 lg:p-16 rounded-[3rem] lg:rounded-[4rem] backdrop-blur-sm"
        >
          <ParticipantsTable 
            registrations={allRegistrations} 
            title="Atletas Inscritos" 
          />
        </motion.div>
      </div>
    </div>
  );
};

const DetailBox = ({ icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="flex items-start gap-4 p-5 bg-slate-950 border border-slate-800 rounded-3xl hover:border-slate-700 transition-colors group">
    <div className="p-3 bg-slate-900 rounded-2xl text-yellow-400 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <div>
      <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">{label}</div>
      <div className="text-sm font-black text-white italic uppercase tracking-tighter">{value}</div>
    </div>
  </div>
);

const InputField = ({ label, icon, value, onChange, placeholder, type = "text", maxLength, required = true }: any) => (
  <div className="space-y-4">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic ml-2 flex items-center gap-2">
      {icon} {label}
    </label>
    <input 
      required={required}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      maxLength={maxLength}
      className="w-full bg-slate-950 border-2 border-slate-800 rounded-3xl px-6 sm:px-8 py-4 sm:py-5 focus:outline-none focus:border-yellow-400 transition-all text-white placeholder:text-slate-800 font-bold italic"
    />
  </div>
);


export default RaceEnrollment;
