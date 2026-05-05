import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Zap, User, Briefcase, ArrowRight, ArrowLeft } from 'lucide-react';

const SignupSelection = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-400/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>

      <div className="w-full max-w-4xl relative z-10">
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
             <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-[0_0_20px_rgba(250,204,21,0.3)]">
                <Zap className="text-black w-6 h-6 fill-current" />
             </div>
             <span className="text-2xl font-display font-bold tracking-tight">RunManager</span>
          </Link>
          <h1 className="text-4xl md:text-5xl font-display font-black italic uppercase tracking-tighter mb-4">
            Qual tipo de conta você <br className="hidden md:block" /> <span className="text-yellow-400">deseja criar?</span>
          </h1>
          <p className="text-slate-400 font-medium">Escolha a opção que melhor se adapta ao seu objetivo.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Athlete Card */}
          <motion.div
            whileHover={{ y: -10 }}
            className="group relative"
          >
            <div className="absolute inset-0 bg-yellow-400/20 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative bg-slate-900/50 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem] flex flex-col items-center text-center h-full group-hover:border-yellow-400/50 transition-colors">
              <div className="w-20 h-20 bg-yellow-400/10 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <User className="w-10 h-10 text-yellow-400" />
              </div>
              <h2 className="text-2xl font-display font-black italic uppercase tracking-tighter mb-4">Atleta</h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-8 flex-grow">
                Participe de corridas, acesse seus treinos, acompanhe sua evolução e receba feedbacks da sua assessoria.
              </p>
              <Link 
                to="/signup/athlete"
                className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase italic tracking-widest text-[10px] flex items-center justify-center gap-2 group-hover:bg-yellow-400 transition-all shadow-xl"
              >
                Criar conta como Atleta
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>

          {/* Organizer Card */}
          <motion.div
            whileHover={{ y: -10 }}
            className="group relative"
          >
            <div className="absolute inset-0 bg-yellow-400/20 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative bg-slate-900/50 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem] flex flex-col items-center text-center h-full group-hover:border-yellow-400/50 transition-colors">
              <div className="w-20 h-20 bg-yellow-400/10 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <Briefcase className="w-10 h-10 text-yellow-400" />
              </div>
              <h2 className="text-2xl font-display font-black italic uppercase tracking-tighter mb-4">Organizador / Personal</h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-8 flex-grow">
                Crie corridas, gerencie atletas, envie treinos, controle o financeiro e escale sua assessoria esportiva.
              </p>
              <Link 
                to="/signup/organizer"
                className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase italic tracking-widest text-[10px] flex items-center justify-center gap-2 group-hover:bg-yellow-400 transition-all shadow-xl"
              >
                Criar conta como Organizador
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-500 text-sm font-medium mb-4 italic">Já possui uma conta?</p>
          <Link to="/login" className="text-yellow-400 font-black uppercase italic tracking-widest text-[10px] hover:text-white transition-colors flex items-center justify-center gap-2">
            Fazer Login
            <ArrowRight className="w-4 h-4" />
          </Link>
          
          <Link to="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-white transition-colors mt-12 text-xs font-bold uppercase tracking-widest italic">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Início
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupSelection;
