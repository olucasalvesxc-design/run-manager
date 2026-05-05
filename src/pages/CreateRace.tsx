import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { RaceType, ParticipationType } from '../types';
import { 
  Trophy, 
  Calendar, 
  MapPin, 
  Clock, 
  Info, 
  CircleDollarSign, 
  Users,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Image as ImageIcon,
  Upload
} from 'lucide-react';
import { motion } from 'motion/react';

const CreateRace = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    time: '',
    location: '',
    description: '',
    distance: '',
    type: 'street' as RaceType,
    participationType: 'paid' as ParticipationType,
    price: 0,
    pixKey: profile?.pixKey || '',
    donationDescription: '',
    capacity: 100,
    logoUrl: ''
  });

  useEffect(() => {
    if (profile?.pixKey && !formData.pixKey) {
      setFormData(prev => ({ ...prev, pixKey: profile.pixKey }));
    }
  }, [profile]);

  const [uploadLoading, setUploadLoading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Aumentado para 5MB para permitir o upload, mas vamos comprimir depois
    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem é muito pesada. O limite máximo é 5MB.');
      return;
    }

    setUploadLoading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.src = reader.result as string;
      img.onload = () => {
        // Lógica de Compressão via Canvas
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Redimensionar se for muito grande (max 1200px)
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Exportar como JPEG comprimido (qualidade 0.7)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        
        // Verifica se ainda assim ficou muito grande (Base64 aumenta ~33% o tamanho original)
        // Estimativa: 800KB em base64 é seguro para o limite de 1MB do Firestore
        if (compressedBase64.length > 800000) {
          setError('A imagem ainda está muito grande após compressão. Tente uma imagem menos complexa ou menor.');
          setUploadLoading(false);
          return;
        }

        setFormData(prev => ({ ...prev, logoUrl: compressedBase64 }));
        setUploadLoading(false);
      };
      img.onerror = () => {
        setError('Erro ao processar imagem.');
        setUploadLoading(false);
      };
    };
    reader.onerror = () => {
      setError('Erro ao ler o arquivo.');
      setUploadLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      if (!auth.currentUser) {
        throw new Error('Usuário não autenticado. Por favor, faça login novamente.');
      }

      console.log("Iniciando criação da corrida...", formData);

      const docRef = await addDoc(collection(db, 'races'), {
        ...formData,
        organizerId: auth.currentUser.uid,
        status: 'active',
        createdAt: serverTimestamp()
      });

      console.log("Corrida criada com sucesso:", docRef.id);
      navigate(`/dashboard/race/${docRef.id}`);
    } catch (err: any) {
      console.error("Erro detalhado ao criar corrida:", err);
      if (err.code === 'permission-denied') {
        setError('Erro de permissão: Você não tem autorização para criar corridas neste projeto.');
      } else {
        const errorMsg = err?.message || String(err);
        setError(`Não foi possível criar a corrida: ${errorMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {error && (
        <div className="mb-6 p-4 bg-yellow-400/10 border border-yellow-400/50 rounded-2xl text-yellow-400 text-sm font-bold flex items-center gap-3">
          <Info className="w-5 h-5" />
          {error}
        </div>
      )}
      <div className="mb-8 px-4 sm:px-0">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-4 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest italic">Voltar</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-white flex items-center gap-3 italic leading-tight">
          <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 shrink-0" />
          Criar Nova Corrida
        </h1>
        <p className="text-sm text-slate-400 mt-1">Preencha os detalhes para lançar seu evento.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 px-4 sm:px-0">
        {/* Info Básica */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] sm:rounded-3xl p-6 sm:p-8 space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-500 mb-3 uppercase tracking-wider flex items-center gap-2 italic">
              <Info className="w-4 h-4 text-slate-600" /> Nome da Corrida
            </label>
            <input 
              required
              type="text"
              placeholder="Ex: Treino de Sábado - Ibirapuera"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all font-medium text-white shadow-inner"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Data do Evento
              </label>
              <input 
                required
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4" /> Horário
              </label>
              <input 
                required
                type="time"
                value={formData.time}
                onChange={e => setFormData({ ...formData, time: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Localização
            </label>
            <input 
              required
              type="text"
              placeholder="Ex: Parque do Ibirapuera - Portão 7"
              value={formData.location}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-2">
              <Trophy className="w-4 h-4" /> Distância
            </label>
            <input 
              required
              type="text"
              placeholder="Ex: 5km, 10km, Meia Maratona"
              value={formData.distance}
              onChange={e => setFormData({ ...formData, distance: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-2">
              Descrição do Evento
            </label>
            <textarea 
              rows={4}
              placeholder="Detalhes sobre o percurso, ponto de encontro e recomendações..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all text-white resize-none"
            />
          </div>
        </div>

        {/* Logo do Evento */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 space-y-6">
          <label className="block text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-2">
            <ImageIcon className="w-4 h-4" /> Logo do Evento
          </label>
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="w-40 h-40 bg-slate-950 border-2 border-dashed border-slate-800 rounded-3xl flex items-center justify-center overflow-hidden shrink-0 relative group"
            >
              {formData.logoUrl ? (
                <>
                  <img 
                    src={formData.logoUrl} 
                    alt="Logo Preview" 
                    className="w-full h-full object-contain p-4"
                  />
                  <button 
                    type="button"
                    onClick={() => setFormData({ ...formData, logoUrl: '' })}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold text-white uppercase"
                  >
                    Remover
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 opacity-30 group-hover:opacity-100 transition-opacity">
                  <ImageIcon className="w-12 h-12 text-slate-500" />
                  <span className="text-[10px] font-black uppercase tracking-tighter">Preview</span>
                </div>
              )}
              {uploadLoading && (
                <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
                </div>
              )}
            </motion.div>

            <div className="flex-1 w-full space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <label className="flex-1 cursor-pointer">
                  <div className="bg-white/5 border border-white/10 hover:bg-white/10 transition-all rounded-2xl px-6 py-5 flex items-center gap-4 group">
                    <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6 text-slate-950" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-bold text-white">Subir Imagem</div>
                      <div className="text-[10px] text-slate-500 uppercase font-black">PNG, JPG ou SVG (Max 5MB - Compressão Automática)</div>
                    </div>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileUpload}
                  />
                </label>

                <div className="hidden sm:flex items-center text-slate-700 font-black uppercase italic text-xs px-2">OU</div>

                <div className="flex-[1.5]">
                  <input 
                    type="text"
                    placeholder="Cole a URL da imagem aqui..."
                    value={formData.logoUrl.startsWith('data:') ? '' : formData.logoUrl}
                    onChange={e => setFormData({ ...formData, logoUrl: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-[1.375rem] focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all text-white placeholder:text-slate-700 text-sm"
                  />
                </div>
              </div>

              <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight leading-relaxed flex items-start gap-2">
                  <Info className="w-3 h-3 mt-0.5 text-yellow-400" />
                  A logo é essencial para dar identidade à sua corrida. Ela aparecerá no topo do formulário de inscrição, no dashboard do atleta e no certificado de conclusão.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Configurações */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
              <label className="block text-sm font-bold text-slate-400 mb-6 uppercase tracking-wider flex items-center gap-2">
                Tipo de Corrida
              </label>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { value: 'street', label: 'Rua', desc: 'Ao ar livre em parques ou ruas' },
                  { value: 'treadmill', label: 'Esteira', desc: 'Em academias ou estúdios' },
                  { value: 'online', label: 'Online / Remoto', desc: 'Monitorado via app' }
                ].map(type => (
                  <label key={type.value} className={`
                    flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all
                    ${formData.type === type.value ? 'bg-yellow-400/10 border-yellow-400' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}
                  `}>
                    <input 
                      type="radio" 
                      name="raceType" 
                      className="sr-only"
                      checked={formData.type === type.value}
                      onChange={() => setFormData({ ...formData, type: type.value as RaceType })}
                    />
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.type === type.value ? 'border-yellow-400 bg-yellow-400' : 'border-slate-700'}`}>
                       {formData.type === type.value && <div className="w-2 h-2 rounded-full bg-slate-950" />}
                    </div>
                    <div>
                      <div className="font-bold text-white">{type.label}</div>
                      <div className="text-xs text-slate-500">{type.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
           </div>

           <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
              <label className="block text-sm font-bold text-slate-400 mb-6 uppercase tracking-wider flex items-center gap-2">
                Inscrição & Participação
              </label>
              <div className="grid grid-cols-3 gap-4 mb-8">
                <button 
                  type="button"
                  onClick={() => setFormData({ ...formData, participationType: 'paid' })}
                  className={`py-4 rounded-2xl font-bold flex flex-col items-center gap-2 border-2 transition-all ${formData.participationType === 'paid' ? 'bg-yellow-400 border-yellow-400 text-slate-950' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
                >
                  <CircleDollarSign className="w-6 h-6" />
                  Paga
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData({ ...formData, participationType: 'beneficent' })}
                  className={`py-4 rounded-2xl font-bold flex flex-col items-center gap-2 border-2 transition-all ${formData.participationType === 'beneficent' ? 'bg-yellow-400 border-yellow-400 text-slate-950' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
                >
                  <Trophy className="w-6 h-6" />
                  Beneficente
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData({ ...formData, participationType: 'free' })}
                  className={`py-4 rounded-2xl font-bold flex flex-col items-center gap-2 border-2 transition-all ${formData.participationType === 'free' ? 'bg-yellow-400 border-yellow-400 text-slate-950' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
                >
                  <Users className="w-6 h-6" />
                  Grátis
                </button>
              </div>

              {formData.participationType === 'paid' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Valor da Inscrição (R$)</label>
                    <div className="relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">R$</span>
                      <input 
                        required
                        type="number"
                        min="0"
                        value={formData.price}
                        onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all text-white font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Chave PIX para Recebimento</label>
                    <input 
                      required
                      type="text"
                      placeholder="CPF, E-mail, Celular ou Chave Aleatória"
                      value={formData.pixKey}
                      onChange={e => setFormData({ ...formData, pixKey: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all text-white"
                    />
                  </div>
                </div>
              )}

              {formData.participationType === 'beneficent' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="bg-yellow-400/10 border border-yellow-400/20 p-4 rounded-2xl text-yellow-400 text-xs font-medium flex gap-3">
                    <Info className="w-5 h-5 flex-shrink-0" />
                    Incentive a doação de alimentos ou itens específicos no dia da corrida.
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Itens de doação necessários</label>
                    <textarea 
                      required
                      placeholder="Ex: 2kg de Arroz ou 1kg de Feijão"
                      value={formData.donationDescription}
                      onChange={e => setFormData({ ...formData, donationDescription: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all text-white resize-none"
                    />
                  </div>
                </div>
              )}

              {formData.participationType === 'free' && (
                <div className="bg-green-400/10 border border-green-400/20 p-4 rounded-2xl text-green-400 text-xs font-medium flex gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  Evento totalmente gratuito para os atletas. Ótimo para treinos coletivos.
                </div>
              )}

              <div className="mt-8 space-y-4">
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase flex items-center justify-between">
                  Limite de Vagas <span>{formData.capacity} atletas</span>
                </label>
                <input 
                  type="range"
                  min="5"
                  max="1000"
                  step="5"
                  value={formData.capacity}
                  onChange={e => setFormData({ ...formData, capacity: Number(e.target.value) })}
                  className="w-full accent-yellow-400 h-2 bg-slate-950 rounded-full appearance-none cursor-pointer"
                />
                
                <div className="bg-black/40 border border-white/5 rounded-2xl p-6 mt-4">
                   <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Taxa de Criação do Evento</span>
                      <span className="text-xl font-display font-black text-yellow-400 italic">
                        {formData.capacity <= 100 ? 'R$ 99,00' : formData.capacity <= 500 ? 'R$ 299,00' : 'R$ 599,00'}
                      </span>
                   </div>
                   <p className="text-[9px] text-slate-600 font-bold uppercase tracking-tight leading-relaxed italic">
                     * A taxa é cobrada uma única vez no lançamento do evento, proporcional ao número de vagas disponibilizadas.
                   </p>
                </div>
              </div>
           </div>
        </div>

        <div className="flex justify-end gap-4 mt-12">
          <button 
            type="button" 
            onClick={() => navigate('/dashboard')}
            className="px-8 py-4 rounded-2xl font-bold text-slate-500 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            disabled={loading}
            className="bg-yellow-400 text-slate-950 px-12 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-yellow-300 transition-all hover:scale-105 shadow-[0_10px_30px_rgba(250,204,21,0.2)] disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
              <>
                Lançar Corrida
                <CheckCircle2 className="w-6 h-6" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRace;
