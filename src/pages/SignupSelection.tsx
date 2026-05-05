import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, 
  Users, 
  Dumbbell, 
  Zap, 
  TrendingUp, 
  ArrowRight,
  ShieldCheck,
  ChevronLeft
} from 'lucide-react';
import { motion } from 'motion/react';

const SignupSelection = () => {
  const options = [
    {
      title: 'Sou Atleta',
      subtitle: 'BUSCANDO PERFORMANCE',
      description: 'Participe de corridas, acompanhe seus resultados e receba planilhas de treino avançadas.',
      icon: Trophy,
      link: '/signup/student',
      color: 'blue'
    },
    {
      title: 'Sou Treinador',
      subtitle: 'GESTOR DE ELITE',
      description: 'Gerencie seus atletas, crie assessorias esportivas e escale sua metodologia.',
      icon: Dumbbell,
      link: '/signup/trainer',
      color: 'blue'
    },
    {
      title: 'Organizador',
      subtitle: 'DOMÍNIO DE EVENTOS',
      description: 'Crie e gerencie provas de rua, controle inscrições e domine o mercado de eventos.',
      icon: Zap,
      link: '/signup/organizer',
      color: 'blue'
    }
  ];

  return (
    <div className="min-h-screen bg-[#05070A] text-white flex flex-col items-center justify-center p-6 font-sans selection:bg-[#3B82F6]/30 overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#3B82F6]/5 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#3B82F6]/5 rounded-full blur-[120px] translate-y-1/2 translate-x-1/2" />
      </div>

      <div className="max-w-6xl w-full relative z-10">
        <div className="flex flex-col items-center text-center mb-16 md:mb-24">
           <Link to="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 hover:text-white transition-colors mb-12 italic group">
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Voltar ao Início
           </Link>
           <div className="inline-flex items-center gap-3 text-[#3B82F6] mb-6">
              <ShieldCheck className="w-6 h-6 shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] italic">LAB ACCESS INITIATION</span>
           </div>
           <h1 className="text-5xl sm:text-7xl md:text-8xl font-display font-black italic uppercase tracking-tighter leading-none mb-8">
             ESCOLHA SEU <br /> <span className="text-[#3B82F6]">CAMINHO.</span>
           </h1>
           <p className="max-w-xl text-slate-500 font-bold uppercase tracking-[0.2em] italic text-xs leading-relaxed">
             Para qual objetivo você busca a excelência tecnológica? Selecione seu perfil para começar sua jornada.
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {options.map((opt, idx) => (
             <motion.div
               key={idx}
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.1 }}
             >
               <Link 
                 to={opt.link}
                 className="group relative bg-[#11161D] p-10 sm:p-12 rounded-[3.5rem] border border-white/5 block hover:translate-y-[-10px] transition-all duration-500 hover:border-[#3B82F6]/50 shadow-2xl"
               >
                  <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                     <opt.icon className="w-32 h-32 text-[#3B82F6]" />
                  </div>

                  <div className="mb-12 relative z-10">
                     <div className="w-16 h-16 rounded-[2rem] bg-black/40 border border-white/10 flex items-center justify-center mb-10 group-hover:bg-[#3B82F6] transition-all duration-500 group-hover:scale-110 shadow-lg group-hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                        <opt.icon className="w-8 h-8 text-[#3B82F6] group-hover:text-white transition-colors" />
                     </div>
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic mb-3 block group-hover:text-[#3B82F6] transition-colors">{opt.subtitle}</span>
                     <h3 className="text-3xl font-display font-black italic uppercase tracking-tight text-white">{opt.title}</h3>
                  </div>

                  <p className="text-slate-600 text-[11px] font-bold uppercase tracking-widest leading-relaxed italic mb-12 group-hover:text-slate-400 transition-colors">
                     {opt.description}
                  </p>

                  <div className="flex items-center gap-3 text-white font-black italic uppercase text-[10px] tracking-widest group-hover:text-[#3B82F6] transition-all">
                     Criar Conta Elite
                     <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </div>
               </Link>
             </motion.div>
           ))}
        </div>

        <div className="mt-20 text-center">
           <div className="bg-white/5 border border-white/5 px-10 py-6 rounded-[2.5rem] inline-flex items-center gap-6">
              <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest italic">Já possui uma conta?</span>
              <Link to="/login" className="text-white font-black uppercase text-[10px] tracking-widest hover:text-[#3B82F6] transition-colors italic border-l border-white/10 pl-6 underline underline-offset-4">Fazer Login</Link>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SignupSelection;
