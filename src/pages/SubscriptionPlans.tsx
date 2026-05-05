import React from 'react';
import { motion } from 'motion/react';
import { 
  Zap, 
  Check, 
  Crown, 
  Trophy, 
  ArrowRight, 
  ArrowLeft,
  Infinity,
  Users,
  Target,
  Rocket
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';

const plans = [
  {
    id: 'free',
    name: 'START',
    price: '0',
    description: 'Para quem está começando a organizar seus primeiros eventos.',
    features: [
      'Até 1 corrida ativa',
      'Até 50 atletas por corrida',
      'Recebimento via Pix Manual',
      'Dashboard Básico',
      'Suporte via E-mail'
    ],
    highlight: false,
    icon: <Trophy className="w-8 h-8" />,
    color: 'slate',
    buttonText: 'Plano Atual'
  },
  {
    id: 'pro',
    name: 'PRO RUNNER',
    price: '49,90',
    description: 'Ideal para organizadores frequentes e assessorias em crescimento.',
    features: [
      'Corridas Ilimitadas',
      'Até 200 atletas por corrida',
      'Recebimento via Pix Manual',
      'Dashboard Avançado',
      'Exportação de Listas (Excel)',
      'Suporte via WhatsApp',
      'Selos de Verificação'
    ],
    highlight: true,
    icon: <Zap className="w-8 h-8" />,
    color: 'yellow',
    buttonText: 'Quero este',
    kirvanoUrl: 'https://pay.kirvano.com/pro-plan' // Placeholder
  },
  {
    id: 'master',
    name: 'MASTER ELITE',
    price: '149,90',
    description: 'A experiência completa para grandes eventos e marcas profissionais.',
    features: [
      'Tudo do Plano Pro',
      'Atletas Ilimitados',
      'Personalização de Certificados',
      'Gerenciamento de Equipes',
      'Marketing & Analytics',
      'Suporte Prioritário 24/7',
      'Taxas Reduzidas'
    ],
    highlight: false,
    icon: <Crown className="w-8 h-8" />,
    color: 'red',
    buttonText: 'Quero este',
    kirvanoUrl: 'https://pay.kirvano.com/elite-plan' // Placeholder
  }
];

const SubscriptionPlans = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const currentPlan = profile?.planName || 'START';

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-yellow-400/30 pb-20">
      <div className="container mx-auto px-6 pt-12 md:pt-24 flex flex-col items-center">
        
        {/* Header */}
        <div className="w-full max-w-4xl mb-20">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Voltar ao Dashboard
          </button>
          
          <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400 text-black font-black text-[10px] uppercase tracking-[0.2em] italic mb-6">
                <Rocket className="w-4 h-4" />
                Planos & Upgrade
              </div>
              <h1 className="text-4xl md:text-7xl font-display font-black text-white italic tracking-tighter uppercase leading-[0.85]">
                Potencialize <br /> sua <span className="text-yellow-400">Organização</span>
              </h1>
            </div>
            <div className="max-w-xs text-right hidden md:block">
              <p className="text-slate-500 font-bold italic uppercase text-xs leading-relaxed">
                Escolha o plano que melhor se adapta ao tamanho do seu evento e escale sua operação.
              </p>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-7xl">
          {plans.map((plan, index) => {
            const isCurrent = currentPlan.toUpperCase() === plan.name.toUpperCase() || (plan.id === 'free' && (!currentPlan || currentPlan === 'START'));
            
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "relative group rounded-[3.5rem] p-8 lg:p-12 border-2 transition-all duration-500 flex flex-col",
                  plan.highlight 
                    ? "bg-slate-900 border-yellow-400 shadow-[0_0_80px_rgba(250,204,21,0.1)] scale-105 z-10" 
                    : "bg-slate-900/50 border-slate-800 hover:border-slate-700 shadow-2xl"
                )}
              >
                {plan.highlight && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-yellow-400 text-slate-950 px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-[0.2em] italic shadow-xl z-20">
                    MAIS POPULAR
                  </div>
                )}

                <div className="mb-10 flex items-center justify-between">
                  <div className={cn(
                    "w-16 h-16 rounded-3xl flex items-center justify-center transition-transform group-hover:rotate-12",
                    plan.color === 'yellow' ? "bg-yellow-400 text-slate-950" : 
                    plan.color === 'red' ? "bg-red-500 text-white" : "bg-slate-800 text-white"
                  )}>
                    {plan.icon}
                  </div>
                  <div className="text-right">
                    <span className="text-4xl lg:text-5xl font-display font-black italic tracking-tighter text-white">R$ {plan.price}</span>
                    <span className="text-[10px] font-black text-slate-500 uppercase block tracking-widest mt-1">/mês</span>
                  </div>
                </div>

                <div className="mb-10">
                  <h3 className="text-2xl lg:text-3xl font-display font-black text-white italic tracking-tighter uppercase mb-3">{plan.name}</h3>
                  <p className="text-slate-500 text-xs font-medium leading-relaxed italic">{plan.description}</p>
                </div>

                <div className="space-y-4 mb-12 flex-1">
                  {plan.features.map((feature, fIndex) => (
                    <div key={fIndex} className="flex items-center gap-3">
                      <div className={cn(
                        "w-5 h-5 rounded-lg flex items-center justify-center shrink-0 border",
                        plan.highlight ? "border-yellow-400/30 bg-yellow-400/10 text-yellow-400" : "border-slate-700 bg-slate-800/50 text-slate-500"
                      )}>
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  disabled={isCurrent}
                  onClick={() => {
                    if (plan.kirvanoUrl) window.open(plan.kirvanoUrl, '_blank');
                  }}
                  className={cn(
                    "w-full py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] italic transition-all flex items-center justify-center gap-3",
                    isCurrent 
                      ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-default" 
                      : plan.highlight 
                        ? "bg-yellow-400 text-slate-950 hover:bg-yellow-300 hover:scale-105 shadow-[0_20px_50px_rgba(250,204,21,0.2)]" 
                        : "bg-white text-slate-950 hover:bg-slate-200 hover:scale-105 shadow-xl"
                  )}
                >
                  {isCurrent ? 'Planos Atual' : plan.buttonText}
                  {!isCurrent && <ArrowRight className="w-4 h-4" />}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Comparison and FAQ footer */}
        <div className="mt-32 w-full max-w-4xl bg-slate-900/30 border border-slate-800 rounded-[3rem] p-12 text-center relative overflow-hidden">
           <div className="absolute top-0 left-0 w-64 h-64 bg-yellow-400/5 rounded-full blur-[100px] pointer-events-none"></div>
           <Target className="w-12 h-12 text-yellow-400/20 mx-auto mb-6" />
           <h4 className="text-xl font-display font-black text-white italic uppercase tracking-tighter mb-4">Dúvidas sobre os planos?</h4>
           <p className="text-slate-500 text-xs font-medium max-w-lg mx-auto leading-relaxed mb-8">
             Nossa equipe está pronta para ajudar você a escolher o melhor caminho para o seu negócio. 
             Entre em contato para orçamentos personalizados ou eventos de grande porte.
           </p>
           <a 
             href="https://wa.me/5581989768406" 
             target="_blank" 
             rel="noopener noreferrer"
             className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
           >
             FALAR COM UM ESPECIALISTA <ArrowRight className="w-4 h-4" />
           </a>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
