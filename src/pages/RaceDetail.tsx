import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Race, Registration, RaceStatus } from '../types';
import { useAuth } from '../hooks/useAuth';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  Trash2, 
  Users, 
  MapPin, 
  Calendar, 
  Clock,
  Phone,
  MessageCircle,
  Filter, 
  ExternalLink,
  Download,
  Search,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Loader2,
  Share2,
  Zap,
  AlertCircle,
  ArrowRight,
  Award,
  FileBadge,
  Camera
} from 'lucide-react';
import { formatCurrency, formatDate, cn, getPublicRaceLink, handleFirestoreError, OperationType } from '../lib/utils';
import { generateCertificate, generateAllCertificates } from '../lib/CertificateGenerator';
import { motion, AnimatePresence } from 'motion/react';
import MapSection from '../components/MapSection';

const RaceDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [race, setRace] = useState<Race | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [waCopied, setWaCopied] = useState(false);
  const [idCopied, setIdCopied] = useState(false);
  const [updatingReg, setUpdatingReg] = useState<string | null>(null);
  const [successReg, setSuccessReg] = useState<string | null>(null);
  const [newRegistration, setNewRegistration] = useState<Registration | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filters, setFilters] = useState({ gender: 'all', payment: 'all', search: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [jumpInput, setJumpInput] = useState('1');
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !user) return;
      try {
        const raceRef = doc(db, 'races', id);
        const raceSnap = await getDoc(raceRef);
        
        if (raceSnap.exists()) {
          const raceData = { id: raceSnap.id, ...raceSnap.data() } as Race;
          
          if (raceData.organizerId !== user.uid) {
            setError('Você não tem permissão para gerenciar esta corrida.');
            setLoading(false);
            return;
          }

          setRace(raceData);
        } else {
          setError('Corrida não encontrada.');
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Error fetching race details:', err);
        setError('Falha ao carregar dados da corrida. Verifique sua conexão.');
        setLoading(false);
      }
    };

    fetchData();

    // Set up real-time listener for registrations
    if (!id || !user) return;
    const regsQuery = query(
      collection(db, 'registrations'),
      where('raceId', '==', id),
      where('organizerId', '==', user.uid)
    );

    let isFirstLoad = true;
    const unsubscribe = onSnapshot(regsQuery, (snapshot) => {
      const updatedRegs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Registration));
      
      if (!isFirstLoad) {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const newReg = { id: change.doc.id, ...change.doc.data() } as Registration;
            setNewRegistration(newReg);
          }
        });
      }

      setRegistrations(updatedRegs);
      setLoading(false);
      isFirstLoad = false;
    });

    return () => unsubscribe();
  }, [id, user]);

  useEffect(() => {
    if (newRegistration) {
      const timer = setTimeout(() => {
        setNewRegistration(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [newRegistration]);

  const getPublicLink = useCallback(() => {
    return id ? getPublicRaceLink(id) : '';
  }, [id]);

  const copyRegistrationLink = useCallback(() => {
    const link = getPublicLink();
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [getPublicLink]);

  const copyRaceId = useCallback(() => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    setIdCopied(true);
    setTimeout(() => setIdCopied(false), 2000);
  }, [id]);

  const shareWhatsApp = useCallback(() => {
    const link = getPublicLink();
    navigator.clipboard.writeText(link).catch(err => console.error('Failed to copy: ', err));
    setWaCopied(true);
    setTimeout(() => setWaCopied(false), 2000);

    const text = encodeURIComponent(`🏃‍♂️ *INSCRIÇÃO ABERTA!* 🏃‍♀️\n\nVem correr com a gente na *${race?.name}*!\n\n📅 *Data:* ${formatDate(race?.date || '')}\n📍 *Local:* ${race?.location}\n\nGaranta sua vaga agora pelo link oficial:\n${link}\n\n_Bora bater esse recorde!_ 🏁🔥`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }, [getPublicLink, race]);

  const handlePreviewLink = useCallback(() => {
    window.open(getPublicLink(), '_blank');
  }, [getPublicLink]);

  const togglePayment = useCallback(async (regId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'confirmed' ? 'pending' : 'confirmed';
    const previousRegistrations = [...registrations];
    
    // Optimistic Update
    setRegistrations(prev => prev.map(r => 
      r.id === regId ? { ...r, paymentStatus: newStatus as any } : r
    ));
    setUpdatingReg(regId);
    
    try {
      await updateDoc(doc(db, 'registrations', regId), { paymentStatus: newStatus });
      setSuccessReg(regId);
      setTimeout(() => setSuccessReg(null), 3000);
    } catch (err) {
      console.error('Error updating payment status:', err);
      // Revert if failed
      setRegistrations(previousRegistrations);
      alert('Erro ao atualizar status. O servidor não pôde ser alcançado.');
    } finally {
      setTimeout(() => setUpdatingReg(null), 300);
    }
  }, [registrations]);

  const deleteRace = useCallback(async () => {
    if (!id) return;
    
    setIsDeleting(true);
    try {
      const regsQuery = query(
        collection(db, 'registrations'), 
        where('raceId', '==', id),
        where('organizerId', '==', user?.uid)
      );
      const regsSnap = await getDocs(regsQuery);
      
      const deletePromises = regsSnap.docs.map(regDoc => deleteDoc(regDoc.ref));
      await Promise.allSettled(deletePromises);

      await deleteDoc(doc(db, 'races', id));
      navigate('/dashboard');
    } catch (err) {
      console.error('Error deleting race and registrations:', err);
      alert('Erro ao excluir corrida. Verifique se você tem permissão e tente novamente.');
    } finally {
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }
  }, [id, user, navigate]);

  const updateRaceStatus = useCallback(async (newStatus: any) => {
    if (!id) return;
    try {
      await updateDoc(doc(db, 'races', id), { status: newStatus });
    } catch (err) {
      console.error('Error updating race status:', err);
    }
  }, [id]);

  const filteredRegistrations = useMemo(() => {
    return registrations.filter(r => {
      const matchesGender = filters.gender === 'all' || r.gender === filters.gender;
      const matchesPayment = filters.payment === 'all' || r.paymentStatus === filters.payment;
      const matchesSearch = r.runnerName.toLowerCase().includes(filters.search.toLowerCase()) || 
                            r.email.toLowerCase().includes(filters.search.toLowerCase()) ||
                            r.cpf.includes(filters.search);
      return matchesGender && matchesPayment && matchesSearch;
    });
  }, [registrations, filters]);

  const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage);
  const paginatedRegistrations = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRegistrations.slice(start, start + itemsPerPage);
  }, [filteredRegistrations, currentPage, itemsPerPage]);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  useEffect(() => {
    setJumpInput(currentPage.toString());
  }, [currentPage]);

  const exportToCSV = useCallback(() => {
    const headers = ['Nome', 'Email', 'WhatsApp', 'Sexo', 'Data Nasc', 'CPF', 'Camisa', 'Equipe', 'Cidade', 'Contato Emergência', 'Status Pagamento', 'Data Inscrição'];
    const rows = filteredRegistrations.map(r => [
      r.runnerName,
      r.email,
      r.whatsapp,
      r.gender === 'male' ? 'Masculino' : 'Feminino',
      r.birthDate,
      r.cpf,
      r.jerseySize,
      r.team || 'N/A',
      r.city,
      r.emergencyContact,
      r.paymentStatus === 'confirmed' ? 'Confirmado' : 'Pendente',
      r.createdAt?.toDate 
        ? r.createdAt.toDate().toLocaleDateString('pt-BR') 
        : new Date(r.createdAt).toLocaleDateString('pt-BR')
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `inscritos-${race?.name}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredRegistrations, race]);

  const exportToPDF = useCallback(() => {
    if (!race) return;
    
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text(`Relatório de Inscritos - ${race.name}`, 14, 20);
    doc.setFontSize(12);
    doc.text(`Data: ${formatDate(race.date)} - ${race.time}`, 14, 30);
    doc.text(`Local: ${race.location}`, 14, 37);
    doc.text(`Total de Inscritos: ${registrations.length}`, 14, 44);
    
    const tableHeaders = [['Atleta', 'Sexo', 'WhatsApp', 'Status Pagamento', 'Equipe']];
    const tableRows = filteredRegistrations.map(r => [
      r.runnerName,
      r.gender === 'male' ? 'Masc.' : 'Fem.',
      r.whatsapp,
      r.paymentStatus === 'confirmed' ? 'Confirmado' : 'Pendente',
      r.team || '-'
    ]);

    autoTable(doc, {
      startY: 55,
      head: tableHeaders,
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [250, 204, 21], textColor: [0, 0, 0], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    doc.save(`inscritos-${race.name}.pdf`);
  }, [filteredRegistrations, race, registrations.length]);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, escolha um arquivo de imagem.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Resize banner (Max 1200px width for covers)
        const MAX_WIDTH = 1200;
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Compress and update document (base64)
        const base64 = canvas.toDataURL('image/jpeg', 0.6);
        updateRaceBanner(base64);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, [race, id]);

  const updateRaceBanner = async (bannerUrl: string) => {
    if (!race || !id) return;
    try {
      await updateDoc(doc(db, 'races', id), { bannerUrl });
      setRace({ ...race, bannerUrl });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `races/${id}`, auth);
    }
  };

  const handleGenerateCertificate = useCallback((reg: Registration) => {
    if (!race) return;
    generateCertificate(race, reg);
  }, [race]);

  const handleGenerateAllCertificates = useCallback(() => {
    if (!race) return;
    const confirmedRegs = registrations.filter(r => r.paymentStatus === 'confirmed');
    if (confirmedRegs.length === 0) {
      alert('Não há atletas confirmados para gerar certificados.');
      return;
    }
    generateAllCertificates(race, confirmedRegs);
  }, [race, registrations]);

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-yellow-400" /></div>;
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center space-y-6">
        <XCircle className="w-16 h-16 text-yellow-400" />
        <h2 className="text-2xl font-display font-black text-white italic uppercase tracking-tighter">{error}</h2>
        <button onClick={() => navigate('/dashboard')} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all border border-slate-700">
          Voltar para o Painel
        </button>
      </div>
    );
  }

  if (!race) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 relative">
      {/* Real-time Notification Banner */}
      <AnimatePresence>
        {newRegistration && (
          <motion.div 
            initial={{ opacity: 0, y: -100, x: '-50%' }}
            animate={{ opacity: 1, y: 20, x: '-50%' }}
            exit={{ opacity: 0, y: -100, x: '-50%' }}
            className="fixed top-0 left-1/2 z-[100] w-full max-w-sm px-4"
          >
            <div className="bg-yellow-400 text-slate-950 p-4 rounded-2xl shadow-[0_20px_50px_rgba(250,204,21,0.3)] flex items-center gap-4 border-2 border-slate-950/10">
               <div className="w-12 h-12 rounded-full bg-slate-950/10 flex items-center justify-center shrink-0">
                  <Zap className="w-6 h-6 animate-pulse" />
               </div>
               <div className="flex-1">
                  <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Nova Inscrição!</div>
                  <div className="text-sm font-black italic uppercase truncate leading-none mt-0.5">{newRegistration.runnerName}</div>
                  <div className="text-[9px] font-bold opacity-60 uppercase mt-1">Acabou de garantir a vaga</div>
               </div>
               <button onClick={() => setNewRegistration(null)} className="p-1 hover:bg-slate-950/10 rounded-lg transition-colors">
                  <XCircle className="w-5 h-5" />
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Race Deletion Modal */}
      <AnimatePresence>
        {showConfirmDelete && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeleting && setShowConfirmDelete(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] text-center overflow-hidden"
            >
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
               <div className="w-20 h-20 bg-yellow-400/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trash2 className="w-10 h-10 text-yellow-400 animate-pulse" />
               </div>
               <h4 className="text-2xl font-display font-black text-white uppercase italic mb-3">Excluir Corrida?</h4>
               <p className="text-slate-400 text-sm mb-10 leading-relaxed font-medium">
                  Esta ação é irreversível. Todos os dados da corrida <span className="text-white font-bold italic">"{race.name}"</span> e os registros de todos os <span className="text-white font-bold">{registrations.length}</span> atletas serão permanentemente removidos.
               </p>
               <div className="flex flex-col gap-3">
                  <button 
                    onClick={deleteRace}
                    disabled={isDeleting}
                    className="w-full py-5 bg-yellow-400 text-slate-950 rounded-2xl font-black uppercase italic tracking-widest text-sm hover:bg-yellow-300 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'CONFIRMAR EXCLUSÃO'}
                  </button>
                  <button 
                    onClick={() => !isDeleting && setShowConfirmDelete(false)}
                    disabled={isDeleting}
                    className="w-full py-5 bg-slate-800 text-slate-300 rounded-2xl font-black uppercase italic tracking-widest text-sm hover:bg-slate-700 transition-all active:scale-95 disabled:opacity-50"
                  >
                    CANCELAR
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header Info */}
      <div className="flex flex-col xl:flex-row justify-between items-start gap-6 px-4 sm:px-0">
        <div className="flex-1 w-full sm:w-auto">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-4 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Voltar para Visão Geral
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-2 flex-wrap">
             {race.logoUrl && (
               <div className="w-16 h-16 rounded-2xl bg-white p-2 shadow-xl shrink-0 ring-2 ring-slate-800">
                 <img src={race.logoUrl} alt="Logo" className="w-full h-full object-contain" />
               </div>
             )}
             <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white italic leading-tight">{race.name}</h1>
             
             <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                <label className="cursor-pointer group flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg hover:border-yellow-400/50 transition-all">
                   <div className="w-6 h-6 rounded-md bg-slate-950 flex items-center justify-center text-slate-500 group-hover:text-yellow-400 transition-colors">
                      <Camera className="w-3 h-3" />
                   </div>
                   <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors">
                      {race.bannerUrl ? 'Trocar Capa' : 'Adicionar Capa'}
                   </span>
                   <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
                
                <div className="flex items-center bg-slate-900 rounded-full p-1 border border-slate-800">
                   {(['active', 'paused', 'closed'] as RaceStatus[]).map((s) => (
                     <button
                       key={s}
                       onClick={() => updateRaceStatus(s)}
                       className={cn(
                         "px-2 sm:px-3 py-1 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-tighter transition-all",
                         race.status === s 
                           ? (s === 'active' ? "bg-green-500 text-white" : s === 'paused' ? "bg-yellow-500 text-white" : "bg-yellow-400 text-slate-950")
                           : "text-slate-600 hover:text-slate-400"
                       )}
                     >
                       {s === 'active' ? 'Ativo' : s === 'paused' ? 'Pausado' : 'Fim'}
                     </button>
                   ))}
                </div>
             </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-slate-400 mt-4 text-xs">
             <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-yellow-400" /> {formatDate(race.date)}</div>
             <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-yellow-400" /> {race.time}</div>
             <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-yellow-400" /> {race.location}</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto relative px-4 sm:px-0">
          <Link 
            to={`/dashboard/race/${id}/participants`}
            className="flex items-center justify-center gap-3 bg-yellow-400 text-slate-950 px-6 sm:px-8 py-4 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-yellow-300 transition-all shadow-[0_20px_40px_rgba(250,204,21,0.2)]"
          >
            <Users className="w-4 h-4" />
            Participantes
          </Link>

          <div className="flex gap-3">
             <button 
               onClick={copyRegistrationLink}
               className="flex-1 flex items-center justify-center gap-3 bg-slate-900 border border-slate-700 px-6 py-4 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-slate-800 hover:border-yellow-400/30 transition-all text-white group"
             >
               {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-yellow-400 group-hover:rotate-12 transition-transform" />}
               {copied ? 'Copiado!' : 'Link'}
             </button>
             <button 
               onClick={shareWhatsApp}
               className="flex-1 flex items-center justify-center gap-3 bg-[#25D366] text-white px-6 py-4 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-[#128C7E] transition-all shadow-[0_20px_40px_rgba(37,211,102,0.2)]"
             >
               {waCopied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
               {waCopied ? 'OK' : 'Zap'}
             </button>
             <button 
               onClick={() => setShowConfirmDelete(true)} 
               disabled={isDeleting}
               className="p-4 text-yellow-400 hover:bg-yellow-400/10 rounded-xl transition-all border border-yellow-400/30 disabled:opacity-50 flex items-center justify-center"
             >
               {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
             </button>
          </div>
        </div>
      </div>

      {/* Mini Stats and Link info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 bg-slate-950 border border-slate-800 p-6 rounded-2xl">
           <div className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Inscritos</div>
           <div className="text-3xl font-display font-black text-white">{registrations.length} <span className="text-sm text-slate-700">/ {race.capacity}</span></div>
           
           {registrations.length >= race.capacity * 0.8 && registrations.length < race.capacity && (
             <motion.div 
               animate={{ scale: [1, 1.02, 1] }}
               transition={{ repeat: Infinity, duration: 2 }}
               className="mt-2 text-[9px] font-black text-yellow-500 uppercase tracking-widest flex items-center gap-1"
             >
                <Zap className="w-3 h-3 fill-current" /> Atenção: 80% da capacidade atingida!
             </motion.div>
           )}
           {registrations.length >= race.capacity && (
             <div className="mt-2 text-[9px] font-black text-yellow-400 uppercase tracking-widest flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Evento com lotação máxima!
             </div>
           )}

           <div className="w-full bg-slate-900 h-1.5 rounded-full mt-4 overflow-hidden">
              <div className={cn(
                "h-full rounded-full transition-all duration-1000",
                registrations.length >= race.capacity ? "bg-yellow-100" : registrations.length >= race.capacity * 0.8 ? "bg-yellow-400" : "bg-yellow-400"
              )} style={{ width: `${Math.min(100, (registrations.length / race.capacity) * 100)}%` }}></div>
           </div>
        </div>
        <div className="md:col-span-1 bg-slate-950 border border-slate-800 p-6 rounded-2xl">
           <div className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Arrecadação</div>
           <div className="text-3xl font-display font-black text-green-400">
             {race.participationType === 'beneficent' ? 'Doação' : race.participationType === 'free' ? 'Grátis' : formatCurrency(registrations.filter(r => r.paymentStatus === 'confirmed').length * race.price)}
           </div>
           <div className="text-xs text-slate-500 mt-2">
             {race.participationType === 'paid' && (
               <span>Pendente: {formatCurrency(registrations.filter(r => r.paymentStatus === 'pending').length * race.price)}</span>
             )}
             {race.participationType !== 'paid' && 'Apenas confirmados'}
           </div>
        </div>
        <div className="md:col-span-2 bg-gradient-to-r from-yellow-400 to-yellow-600 p-[1px] rounded-2xl shadow-xl shadow-yellow-400/10">
            <div className="bg-slate-950 p-6 rounded-2xl h-full flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-8 h-8 rounded-full bg-yellow-400/20 flex items-center justify-center">
                   <Share2 className="w-4 h-4 text-yellow-400" />
                 </div>
                 <div className="text-sm font-black text-white uppercase tracking-widest italic">Link de Divulgação</div>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl border border-white/5 flex items-center justify-between gap-4 mb-4">
                <code className="text-[10px] text-yellow-400 font-mono truncate flex-1">{getPublicLink()}</code>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handlePreviewLink}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                    title="Testar Link (Abre em nova aba)"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={copyRegistrationLink}
                    className="px-3 py-1.5 bg-yellow-400/10 text-yellow-400 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-yellow-400/20 transition-colors"
                  >
                    {copied ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase tracking-tighter">
                <span className="text-yellow-400">✓ Link Público Gerado:</span> Este link é público e não pede login do AI Studio. Envie-o para seus atletas.
              </p>
            </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
         <MapSection location={race.location} />
      </motion.div>

      {/* Attendees Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-slate-800 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-2xl font-display font-extrabold text-white italic flex items-center gap-3">
              <Users className="w-7 h-7 text-yellow-400" />
              Lista de Atletas
            </h2>
            <div className="flex items-center gap-4">
              <button 
                onClick={exportToCSV}
                disabled={filteredRegistrations.length === 0}
                className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" /> Exportar CSV
              </button>
              <button 
                onClick={exportToPDF}
                disabled={filteredRegistrations.length === 0}
                className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" /> Exportar PDF
              </button>
              <button 
                onClick={handleGenerateAllCertificates}
                disabled={registrations.filter(r => r.paymentStatus === 'confirmed').length === 0}
                className="flex items-center gap-2 text-sm font-bold text-yellow-400 hover:text-yellow-300 transition-colors disabled:opacity-50"
              >
                <Award className="w-4 h-4" /> Certificados (Lote)
              </button>
            </div>
          </div>

          <div className="flex flex-col xl:flex-row gap-6 items-stretch">
            <div className="relative flex-1 group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-500 group-focus-within:text-yellow-400 group-focus-within:border-yellow-400/30 transition-all">
                <Search className="w-4 h-4" />
              </div>
              <input 
                type="text" 
                placeholder="Buscar atleta..." 
                value={filters.search}
                onChange={e => handleFilterChange({...filters, search: e.target.value})}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl pl-16 pr-4 py-4 focus:outline-none focus:ring-4 focus:ring-yellow-400/5 focus:border-yellow-400/50 text-white placeholder:text-slate-600 font-medium transition-all text-sm"
              />
              {filters.search && (
                <button 
                  onClick={() => handleFilterChange({...filters, search: ''})}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl sm:rounded-[1.25rem] overflow-x-auto">
                {[
                  { id: 'all', label: 'T', icon: Users },
                  { id: 'male', label: 'M', icon: Users },
                  { id: 'female', label: 'F', icon: Users },
                ].map((g) => (
                  <button
                    key={g.id}
                    onClick={() => handleFilterChange({...filters, gender: g.id})}
                    className={cn(
                      "px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shrink-0",
                      filters.gender === g.id 
                        ? "bg-yellow-400 text-slate-950 shadow-[0_10px_20px_rgba(250,204,21,0.2)]" 
                        : "text-slate-500 hover:text-slate-300"
                    )}
                  >
                    {g.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl sm:rounded-[1.25rem] overflow-x-auto">
                {[
                  { id: 'all', label: 'TODOS', icon: Filter },
                  { id: 'confirmed', label: 'CONFIRMADOS', icon: CheckCircle2, color: 'bg-green-500' },
                  { id: 'pending', label: 'PENDENTES', icon: Clock, color: 'bg-red-500' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleFilterChange({...filters, payment: p.id})}
                    className={cn(
                      "px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shrink-0",
                      filters.payment === p.id 
                        ? (p.color ? `${p.color} text-white` : "bg-yellow-400 text-slate-950")
                        : "text-slate-500 hover:text-slate-300"
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {(filters.gender !== 'all' || filters.payment !== 'all' || filters.search !== '') && (
                <button 
                  onClick={() => handleFilterChange({ gender: 'all', payment: 'all', search: '' })}
                  className="p-3 bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all border border-slate-700 flex items-center justify-center shrink-0"
                  title="Limpar Filtros"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full text-left min-w-[1000px]">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/30">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Atleta / Identificação</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Kit e Detalhes</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Informações de Contato</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Pagamento</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
              {paginatedRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="max-w-xs mx-auto space-y-4">
                       <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto text-slate-800">
                          <Search className="w-8 h-8" />
                       </div>
                       <div className="text-slate-500 italic font-medium">Nenhum atleta encontrado com os filtros atuais. Tente ajustar sua busca.</div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRegistrations.map((reg) => (
                  <tr 
                    key={reg.id} 
                    className="group hover:bg-white/[0.03] transition-all duration-300 relative border-l-4 border-l-transparent hover:border-l-yellow-400"
                  >
                    <td className="px-8 py-8">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-700 font-bold border border-slate-800 group-hover:border-yellow-400/30 transition-colors">
                             {reg.runnerName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-black text-white italic uppercase tracking-tighter text-lg leading-none mb-1 group-hover:text-yellow-400 transition-colors">{reg.runnerName}</div>
                            <div className="flex items-center gap-2">
                               <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                                  <FileBadge className="w-3 h-3" /> {reg.cpf}
                               </div>
                               <div className="w-1 h-1 rounded-full bg-slate-800"></div>
                               <div className="text-[10px] text-slate-500 truncate max-w-[150px]">{reg.email}</div>
                            </div>
                            {reg.team && (
                              <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-yellow-400/10 text-yellow-500 text-[9px] font-black uppercase tracking-widest">
                                 <Award className="w-3 h-3" /> {reg.team}
                              </div>
                            )}
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex items-center gap-8">
                        <div className="space-y-3">
                           <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                                 <Zap className="w-4 h-4 text-yellow-400" />
                              </div>
                              <div>
                                 <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Camisa</div>
                                 <div className="text-sm font-black text-white italic italic">{reg.jerseySize}</div>
                              </div>
                           </div>
                        </div>
                        <div className="space-y-1">
                           <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Gênero / Idade</div>
                           <div className="text-[11px] font-bold text-slate-300">
                             {reg.gender === 'male' ? 'Masculino' : 'Feminino'}
                           </div>
                           <div className="text-[10px] text-slate-500">{reg.birthDate.split('-').reverse().join('/')}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-2xl bg-[#25D366]/10 flex items-center justify-center text-[#25D366]">
                              <MessageCircle className="w-5 h-5" />
                           </div>
                           <div>
                              <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest">WhatsApp</div>
                              <div className="text-xs font-mono text-white">{reg.whatsapp}</div>
                           </div>
                        </div>
                        <div className="bg-slate-900/50 p-2 rounded-xl border border-white/5">
                           <div className="text-[8px] font-black text-slate-700 uppercase tracking-widest mb-1">Emergência</div>
                           <div className="text-[10px] text-slate-400 font-medium italic">{reg.emergencyContact}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8 text-center">
                      <div className={cn(
                        "inline-flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-500",
                        reg.paymentStatus === 'confirmed' 
                          ? "bg-green-500/10 border border-green-500/20 text-green-400" 
                          : "bg-slate-900 border border-slate-800 text-slate-600"
                      )}>
                        {reg.paymentStatus === 'confirmed' ? (
                          <>
                            <CheckCircle2 className="w-5 h-5 mb-1" />
                            <span className="text-[9px] font-black uppercase tracking-widest leading-none">Confirmado</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-5 h-5 mb-1 animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-widest leading-none">Pendente</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-8 text-right relative">
                       <AnimatePresence>
                         {successReg === reg.id && (
                           <motion.div 
                             initial={{ opacity: 0, y: -10, scale: 0.9 }}
                             animate={{ opacity: 1, y: -25, scale: 1 }}
                             exit={{ opacity: 0, scale: 0.9 }}
                             className="absolute right-8 bg-green-500 text-white text-[9px] font-black px-2 py-1 rounded-md shadow-lg z-10 uppercase tracking-widest italic"
                           >
                             Atualizado!
                           </motion.div>
                         )}
                       </AnimatePresence>
                       <div className="flex items-center justify-end gap-2">
                         {reg.paymentStatus === 'confirmed' && (
                           <button
                             onClick={() => handleGenerateCertificate(reg)}
                             className="px-3 py-2 bg-yellow-400/10 text-yellow-500 hover:bg-yellow-400 hover:text-slate-950 rounded-xl transition-all border border-yellow-400/20 flex items-center gap-2 group/cert"
                             title="Gerar Certificado"
                           >
                             <FileBadge className="w-4 h-4" />
                             <span className="text-[9px] font-black uppercase tracking-widest hidden lg:inline">Certificado</span>
                           </button>
                         )}
                         <button 
                           onClick={() => togglePayment(reg.id, reg.paymentStatus)}
                           disabled={updatingReg === reg.id}
                           className={cn(
                             "px-4 py-2 rounded-lg text-[10px] font-black transition-all flex items-center justify-center min-w-[110px] border",
                             reg.paymentStatus === 'confirmed' 
                               ? "border-slate-800 text-slate-500 hover:text-yellow-400 hover:border-yellow-400/30" 
                               : "bg-yellow-400 border-yellow-400 text-slate-950 hover:bg-yellow-300 active:scale-95 shadow-[0_4px_10px_rgba(250,204,21,0.2)]",
                             updatingReg === reg.id && "opacity-50 cursor-not-allowed",
                             successReg === reg.id && "border-green-500 text-green-500"
                           )}
                         >
                           {updatingReg === reg.id ? (
                             <Loader2 className="w-3.5 h-3.5 animate-spin" />
                           ) : successReg === reg.id ? (
                             <Check className="w-3.5 h-3.5" />
                           ) : (
                             reg.paymentStatus === 'confirmed' ? 'ESTORNAR' : 'CONFIRMAR PAGO'
                           )}
                         </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {totalPages > 1 ? (
            <div className="px-8 py-6 border-t border-slate-800 bg-slate-900/20 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic order-2 sm:order-1">
                  Exibindo {paginatedRegistrations.length} de {filteredRegistrations.length} <span className="mx-2 opacity-20">|</span> Pág {currentPage} de {totalPages}
                </div>
                <div className="flex items-center gap-2 order-1 sm:order-2">
                   <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1;
                      if (totalPages > 5 && Math.abs(page - currentPage) > 1 && page !== 1 && page !== totalPages) {
                        if (page === 2 || page === totalPages - 1) return <span key={page} className="text-slate-700">...</span>;
                        return null;
                      }
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={cn(
                            "w-8 h-8 rounded-lg text-[10px] font-black transition-all",
                            currentPage === page 
                              ? "bg-yellow-400 text-slate-950" 
                              : "bg-slate-900 text-slate-500 hover:bg-slate-800"
                          )}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 transition-all"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2 border-l border-slate-800 pl-4 ml-2">
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">Ir para:</span>
                    <div className="flex items-center gap-1">
                      <input 
                        type="text"
                        value={jumpInput}
                        onChange={(e) => setJumpInput(e.target.value.replace(/\D/g, ''))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const p = parseInt(jumpInput);
                            if (!isNaN(p) && p >= 1 && p <= totalPages) {
                              setCurrentPage(p);
                            } else {
                              setJumpInput(currentPage.toString());
                            }
                          }
                        }}
                        className="w-10 bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-1 text-[10px] font-black text-yellow-400 text-center focus:outline-none focus:border-yellow-400 transition-colors"
                      />
                      <button 
                        onClick={() => {
                          const p = parseInt(jumpInput);
                          if (!isNaN(p) && p >= 1 && p <= totalPages) {
                            setCurrentPage(p);
                          } else {
                            setJumpInput(currentPage.toString());
                          }
                        }}
                        className="text-[9px] font-black text-slate-500 hover:text-white transition-colors uppercase italic"
                      >
                        IR
                      </button>
                    </div>
                  </div>
                </div>
            </div>
           ) : registrations.length > 0 && (
             <div className="p-8 border-t border-slate-800 bg-slate-900/20 flex justify-center">
                <Link 
                  to={`/dashboard/race/${id}/participants`}
                  className="flex items-center gap-2 text-[10px] font-black text-yellow-400 uppercase tracking-widest hover:text-yellow-300 transition-colors group"
                >
                  Gerenciar Todos os Atletas <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </Link>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default RaceDetail;
