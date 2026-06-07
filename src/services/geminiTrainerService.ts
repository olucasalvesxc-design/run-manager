import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface FitnessProfile {
  goal: string;
  age: number;
  weight: number;
  height: number;
  level: 'iniciante' | 'intermediario' | 'avancado';
  location: 'academia' | 'casa' | 'condominio' | 'ar_livre';
  daysPerWeek: number;
  minutesPerSession: number;
  limitations?: string;
  injuries?: string;
  gender?: 'masculino' | 'feminino';
}

export interface AIExercise {
  id: string;
  name: string;
  series: number;
  reps: string;
  restSeconds: number;
  notes: string;
  muscleGroup: string;
  technique: string;
  weight?: string;
}

export interface WorkoutDay {
  dayIndex: number;
  dayName: string;
  isRest: boolean;
  focus: string;
  muscleGroups: string[];
  exercises: AIExercise[];
  estimatedMinutes: number;
  tips: string[];
}

export interface AIPlan {
  title: string;
  description: string;
  goal: string;
  level: string;
  totalWeeks: number;
  weeklySchedule: WorkoutDay[];
  generalTips: string[];
  nutritionTips: string[];
  progressionPlan: string;
}

export interface AIInsight {
  headline: string;
  message: string;
  recommendations: string[];
  nextGoal: string;
  motivationalPhrase: string;
  alertLevel: 'success' | 'warning' | 'info';
}

const GOAL_LABELS: Record<string, string> = {
  hipertrofia:   'Hipertrofia e ganho de massa muscular',
  emagrecimento: 'Emagrecimento e perda de gordura',
  forca:         'Ganho de força máxima',
  condicionamento:'Condicionamento físico e resistência',
  corrida:       'Performance e resistência em corrida',
  saude_geral:   'Saúde geral e bem-estar',
  calistenia:    'Calistenia e movimentos com peso corporal',
  funcional:     'Treino funcional e mobilidade',
};

const LOCATION_LABELS: Record<string, string> = {
  academia:    'Academia completa (todos os equipamentos)',
  casa:        'Casa (apenas peso corporal e itens básicos)',
  condominio:  'Academia de condomínio (equipamentos básicos)',
  ar_livre:    'Ar livre — parques e espaços externos',
};

const LEVEL_LABELS: Record<string, string> = {
  iniciante:     'Iniciante (menos de 1 ano de treino regular)',
  intermediario: 'Intermediário (1-3 anos de treino regular)',
  avancado:      'Avançado (mais de 3 anos com treino consistente)',
};

