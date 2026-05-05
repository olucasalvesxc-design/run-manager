import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  Trophy, 
  Target, 
  ChevronRight, 
  Dumbbell, 
  TrendingUp, 
  Clock, 
  Activity,
  MapPin, 
  Calendar,
  Users,
  ShieldCheck,
  Zap,
  ArrowRight,
  Play,
  CheckCircle2,
  Menu,
  X
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

const LandingPage = () => {
  const { user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  const navLinks = [
    { label: 'Plataforma', href: '#platform' },
    { label: 'Assessorias', href: '#trainers' },
    { label: 'Minhas Provas', href: '#races' },
    { label: 'Metodologia', href: '#method' },
  ];

  return (
    <div className="min-h-screen bg-[#05070A] text-white font-sans overflow-x-hidden">
      {/* Dynamic Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-[#05070A]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 sm:h-24 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-[#3B82F6] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)] group-hover:scale-110 transition-transform">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-display font-black italic uppercase tracking-tighter sm:text-2xl">
              RUN<span className="text-[#3B82F6]">PRO</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-12">
            {navLinks.map((link) => (
              <a 
                key={link.label} 
                href={link.href}
                className="text-[10px] font-black uppercase tracking-[0.2em] italic text-slate-500 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <Link 
                to="/dashboard"
                className="bg-[#3B82F6] text-white px-8 py-3.5 rounded-2xl font-black italic uppercase text-[10px] tracking-widest shadow-lg shadow-[#3B82F6]/20 hover:scale-105 active:scale-95 transition-all"
              >
                Dashboard
              </Link>
            ) : (
              <button 
                onClick={handleLogin}
                className="bg-[#3B82F6] text-white px-8 py-3.5 rounded-2xl font-black italic uppercase text-[10px] tracking-widest shadow-lg shadow-[#3B82F6]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group font-bold"
              >
                Começar Agora
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
            
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-3 bg-white/5 rounded-xl border border-white/10"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-[#0A0D12] border-b border-white/5 overflow-hidden"
            >
              <div className="p-8 space-y-6">
                {navLinks.map((link) => (
                  <a 
                    key={link.label} 
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-xl font-display font-black italic uppercase tracking-wider text-slate-400"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 sm:pt-48 pb-20 sm:pb-32 px-6 overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-full h-full pointer-events-none">
           <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] bg-[#3B82F6]/10 blur-[150px] rounded-full animate-pulse" />
           <div className="absolute bottom-[20%] left-[-5%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 sm:mb-24">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 bg-[#3B82F6]/10 border border-[#3B82F6]/20 px-6 py-2 rounded-full mb-10"
            >
               <Zap className="w-4 h-4 text-[#3B82F6]" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em] italic text-[#3B82F6]">Evolution is a choice.</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-6xl sm:text-8xl md:text-[8rem] lg:text-[12rem] font-display font-black italic italic leading-[0.8] tracking-tighter uppercase mb-12 sm:mb-16"
            >
              RUNNING <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] via-blue-400 to-[#3B82F6] drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]">INTELLIGENCE.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="max-w-xl mx-auto text-slate-400 text-sm sm:text-base md:text-xl font-bold uppercase tracking-[0.2em] italic leading-relaxed mb-16 sm:mb-20 px-4"
            >
              A plataforma definitiva para <span className="text-white">corredores de elite</span> e <span className="text-white">treinadores profissionais</span> que buscam a alta performance.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
            >
               <button 
                 onClick={handleLogin}
                 className="w-full sm:w-auto bg-[#3B82F6] text-white px-12 py-6 rounded-[2rem] font-black italic uppercase text-xs sm:text-sm tracking-widest shadow-[0_20px_40px_-10px_rgba(59,130,246,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 hover:bg-blue-600 font-bold"
               >
                  Começar Jornada
                  <ArrowRight className="w-5 h-5" />
               </button>
               <button className="w-full sm:w-auto bg-white/5 border border-white/10 text-white px-12 py-6 rounded-[2rem] font-black italic uppercase text-xs sm:text-sm tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-4">
                  <Play className="w-5 h-5 text-[#3B82F6] fill-current" />
                  Ver Teaser
               </button>
            </motion.div>
          </div>

          {/* Trust Badges */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 border-y border-white/5 py-12 sm:py-20"
          >
            {[
              { label: 'ATLETAS ELITE', value: '1.5k+', icon: Users },
              { label: 'TREINOS GERADOS', value: '450k+', icon: Dumbbell },
              { label: 'PACES REDUZIDOS', value: '92%', icon: TrendingUp },
              { label: 'RECORDE PESSOAIS', value: '12k+', icon: Trophy },
            ].map((target, idx) => (
              <div key={idx} className="text-center group">
                <p className="text-2xl sm:text-4xl font-display font-black italic text-white mb-2 group-hover:text-[#3B82F6] transition-colors">{target.value}</p>
                <p className="text-[8px] sm:text-[10px] font-black text-slate-600 uppercase tracking-widest">{target.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section id="platform" className="py-20 sm:py-40 px-6 bg-[#080B0F]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 sm:mb-32">
             <div className="text-[11px] font-black uppercase tracking-[0.4em] text-[#3B82F6] mb-6">Workflow Profissional</div>
             <h2 className="text-5xl sm:text-8xl font-display font-black italic uppercase tracking-tighter leading-none">
                Trabalho Duro <br /> <span className="text-[#3B82F6]">Gestão Leve</span>.
             </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 md:grid-rows-2 gap-4 sm:gap-8 h-auto md:h-[900px]">
             {/* Large Card */}
             <div className="md:col-span-8 md:row-span-1 bg-[#11161D] rounded-[3rem] sm:rounded-[4rem] border border-white/5 p-8 sm:p-16 relative overflow-hidden group">
                <div className="absolute -right-20 -bottom-20 opacity-5 group-hover:-translate-x-10 transition-transform duration-1000">
                   <Target className="w-80 h-80" />
                </div>
                <div className="relative z-10 max-w-lg">
                   <ShieldCheck className="w-12 h-12 text-[#3B82F6] mb-8" />
                   <h3 className="text-3xl sm:text-5xl font-display font-black italic uppercase tracking-tighter mb-6">Planilhas Dinâmicas & I.A.</h3>
                   <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] sm:text-xs leading-relaxed italic">
                      Algoritmos proprietários que analisam seu histórico de Pace, FC e Variação pra ajustar o treino automaticamente com base no feedback da sua assessoria.
                   </p>
                </div>
             </div>

             {/* Vertical Card */}
             <div className="md:col-span-4 md:row-span-2 bg-[#11161D] rounded-[3rem] sm:rounded-[4rem] border border-white/5 p-8 sm:p-12 flex flex-col justify-between group overflow-hidden">
                <div>
                   <div className="w-16 h-16 bg-[#3B82F6]/10 rounded-[2rem] flex items-center justify-center mb-10 border border-[#3B82F6]/20">
                      <Trophy className="w-8 h-8 text-[#3B82F6] mb-2" />
                   </div>
                   <h3 className="text-3xl sm:text-4xl font-display font-black italic uppercase tracking-tighter mb-6">Calendário de <br /> Majors.</h3>
                   <p className="text-slate-500 font-black uppercase tracking-widest text-[10px] sm:text-xs leading-relaxed italic">
                      Sincronize suas provas com seu calendário de treinos. Foco total nos ciclos de polimento e macrociclos de base.
                   </p>
                </div>
                <div className="mt-12 space-y-4">
                  {[
                    { name: 'Chicago Marathon', date: 'OUT 12', status: 'Focus' },
                    { name: 'Berlin Marathon', date: 'SET 28', status: 'B-Race' },
                    { name: 'NYC Marathon', date: 'NOV 02', status: 'Support' },
                  ].map((race, i) => (
                    <div key={i} className="flex items-center justify-between bg-black/40 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/5 group-hover:border-[#3B82F6]/20 transition-all">
                       <span className="text-[10px] sm:text-[11px] font-black italic uppercase tracking-wider">{race.name}</span>
                       <span className="text-[8px] font-black uppercase tracking-widest text-[#3B82F6]">{race.date}</span>
                    </div>
                  ))}
                </div>
             </div>

             {/* Small Squares */}
             <div className="md:col-span-4 bg-[#3B82F6] rounded-[3rem] sm:rounded-[4rem] p-8 sm:p-12 text-black flex flex-col justify-center gap-6 shadow-[0_30px_60px_rgba(5,7,10,0.5)]">
                <ActivityIcon className="w-12 h-12" />
                <div>
                  <h4 className="text-2xl sm:text-3xl font-display font-black italic uppercase tracking-tighter leading-none mb-2">Monitoramento de Lactato.</h4>
                  <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest italic opacity-70">Integração nativa para limiares ventilatórios.</p>
                </div>
             </div>

             <div className="md:col-span-4 bg-[#11161D] rounded-[3rem] sm:rounded-[4rem] border border-white/5 p-8 sm:p-12 flex flex-col justify-center gap-4 hover:border-[#3B82F6]/20 transition-all">
                <div className="flex items-center gap-3 mb-2">
                   <CheckCircle2 className="w-6 h-6 text-[#3B82F6]" />
                   <h4 className="text-xl sm:text-2xl font-display font-black italic uppercase tracking-widest">Dashboards Pro.</h4>
                </div>
                <p className="text-slate-600 font-black uppercase tracking-widest text-[9px] sm:text-[10px] leading-relaxed italic">
                   Visualização em tempo real de métricas avançadas: VO2 Max estimado, Tempo de Contato e Oscilação Vertical.
                </p>
             </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-40 px-6">
         <div className="max-w-7xl mx-auto">
            <div className="bg-[#0A0D12] rounded-[4rem] sm:rounded-[6rem] p-12 sm:p-32 border border-white/5 text-center relative overflow-hidden group">
               <div className="absolute inset-0 bg-[#3B82F6]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
               <motion.div
                 initial={{ opacity: 0, y: 30 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 className="relative z-10 space-y-12 sm:space-y-16"
               >
                  <h2 className="text-5xl sm:text-7xl md:text-9xl font-display font-black italic uppercase tracking-[s-0.05em] leading-[0.8] tracking-tighter">
                    VIVA O SEU <br />
                    <span className="text-[#3B82F6]">NEXT LEVEL.</span>
                  </h2>
                  <p className="max-w-2xl mx-auto text-slate-500 text-sm sm:text-xl font-bold uppercase tracking-[0.2em] italic leading-relaxed">
                    Entre para a comunidade de atletas que não aceitam o mediano. <br className="hidden sm:block" /> Treine com ciência, corra com alma.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
                     <button 
                       onClick={handleLogin}
                       className="w-full sm:w-auto bg-white text-black px-16 py-7 rounded-[2.5rem] font-black italic uppercase text-xs sm:text-sm tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] font-bold"
                     >
                       Inscrever-se Agora
                     </button>
                     <Link 
                       to="/atleta"
                       className="w-full sm:w-auto bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-[#3B82F6] px-16 py-7 rounded-[2.5rem] font-black italic uppercase text-xs sm:text-sm tracking-widest hover:bg-[#3B82F6]/20 transition-all font-bold"
                     >
                       Sou Atleta RunPro
                     </Link>
                  </div>
               </motion.div>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#05070A] border-t border-white/5 pt-24 sm:pt-32 pb-12 sm:pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 sm:gap-24 mb-24 sm:mb-32">
            <div className="md:col-span-4 space-y-10">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#3B82F6] rounded-xl flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-2xl font-display font-black italic uppercase tracking-tighter">
                    RUN<span className="text-[#3B82F6]">PRO</span>
                  </span>
               </div>
               <p className="text-slate-600 text-xs sm:text-sm font-black uppercase tracking-widest italic leading-relaxed">
                 A maior plataforma de assessoria de corrida do Brasil dedicada à tecnologia de alta performance.
               </p>
            </div>
            
            <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-12 sm:gap-20">
               <div className="space-y-8">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-white italic">Produto</h5>
                  <ul className="space-y-4">
                     {['Dashboard', 'I.A. Insights', 'Planilhas', 'Consultoria'].map(item => (
                       <li key={item}>
                          <a href="#" className="text-xs font-black uppercase tracking-widest italic text-slate-500 hover:text-[#3B82F6] transition-colors">{item}</a>
                       </li>
                     ))}
                  </ul>
               </div>

               <div className="space-y-8">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-white italic">Empresa</h5>
                  <ul className="space-y-4">
                     {['Carreiras', 'Imprensa', 'Manifesto', 'Blog'].map(item => (
                       <li key={item}>
                          <a href="#" className="text-xs font-black uppercase tracking-widest italic text-slate-500 hover:text-[#3B82F6] transition-colors">{item}</a>
                       </li>
                     ))}
                  </ul>
               </div>

               <div className="space-y-8">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-white italic">Suporte</h5>
                  <ul className="space-y-4">
                     {['API Docs', 'Status', 'Atendimento', 'FAQ'].map(item => (
                       <li key={item}>
                          <a href="#" className="text-xs font-black uppercase tracking-widest italic text-slate-500 hover:text-[#3B82F6] transition-colors">{item}</a>
                       </li>
                     ))}
                  </ul>
               </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 sm:gap-12 border-t border-white/5 pt-12 sm:pt-16">
             <p className="text-[8px] sm:text-[10px] font-bold text-slate-700 uppercase tracking-widest">© 2025 RUNPRO PERFORMANCE LABS. TODOS OS DIREITOS RESERVADOS.</p>
             <div className="flex flex-wrap items-center gap-8 text-[8px] sm:text-[10px] font-bold text-slate-700 uppercase tracking-widest">
                <a href="#" className="hover:text-white transition-colors">Privacidade</a>
                <a href="#" className="hover:text-white transition-colors">Cookies</a>
                <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Simple dummy icon to bypass import check if needed
const ActivityIcon = Activity;

export default LandingPage;
