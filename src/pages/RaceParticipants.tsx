import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { collection, query, where, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { Race, Registration, PaymentStatus } from '../types';
import { 
  Users, 
  Loader2,
  ChevronLeft
} from 'lucide-react';
import { handleFirestoreError, OperationType } from '../lib/utils';
import ParticipantsTable from '../components/ParticipantsTable';
import { generateCertificate } from '../lib/CertificateGenerator';

const RaceParticipants = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [race, setRace] = useState<Race | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !user) return;

    // Fetch Race details
    const fetchRace = async () => {
      try {
        const raceSnap = await getDoc(doc(db, 'races', id));
        if (raceSnap.exists()) {
          const data = { id: raceSnap.id, ...raceSnap.data() } as Race;
          if (data.organizerId !== user.uid) {
            navigate('/dashboard');
            return;
          }
          setRace(data);
        }
      } catch (err) {
        console.error('Error fetching race:', err);
      }
    };
    fetchRace();

    // Listen to registrations for this race
    const regsQuery = query(
      collection(db, 'registrations'),
      where('raceId', '==', id),
      where('organizerId', '==', user.uid)
    );
    
    const unsubRegs = onSnapshot(regsQuery, (snap) => {
      setRegistrations(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Registration)));
      setLoading(false);
    }, (err) => {
      console.error('Error listening to registrations:', err);
      handleFirestoreError(err, OperationType.GET, `registrations/${id}`, auth);
    });

    return () => unsubRegs();
  }, [id, user, navigate]);

  const togglePaymentStatus = async (reg: Registration) => {
    const newStatus: PaymentStatus = reg.paymentStatus === 'confirmed' ? 'pending' : 'confirmed';
    try {
      await updateDoc(doc(db, 'registrations', reg.id), { paymentStatus: newStatus });
    } catch (err) {
      console.error('Error updating payment status:', err);
    }
  };

  const handleGenerateCertificate = (reg: Registration) => {
    if (!race) return;
    generateCertificate(race, reg);
  };

  if (loading || !race) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col gap-6">
        <Link to={`/dashboard/race/${id}`} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors group w-fit">
           <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
           <span className="text-[10px] font-black uppercase tracking-widest">Voltar para Prova</span>
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
               <h1 className="text-4xl font-display font-black text-white italic uppercase tracking-tighter mb-2">Gerenciar Atletas</h1>
               <div className="flex items-center gap-3">
                  <div className="px-2 py-1 bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 rounded text-[9px] font-black uppercase tracking-widest">{race.name}</div>
                  <p className="text-slate-500 font-medium text-sm">{registrations.length} inscritos no total.</p>
               </div>
            </div>
            <div className="flex bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50 items-center gap-6">
               <div className="text-center">
                  <div className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Confirmados</div>
                  <div className="text-xl font-display font-black text-green-400 italic">{registrations.filter(r => r.paymentStatus === 'confirmed').length}</div>
               </div>
               <div className="w-px h-8 bg-slate-800"></div>
               <div className="text-center">
                  <div className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Pendentes</div>
                  <div className="text-xl font-display font-black text-yellow-500 italic">{registrations.filter(r => r.paymentStatus === 'pending').length}</div>
               </div>
            </div>
        </div>
      </div>

      <ParticipantsTable 
        registrations={registrations} 
        isAdmin={true} 
        onTogglePayment={togglePaymentStatus}
        onGenerateCertificate={handleGenerateCertificate}
        title="Controle de Inscrições"
      />
    </div>
  );
};

export default RaceParticipants;
