import React, { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { 
  User, 
  Mail, 
  Phone, 
  Instagram, 
  Info, 
  CheckCircle2, 
  Loader2,
  Zap,
  Camera,
  ArrowRight,
  Settings
} from 'lucide-react';
import { motion } from 'motion/react';
import { IMaskInput } from 'react-imask';
import { cn } from '../lib/utils';

const ProfileSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    organizerName: '',
    bio: '',
    businessPhone: '',
    businessEmail: '',
    whatsapp: '',
    instagram: '',
    profileImageUrl: '',
    // Pix Fields
    pixName: '',
    pixDocument: '',
    pixKey: '',
    pixKeyType: 'cpf',
    pixProofWhatsapp: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const profileRef = doc(db, 'profiles', user.uid);
        const profileSnap = await getDoc(profileRef);
        
        if (profileSnap.exists()) {
          const data = profileSnap.data();
          setFormData({
            organizerName: data.organizerName || user.displayName || '',
            bio: data.bio || '',
            businessPhone: data.businessPhone || user.phoneNumber || '',
            businessEmail: data.businessEmail || user.email || '',
            whatsapp: data.whatsapp || '',
            instagram: data.instagram || '',
            profileImageUrl: data.profileImageUrl || user.photoURL || '',
            pixName: data.pixName || '',
            pixDocument: data.pixDocument || '',
            pixKey: data.pixKey || '',
            pixKeyType: data.pixKeyType || 'cpf',
            pixProofWhatsapp: data.pixProofWhatsapp || ''
          });
        } else {
          // Default data from user object
          setFormData(prev => ({
            ...prev,
            organizerName: user.displayName || '',
            businessEmail: user.email || '',
            businessPhone: user.phoneNumber || '',
            profileImageUrl: user.photoURL || ''
          }));
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Standard check for initial feedback
    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem original é muito grande. Tente uma imagem de até 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.src = reader.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Resize logic (Max 500px for profile pics to keep base64 size reasonable)
        const MAX_SIZE = 500;
        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Compress and convert to base64
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.6);
        setFormData(prev => ({ ...prev, profileImageUrl: compressedDataUrl }));
        setError(null);
      };
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Update Firebase Auth display name and photoURL for synchronization
      await updateProfile(user, {
        displayName: formData.organizerName,
        photoURL: formData.profileImageUrl
      });

      await setDoc(doc(db, 'profiles', user.uid), {
        ...formData,
        userId: user.uid,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError('Falha ao salvar perfil. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-yellow-400" /></div>;

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10">
        <h1 className="text-4xl font-display font-black text-white italic uppercase tracking-tighter flex items-center gap-4">
          <Settings className="w-10 h-10 text-yellow-400" />
          Perfil do Organizador
        </h1>
        <p className="text-slate-500 mt-2 font-medium">Personalize como os atletas veem sua marca.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-slate-900/50 border border-slate-800 rounded-[3rem] p-8 lg:p-12 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 rounded-full blur-[100px] pointer-events-none"></div>
           
           <div className="flex flex-col md:flex-row gap-12 items-start relative z-10">
              {/* Profile Image Section */}
              <div className="shrink-0 w-full md:w-auto flex flex-col items-center gap-6">
                 <div className="relative group">
                    <label className="relative cursor-pointer block group">
                       <div className="w-40 h-40 rounded-full bg-slate-950 border-4 border-slate-800 flex items-center justify-center overflow-hidden shadow-2xl group-hover:border-yellow-400 transition-all duration-500">
                          {formData.profileImageUrl ? (
                             <img src={formData.profileImageUrl} alt="Profile" className="w-full h-full object-cover animate-in fade-in zoom-in duration-500" />
                          ) : (
                             <div className="text-5xl font-display font-black text-slate-800 italic group-hover:text-yellow-400 transition-colors uppercase">
                                {formData.organizerName?.[0] || user?.displayName?.[0] || user?.email?.[0]}
                             </div>
                          )}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                             <Camera className="w-8 h-8 text-white animate-in slide-in-from-bottom-2" />
                             <span className="text-[8px] font-black uppercase text-white tracking-widest">Alterar</span>
                          </div>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleFileChange}
                          />
                       </div>
                    </label>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                       <Zap className="w-5 h-5 text-slate-950 fill-current" />
                    </div>
                 </div>
                 
                 <div className="flex flex-col items-center gap-3">
                    <button 
                      type="button"
                      onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
                      className="text-[10px] font-black text-yellow-400 uppercase tracking-widest hover:text-yellow-300 transition-colors"
                    >
                       Trocar Imagem
                    </button>
                    <div className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest border border-green-500/20">
                       Organizador Verificado
                    </div>
                 </div>
              </div>

              {/* Fields Section */}
              <div className="flex-1 w-full space-y-8">
                 <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 italic flex items-center gap-2">
                        <User className="w-4 h-4" /> Nome Fantasia / Organizador
                      </label>
                      <input 
                        type="text"
                        placeholder="Ex: Premium Sports Brazil"
                        value={formData.organizerName}
                        onChange={e => setFormData({ ...formData, organizerName: e.target.value })}
                        className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-6 py-4 focus:outline-none focus:border-yellow-400 transition-all text-white font-bold italic"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 italic flex items-center gap-2">
                        <Info className="w-4 h-4" /> Sobre / Bio
                      </label>
                      <textarea 
                        rows={3}
                        placeholder="Conte um pouco sobre sua experiência organizando eventos..."
                        value={formData.bio}
                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                        className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-6 py-4 focus:outline-none focus:border-yellow-400 transition-all text-white font-medium resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 italic flex items-center gap-2">
                          <Phone className="w-4 h-4" /> Telefone Comercial
                        </label>
                        <IMaskInput
                          mask="(00) 00000-0000"
                          unmask={true}
                          value={formData.businessPhone}
                          onAccept={(value) => setFormData({ ...formData, businessPhone: value })}
                          placeholder="(00) 90000-0000"
                          className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-6 py-4 focus:outline-none focus:border-yellow-400 transition-all text-white font-bold italic"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 italic flex items-center gap-2">
                          <Mail className="w-4 h-4" /> E-mail de Contato
                        </label>
                        <input 
                          type="email"
                          placeholder="contato@empresa.com"
                          value={formData.businessEmail}
                          onChange={e => setFormData({ ...formData, businessEmail: e.target.value })}
                          className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-6 py-4 focus:outline-none focus:border-yellow-400 transition-all text-white font-bold italic"
                        />
                      </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 italic flex items-center gap-2">
                        <Phone className="w-4 h-4" /> WhatsApp de Contato
                      </label>
                      <IMaskInput
                        mask="(00) 00000-0000"
                        unmask={true}
                        value={formData.whatsapp}
                        onAccept={(value) => setFormData({ ...formData, whatsapp: value })}
                        placeholder="(00) 00000-0000"
                        className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-6 py-4 focus:outline-none focus:border-yellow-400 transition-all text-white font-bold italic"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 italic flex items-center gap-2">
                        <Instagram className="w-4 h-4" /> Instagram (Username)
                      </label>
                      <div className="relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 font-bold">@</span>
                        <input 
                          type="text"
                          placeholder="seu.perfil"
                          value={formData.instagram}
                          onChange={e => setFormData({ ...formData, instagram: e.target.value })}
                          className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl pl-10 pr-6 py-4 focus:outline-none focus:border-yellow-400 transition-all text-white font-bold italic"
                        />
                      </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Pix Payment Settings Section */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-[3rem] p-8 lg:p-12 shadow-2xl relative overflow-hidden mt-8">
           <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 rounded-full blur-[100px] pointer-events-none"></div>
           
           <div className="relative z-10">
              <div className="mb-10">
                 <h2 className="text-2xl font-display font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
                   <Zap className="w-8 h-8 text-yellow-400" />
                   Dados de Recebimento (Pix)
                 </h2>
                 <p className="text-slate-500 text-sm mt-1">Configure como você receberá os pagamentos das inscrições.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-8">
                   <div>
                     <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 italic">Nome do Recebedor / Titular</label>
                     <input 
                       type="text"
                       placeholder="Nome completo ou Razão Social"
                       value={formData.pixName}
                       onChange={e => setFormData({ ...formData, pixName: e.target.value })}
                       className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-6 py-4 focus:outline-none focus:border-yellow-400 transition-all text-white font-bold italic"
                     />
                   </div>

                   <div>
                     <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 italic">CPF ou CNPJ</label>
                     <IMaskInput
                       mask={[
                         { mask: '000.000.000-00' },
                         { mask: '00.000.000/0000-00' }
                       ]}
                       unmask={true}
                       value={formData.pixDocument}
                       onAccept={(value) => setFormData({ ...formData, pixDocument: value })}
                       placeholder="000.000.000-00"
                       className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-6 py-4 focus:outline-none focus:border-yellow-400 transition-all text-white font-bold italic"
                     />
                   </div>
                 </div>

                 <div className="space-y-8">
                   <div>
                     <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 italic">Tipo de Chave Pix</label>
                     <select 
                       value={formData.pixKeyType}
                       onChange={e => setFormData({ ...formData, pixKeyType: e.target.value })}
                       className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-6 py-4 focus:outline-none focus:border-yellow-400 transition-all text-white font-bold italic appearance-none"
                     >
                       <option value="cpf">CPF</option>
                       <option value="cnpj">CNPJ</option>
                       <option value="email">E-mail</option>
                       <option value="phone">Telefone</option>
                       <option value="random">Chave Aleatória</option>
                     </select>
                   </div>

                   <div>
                     <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 italic">Valor da Chave Pix</label>
                     <input 
                       type="text"
                       placeholder="Insira sua chave Pix aqui"
                       value={formData.pixKey}
                       onChange={e => setFormData({ ...formData, pixKey: e.target.value })}
                       className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-6 py-4 focus:outline-none focus:border-yellow-400 transition-all text-white font-bold italic"
                     />
                   </div>
                 </div>
              </div>

              <div className="mt-8">
                 <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 italic">WhatsApp para Receber Comprovantes</label>
                 <IMaskInput
                   mask="(00) 00000-0000"
                   unmask={true}
                   value={formData.pixProofWhatsapp}
                   onAccept={(value) => setFormData({ ...formData, pixProofWhatsapp: value })}
                   placeholder="(00) 90000-0000"
                   className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-6 py-4 focus:outline-none focus:border-yellow-400 transition-all text-white font-bold italic"
                 />
                 <p className="text-[9px] text-slate-600 mt-2 italic">* Atletas serão redirecionados para este número após a inscrição.</p>
              </div>
           </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-900/30 p-8 rounded-[3rem] border border-slate-800">
           <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500",
                success ? "bg-green-500/20 text-green-500" : "bg-yellow-400/10 text-yellow-400"
              )}>
                {success ? <CheckCircle2 className="w-6 h-6 animate-in zoom-in" /> : <Info className="w-6 h-6" />}
              </div>
              <p className="text-xs font-bold text-slate-500 max-w-sm uppercase tracking-widest leading-relaxed">
                {error ? <span className="text-yellow-400">{error}</span> : success ? <span className="text-green-500">Alterações salvas com sucesso no seu perfil profissional!</span> : "As informações acima serão exibidas em suas páginas de inscrição públicas."}
              </p>
           </div>
           
           <button 
             type="submit"
             disabled={saving}
             className="w-full md:w-auto bg-yellow-400 text-slate-950 px-12 py-5 rounded-[2rem] font-black text-xl hover:bg-yellow-300 transition-all hover:scale-105 shadow-[0_20px_40px_rgba(250,204,21,0.2)] disabled:opacity-50 uppercase italic tracking-tighter flex items-center justify-center gap-3"
           >
             {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : (
               <>
                 SALVAR PERFIL
                 <ArrowRight className="w-6 h-6" />
               </>
             )}
           </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
