import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Trophy, Zap, ArrowRight, ShieldCheck, BarChart3, Activity as ActivityIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

const LandingPage = () => {
  const { scrollY } = useScroll();
  const yParallax = useTransform(scrollY, [0, 800], [0, 200]);
  const opacityFade = useTransform(scrollY, [0, 500], [1, 0]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.23, 1, 0.32, 1] }
    }
  };

  const fadeInUpScroll = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-yellow-400 selection:text-black">
      {/* Premium Gradient Overlay */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-yellow-400/5 rounded-full blur-[120px]"></div>
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[50%] bg-blue-600/5 rounded-full blur-[120px]"></div>
      </div>

      {/* Navigation */}
      <nav className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 flex justify-between items-center relative z-50">
        <div className="flex items-center gap-2">
          <img
            src="/logo-opt.png"
            alt="RunManager"
            className="w-8 h-8 sm:w-10 sm:h-10 object-contain hover:scale-110 transition-transform duration-300"
          />
          <span className="text-base sm:text-2xl font-display font-black tracking-tighter italic uppercase leading-none">Run<span className="text-yellow-400">Manager</span></span>
        </div>
        <div className="hidden md:flex items-center gap-12 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">
          <a href="#features" className="hover:text-white transition-colors relative group">
            Funcionalidades
            <span className="absolute -bottom-2 left-0 w-0 h-px bg-yellow-400 transition-all group-hover:w-full"></span>
          </a>
          <a href="#how-it-works" className="hover:text-white transition-colors relative group">
            Performance
            <span className="absolute -bottom-2 left-0 w-0 h-px bg-yellow-400 transition-all group-hover:w-full"></span>
          </a>
        </div>
        <div className="flex items-center gap-2 sm:gap-6">
          <Link to="/login" className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-yellow-400 hover:text-black transition-all px-3 sm:px-6 py-2 sm:py-3 rounded-full border border-yellow-400/50 bg-yellow-400/10 hover:bg-yellow-400 shadow-[0_5px_15px_rgba(250,204,21,0.1)]">Entrar</Link>
          <Link to="/signup" className="bg-white text-slate-950 px-4 sm:px-8 py-2 sm:py-4 rounded-full font-black text-[8px] sm:text-xs uppercase tracking-[0.2em] hover:bg-yellow-400 hover:scale-105 transition-all shadow-xl">
             Começar
          </Link>
        </div>
      </nav>


      {/* Hero Section - Dynamic Split Layout */}
      <section className="relative min-h-screen flex flex-col lg:flex-row items-stretch overflow-hidden">
        {/* LEFT COLUMN: Content */}
        <motion.div
          initial={{ opacity: 0, x: -80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
          className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 relative z-10 bg-slate-950/20 backdrop-blur-sm"
        >
          <div className="max-w-xl w-full">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md"
            >
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-yellow-400/80">Infraestrutura Profissional</span>
            </motion.div>

            <h1 className="text-[clamp(2.4rem,10vw,4.5rem)] md:text-[clamp(4.5rem,8vw,7rem)] lg:text-[7.5vw] font-display font-black leading-[0.85] lg:leading-[0.8] italic uppercase tracking-tighter mb-10 group cursor-default w-full max-w-full overflow-hidden">
              DOMINE <br />
              <span className="relative inline-block max-w-full">
                <span className="text-yellow-400 group-hover:text-white transition-colors duration-300 relative z-10 break-words block">O ASFALTO</span>
                <span className="absolute inset-0 z-0 text-white opacity-0 group-hover:opacity-20 group-hover:animate-[glitch_0.3s_infinite] select-none pointer-events-none break-words block">O ASFALTO</span>
                {/* Road marking underline */}
                <motion.div 
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1, duration: 1, ease: "circOut" }}
                  className="absolute -bottom-1 sm:-bottom-2 md:-bottom-4 left-0 right-0 h-1 md:h-4 bg-yellow-400 origin-left skew-x-[-20deg]"
                />
              </span>
            </h1>

            <p className="mt-8 text-slate-400 text-lg sm:text-xl font-medium leading-relaxed italic max-w-md">
              Gestão de inscrições, pagamentos e resultados integrada em uma única plataforma de alta performance.
            </p>

            <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row gap-4 sm:gap-6">
              <Link 
                to="/signup" 
                className="bg-yellow-400 text-black px-8 sm:px-10 py-5 sm:py-6 rounded-2xl font-black text-base sm:text-lg hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_rgba(250,204,21,0.3)] flex items-center justify-center gap-4 group italic uppercase tracking-tighter overflow-hidden relative"
              >
                <span className="relative z-10 uppercase">Começar</span>
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-2 transition-transform relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] skew-x-12"></div>
              </Link>
              <a 
                href="#features" 
                className="border-2 border-white/10 px-8 sm:px-10 py-5 sm:py-6 rounded-2xl font-black text-base sm:text-lg hover:bg-white/5 transition-all flex items-center justify-center italic uppercase tracking-tighter"
              >
                Ver Detalhes
              </a>
            </div>

            {/* Speed Streaks for left column background */}
            <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
               {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: "-100%", y: `${25 + i * 20}%` }}
                    animate={{ x: "200%" }}
                    transition={{ duration: 0.8 + i*0.2, repeat: Infinity, ease: "linear", delay: i * 0.5 }}
                    className="absolute h-[2px] w-64 bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent"
                  />
               ))}
            </div>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: Visuals */}
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
          className="w-full lg:w-1/2 min-h-[400px] lg:min-h-0 relative group"
        >
          {/* Road Perspective Background inside Image column */}
          <div className="absolute inset-0 bg-slate-900 overflow-hidden">
            <motion.img
              style={{ y: yParallax, opacity: opacityFade }}
              src="https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=2070&auto=format&fit=crop"
              className="h-full w-full object-cover grayscale-[30%] hover:grayscale-0"
              alt="Elite Runner"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-transparent to-transparent lg:hidden"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950"></div>
            
            {/* Speed Overlays on Image */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden mix-blend-overlay">
               {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: "-100%", y: `${10 + i * 12}%` }}
                    animate={{ x: "200%" }}
                    transition={{ duration: 0.5, repeat: Infinity, ease: "linear", delay: i * 0.2 }}
                    className="absolute h-px w-full bg-white/40"
                  />
               ))}
            </div>
          </div>

          <div className="absolute bottom-12 right-12 text-right hidden lg:block">
            <div className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40 mb-2">Engenharia Esportiva</div>
            <div className="text-4xl font-display font-black italic text-white/10 uppercase tracking-tighter">PERFORMANCE FIRST</div>
          </div>
        </motion.div>
      </section>

      {/* Trust Grid */}
      <section className="pb-32 container mx-auto px-6">
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <TrustItem label="Atletas Gerenciados" value="+50k" />
            <TrustItem label="Eventos Realizados" value="1.2k" />
            <TrustItem label="Uptime de Inscrição" value="99.9%" />
            <TrustItem label="Satisfação" value="4.9/5" />
         </div>
      </section>

      {/* Features */}
      <section id="features" className="py-40 bg-black border-y border-slate-900 overflow-hidden relative z-10">
        <div className="container mx-auto px-6">
          <div className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
             <div className="max-w-2xl">
                <div className="text-[10px] font-black text-yellow-400 uppercase tracking-[0.5em] mb-6">Capacidades</div>
                <h2 className="text-5xl lg:text-7xl font-display font-black italic uppercase leading-[0.9] tracking-tighter">
                   Tecnologia de <br /> <span className="text-slate-500">Elite</span>.
                </h2>
             </div>
             <p className="text-slate-500 font-medium max-w-sm">
                Desenvolvido para lidar com picos de tráfego e volume massivo de atletas sem perder a estabilidade.
             </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <PremiumFeatureItem 
               icon={<ActivityIcon className="w-10 h-10" />}
               title="Checkout Instantâneo"
               desc="Inscrições concluídas em menos de 45 segundos com nossa interface otimizada."
             />
             <PremiumFeatureItem 
               icon={<BarChart3 className="w-10 h-10" />}
               title="BI & Analytics"
               desc="Visualize a demografia dos seus atletas e o luxo financeiro em tempo real."
             />
             <PremiumFeatureItem 
               icon={<ShieldCheck className="w-10 h-10" />}
               title="Validação Segura"
               desc="Sistema anti-fraude e confirmação de dados automática para organizadores."
             />
          </div>

          {/* AI Training Integration */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 p-8 md:p-16 bg-yellow-400 rounded-[4rem] flex flex-col md:flex-row items-center justify-between gap-12 group overflow-hidden relative"
          >
             <div className="absolute top-0 right-0 w-64 h-64 bg-black/5 rounded-full blur-[80px] -mr-32 -mt-32 transition-transform group-hover:scale-150 duration-700"></div>
             <div className="max-w-2xl relative z-10 text-slate-950">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/10 rounded-full mb-6">
                   <Zap className="w-3 h-3 fill-current" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-950">Exclusividade RunManager</span>
                </div>
                <h3 className="text-4xl md:text-6xl font-display font-black italic uppercase leading-[0.9] tracking-tighter mb-8">
                   TREINE <br /> COM IA.
                </h3>
                <p className="text-slate-900/80 font-bold text-lg mb-0 italic max-w-md">
                   Entregue um diferencial real: gerador de planilhas inteligente para seus atletas baterem o próprio recorde.
                </p>
             </div>
             <Link to="/training-generator" className="bg-slate-950 text-white px-8 sm:px-12 py-6 sm:py-8 rounded-[2rem] sm:rounded-[2.5rem] font-black text-lg sm:text-xl hover:scale-105 sm:hover:scale-110 active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-4 sm:gap-6 italic group uppercase tracking-tighter relative z-10 text-center w-full md:w-auto">
                TESTAR GERADOR
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-2 transition-transform" />
             </Link>
          </motion.div>
        </div>
      </section>

      {/* Marquee Section */}
      <section className="py-24 overflow-hidden bg-black border-y border-slate-900">
         <div className="flex items-center gap-12 whitespace-nowrap animate-[marquee_40s_linear_infinite]">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="flex items-center gap-4 text-4xl lg:text-8xl font-display font-black italic uppercase opacity-20 hover:opacity-100 transition-opacity cursor-default">
                 Performance <div className="w-3 h-3 bg-yellow-400 rounded-full"></div> 
                 Resultados <div className="w-3 h-3 bg-white rounded-full"></div> 
                 Excelência <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              </div>
            ))}
         </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-32 container mx-auto px-6 overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-24 items-center">
           <div className="lg:w-1/2 relative order-2 lg:order-1">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative z-10 rounded-[4rem] overflow-hidden border border-white/5 group shadow-2xl"
              >
                 <img 
                  src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=2070&auto=format&fit=crop" 
                  className="w-full aspect-[4/5] object-cover group-hover:scale-105 transition-transform duration-1000" 
                  alt="Training" 
                  referrerPolicy="no-referrer"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
                 <div className="absolute top-10 left-10 p-6 bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl">
                    <Trophy className="w-8 h-8 text-yellow-400 mb-2" />
                    <div className="text-xl font-display font-black italic">ULTRA PERFORMANCE</div>
                 </div>
              </motion.div>
           </div>

           <div className="lg:w-1/2 space-y-12 order-1 lg:order-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="text-[11px] font-black uppercase tracking-[0.4em] text-yellow-400 mb-6">Workflow Profissional</div>
                <h2 className="text-5xl lg:text-7xl font-display font-black italic uppercase leading-[0.9] tracking-tighter mb-12">
                  Trabalho Duro <br /> <span className="text-yellow-400">Gestão Leve</span>.
                </h2>
                
                <div className="space-y-12">
                   <HowStep number="01" title="Arquitetura do Evento" desc="Defina metas, limites e valores em um setup guiado de 60 segundos." />
                   <HowStep number="02" title="Distribuição Viral" desc="Seu link pronto para ser disparado em grupos e redes sociais." />
                   <HowStep number="03" title="Execução Total" desc="Foque no dia da prova, a RunManager cuida da conferência de dados." />
                </div>
              </motion.div>
           </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 bg-[#020617] relative flex flex-col items-center text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent opacity-50"></div>
        <div className="container mx-auto px-6 relative z-10">
           <h2 className="text-6xl lg:text-[18vw] font-display font-black leading-[0.8] italic uppercase tracking-tighter mb-16 opacity-5 select-none">
             RESULTADO <br /> AGORA.
           </h2>
          <div className="-mt-16 sm:-mt-32 lg:-mt-72 relative text-center px-4 w-full">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
                className="group/title w-full"
              >
                <h3 className="text-5xl sm:text-7xl lg:text-[clamp(4rem,10vw,12rem)] font-display font-black italic uppercase mb-10 sm:mb-16 tracking-tighter relative cursor-default w-full leading-none">
                  <span className="relative z-10 transition-all duration-300 group-hover/title:tracking-[-0.05em] group-hover/title:text-yellow-400 inline-block max-w-full break-words">
                    Domine o <span className="text-yellow-400 group-hover/title:text-white transition-colors duration-300">Asfalto.</span>
                  </span>
                  
                  {/* Kinetic Shadow Copies */}
                  <span className="absolute inset-0 z-0 text-white opacity-0 group-hover/title:opacity-10 group-hover/title:animate-[glitch_0.3s_infinite] select-none pointer-events-none">
                    Domine o Asfalto.
                  </span>

                  {/* Road marking effect behind text */}
                  <motion.div 
                    initial={{ scaleX: 0, opacity: 0 }}
                    whileInView={{ scaleX: 1, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1.2, ease: "circOut" }}
                    className="absolute -bottom-4 left-1/4 right-1/4 h-2 sm:h-3 bg-yellow-400 origin-center skew-x-[-20deg] shadow-[0_10px_30px_rgba(250,204,21,0.4)]"
                  />
                </h3>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <Link to="/signup" className="bg-yellow-400 text-black px-10 sm:px-16 py-6 sm:py-8 rounded-2xl sm:rounded-[2.5rem] font-black text-xl sm:text-2xl hover:scale-105 sm:hover:scale-110 active:scale-95 transition-all shadow-[0_30px_60px_rgba(250,204,21,0.2)] sm:shadow-[0_40px_80px_rgba(250,204,21,0.3)] inline-flex items-center gap-6 sm:gap-8 italic group uppercase tracking-widest overflow-hidden relative">
                   <span className="relative z-10 flex items-center gap-4">
                      COMEÇAR AGORA
                      <ArrowRight className="w-6 h-6 sm:w-8 sm:h-8 group-hover:translate-x-2 sm:group-hover:translate-x-3 transition-transform" />
                   </span>
                   {/* Speed shine effect */}
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] skew-x-12"></div>
                </Link>
              </motion.div>
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-32 border-t border-slate-900 bg-black">
        <div className="container mx-auto px-6">
           <div className="flex flex-col md:flex-row justify-between items-start gap-24 mb-32">
              <div className="max-w-md">
                 <div className="flex items-center gap-4 mb-10">
                    <Zap className="text-white w-8 h-8 fill-current" />
                    <span className="text-3xl font-display font-black italic uppercase">Run<span className="text-yellow-400">Manager</span></span>
                 </div>
                 <p className="text-slate-500 text-lg font-medium leading-relaxed">
                   A infraestrutura definitiva para organizadores que levam a sério a performance esportiva e financeira. Elevando o padrão do asfalto.
                 </p>
              </div>
              <div className="grid grid-cols-2 gap-32">
                 <div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mb-10">Plataforma</div>
                    <ul className="space-y-6 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                       <li className="hover:text-yellow-400 cursor-pointer transition-colors">Funcionalidades</li>
                       <li className="hover:text-yellow-400 cursor-pointer transition-colors">Performance</li>
                       <li className="hover:text-yellow-400 cursor-pointer transition-colors">Cases</li>
                    </ul>
                 </div>
                 <div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mb-10">Legal</div>
                    <ul className="space-y-6 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                       <li className="hover:text-yellow-400 cursor-pointer transition-colors">Termos</li>
                       <li className="hover:text-yellow-400 cursor-pointer transition-colors">Privacidade</li>
                    </ul>
                 </div>
              </div>
           </div>
           <div className="pt-16 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black uppercase tracking-[0.5em] text-slate-800">
              <span>© {new Date().getFullYear()} PERFORMANCE FIRST TECHNOLOGY.</span>
              <div className="flex gap-12">
                 <span>ENGINEERED FOR ATHLETES</span>
                 <span>BRASIL</span>
              </div>
           </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-bounce-slow {
          animation: bounce 3s infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(-5%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
          50% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }
        }
      `}} />
    </div>
  );
};

const TrustItem = ({ label, value }: { label: string; value: string }) => (
  <motion.div 
    whileHover={{ y: -10, borderColor: 'rgba(250, 204, 21, 0.5)' }}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="bg-slate-950/50 border border-slate-900 p-8 rounded-[2rem] text-center group transition-colors duration-500"
  >
     <div className="text-4xl font-display font-black text-white italic mb-2 group-hover:scale-110 transition-transform">{value}</div>
     <div className="text-[10px] font-black uppercase tracking-widest text-slate-600">{label}</div>
  </motion.div>
);

const PremiumFeatureItem = ({ icon, title, desc }: { icon: any; title: string; desc: string }) => (
  <motion.div 
    whileHover={{ scale: 1.02, borderColor: 'rgba(250, 204, 21, 1)' }}
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    className="p-8 md:p-12 bg-slate-950 border border-slate-900 rounded-[3rem] transition-all duration-500 group flex flex-col h-full"
  >
     <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-900 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center text-slate-500 mb-8 md:mb-10 group-hover:bg-yellow-400 group-hover:text-black transition-all duration-500 group-hover:rotate-12">
        {icon}
     </div>
     <h3 className="text-2xl md:text-3xl lg:text-[clamp(1.5rem,2.5vw,2.5rem)] font-display font-black text-white italic uppercase tracking-tighter mb-6 leading-[0.9] group-hover:text-yellow-400 transition-colors break-words overflow-hidden">{title}</h3>
     <p className="text-slate-500 text-sm leading-relaxed font-medium">{desc}</p>
  </motion.div>
);

const ListItem = ({ text }: { text: string }) => (
  <li className="flex items-center gap-4 text-sm font-bold uppercase tracking-widest text-slate-300">
     <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
     {text}
  </li>
);

const HowStep = ({ number, title, desc }: { number: string; title: string; desc: string }) => (
  <div className="flex gap-10 group">
    <div className="text-5xl font-display font-black italic text-slate-800 h-fit transition-colors group-hover:text-yellow-400 duration-500">
      {number}
    </div>
    <div className="pt-2">
      <h4 className="text-2xl font-display font-black italic uppercase tracking-tighter mb-3 group-hover:text-white transition-colors duration-500">{title}</h4>
      <p className="text-slate-600 font-medium leading-relaxed max-w-sm group-hover:text-slate-400 transition-colors duration-500">{desc}</p>
    </div>
  </div>
);

export default LandingPage;
