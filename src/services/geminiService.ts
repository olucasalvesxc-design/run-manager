import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface TrainingPlan {
  title: string;
  description: string;
  targetDistance?: string;
  currentLevel?: string;
  daysPerWeek?: number;
  weeksUntilRace?: number;
  schedule: {
    id: string;
    day: string;
    activity: string;
    details: string;
    intensity: 'low' | 'medium' | 'high' | 'rest';
    visualKey: 'running' | 'sprints' | 'stretching' | 'weights' | 'rest' | 'hills' | 'recovery' | 'cycling' | 'swimming' | 'timer' | 'trail';
    steps?: {
      id: string;
      title: string;
      description: string;
      type: 'warmup' | 'main' | 'cooldown' | 'rest';
      duration?: number; // in seconds
      distance?: number; // in meters
    }[];
  }[];
  tips: string[];
}

export const generateTrainingPlan = async (params: {
  targetDistance: string;
  currentLevel: string;
  daysPerWeek: number;
  weeksUntilRace: number;
}): Promise<TrainingPlan> => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("A chave da API Gemini não está configurada. Por favor, adicione GEMINI_API_KEY aos segredos.");
  }
  const { targetDistance, currentLevel, daysPerWeek, weeksUntilRace } = params;

  const prompt = `Crie um plano de treinamento de corrida personalizado com os seguintes detalhes:
Distância Alvo: ${targetDistance}
Nível Atual: ${currentLevel} (Iniciante, Intermediário, Avançado)
Disponibilidade: ${daysPerWeek} dias por semana
Tempo disponível até a prova: ${weeksUntilRace} semanas

O plano deve ser para uma semana "tipo" que represente o ciclo atual do atleta. 
Forneça detalhes técnicos como ritmos, distâncias e exercícios educativos.

Cada treino deve ter uma lista de "steps" (etapas) detalhadas. 
Exemplo: Um treino intervalado de 10x400m deve ter:
1. Aquecimento (15 min leve)
2. Intervalado (10x400m forte com 1min descanso)
3. Desaquecimento (10 min leve)

Para cada item do "schedule", você deve incluir um campo "visualKey" que melhor represente o treino, escolhendo exatamente UM destes categories: 
- 'running': corridas leves ou moderadas
- 'sprints': treinos de velocidade, tiros
- 'stretching': alongamento, yoga, flexibilidade
- 'weights': musculação, fortalecimento
- 'rest': descanso total, sono
- 'hills': treinos em subida, aclives
- 'recovery': trote regenerativo, massagem, liberação
- 'cycling': bike, spinning (se mencionado)
- 'swimming': natação (se mencionado)
- 'timer': treinos de tempo/ritmo
- 'trail': trilhas, terrenos irregulares

Responda em PORTUGUÊS BRASILEIRO.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "Você é um treinador de corrida de elite com anos de experiência preparando atletas para pódios. Sua linguagem é motivadora, técnica e precisa. Você sempre prioriza a segurança do atleta e o descanso estratégico.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["title", "description", "schedule", "tips"],
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            schedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["id", "day", "activity", "details", "intensity", "visualKey", "steps"],
                properties: {
                  id: { type: Type.STRING, description: "ID único para o treino na semana" },
                  day: { type: Type.STRING, description: "Ex: Segunda-feira" },
                  activity: { type: Type.STRING, description: "Ex: Intervalado, Rodagem Leve, Descanso" },
                  details: { type: Type.STRING, description: "Detalhes do treino, ex: 5x1km em ritmo de X min/km" },
                  intensity: { 
                    type: Type.STRING, 
                    enum: ["low", "medium", "high", "rest"] 
                  },
                  visualKey: {
                    type: Type.STRING,
                    enum: ['running', 'sprints', 'stretching', 'weights', 'rest', 'hills', 'recovery', 'cycling', 'swimming', 'timer', 'trail']
                  },
                  steps: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      required: ["id", "title", "description", "type"],
                      properties: {
                        id: { type: Type.STRING },
                        title: { type: Type.STRING, description: "Título da etapa (ex: Aquecimento)" },
                        description: { type: Type.STRING, description: "O que fazer (ex: 2km leve + educativos)" },
                        type: { type: Type.STRING, enum: ["warmup", "main", "cooldown", "rest"] },
                        duration: { type: Type.NUMBER, description: "Duração em segundos (opcional)" },
                        distance: { type: Type.NUMBER, description: "Distância em metros (opcional)" }
                      }
                    }
                  }
                }
              }
            },
            tips: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    return JSON.parse(response.text) as TrainingPlan;
  } catch (error) {
    console.error("Error generating training plan:", error);
    throw new Error("Não foi possível gerar seu treino agora. Tente novamente em alguns instantes.");
  }
};
