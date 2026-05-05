import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Race, Registration } from '../types';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Calendar, 
  Phone, 
  Info, 
  Share2, 
  Trophy,
  Loader2,
  ChevronLeft,
  Instagram,
  QrCode,
  Check,
  Copy
} from 'lucide-react';
import { formatCurrency, formatDate, cn, getPublicRaceLink } from '../lib/utils';
import { motion } from 'motion/react';

const RegistrationStatus = () => {
  const { id } = useParams();
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [race, setRace] = useState<Race | null>(null);
  const [organizer, setOrganizer] = useState<{ organizerName?: string; profileImageUrl?: string; whatsapp?: string; instagram?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [pixCopied, setPixCopied] = useState(false);

  useEffect(() => {
    if (!id) return;

    // Use onSnapshot to handle eventual consistency after registration
    const unsubscribe = onSnapshot(doc(db, 'registrations', id), async (regSnap) => {
      if (regSnap.exists()) {
        const regData = { id: regSnap.id, ...regSnap.data() } as Registration;
        setRegistration(regData);
        
        // Only fetch race once
        if (!race) {
          const raceSnap = await getDoc(doc(db, 'races', regData.raceId));
          if (raceSnap.exists()) {
            const raceData = { id: raceSnap.id, ...raceSnap.data() } as Race;
            setRace(raceData);

            // Buscar perfil do organizador
            try {
              const profileSnap = await getDoc(doc(db, 'profiles', raceData.organizerId));
              if (profileSnap.exists()) {
                setOrganizer(profileSnap.data());
              }
            } catch (err) {
              console.error('Error fetching profile:', err);
            }
          }
        }
        setLoading(false);
      } else {
        // If it doesn't exist yet, we keep loading
      }
    }, (err) => {
      console.error('Registration onSnapshot error:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id, race]);

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-yellow-400" /></div>;
  if (!registration || !race) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Inscrição não encontrada.</div>;

  const shareWithFriends = () => {
    const link = getPublicRaceLink(race?.id!);
    const text = encodeURIComponent(`Acabei de me inscrever na corrida "${race?.name}"! Vem correr comigo: ${link}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const isConfirmed = registration.paymentStatus === 'confirmed';

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-yellow-400/30">
      <div className="container mx-auto px-6 py-12 md:py-24 flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl bg-slate-900 border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden"
        >
          {/* Decorative radial gradient */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-yellow-400/10 rounded-full blur-[80px]"></div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center mb-8",
              isConfirmed ? "bg-green-400/20 text-green-400" : "bg-yellow-400/20 text-yellow-400"
            )}>
              {isConfirmed ? <CheckCircle2 className="w-12 h-12" /> : <Clock className="w-12 h-12 animate-pulse" />}
            </div>

            <h1 className="text-3xl md:text-5xl font-display font-black italic uppercase tracking-tighter mb-4 leading-tight">
              {isConfirmed ? 'Inscrição Confirmada!' : 'Inscrição Recebida!'}
            </h1>
            <p className="text-slate-400 text-lg mb-12 max-w-md">
              {isConfirmed 
                ? `Tudo certo, ${registration.runnerName}! Você já está garantido na largada.` 
                : `${registration.runnerName}, sua pré-inscrição foi realizada. Agora falta pouco!`}
            </p>

            <div className="w-full h-px bg-slate-800 mb-12"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full text-left mb-12">
               <div className="space-y-6">
                  <div>
                    <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Evento</div>
                    <div className="text-xl font-bold text-white">{race.name}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Quando</div>
                    <div className="text-slate-300 font-medium">{formatDate(race.date)} às {race.time}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Onde</div>
                    <div className="text-slate-300 font-medium">{race.location}</div>
                  </div>
               </div>
               
               <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex flex-col justify-center">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Dados da Inscrição</div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 uppercase font-black tracking-tighter">Camisa</span>
                      <span className="text-white font-bold">{registration.jerseySize}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 uppercase font-black tracking-tighter">CPF</span>
                      <span className="text-slate-400 font-mono">***.***.{registration.cpf.slice(-3)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 uppercase font-black tracking-tighter">Status</span>
                      <span className={cn("font-black italic uppercase tracking-tighter", isConfirmed ? "text-green-400" : "text-yellow-400")}>
                        {isConfirmed ? 'Confirmado' : 'Pendente'}
                      </span>
                    </div>
                  </div>
                  {!isConfirmed && (
                    <div className="mt-4 p-6 bg-yellow-400/5 rounded-[2rem] border border-yellow-400/20 flex flex-col gap-6">
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center border border-yellow-400/20">
                            <Info className="w-5 h-5 text-yellow-400" />
                         </div>
                         <span className="text-sm text-yellow-400 uppercase font-black italic tracking-widest">Quase lá! Garanta sua vaga na corrida</span>
                       </div>
                       
                       <div className="text-xs text-slate-400 leading-relaxed font-medium">
                         {race.participationType === 'paid' 
                           ? (
                             <div className="space-y-6">
                               <p className="text-slate-300">Escaneie o código abaixo ou copie a chave Pix para realizar o pagamento de <span className="text-yellow-400 font-black">{formatCurrency(race.price)}</span>.</p>
                               
                               {race.pixKey && (
                                 <div className="space-y-4">
                                   <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between gap-4 group shadow-inner">
                                     <div className="overflow-hidden">
                                       <div className="text-[8px] font-black uppercase text-slate-600 mb-1 tracking-widest">Chave Pix</div>
                                       <code className="text-yellow-400 font-mono break-all text-xs font-bold leading-none">{race.pixKey}</code>
                                     </div>
                                     <button 
                                       onClick={() => {
                                         navigator.clipboard.writeText(race.pixKey!);
                                         setPixCopied(true);
                                         setTimeout(() => setPixCopied(false), 2000);
                                       }}
                                       className="bg-yellow-400 text-slate-950 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-yellow-300 transition-all flex-shrink-0 shadow-lg"
                                     >
                                       {pixCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                       {pixCopied ? 'COPIADO' : 'COPIAR'}
                                     </button>
                                   </div>

                                   <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col items-center gap-4">
                                      <div className="w-40 h-40 bg-white p-3 rounded-xl">
                                         <QrCode className="w-full h-full text-slate-900" />
                                      </div>
                                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Ou use o QR Code acima</p>
                                   </div>
                                 </div>
                               )}
                               
                               <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                                  <div className="flex items-center gap-3">
                                     <CheckCircle2 className="w-5 h-5 text-green-400" />
                                     <span className="text-[10px] font-black uppercase tracking-widest text-white">Após o pagamento</span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 italic">Envie o comprovante para o organizador validar sua inscrição. Sua vaga só será garantida após essa validação.</p>
                                  
                                  <a 
                                    href={`https://wa.me/55${(organizer as any)?.pixProofWhatsapp || organizer?.whatsapp?.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá! Acabei de realizar o pagamento da inscrição para a corrida ${race.name}.\n\nAtleta: ${registration.runnerName}\nValor: ${formatCurrency(race.price)}\nID: ${registration.id}\n\nSegue o comprovante em anexo:`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-4 bg-green-500 text-white rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg hover:bg-green-400 transition-all"
                                  >
                                    <Phone className="w-5 h-5" />
                                    Enviar comprovante no WhatsApp
                                  </a>
                               </div>
                             </div>
                           )
                           : race.participationType === 'beneficent' 
                           ? (
                             <div className="space-y-4">
                               <p className="text-slate-300">Esta é uma corrida solidária.</p>
                               <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                                  <div className="text-[8px] font-black uppercase text-slate-600 mb-2 tracking-widest">O que levar</div>
                                  <p className="text-white font-bold italic uppercase tracking-tighter">{race.donationDescription || 'Doação a combinar'}</p>
                               </div>
                               <p className="text-xs text-slate-400 italic">Leve os itens acima no dia do evento para retirar seu kit.</p>
                             </div>
                           )
                           : 'Esta corrida é gratuita! Sua vaga já está pré-reservada.'}
                       </div>
                    </div>
                  )}
               </div>
            </div>

            <div className="w-full space-y-4">
               <button 
                 onClick={shareWithFriends}
                 className="w-full py-4 bg-yellow-400 text-slate-950 rounded-2xl font-bold hover:bg-yellow-300 transition-all flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(250,204,21,0.2)]"
               >
                 <Share2 className="w-5 h-5" />
                 Convidar Amigos
               </button>
               <button 
                 onClick={() => window.print()}
                 className="w-full py-4 bg-slate-950 text-white rounded-2xl font-bold border border-slate-800 hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
               >
                 Salvar Comprovante
               </button>
               {!isConfirmed && (
                 <a 
                   href={organizer?.whatsapp ? `https://wa.me/55${organizer.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá, acabei de me inscrever na corrida ${race.name}. Meu ID de inscrição é ${registration.id}. Gostaria de confirmar meu pagamento.`)}` : `https://wa.me/?text=${encodeURIComponent(`Olá, acabei de me inscrever na corrida ${race.name}. Meu ID de inscrição é ${registration.id}`)}`}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="w-full py-4 bg-green-500/10 text-green-500 rounded-2xl font-bold border border-green-500/20 hover:bg-green-500/20 transition-all flex items-center justify-center gap-3"
                 >
                   <Phone className="w-5 h-5" />
                   Falar com Organizador
                 </a>
               )}
               
               {organizer && (
                 <div className="pt-8 border-t border-slate-800 flex flex-col items-center gap-4">
                    <div className="flex items-center gap-3 opacity-50">
                       <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                          {organizer.profileImageUrl ? (
                            <img src={organizer.profileImageUrl} alt="Logo" className="w-full h-full object-cover" />
                          ) : (
                            <Trophy className="w-4 h-4 text-yellow-400 opacity-50" />
                          )}
                       </div>
                       <div className="text-[9px] font-black uppercase tracking-[0.2em]">{organizer.organizerName}</div>
                    </div>
                    {organizer.instagram && (
                      <a 
                        href={`https://instagram.com/${organizer.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-pink-500 transition-colors"
                      >
                        <Instagram className="w-3 h-3" /> @{organizer.instagram.replace('@', '')}
                      </a>
                    )}
                 </div>
               )}
            </div>
          </div>
        </motion.div>

        <Link to="/" className="mt-12 flex items-center gap-2 text-slate-500 hover:text-white transition-colors group">
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Voltar para Início
        </Link>
      </div>
    </div>
  );
};

export default RegistrationStatus;
