import React from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Dumbbell, Trophy, ArrowRight, ShieldCheck, Mail } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';

const AthletePortal = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-yellow-400 selection:text-black overflow-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-yellow-400/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-yellow-900/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-20 lg:pt-20">
        <nav className="flex items-center justify-between mb-12 sm:mb-24">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-400 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
              <Zap className="text-black w-5 h-5 sm:w-6 sm:h-6 fill-current" />
            </div>
            <span className="text-base sm:text-xl font-display font-black italic tracking-tighter uppercase whitespace-nowrap">
              Run<span className="text-yellow-400">Manager</span> <span className="hidden sm:inline-block text-[10px] ml-1 bg-white/10 px-2 py-0.5 rounded text-slate-400 not-italic font-black tracking-widest uppercase">Atleta</span>
            </span>
          </Link>
          
          {user ? (
            <Link 
              to="/dashboard/runner" 
              className="bg-yellow-400 text-black px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest italic shadow-xl hover:bg-yellow-500 transition-colors"
            >
              Meu Painel
            </Link>
          ) : (
            <Link 
              to="/login" 
              className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
            >
              Entrar
            </Link>
          )}
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8 sm:space-y-12"
          >
            <div className="space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] italic mb-2 sm:mb-4">
                <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                Área Exclusiva do Aluno
              </div>
              <h1 className="text-4xl sm:text-7xl lg:text-8xl font-display font-black italic uppercase tracking-tighter leading-[0.9]">
                Sua Melhor <br/>
                <span className="text-yellow-400 text-stroke">Versão</span> <br/>
                Começa <span className="text-yellow-400 italic">Aqui.</span>
              </h1>
              <p className="text-slate-400 text-base sm:text-lg font-medium leading-relaxed max-w-lg italic mx-auto lg:mx-0">
                Acesse seus treinos personalizados, acompanhe sua evolução e gerencie suas inscrições em corridas em um só lugar.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              <Link 
                to="/register"
                className="group relative bg-yellow-400 text-black px-10 py-5 rounded-[2rem] font-black italic uppercase text-sm tracking-widest shadow-[0_20px_40px_-5px_rgba(250,204,21,0.4)] flex items-center justify-center gap-3 overflow-hidden transition-all hover:scale-105 active:scale-95"
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                Acessar Meu Painel
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="bg-white/5 border border-white/10 text-white px-10 py-5 rounded-[2rem] font-black italic uppercase text-sm tracking-widest hover:bg-white/10 transition-all">
                Saiba Mais
              </button>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-10 border-t border-white/5">
              <div>
                <div className="text-3xl font-display font-black italic text-yellow-400 mb-1">24/7</div>
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Acesso Vitalício</div>
              </div>
              <div>
                <div className="text-3xl font-display font-black italic text-yellow-400 mb-1">HD</div>
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Vídeos 4K</div>
              </div>
              <div>
                <div className="text-3xl font-display font-black italic text-yellow-400 mb-1">PRO</div>
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Planilhas Focadas</div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
            className="relative"
          >
            <div className="absolute inset-0 bg-yellow-400/20 blur-[100px] rounded-full scale-75 animate-pulse" />
            <div className="relative aspect-square rounded-[4rem] bg-slate-900 border border-white/10 shadow-2xl overflow-hidden group">
               {/* Mock UI for Visual Impact */}
               <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-black p-10 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                     <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center">
                        <Dumbbell className="text-black w-6 h-6" />
                     </div>
                     <div className="flex gap-2">
                        <div className="w-12 h-3 bg-white/10 rounded-full" />
                        <div className="w-8 h-3 bg-white/5 rounded-full" />
                     </div>
                  </div>
                  <div className="space-y-6">
                     <div className="h-4 w-3/4 bg-white/10 rounded-full" />
                     <div className="h-4 w-1/2 bg-white/10 rounded-full" />
                     <div className="h-32 w-full bg-white/5 rounded-[2rem] border border-white/10 flex items-center justify-center">
                        <Zap className="w-8 h-8 text-yellow-400 animate-bounce" />
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="h-12 bg-yellow-400/10 rounded-2xl border border-yellow-400/20" />
                     <div className="h-12 bg-white/5 rounded-2xl border border-white/10" />
                  </div>
               </div>
               {/* Overlay with a nice gradient */}
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
            </div>

            {/* Floating Elements */}
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-10 -right-10 bg-slate-900 border border-white/10 p-6 rounded-[2rem] shadow-2xl backdrop-blur-md"
            >
               <Trophy className="w-8 h-8 text-yellow-400 mb-2" />
               <div className="text-xs font-black italic uppercase tracking-widest">Evolução PRO</div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 5, repeat: Infinity, delay: 1 }}
              className="absolute -bottom-6 -left-10 bg-slate-900 border border-white/10 p-5 rounded-[2rem] shadow-2xl backdrop-blur-md flex items-center gap-4"
            >
               <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-green-500" />
               </div>
               <div className="text-[9px] font-black italic uppercase tracking-[0.2em] text-slate-400">Plano Ativo</div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AthletePortal;
