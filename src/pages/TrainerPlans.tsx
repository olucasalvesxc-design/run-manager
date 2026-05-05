import React from 'react';
import { Check, ShieldCheck, Zap, Star, Trophy, Users, TrendingUp } from 'lucide-react';
import { cn } from '../lib/utils';

const TrainerPlans = () => {
  const plans = [
    {
      name: 'Starter',
      price: 'R$ 149',
      period: '/mês',
      description: 'Ideal para treinadores que estão começando agora.',
      features: [
        'Até 10 alunos ativos',
        'Planilhas de treino ilimitadas',
        'Chat dentro do portal',
        'Gestão básica financeira',
        'Suporte por e-mail'
      ],
      color: 'blue'
    },
    {
      name: 'Elite',
      price: 'R$ 297',
      period: '/mês',
      description: 'O plano mais popular para assessorias em crescimento.',
      features: [
        'Até 50 alunos ativos',
        'Dashboard de performance I.A.',
        'Gerador de treinos automático',
        'Relatórios avançados',
        'Suporte prioritário WhatsApp',
        'Multi-treinadores (até 2)'
      ],
      highlight: true,
      color: 'blue'
    },
    {
      name: 'Performance Lab',
      price: 'R$ 597',
      period: '/mês',
      description: 'Para grandes assessorias que buscam escala e excelência.',
      features: [
        'Alunos ilimitados',
        'Tudo no plano Elite',
        'Customização White Label',
        'Integração com Strava/Garmin',
        'Consultoria de negócios',
        'Multi-treinadores ilimitados'
      ],
      color: 'blue'
    }
  ];

  return (
    <div className="space-y-12 pb-20">
      <header className="text-center space-y-4 pt-12 sm:pt-20">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#3B82F6]/10 rounded-full border border-[#3B82F6]/20 text-[#3B82F6] mb-4">
           <Zap className="w-4 h-4 fill-current" />
           <span className="text-[10px] font-black uppercase tracking-widest italic">Acelere seu Crescimento</span>
        </div>
        <h1 className="text-5xl sm:text-8xl font-display font-black italic uppercase tracking-tighter leading-none mb-8">
          Transforme sua <br /> <span className="text-[#3B82F6]">Consultoria.</span>
        </h1>
        <p className="max-w-xl mx-auto text-slate-500 font-bold uppercase tracking-[0.2em] italic text-xs leading-relaxed">
          Escolha o plano ideal para gerir seus atletas com tecnologia de elite e performance comprovada.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-6">
        {plans.map((plan, idx) => (
          <div 
            key={idx}
            className={cn(
              "relative p-10 rounded-[3rem] border border-white/5 flex flex-col h-full group hover:translate-y-[-10px] transition-all duration-500",
              plan.highlight 
                ? "bg-slate-900 border-[#3B82F6]/50 shadow-[0_30px_60px_-20px_rgba(59,130,246,0.2)]" 
                : "bg-black/40 hover:bg-white/5"
            )}
          >
            {plan.highlight && (
              <div className="absolute top-0 right-0 bg-[#3B82F6] text-white px-6 py-2 rounded-bl-3xl font-black text-[10px] uppercase tracking-widest italic font-bold">
                Mais Popular
              </div>
            )}

            <div className="mb-10">
               <div className={cn(
                 "w-16 h-16 rounded-2xl flex items-center justify-center mb-6",
                 plan.color === 'blue' ? "bg-[#3B82F6]/10 border-[#3B82F6]/20" : 
                 "bg-gray-800 border-white/10"
               )}>
                  <ShieldCheck className={cn(
                    "w-8 h-8",
                    plan.color === 'blue' ? "text-[#3B82F6]" : "text-white"
                  )} />
               </div>
               <h3 className="text-2xl font-display font-black italic uppercase tracking-wider text-white mb-2">{plan.name}</h3>
               <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-relaxed italic">{plan.description}</p>
            </div>

            <div className="mb-10 flex items-baseline gap-1">
               <span className="text-5xl font-display font-black italic text-white">{plan.price}</span>
               <span className="text-slate-500 font-black uppercase tracking-widest text-xs italic">{plan.period}</span>
            </div>

            <ul className="space-y-4 mb-12 flex-1">
               {plan.features.map((feature, fIdx) => (
                 <li key={fIdx} className="flex items-start gap-3">
                    <div className="mt-1">
                       <Check className="w-3 h-3 text-[#3B82F6]" />
                    </div>
                    <span className="text-slate-400 text-[11px] font-black uppercase tracking-widest leading-tight italic">{feature}</span>
                 </li>
               ))}
            </ul>

            <button className={cn(
              "w-full py-5 rounded-2xl font-black italic uppercase text-xs tracking-[0.2em] transition-all font-bold",
              plan.highlight 
                ? "bg-[#3B82F6] text-white hover:bg-blue-400 shadow-xl" 
                : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
            )}>
              {idx === 2 ? 'Falar com Especialista' : 'Assinar Plano'}
            </button>
          </div>
        ))}
      </div>

      <section className="bg-[#11161D] rounded-[4rem] p-12 sm:p-20 border border-white/5 max-w-7xl mx-auto mx-6 text-center mt-20">
         <h4 className="text-2xl sm:text-4xl font-display font-black italic uppercase tracking-tighter mb-8">Dúvidas sobre qual escolher?</h4>
         <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] sm:text-xs italic mb-12 max-w-2xl mx-auto leading-relaxed">
            Nossa equipe está pronta para ajudar você a escalar sua assessoria com o melhor da tecnologia.
         </p>
         <button className="bg-white/5 border border-white/10 text-white px-10 py-5 rounded-2xl font-black italic uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all font-bold">
            Agendar Demonstração
         </button>
      </section>
    </div>
  );
};

export default TrainerPlans;