export const generateFitnessPlan = async (profile: FitnessProfile): Promise<AIPlan> => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY não configurada.");
  }

  const bmi = profile.weight / ((profile.height / 100) ** 2);

  const prompt = `Você é o NEXUS TRAINER AI, o personal trainer virtual mais avançado do Brasil. Crie um plano de treino COMPLETO, DETALHADO e PERSONALIZADO.

═══ PERFIL DO ATLETA ═══
• Objetivo principal: ${GOAL_LABELS[profile.goal] || profile.goal}
• Sexo: ${profile.gender === 'feminino' ? 'Feminino' : 'Masculino'}
• Idade: ${profile.age} anos
• Peso: ${profile.weight}kg | Altura: ${profile.height}cm | IMC: ${bmi.toFixed(1)}
• Nível de experiência: ${LEVEL_LABELS[profile.level] || profile.level}
• Local de treino: ${LOCATION_LABELS[profile.location] || profile.location}
• Disponibilidade: ${profile.daysPerWeek} dias/semana | ${profile.minutesPerSession} minutos por sessão
${profile.limitations ? `• Limitações físicas: ${profile.limitations}` : ''}
${profile.injuries ? `• Histórico de lesões: ${profile.injuries}` : ''}

═══ INSTRUÇÕES ═══
1. Crie um plano semanal com EXATAMENTE 7 dias (${profile.daysPerWeek} treinos + ${7 - profile.daysPerWeek} descanso)
2. Para cada dia de treino, liste 4-8 exercícios com séries, repetições e descanso específicos
3. Adapte TODOS os exercícios ao local de treino informado
4. Respeite TODAS as limitações e lesões mencionadas
5. Para iniciantes: exercícios básicos, volume moderado, foco em técnica
6. Para avançados: técnicas avançadas (drop sets, supersets, periodização)
7. Inclua dicas nutricionais específicas para o objetivo
8. Inclua um plano de progressão de cargas ao longo das semanas

Responda em PORTUGUÊS BRASILEIRO com linguagem técnica mas acessível.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-05-20",
    contents: prompt,
    config: {
      systemInstruction:
        "Você é o NEXUS TRAINER AI — personal trainer virtual de elite com expertise em fisiologia do exercício, nutrição esportiva e ciência do treinamento. Crie planos altamente personalizados, seguros, progressivos e eficientes. Sempre priorize a segurança e a técnica correta.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        required: ["title", "description", "goal", "level", "totalWeeks", "weeklySchedule", "generalTips", "nutritionTips", "progressionPlan"],
        properties: {
          title:           { type: Type.STRING },
          description:     { type: Type.STRING },
          goal:            { type: Type.STRING },
          level:           { type: Type.STRING },
          totalWeeks:      { type: Type.NUMBER },
          progressionPlan: { type: Type.STRING },
          generalTips:    { type: Type.ARRAY, items: { type: Type.STRING } },
          nutritionTips:  { type: Type.ARRAY, items: { type: Type.STRING } },
          weeklySchedule: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              required: ["dayIndex", "dayName", "isRest", "focus", "muscleGroups", "exercises", "estimatedMinutes", "tips"],
              properties: {
                dayIndex:        { type: Type.NUMBER },
                dayName:         { type: Type.STRING },
                isRest:          { type: Type.BOOLEAN },
                focus:           { type: Type.STRING },
                muscleGroups:    { type: Type.ARRAY, items: { type: Type.STRING } },
                estimatedMinutes:{ type: Type.NUMBER },
                tips:            { type: Type.ARRAY, items: { type: Type.STRING } },
                exercises: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    required: ["id", "name", "series", "reps", "restSeconds", "notes", "muscleGroup", "technique"],
                    properties: {
                      id:          { type: Type.STRING },
                      name:        { type: Type.STRING },
                      series:      { type: Type.NUMBER },
                      reps:        { type: Type.STRING },
                      restSeconds: { type: Type.NUMBER },
                      notes:       { type: Type.STRING },
                      muscleGroup: { type: Type.STRING },
                      technique:   { type: Type.STRING },
                      weight:      { type: Type.STRING },
                    }
                  }
                },
              }
            }
          }
        }
      }
    }
  });

  return JSON.parse(response.text) as AIPlan;
};

export const generateAIInsight = async (stats: {
  totalWorkouts: number;
  currentStreak: number;
  thisWeekWorkouts: number;
  goalDaysPerWeek: number;
  recentPRs: number;
  userName: string;
  goal: string;
  daysSinceLastWorkout: number;
}): Promise<AIInsight> => {
  if (!process.env.GEMINI_API_KEY) {
    const weekProgress = (stats.thisWeekWorkouts / stats.goalDaysPerWeek) * 100;
    return {
      headline: stats.currentStreak > 3 ? "Sequência Incrível!" : "Continue Evoluindo!",
      message:
        stats.daysSinceLastWorkout > 2
          ? `Faz ${stats.daysSinceLastWorkout} dias desde o último treino. Hora de voltar à ação!`
          : `${stats.thisWeekWorkouts} de ${stats.goalDaysPerWeek} treinos esta semana. ${weekProgress >= 100 ? 'Meta batida!' : 'Mantenha o ritmo!'}`,
      recommendations: [
        "Mantenha a regularidade — consistência supera intensidade",
        "Hidrate-se bem antes, durante e após os treinos",
        "Durma 7-9 horas para máxima recuperação muscular",
      ],
      nextGoal:
        stats.thisWeekWorkouts < stats.goalDaysPerWeek
          ? `Complete mais ${stats.goalDaysPerWeek - stats.thisWeekWorkouts} treino(s) esta semana`
          : "Planeje os treinos da próxima semana",
      motivationalPhrase: "A consistência supera a perfeição. Um dia de cada vez.",
      alertLevel: stats.daysSinceLastWorkout > 3 ? 'warning' : stats.currentStreak >= 7 ? 'success' : 'info',
    };
  }

  const prompt = `Como NEXUS TRAINER AI, analise os dados do atleta e forneça insights personalizados em português:

Atleta: ${stats.userName}
Objetivo: ${GOAL_LABELS[stats.goal] || stats.goal}
Total de treinos realizados: ${stats.totalWorkouts}
Sequência atual: ${stats.currentStreak} dias consecutivos
Treinos esta semana: ${stats.thisWeekWorkouts} de ${stats.goalDaysPerWeek}
Dias desde o último treino: ${stats.daysSinceLastWorkout}
Recordes pessoais recentes: ${stats.recentPRs}

Forneça análise motivacional, insights sobre desempenho e recomendações específicas.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-05-20",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        required: ["headline", "message", "recommendations", "nextGoal", "motivationalPhrase", "alertLevel"],
        properties: {
          headline:          { type: Type.STRING },
          message:           { type: Type.STRING },
          recommendations:   { type: Type.ARRAY, items: { type: Type.STRING } },
          nextGoal:          { type: Type.STRING },
          motivationalPhrase:{ type: Type.STRING },
          alertLevel:        { type: Type.STRING, enum: ["success", "warning", "info"] },
        }
      }
    }
  });

  return JSON.parse(response.text) as AIInsight;
};
