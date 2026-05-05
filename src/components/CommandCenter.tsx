import React from 'react';
import { 
  Zap, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  MessageSquare,
  Trophy,
  Users
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface InsightCardProps {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  action: string;
  icon: React.ReactNode;
}

const InsightCard: React.FC<InsightCardProps> = ({ title, description, priority, action, icon }) => {
  const priorityStyles = {
    low: 'border-slate-800 bg-slate-900/50 text-slate-400',
    medium: 'border-amber-500/20 bg-amber-500/5 text-amber-500',
    high: 'border-red-500/20 bg-red-500/5 text-red-500'
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        "p-6 rounded-[2rem] border transition-all hover:scale-[1.02] cursor-default",
        priorityStyles[priority]
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 rounded-xl bg-black/20">
          {icon}
        </div>
        <span className={cn(
          "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
          priority === 'high' ? "bg-red-500/20 text-red-500" : 
          priority === 'medium' ? "bg-amber-500/20 text-amber-500" : 
          "bg-slate-800 text-slate-500"
        )}>
          {priority === 'high' ? 'Crítico' : priority === 'medium' ? 'Importante' : 'Sugestão'}
        </span>
      </div>
      <h4 className="text-sm font-black uppercase italic tracking-tight mb-2 text-white">{title}</h4>
      <p className="text-[10px] font-medium leading-relaxed mb-4 opacity-70">{description}</p>
      <button className="text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all text-white">
        {action}
        <TrendingUp className="w-3 h-3" />
      </button>
    </motion.div>
  );
};

interface CommandCenterProps {
  stats: {
    totalClients: number;
    pendingPayments: number;
    completionRate: number;
    topRace?: string;
    recentActivitiesCount: number;
  };
}

export const CommandCenter: React.FC<CommandCenterProps> = ({ stats }) => {
  const insights: InsightCardProps[] = [];

  if (stats.pendingPayments > 0) {
    insights.push({
      title: 'Pagamentos Pendentes',
      description: `Existem ${stats.pendingPayments} atletas com pagamentos em atraso ou pendentes.`,
      priority: stats.pendingPayments > 5 ? 'high' : 'medium',
      action: 'Enviar Lembrete WhatsApp',
      icon: <AlertCircle className="w-5 h-5" />
    });
  }

  if (stats.completionRate < 60) {
    insights.push({
      title: 'Taxa de Conclusão Baixa',
      description: `A taxa de conclusão semanal está em ${stats.completionRate}%. Isso pode indicar falta de engajamento.`,
      priority: 'high',
      action: 'Ver Relatório de Adesão',
      icon: <Zap className="w-5 h-5" />
    });
  } else if (stats.completionRate > 85) {
    insights.push({
      title: 'Performance Excelente',
      description: `Parabéns! Sua taxa de conclusão está em ${stats.completionRate}%. Seus atletas estão focados.`,
      priority: 'low',
      action: 'Elogiar no Grupo',
      icon: <CheckCircle2 className="w-5 h-5" />
    });
  }

  if (stats.topRace) {
    insights.push({
      title: 'Líder de Inscrições',
      description: `Sua corrida "${stats.topRace}" é o evento com maior procura atual.`,
      priority: 'low',
      action: 'Ver Detalhes da Corrida',
      icon: <Trophy className="w-5 h-5" />
    });
  }

  if (stats.recentActivitiesCount === 0) {
    insights.push({
      title: 'Sem Treinos Hoje',
      description: 'Nenhum atleta concluiu treinos nas últimas 24h. Envie uma mensagem de incentivo.',
      priority: 'medium',
      action: 'Abrir Mural',
      icon: <Clock className="w-5 h-5" />
    });
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center border border-[#3B82F6]/20">
          <Zap className="w-4 h-4 text-[#3B82F6]" />
        </div>
        <h2 className="text-xl font-display font-black italic uppercase tracking-tighter text-white">Command Center</h2>
        <div className="h-[1px] flex-1 bg-white/5" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {insights.length > 0 ? insights.map((insight, i) => (
          <InsightCard key={i} {...insight} />
        )) : (
          <div className="col-span-full border-2 border-dashed border-white/5 rounded-[2.5rem] py-12 text-center">
             <CheckCircle2 className="w-12 h-12 text-slate-800 mx-auto mb-4" />
             <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Tudo sob controle. Nenhum insight crítico no momento.</p>
          </div>
        )}
      </div>
    </section>
  );
};
