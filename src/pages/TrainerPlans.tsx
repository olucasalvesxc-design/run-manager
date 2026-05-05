import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { 
  Check, 
  Zap, 
  Dumbbell, 
  Users, 
  BarChart3, 
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Star
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

const TrainerPlans = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);

  const plans = [
    {
      id: 'free',
      name: 'Básico',
      description: 'Perfeito para começar sua consultoria online.',
      price: 0,
      icon: <Users className="w-6 h-6" />,
      features: [
        'Até 5 alunos ativos',
        'Gestão de treinos simples',
        'Suporte por e-mail',
        'Dashboard básico'
      ],
      color: 'slate',
      badge: 'Start'
    },
    {
      id: 'pro',
      name: 'Pro Trainer',
      description: 'A ferramenta completa para o personal de sucesso.',
      price: 49.90,
      icon: <TrendingUp className="w-6 h-6" />,
      features: [
        'Até 30 alunos ativos',
        'Biblioteca de exercícios',
        'Relatórios de evolução',
        'Gestão de pagamentos',
        'Suporte prioritário'
      ],
      recommended: true,
      color: 'yellow',
      badge: 'Popular'
    },
    {
      id: 'elite',
      name: 'Elite Studio',
      description: 'Escalabilidade total para sua marca esportiva.',
      price: 99.90,
      icon: <Star className="w-6 h-6" />,
      features: [
        'Alunos ilimitados',
        'App personalizado (PWA)',
        'Integração total com eventos',
        'Consultoria de negócios',
        'Suporte 24/7 VIP'
      ],
      color: 'blue',
      badge: 'Unlimited'
    }
  ];

  const handleSubscribe = async (planId: string) => {
    if (!user) return;
    setLoading(planId);
    try {
      await updateDoc(doc(db, 'profiles', user.uid), {
        isTrainer: true,
        trainerPlan: planId,
        trainerPlanStatus: 'active',
        updatedAt: serverTimestamp()
      });
      navigate('/dashboard/trainer');
    } catch (err) {
      alert('Erro ao ativar plano');
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-16 py-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400/10 rounded-full border border-yellow-400/20 text-yellow-400 mb-4">
          <Zap className="w-4 h-4 fill-current" />
          <span className="text-[10px] font-black uppercase tracking-widest italic">Expansão Personal Trainer</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-display font-black italic uppercase tracking-tighter leading-none">
          Transforme sua <br /> <span className="text-yellow-400">Consultoria.</span>
        </h1>
        <p className="text-slate-500 text-sm md:text-base font-medium italic max-w-lg mx-auto">
          Crie treinos, gerencie alunos e escale sua marca com as ferramentas mais avançadas do mercado esportivo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <motion.div
            key={plan.id}
            whileHover={{ y: -8 }}
            className={cn(
              "relative p-8 rounded-[3rem] border transition-all duration-500 overflow-hidden group flex flex-col",
              plan.recommended 
                ? "bg-slate-900 border-yellow-400/50 shadow-[0_30px_60px_-20px_rgba(250,204,21,0.2)]" 
                : "bg-slate-900/50 border-white/5 hover:bg-slate-900"
            )}
          >
            {plan.recommended && (
              <div className="absolute top-0 right-0 bg-yellow-400 text-slate-950 px-6 py-2 rounded-bl-3xl font-black text-[10px] uppercase tracking-widest italic">
                {plan.badge}
              </div>
            )}
            
            <div className={cn(
               "w-14 h-14 rounded-2xl flex items-center justify-center mb-8 border transition-transform group-hover:scale-110 duration-500",
               plan.color === 'yellow' ? "bg-yellow-400/10 border-yellow-400/20" : 
               plan.color === 'blue' ? "bg-blue-400/10 border-blue-400/20" : "bg-slate-800 border-white/10"
            )}>
              {React.cloneElement(plan.icon as React.ReactElement, { 
                className: cn(
                  "w-7 h-7",
                  plan.color === 'yellow' ? "text-yellow-400" : 
                  plan.color === 'blue' ? "text-blue-400" : "text-slate-400"
                )
              })}
            </div>

            <div className="space-y-4 mb-10">
              <h3 className="text-3xl font-display font-black uppercase italic tracking-wider">{plan.name}</h3>
              <p className="text-xs text-slate-400 font-medium italic leading-relaxed">{plan.description}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-display font-black italic tracking-tighter">
                  {plan.price === 0 ? 'GRÁTIS' : `R$ ${plan.price.toFixed(2)}`}
                </span>
                {plan.price > 0 && <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic text-center">/ mês</span>}
              </div>
            </div>

            <ul className="space-y-4 flex-1 mb-10">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3 text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-slate-950 border border-white/10 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-yellow-400" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-tight">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan.id)}
              disabled={loading !== null}
              className={cn(
                "w-full py-5 rounded-2xl font-black italic uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95",
                plan.recommended 
                  ? "bg-yellow-400 text-slate-950 hover:bg-yellow-300 shadow-xl" 
                  : "bg-white/5 text-white border border-white/10 hover:bg-white/10"
              )}
            >
              {loading === plan.id ? <BarChart3 className="w-5 h-5 animate-spin" /> : (
                <>
                  {plan.price === 0 ? 'Começar Agora' : 'Assinar Plano'}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </motion.div>
        ))}
      </div>

      <div className="bg-slate-900/30 rounded-[3rem] border border-white/5 p-12 relative overflow-hidden text-center">
         <div className="absolute top-0 left-0 p-8 opacity-5">
           <ShieldCheck className="w-32 h-32" />
         </div>
         <div className="relative z-10 space-y-6">
            <h4 className="text-2xl font-display font-black italic uppercase tracking-wider">Compromisso com sua evolução</h4>
            <p className="text-slate-400 text-xs font-medium max-w-lg mx-auto leading-loose italic">
              Não cobramos comissão sobre suas aulas. O valor da mensalidade é fixo e você retém 100% do lucro da sua consultoria. Cancelamento grátis a qualquer momento.
            </p>
         </div>
      </div>
    </div>
  );
};

export default TrainerPlans;
