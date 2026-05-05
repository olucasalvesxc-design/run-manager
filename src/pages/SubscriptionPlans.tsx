import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Check, 
  ShieldCheck, 
  Zap, 
  Trophy, 
  Users, 
  TrendingUp, 
  Target,
  ArrowRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

const SubscriptionPlans = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Start',
      price: 'Grátis',
      period: '',
      description: 'Perfeito para organizadores que estão começando e querem testar a plataforma.',
      features: [
        'Até 1 corrida ativa',
        'Taxa de 10% por inscrição',
        'Gestão básica de inscritos',
        'Link de inscrição público',
        'Suporte via e-mail'
      ],
      highlight: false,
      color: 'blue'
    },
    {
      name: 'Pro Organizer',
      price: 'R$ 197',
      period: '/mês',
      description: 'A escolha certa para organizadores profissionais com múltiplas provas.',
      features: [
        'Corridas ilimitadas',
        'Taxa reduzida (5%)',
        'Dashboard financeiro avançado',
        'Exportação total de dados',
        'Gestão de cupons de desconto',
        'Suporte prioritário WhatsApp'
      ],
      highlight: true,
      color: 'blue'
    },
    {
      name: 'Enterprise',
      price: 'Sob Consulta',
      period: '',
      description: 'Solução sob medida para grandes franquias de corrida e eventos massivos.',
      features: [
        'Tudo no plano Pro',
        'Taxas customizadas',
        'Multi-administradores',
        'White Label parcial',
        'Account Manager dedicado',
        'Integração via API'
      ],
      highlight: false,
      color: 'blue'
    }
  ];

  return (
    <div className="min-h-screen bg-[#05070A] text-white font-sans selection:bg-[#3B82F6]/30 pb-20 -m-4 sm:-m-8 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto py-12 md:py-24">
        {/* Header Section */}
        <header className="text-center mb-20 md:mb-32">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3B82F6] text-white font-black text-[10px] uppercase tracking-[0.2em] italic mb-6 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
          >
            <ShieldCheck className="w-3 h-3" />
            Planos & Escalabilidade
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-8xl font-display font-black italic uppercase tracking-tighter leading-[0.8] mb-10"
          >
            Potencialize <br /> sua <span className="text-[#3B82F6]">Organização.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-xl mx-auto text-slate-500 font-bold uppercase tracking-[0.2em] italic text-xs leading-relaxed"
          >
            Escolha o plano que melhor se adapta ao volume das suas provas e leve sua gestão operacional para o nível pro.
          </motion.p>
        </header>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              className={cn(
                "relative p-8 sm:p-12 rounded-[3.5rem] border border-white/5 flex flex-col h-full group hover:translate-y-[-10px] transition-all duration-500",
                plan.highlight 
                  ? "bg-[#11161D] border-[#3B82F6] shadow-[0_0_80px_rgba(59,130,246,0.1)] scale-105 z-10" 
                  : "bg-black/40 hover:bg-white/5"
              )}
            >
              {plan.highlight && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#3B82F6] text-white px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-[0.2em] italic shadow-xl z-20 font-bold">
                  Mais Recomendado
                </div>
              )}

              <div className="mb-10">
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center mb-8 bg-black/40 border border-white/10 group-hover:scale-110 transition-transform",
                  plan.color === 'blue' ? "text-[#3B82F6] border-[#3B82F6]/20" : "text-white"
                )}>
                  {idx === 0 ? <TrendingUp className="w-8 h-8" /> : idx === 1 ? <Zap className="w-8 h-8" /> : <Trophy className="w-8 h-8" />}
                </div>
                <h3 className="text-3xl font-display font-black italic uppercase tracking-wider text-white mb-2">{plan.name}</h3>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-relaxed italic">{plan.description}</p>
              </div>

              <div className="mb-10 flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-display font-black italic text-white">{plan.price}</span>
                <span className="text-slate-500 font-black uppercase tracking-widest text-xs italic">{plan.period}</span>
              </div>

              <div className="space-y-4 mb-12 flex-1">
                <p className={cn(
                  "text-[9px] font-black uppercase tracking-widest mb-6 px-3 py-1 rounded-full border inline-block italic",
                  plan.highlight ? "border-[#3B82F6]/30 bg-[#3B82F6]/10 text-[#3B82F6]" : "border-slate-700 bg-slate-800/50 text-slate-500"
                )}>
                  Recursos do Plano
                </p>
                <div className="space-y-6">
                   {plan.features.map((feature, fIdx) => (
                     <div key={fIdx} className="flex items-start gap-4">
                        <div className="mt-1">
                           <Check className="w-3.5 h-3.5 text-[#3B82F6]" />
                        </div>
                        <span className="text-slate-400 text-[11px] font-black uppercase tracking-widest leading-tight italic">{feature}</span>
                     </div>
                   ))}
                </div>
              </div>

              <button className={cn(
                "w-full py-6 rounded-[2rem] font-black italic uppercase text-xs tracking-[0.2em] transition-all font-bold",
                plan.highlight 
                  ? "bg-[#3B82F6] text-white hover:bg-blue-400 hover:scale-105 shadow-[0_20px_50px_rgba(59,130,246,0.2)]" 
                  : "bg-white/5 text-white hover:bg-white/10 border border-white/5"
              )}>
                Selecionar Plano
              </button>
            </motion.div>
          ))}
        </div>

        {/* Bottom Banner */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="bg-[#11161D] rounded-[4rem] p-12 sm:p-20 border border-white/5 text-center mt-32 relative overflow-hidden group shadow-2xl"
        >
           <div className="absolute top-0 left-0 w-64 h-64 bg-[#3B82F6]/5 rounded-full blur-[100px] pointer-events-none" />
           <Target className="w-12 h-12 text-[#3B82F6]/20 mx-auto mb-6" />
           <h4 className="text-3xl sm:text-5xl font-display font-black italic uppercase tracking-tighter mb-8 text-white">Precisa de uma oferta para grandes volumes?</h4>
           <p className="text-slate-500 font-bold uppercase tracking-widest text-xs italic mb-12 max-w-2xl mx-auto leading-relaxed">
              Nossa equipe de parcerias está pronta para criar um plano que acompanhe o crescimento da sua marca esportiva.
           </p>
           <button className="bg-white text-black px-12 py-5 rounded-[2.5rem] font-black italic uppercase text-[10px] tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl font-bold">
              Falar com Comercial
           </button>
        </motion.section>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
