import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { 
  User, 
  Settings, 
  Mail, 
  MapPin, 
  Briefcase, 
  ShieldCheck, 
  Activity, 
  Zap, 
  Trophy, 
  Loader2, 
  Camera,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const ProfileSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    bio: '',
    location: '',
    phone: '',
    whatsapp: '',
    instagram: '',
    organizerName: '',
    companyName: ''
  });

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
       const docSnap = await getDoc(doc(db, 'profiles', user.uid));
       if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
             displayName: user.displayName || '',
             email: user.email || '',
             bio: data.bio || '',
             location: data.location || '',
             phone: data.phone || '',
             whatsapp: data.whatsapp || '',
             instagram: data.instagram || '',
             organizerName: data.organizerName || '',
             companyName: data.companyName || ''
          });
       }
       setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSuccess(false);
    setError(null);
    try {
       await updateDoc(doc(db, 'profiles', user.uid), {
          ...formData,
          updatedAt: new Date()
       });
       setSuccess(true);
       setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
       console.error(err);
       setError('Erro ao salvar perfil. Tente novamente.');
    } finally {
       setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex h-[400px] items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#3B82F6]" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 md:px-0">
        <div>
           <div className="flex items-center gap-3 text-[#3B82F6] mb-4">
              <Settings className="w-5 h-5 shadow-[0_0_10px_rgba(59,130,246,0.3)] animate-spin-slow" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] italic">CONFIGURAÇÕES DE PERFIL</span>
           </div>
           <h1 className="flex flex-col leading-none">
              <span className="text-4xl sm:text-6xl font-display font-black italic uppercase tracking-tighter text-slate-800">Meus</span>
              <span className="text-5xl sm:text-7xl font-display font-black italic uppercase tracking-tighter text-white -mt-2">Dados</span>
           </h1>
        </div>
        
        <div className="flex items-center gap-3 bg-[#11161D] px-6 py-4 rounded-3xl border border-white/5">
           <Zap className="w-5 h-5 text-[#3B82F6] animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Gestor de Performance</span>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-10 px-4 md:px-0 pb-20">
         {/* Profile Picture & Identity */}
         <div className="bg-[#11161D] rounded-[4rem] p-12 border border-white/5 relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#3B82F6]/5 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
               <div className="relative group/avatar">
                  <div className="w-40 h-40 rounded-full bg-[#05070A] border-4 border-[#11161D] flex items-center justify-center overflow-hidden shadow-2xl group-hover/avatar:border-[#3B82F6] transition-all duration-500">
                     {user?.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover opacity-80 group-hover/avatar:opacity-100 transition-opacity" />
                     ) : (
                        <div className="text-5xl font-display font-black text-slate-800 italic group-hover/avatar:text-[#3B82F6] transition-colors uppercase">
                           {user?.email?.charAt(0)}
                        </div>
                     )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-[#3B82F6] rounded-full flex items-center justify-center shadow-lg transform group-hover/avatar:scale-110 transition-transform cursor-pointer border-4 border-[#11161D]">
                     <Camera className="w-5 h-5 text-white" />
                  </div>
               </div>

               <div className="flex-1 text-center md:text-left space-y-4">
                  <h3 className="text-3xl font-display font-black italic uppercase tracking-tighter text-white">{formData.displayName || 'Atleta RunPro'}</h3>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-black/40 px-4 py-1.5 rounded-full border border-white/5 italic">Nível Elite</span>
                     <span className="text-[10px] font-black text-[#3B82F6] uppercase tracking-widest bg-[#3B82F6]/10 px-4 py-1.5 rounded-full border border-[#3B82F6]/20 italic">Organizador</span>
                  </div>
                  <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest italic">{user?.email}</p>
               </div>
            </div>
         </div>

         {/* Form Sections */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#11161D] rounded-[3.5rem] p-10 sm:p-12 border border-white/5 space-y-10 shadow-2xl">
               <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-[#3B82F6]" />
                  <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Identidade Profissional</h2>
               </div>

               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Nome Completo</label>
                     <input 
                        value={formData.displayName}
                        onChange={e => setFormData({...formData, displayName: e.target.value})}
                        className="w-full bg-black/40 border-2 border-white/5 rounded-2xl px-6 py-4 focus:outline-none focus:border-[#3B82F6] transition-all text-white font-black italic uppercase text-sm tracking-widest"
                        placeholder="Nome como aparecerá para os atletas"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Biografia / Manifesto</label>
                     <textarea 
                        rows={4}
                        value={formData.bio}
                        onChange={e => setFormData({...formData, bio: e.target.value})}
                        className="w-full bg-black/40 border-2 border-white/5 rounded-2xl px-6 py-4 focus:outline-none focus:border-[#3B82F6] transition-all text-white font-bold italic text-sm resize-none"
                        placeholder="Conte sobre sua experiência no esporte..."
                     />
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Localização (Cidade/Estado)</label>
                         <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
                            <input 
                               value={formData.location}
                               onChange={e => setFormData({...formData, location: e.target.value})}
                               className="w-full bg-black/40 border-2 border-white/5 rounded-2xl pl-12 pr-6 py-4 focus:outline-none focus:border-[#3B82F6] transition-all text-white font-black italic uppercase text-sm tracking-widest"
                               placeholder="Recife, PE"
                            />
                         </div>
                      </div>
                  </div>
               </div>
            </div>

            <div className="bg-[#11161D] rounded-[3.5rem] p-10 sm:p-12 border border-white/5 space-y-10 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-[#3B82F6]/5 rounded-full blur-[100px] pointer-events-none" />
               <div className="flex items-center gap-3 relative z-10">
                  <Briefcase className="w-5 h-5 text-[#3B82F6]" />
                  <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Dados Organizacionais</h2>
               </div>

               <div className="space-y-6 relative z-10">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Nome do Organizador/Assessoria</label>
                     <input 
                        value={formData.organizerName}
                        onChange={e => setFormData({...formData, organizerName: e.target.value})}
                        className="w-full bg-black/40 border-2 border-white/5 rounded-2xl px-6 py-4 focus:outline-none focus:border-[#3B82F6] transition-all text-white font-black italic uppercase text-sm tracking-widest"
                        placeholder="Nome Social ou da Equipe"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">Instagram (ex: @meuperfil)</label>
                     <input 
                        value={formData.instagram}
                        onChange={e => setFormData({...formData, instagram: e.target.value})}
                        className="w-full bg-black/40 border-2 border-white/5 rounded-2xl px-6 py-4 focus:outline-none focus:border-[#3B82F6] transition-all text-white font-black italic uppercase text-sm tracking-widest"
                        placeholder="@seuperfil"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-2">WhatsApp de Suporte</label>
                     <input 
                        value={formData.whatsapp}
                        onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                        className="w-full bg-black/40 border-2 border-white/5 rounded-2xl px-6 py-4 focus:outline-none focus:border-[#3B82F6] transition-all text-white font-black italic uppercase text-sm tracking-widest"
                        placeholder="81 99999-9999"
                     />
                  </div>
               </div>
               
               <div className="pt-6 relative z-10">
                  <div className="p-6 bg-black/40 border border-[#3B82F6]/20 rounded-[2rem] flex items-start gap-4">
                     <ShieldCheck className="w-6 h-6 text-[#3B82F6] shrink-0 mt-0.5" />
                     <p className="text-[9px] font-black uppercase text-slate-500 italic tracking-widest leading-relaxed">
                        Seus dados são criptografados e exibidos apenas nas suas <span className="text-white">Páginas de Inscrição Oficiais</span> via AI Studio.
                     </p>
                  </div>
               </div>
            </div>
         </div>

         {/* Actions */}
         <div className="flex flex-col sm:flex-row items-center justify-between gap-8 pt-10 border-t border-white/5">
            <div className="flex items-center gap-4">
               <AnimatePresence>
                  {success && (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 px-6 py-3 rounded-2xl border border-emerald-500/20"
                    >
                       <CheckCircle2 className="w-5 h-5 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                       <span className="text-[10px] font-black uppercase tracking-widest italic">Perfil Salvo com Sucesso!</span>
                    </motion.div>
                  )}
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-center gap-2 text-red-500 bg-red-500/10 px-6 py-3 rounded-2xl border border-red-500/20"
                    >
                       <AlertCircle className="w-5 h-5" />
                       <span className="text-[10px] font-black uppercase tracking-widest italic">{error}</span>
                    </motion.div>
                  )}
               </AnimatePresence>
            </div>

            <button 
               type="submit"
               disabled={saving}
               className="w-full sm:w-auto bg-[#3B82F6] text-white px-16 py-6 rounded-3xl font-black italic uppercase text-xs tracking-widest shadow-[0_20px_40px_rgba(59,130,246,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50 font-bold"
            >
               {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
               Finalizar Alterações
            </button>
         </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
