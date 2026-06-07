export type AnimationType = 'press' | 'pull' | 'squat' | 'hinge' | 'push' | 'curl' | 'extend' | 'raise' | 'plank' | 'row';
export type ExerciseLevel = 'iniciante' | 'intermediario' | 'avancado';
export type MuscleGroupId = 'peito' | 'costas' | 'ombros' | 'biceps' | 'triceps' | 'abdomen' | 'quadriceps' | 'posterior' | 'gluteos' | 'panturrilha';

export interface ExerciseEntry {
  id: string;
  name: string;
  muscles: MuscleGroupId[];
  primaryMuscle: MuscleGroupId;
  level: ExerciseLevel;
  equipment: string[];
  category: string;
  description: string;
  execution: string[];
  commonMistakes: string[];
  tips: string[];
  animationType: AnimationType;
}

export interface MuscleGroup {
  id: MuscleGroupId;
  name: string;
  color: string;
  glowColor: string;
}

export const MUSCLE_GROUPS: MuscleGroup[] = [
  { id: 'peito',       name: 'Peito',       color: '#3b82f6', glowColor: 'rgba(59,130,246,0.4)' },
  { id: 'costas',      name: 'Costas',      color: '#8b5cf6', glowColor: 'rgba(139,92,246,0.4)' },
  { id: 'ombros',      name: 'Ombros',      color: '#06b6d4', glowColor: 'rgba(6,182,212,0.4)'  },
  { id: 'biceps',      name: 'Bíceps',      color: '#10b981', glowColor: 'rgba(16,185,129,0.4)' },
  { id: 'triceps',     name: 'Tríceps',     color: '#f59e0b', glowColor: 'rgba(245,158,11,0.4)' },
  { id: 'abdomen',     name: 'Abdômen',     color: '#ef4444', glowColor: 'rgba(239,68,68,0.4)'  },
  { id: 'quadriceps',  name: 'Quadríceps',  color: '#ec4899', glowColor: 'rgba(236,72,153,0.4)' },
  { id: 'posterior',   name: 'Posterior',   color: '#f97316', glowColor: 'rgba(249,115,22,0.4)' },
  { id: 'gluteos',     name: 'Glúteos',     color: '#84cc16', glowColor: 'rgba(132,204,22,0.4)' },
  { id: 'panturrilha', name: 'Panturrilha', color: '#14b8a6', glowColor: 'rgba(20,184,166,0.4)' },
];

export const EXERCISE_DATABASE: ExerciseEntry[] = [
  // ─── PEITO ─────────────────────────────────────────────────────────────
  {
    id: 'supino_reto',
    name: 'Supino Reto',
    muscles: ['peito', 'triceps', 'ombros'],
    primaryMuscle: 'peito',
    level: 'iniciante',
    equipment: ['Barra', 'Banco'],
    category: 'Peito',
    description: 'Exercício fundamental para o peitoral médio. Principal movimento de empurrar horizontal da musculação.',
    execution: [
      'Deite no banco com os pés firmes no chão',
      'Posicione a barra acima do peito com pegada levemente mais larga que os ombros',
      'Desça a barra controlando até tocar levemente o peito',
      'Empurre explosivamente de volta ao ponto inicial',
      'Trave os cotovelos no topo sem hiperestender'
    ],
    commonMistakes: [
      'Arquear excessivamente a lombar',
      'Quicar a barra no peito',
      'Cotovelos a 90° do tronco (risco de lesão no ombro)',
      'Não controlar a fase excêntrica (descida)'
    ],
    tips: [
      'Mantenha os ombros retraídos e deprimidos durante todo o movimento',
      'Ângulo ideal dos cotovelos: 45-75° do tronco',
      'Inspire na descida, expire na empurrada'
    ],
    animationType: 'press'
  },
  {
    id: 'supino_inclinado',
    name: 'Supino Inclinado',
    muscles: ['peito', 'ombros', 'triceps'],
    primaryMuscle: 'peito',
    level: 'iniciante',
    equipment: ['Barra', 'Banco Inclinado'],
    category: 'Peito',
    description: 'Variação do supino que prioriza o peitoral superior (clavicular). Essencial para um peito completo.',
    execution: [
      'Ajuste o banco entre 30-45° de inclinação',
      'Posicione-se com as escápulas retraídas no banco',
      'Desça a barra à parte superior do peito',
      'Empurre de volta ao ponto inicial mantendo os cotovelos a 60°'
    ],
    commonMistakes: [
      'Inclinação acima de 45° (vira exercício de ombros)',
      'Deixar os ombros elevarem durante o movimento'
    ],
    tips: ['30° de inclinação é o ângulo ideal para hipertrofia do peitoral superior'],
    animationType: 'press'
  },
  {
    id: 'crucifixo_halteres',
    name: 'Crucifixo com Halteres',
    muscles: ['peito', 'ombros'],
    primaryMuscle: 'peito',
    level: 'iniciante',
    equipment: ['Halteres', 'Banco'],
    category: 'Peito',
    description: 'Exercício de isolamento para o peitoral com ênfase no alongamento. Trabalha a amplitude total do músculo.',
    execution: [
      'Deite no banco com halteres nas mãos acima do peito',
      'Palmas voltadas uma para a outra',
      'Abra os braços em arco amplo controlando',
      'Sinta o alongamento máximo do peito',
      'Feche em arco de volta à posição inicial'
    ],
    commonMistakes: [
      'Usar carga excessiva que sobrecarrega o ombro',
      'Flexionar demais os cotovelos (vira supino)'
    ],
    tips: ['Foque em sentir o alongamento do peito na parte inferior do movimento'],
    animationType: 'press'
  },
  {
    id: 'flexao_bracos',
    name: 'Flexão de Braço',
    muscles: ['peito', 'triceps', 'ombros'],
    primaryMuscle: 'peito',
    level: 'iniciante',
    equipment: ['Sem equipamento'],
    category: 'Peito',
    description: 'Exercício de peso corporal fundamental. Eficaz para peito e tríceps em qualquer ambiente.',
    execution: [
      'Mãos levemente mais largas que os ombros no chão',
      'Corpo em linha reta da cabeça aos calcanhares',
      'Desça o peito até quase tocar o solo',
      'Empurre de volta mantendo o core ativado'
    ],
    commonMistakes: [
      'Quadril elevado ou afundado',
      'Cotovelos muito abertos (> 90°)',
      'Cabeça avançada à frente do tronco'
    ],
    tips: ['Variações: diamante (tríceps), larga (peito externo), declinada (peitoral superior)'],
    animationType: 'push'
  },
  {
    id: 'crossover_polia',
    name: 'Crossover na Polia',
    muscles: ['peito', 'ombros'],
    primaryMuscle: 'peito',
    level: 'iniciante',
    equipment: ['Polia Alta'],
    category: 'Peito',
    description: 'Isolamento para o peitoral com tensão constante ao longo de todo o movimento.',
    execution: [
      'Posicione-se entre as polias com handles nas mãos',
      'Ligeira inclinação à frente com um pé à frente',
      'Traga as mãos para o centro cruzando levemente',
      'Controle o retorno mantendo a tensão'
    ],
    commonMistakes: ['Usar os braços como alavanca (usar as costas)', 'Não controlar o retorno'],
    tips: ['Polia alta: peito inferior. Polia baixa: peito superior. Polia na altura do peito: médio'],
    animationType: 'press'
  },

  // ─── COSTAS ────────────────────────────────────────────────────────────
  {
    id: 'puxada_frente',
    name: 'Puxada Frontal',
    muscles: ['costas', 'biceps'],
    primaryMuscle: 'costas',
    level: 'iniciante',
    equipment: ['Polia Alta', 'Barra'],
    category: 'Costas',
    description: 'Principal exercício para largura das costas (latíssimo do dorso). Essencial para o formato em "V".',
    execution: [
      'Sente-se, segure a barra com pegada pronada mais larga que os ombros',
      'Retraia as escápulas antes de iniciar o movimento',
      'Puxe a barra até o queixo/clavícula',
      'Controle o retorno com braços quase estendidos'
    ],
    commonMistakes: [
      'Usar bíceps sem engajar as costas',
      'Inclinar muito o tronco para trás',
      'Puxar atrás da cabeça (risco ao pescoço)'
    ],
    tips: ['Pense em "encolher os cotovelos em direção aos quadris"'],
    animationType: 'pull'
  },
  {
    id: 'remada_curvada',
    name: 'Remada Curvada',
    muscles: ['costas', 'biceps', 'posterior'],
    primaryMuscle: 'costas',
    level: 'intermediario',
    equipment: ['Barra'],
    category: 'Costas',
    description: 'Exercício compound para espessura das costas. Trabalha trapézio, romboides e latíssimo.',
    execution: [
      'Curve o tronco a 45°, joelhos levemente flexionados',
      'Coluna neutra, olhar para baixo e à frente',
      'Puxe a barra em direção ao umbigo/quadril',
      'Retraia as escápulas completamente no topo',
      'Retorne de forma controlada'
    ],
    commonMistakes: [
      'Arredondar a lombar (risco de lesão)',
      'Usar impulso do corpo (cheating)',
      'Puxar para o peitoral em vez do umbigo'
    ],
    tips: ['Mantenha a coluna neutra durante TODO o movimento — prioridade máxima'],
    animationType: 'row'
  },
  {
    id: 'barra_fixa',
    name: 'Barra Fixa (Pull-up)',
    muscles: ['costas', 'biceps', 'ombros'],
    primaryMuscle: 'costas',
    level: 'intermediario',
    equipment: ['Barra Fixa'],
    category: 'Costas',
    description: 'Um dos melhores exercícios para costas usando peso corporal. Desenvolve largura e força funcional.',
    execution: [
      'Segure a barra com pegada pronada mais larga que os ombros',
      'Parta do dead hang (braços totalmente estendidos)',
      'Puxe o corpo até o queixo ultrapassar a barra',
      'Desça controlando até extensão completa'
    ],
    commonMistakes: [
      'Usar swing para subir',
      'Não completar a amplitude (ROM)',
      'Pescoço avançado ao invés do peito para frente'
    ],
    tips: ['Iniciantes: use banda elástica para assistência. Avançados: adicione carga com cinto'],
    animationType: 'pull'
  },
  {
    id: 'remada_serrote',
    name: 'Remada Serrote',
    muscles: ['costas', 'biceps'],
    primaryMuscle: 'costas',
    level: 'iniciante',
    equipment: ['Halter', 'Banco'],
    category: 'Costas',
    description: 'Exercício unilateral excelente para espessura das costas. Corrige assimetrias entre os lados.',
    execution: [
      'Apoie joelho e mão ipsilaterais no banco',
      'Segure o halter com a mão oposta',
      'Puxe o halter em direção ao quadril do mesmo lado',
      'Retraia a escápula completamente no topo',
      'Retorne controlando'
    ],
    commonMistakes: [
      'Rotar o tronco ao puxar',
      'Usar o bíceps em vez de engajar as costas'
    ],
    tips: ['Foque em "empurrar o cotovelo para o teto" em vez de puxar o peso'],
    animationType: 'row'
  },
  {
    id: 'levantamento_terra',
    name: 'Levantamento Terra',
    muscles: ['costas', 'posterior', 'gluteos', 'quadriceps'],
    primaryMuscle: 'costas',
    level: 'avancado',
    equipment: ['Barra', 'Anilhas'],
    category: 'Costas',
    description: 'Rei dos exercícios compostos. Trabalha praticamente toda a cadeia posterior e requer técnica impecável.',
    execution: [
      'Barra sobre o meio do pé, pés na largura dos quadris',
      'Quadril para trás, coluna neutra, peito para cima',
      'Agarre a barra firmemente (pegada mista ou dupla pronada)',
      'Empurre o chão, não puxe a barra',
      'Mantenha a barra rente ao corpo durante todo o movimento',
      'Trave quadril e joelhos simultaneamente no topo'
    ],
    commonMistakes: [
      'Arredondar a lombar (erro mais perigoso)',
      'Joelhos colapseando para dentro',
      'Barra distante do corpo',
      'Puxar com as costas em vez de empurrar com as pernas'
    ],
    tips: ['Domine a técnica com pesos leves antes de progredir a carga'],
    animationType: 'hinge'
  },
  {
    id: 'pullover',
    name: 'Pullover com Halter',
    muscles: ['costas', 'peito'],
    primaryMuscle: 'costas',
    level: 'iniciante',
    equipment: ['Halter', 'Banco'],
    category: 'Costas',
    description: 'Exercício único que trabalha latíssimo e peitoral ao mesmo tempo com grande amplitude.',
    execution: [
      'Deite transversalmente no banco, ombros no banco',
      'Segure um halter acima do peito com as duas mãos',
      'Abaixe o halter em arco atrás da cabeça',
      'Sinta o alongamento máximo das costas',
      'Retorne em arco à posição inicial'
    ],
    commonMistakes: ['Dobrar muito os cotovelos', 'Deixar os quadris caírem'],
    tips: ['Excelente para expandir a caixa torácica quando feito após agachamento'],
    animationType: 'pull'
  },

  // ─── OMBROS ────────────────────────────────────────────────────────────
  {
    id: 'press_militar',
    name: 'Press Militar',
    muscles: ['ombros', 'triceps'],
    primaryMuscle: 'ombros',
    level: 'iniciante',
    equipment: ['Barra', 'Halteres'],
    category: 'Ombros',
    description: 'Principal exercício para desenvolvimento dos deltoides. Movimento fundamental de empurrar vertical.',
    execution: [
      'Segure a barra na altura dos ombros com pegada pronada',
      'Core ativado, sem arqueamento lombar',
      'Empurre acima da cabeça até extensão completa',
      'Retorne controlando até a posição inicial'
    ],
    commonMistakes: [
      'Arquear a lombar para compensar peso excessivo',
      'Não estender completamente os braços',
      'Inclinação excessiva do tronco para trás'
    ],
    tips: ['Versão sentado isola mais os ombros. Em pé recruta mais o core'],
    animationType: 'press'
  },
  {
    id: 'elevacao_lateral',
    name: 'Elevação Lateral',
    muscles: ['ombros'],
    primaryMuscle: 'ombros',
    level: 'iniciante',
    equipment: ['Halteres'],
    category: 'Ombros',
    description: 'Isolamento para o deltoide medial (lateral). Responsável pela largura e volume dos ombros.',
    execution: [
      'Segure halteres ao lado do corpo com leve flexão dos cotovelos',
      'Eleve os braços lateralmente até a altura dos ombros',
      'Leve inclinação à frente dos halteres no topo',
      'Controle a descida lentamente'
    ],
    commonMistakes: [
      'Usar swing para subir',
      'Elevar acima dos ombros (trapézio assume)',
      'Travar os cotovelos completamente'
    ],
    tips: ['Incline o halter levemente para frente para melhor ativação do deltoide medial'],
    animationType: 'raise'
  },
  {
    id: 'face_pull',
    name: 'Face Pull',
    muscles: ['ombros', 'costas'],
    primaryMuscle: 'ombros',
    level: 'iniciante',
    equipment: ['Polia', 'Corda'],
    category: 'Ombros',
    description: 'Essencial para saúde dos ombros. Trabalha deltoide posterior e manguito rotador.',
    execution: [
      'Polia na altura dos olhos, segure a corda',
      'Puxe em direção ao rosto separando as mãos',
      'Cotovelos paralelos ao chão ou acima',
      'Retraia as escápulas completamente no topo'
    ],
    commonMistakes: [
      'Puxar para o pescoço e não para o rosto',
      'Deixar os cotovelos caírem abaixo dos ombros'
    ],
    tips: ['Execute com peso leve e alto volume (15-20 reps) para saúde articular'],
    animationType: 'pull'
  },
  {
    id: 'desenvolvimento_arnold',
    name: 'Desenvolvimento Arnold',
    muscles: ['ombros', 'triceps'],
    primaryMuscle: 'ombros',
    level: 'intermediario',
    equipment: ['Halteres'],
    category: 'Ombros',
    description: 'Variação rotacional do desenvolvimento que trabalha os três feixes do deltoide.',
    execution: [
      'Inicie com halteres na altura dos ombros, palmas para si',
      'Ao empurrar, rotacione as palmas para frente',
      'Estenda completamente acima da cabeça',
      'Retorne com a rotação reversa'
    ],
    commonMistakes: ['Usar carga excessiva que limita a rotação', 'Fazer a rotação muito rápido'],
    tips: ['Movimento criado por Arnold Schwarzenegger para completude dos deltoides'],
    animationType: 'press'
  },

  // ─── BÍCEPS ────────────────────────────────────────────────────────────
  {
    id: 'rosca_direta',
    name: 'Rosca Direta',
    muscles: ['biceps'],
    primaryMuscle: 'biceps',
    level: 'iniciante',
    equipment: ['Barra', 'Halteres'],
    category: 'Bíceps',
    description: 'Exercício clássico de isolamento para bíceps. Base de qualquer programa de braço.',
    execution: [
      'Em pé, barra com pegada supinada na largura dos ombros',
      'Cotovelos fixos junto ao corpo durante todo o movimento',
      'Flexione os cotovelos subindo a barra',
      'Controle a descida até extensão completa'
    ],
    commonMistakes: [
      'Balançar o corpo para ajudar (cheating)',
      'Mover os cotovelos para frente',
      'Não completar a amplitude total'
    ],
    tips: ['Contraia o bíceps maximamente no topo de cada repetição'],
    animationType: 'curl'
  },
  {
    id: 'rosca_martelo',
    name: 'Rosca Martelo',
    muscles: ['biceps'],
    primaryMuscle: 'biceps',
    level: 'iniciante',
    equipment: ['Halteres'],
    category: 'Bíceps',
    description: 'Trabalha braquial e braquiorradial, dando espessura e "pico" ao braço.',
    execution: [
      'Segure halteres com pegada neutra (polegar para cima)',
      'Flexione os cotovelos sem rotacionar os punhos',
      'Suba até contração máxima',
      'Retorne controlando'
    ],
    commonMistakes: [
      'Rodar o punho (transforma em rosca direta)',
      'Usar swing do corpo'
    ],
    tips: ['Pode ser executado alternado ou simultâneo. Alternado permite maior concentração'],
    animationType: 'curl'
  },
  {
    id: 'rosca_concentrada',
    name: 'Rosca Concentrada',
    muscles: ['biceps'],
    primaryMuscle: 'biceps',
    level: 'iniciante',
    equipment: ['Halter'],
    category: 'Bíceps',
    description: 'Isolamento máximo do bíceps com o cotovelo apoiado na coxa. Ótimo para o "pico" do bíceps.',
    execution: [
      'Sentado, apoie o cotovelo na parte interna da coxa',
      'Segure o halter com pegada supinada',
      'Curl completo até máxima contração',
      'Desça lentamente'
    ],
    commonMistakes: ['Tirar o cotovelo do apoio', 'Usar o ombro para ajudar'],
    tips: ['Ao final do movimento, supine o punho para mayor contração do bíceps'],
    animationType: 'curl'
  },

  // ─── TRÍCEPS ───────────────────────────────────────────────────────────
  {
    id: 'triceps_corda',
    name: 'Tríceps Corda',
    muscles: ['triceps'],
    primaryMuscle: 'triceps',
    level: 'iniciante',
    equipment: ['Polia Alta', 'Corda'],
    category: 'Tríceps',
    description: 'Isolamento eficaz para tríceps com amplitude maximizada pela separação das mãos ao final.',
    execution: [
      'Polia alta, segure a corda com as duas mãos',
      'Cotovelos fixos junto ao corpo',
      'Empurre a corda para baixo até extensão completa',
      'Separe as mãos no final para contração máxima',
      'Retorne controlando'
    ],
    commonMistakes: [
      'Mover os cotovelos (anulam o isolamento)',
      'Inclinar muito o tronco à frente',
      'Não separar as mãos no final'
    ],
    tips: ['A separação das mãos no final maximiza a contração da cabeça lateral do tríceps'],
    animationType: 'extend'
  },
  {
    id: 'triceps_frances',
    name: 'Tríceps Francês',
    muscles: ['triceps'],
    primaryMuscle: 'triceps',
    level: 'iniciante',
    equipment: ['Barra', 'Halteres'],
    category: 'Tríceps',
    description: 'Isolamento que prioriza a cabeça longa do tríceps, responsável pela maior parte do volume do braço.',
    execution: [
      'Deite no banco, segure a barra EZ ou halteres acima do peito',
      'Flexione os cotovelos abaixando o peso em direção à testa',
      'Mantenha os cotovelos apontados para o teto',
      'Estenda os braços de volta sem travar completamente'
    ],
    commonMistakes: [
      'Cotovelos abrindo para os lados',
      'Usar carga excessiva forçando os ombros'
    ],
    tips: ['Cabeça longa = 2/3 do volume do tríceps. Priorize este exercício'],
    animationType: 'extend'
  },
  {
    id: 'paralelas_triceps',
    name: 'Paralelas (Dips)',
    muscles: ['triceps', 'peito', 'ombros'],
    primaryMuscle: 'triceps',
    level: 'intermediario',
    equipment: ['Paralelas'],
    category: 'Tríceps',
    description: 'Exercício compound para tríceps e peito. Tronco vertical = tríceps; inclinado = peito.',
    execution: [
      'Segure as barras com braços estendidos',
      'Tronco vertical para foco em tríceps',
      'Desça controlando até cotovelos em 90°',
      'Empurre até extensão completa'
    ],
    commonMistakes: [
      'Descer demais forçando o ombro',
      'Usar swing para subir'
    ],
    tips: ['Iniciantes: máquina assistida. Avançados: cinto com carga adicional'],
    animationType: 'push'
  },

  // ─── QUADRÍCEPS ────────────────────────────────────────────────────────
  {
    id: 'agachamento_livre',
    name: 'Agachamento Livre',
    muscles: ['quadriceps', 'gluteos', 'posterior'],
    primaryMuscle: 'quadriceps',
    level: 'iniciante',
    equipment: ['Barra', 'Rack'],
    category: 'Quadríceps',
    description: 'Rei dos exercícios para membros inferiores. Trabalha quadríceps, glúteos e toda a cadeia posterior.',
    execution: [
      'Barra nos trapézios superiores, pegada levemente mais larga',
      'Pés na largura dos quadris, levemente rotados para fora',
      'Desça como se fosse sentar, quadril abaixo dos joelhos',
      'Joelhos alinhados com os dedos dos pés durante todo o movimento',
      'Suba empurrando o chão com força'
    ],
    commonMistakes: [
      'Joelhos colapseando para dentro (valgo)',
      'Lombar arredondando no final da descida',
      'Calcanhar saindo do chão'
    ],
    tips: ['Profundidade alvo: coxa paralela ou abaixo do chão para maior ativação dos glúteos'],
    animationType: 'squat'
  },
  {
    id: 'leg_press',
    name: 'Leg Press',
    muscles: ['quadriceps', 'gluteos', 'posterior'],
    primaryMuscle: 'quadriceps',
    level: 'iniciante',
    equipment: ['Leg Press'],
    category: 'Quadríceps',
    description: 'Exercício para pernas na máquina. Permite cargas elevadas com menor risco para a coluna.',
    execution: [
      'Pés na plataforma na largura dos quadris',
      'Destrave e desça controlando até 90° nos joelhos',
      'Empurre de volta sem travar completamente os joelhos',
      'Mantenha a lombar encostada na base'
    ],
    commonMistakes: [
      'Subir a pelve da base (risco lombar)',
      'Travar os joelhos no topo',
      'Posição de pés muito baixa (excesso de carga no joelho)'
    ],
    tips: ['Pés altos: mais glúteos e posterior. Pés baixos: mais quadríceps'],
    animationType: 'press'
  },
  {
    id: 'extensora',
    name: 'Cadeira Extensora',
    muscles: ['quadriceps'],
    primaryMuscle: 'quadriceps',
    level: 'iniciante',
    equipment: ['Cadeira Extensora'],
    category: 'Quadríceps',
    description: 'Isolamento puro de quadríceps. Ótimo para finalizar o treino de pernas.',
    execution: [
      'Sente com apoio atrás dos tornozelos, joelhos a 90°',
      'Estenda as pernas completamente com contração máxima',
      'Pause 1-2 segundos no topo',
      'Controle a descida lentamente'
    ],
    commonMistakes: ['Usar impulso para subir', 'Não completar a extensão'],
    tips: ['A pausa no topo aumenta significativamente a ativação muscular'],
    animationType: 'extend'
  },
  {
    id: 'afundo',
    name: 'Afundo (Lunge)',
    muscles: ['quadriceps', 'gluteos', 'posterior'],
    primaryMuscle: 'quadriceps',
    level: 'iniciante',
    equipment: ['Sem equipamento', 'Halteres', 'Barra'],
    category: 'Quadríceps',
    description: 'Exercício unilateral excelente para equilíbrio e força funcional das pernas.',
    execution: [
      'Pé à frente, pé de trás a 1-1.5m de distância',
      'Desça o joelho traseiro em direção ao chão',
      'Joelho dianteiro não ultrapasse o pé',
      'Empurre de volta com o pé da frente'
    ],
    commonMistakes: ['Joelho dianteiro colapsar para dentro', 'Passo muito curto ou muito longo'],
    tips: ['Passo mais longo: mais glúteos e posterior. Mais curto: mais quadríceps'],
    animationType: 'squat'
  },

  // ─── POSTERIOR ─────────────────────────────────────────────────────────
  {
    id: 'mesa_flexora',
    name: 'Mesa Flexora',
    muscles: ['posterior', 'panturrilha'],
    primaryMuscle: 'posterior',
    level: 'iniciante',
    equipment: ['Mesa Flexora'],
    category: 'Posterior',
    description: 'Isolamento para isquiotibiais (bíceps femoral). Fundamental para equilíbrio com o quadríceps.',
    execution: [
      'Deite na máquina, apoio atrás dos tornozelos',
      'Flexione os joelhos puxando o apoio em direção aos glúteos',
      'Controle a descida até quase extensão completa'
    ],
    commonMistakes: ['Levantar o quadril ao puxar', 'Usar balanço para completar as reps'],
    tips: ['Aponte os dedos dos pés para baixo para maior ativação dos isquiotibiais'],
    animationType: 'curl'
  },
  {
    id: 'stiff',
    name: 'Stiff com Barra',
    muscles: ['posterior', 'gluteos', 'costas'],
    primaryMuscle: 'posterior',
    level: 'intermediario',
    equipment: ['Barra'],
    category: 'Posterior',
    description: 'Exercício de dobradiça do quadril com joelhos quase estendidos. Ênfase máxima nos isquiotibiais.',
    execution: [
      'Em pé com barra na frente, pernas quase estendidas',
      'Empurre o quadril para trás inclinando o tronco',
      'Desça até sentir o alongamento máximo dos isquiotibiais',
      'Retorne contraindo glúteos e isquiotibiais'
    ],
    commonMistakes: [
      'Dobrar os joelhos demais (vira terra romeno)',
      'Arredondar a lombar'
    ],
    tips: ['Diferente do terra romeno: mantenha joelhos quase retos para focar nos isquiotibiais'],
    animationType: 'hinge'
  },

  // ─── GLÚTEOS ───────────────────────────────────────────────────────────
  {
    id: 'hip_thrust',
    name: 'Hip Thrust',
    muscles: ['gluteos', 'posterior', 'quadriceps'],
    primaryMuscle: 'gluteos',
    level: 'iniciante',
    equipment: ['Barra', 'Banco'],
    category: 'Glúteos',
    description: 'Exercício com maior ativação de glúteos comprovada pela ciência. Essencial para desenvolvimento glúteo.',
    execution: [
      'Escápulas apoiadas no banco, barra sobre o quadril',
      'Pés no chão com joelhos em aproximadamente 90°',
      'Empurre o quadril para cima contraindo os glúteos',
      'No topo: coluna neutra (não hiperestenda a lombar)',
      'Desça controlando até próximo ao chão'
    ],
    commonMistakes: [
      'Hiperextender a lombar no topo',
      'Joelhos caindo para dentro',
      'Usar os quadríceps em vez dos glúteos'
    ],
    tips: ['Almofada de proteção no quadril é essencial com cargas mais altas'],
    animationType: 'hinge'
  },
  {
    id: 'agachamento_sumo',
    name: 'Agachamento Sumô',
    muscles: ['gluteos', 'quadriceps', 'posterior'],
    primaryMuscle: 'gluteos',
    level: 'iniciante',
    equipment: ['Barra', 'Halteres'],
    category: 'Glúteos',
    description: 'Variação do agachamento com postura larga. Maior ativação de glúteos e adutores.',
    execution: [
      'Pés mais largos que os ombros, dedos apontados para fora (45°)',
      'Desça mantendo o tronco mais vertical',
      'Joelhos seguindo rigorosamente a direção dos dedos dos pés',
      'Suba empurrando o chão'
    ],
    commonMistakes: ['Joelhos colapseando para dentro', 'Tronco excessivamente inclinado'],
    tips: ['Postura mais larga proporciona maior amplitude para glúteos e adutores'],
    animationType: 'squat'
  },
  {
    id: 'cadeira_abdutora',
    name: 'Cadeira Abdutora',
    muscles: ['gluteos'],
    primaryMuscle: 'gluteos',
    level: 'iniciante',
    equipment: ['Cadeira Abdutora'],
    category: 'Glúteos',
    description: 'Isolamento para glúteo médio, responsável pela forma lateral e estabilidade do quadril.',
    execution: [
      'Sente na máquina com os joelhos nos apoios',
      'Abra as pernas contra a resistência',
      'Pause na posição máxima de abertura',
      'Retorne controlando'
    ],
    commonMistakes: ['Usar swing para abrir', 'Não controlar o retorno'],
    tips: ['Incline levemente o tronco à frente para maior ativação do glúteo médio'],
    animationType: 'raise'
  },

  // ─── PANTURRILHA ───────────────────────────────────────────────────────
  {
    id: 'panturrilha_pe',
    name: 'Panturrilha em Pé',
    muscles: ['panturrilha'],
    primaryMuscle: 'panturrilha',
    level: 'iniciante',
    equipment: ['Máquina de Panturrilha', 'Step'],
    category: 'Panturrilha',
    description: 'Principal exercício para desenvolvimento do gastrocnêmio, a maior cabeça da panturrilha.',
    execution: [
      'Antepé na borda do step/máquina',
      'Desça o calcanhar completamente abaixo da linha do pé',
      'Suba na ponta dos pés o máximo possível',
      'Pause 1-2 segundos no topo'
    ],
    commonMistakes: [
      'Não completar a amplitude (especialmente o alongamento)',
      'Usar balanceio para subir',
      'Não pausar no topo'
    ],
    tips: ['Tente 3 posições: dedos retos (gástrocnêmio), para dentro e para fora para completude'],
    animationType: 'raise'
  },
  {
    id: 'panturrilha_sentado',
    name: 'Panturrilha Sentado',
    muscles: ['panturrilha'],
    primaryMuscle: 'panturrilha',
    level: 'iniciante',
    equipment: ['Máquina de Panturrilha Sentado'],
    category: 'Panturrilha',
    description: 'Trabalha o solear, músculo profundo da panturrilha ativado com o joelho flexionado.',
    execution: [
      'Sente com os joelhos embaixo do apoio, antepé na borda',
      'Desça os calcanhares abaixo do nível do step',
      'Suba na ponta dos pés completamente',
      'Pause no topo'
    ],
    commonMistakes: ['Não utilizar amplitude completa', 'Carga excessiva sem técnica adequada'],
    tips: ['Solear bem desenvolvido "empurra" o gastrocnêmio para fora, aumentando a aparência da panturrilha'],
    animationType: 'raise'
  },

  // ─── ABDÔMEN ───────────────────────────────────────────────────────────
  {
    id: 'prancha',
    name: 'Prancha Abdominal',
    muscles: ['abdomen', 'costas'],
    primaryMuscle: 'abdomen',
    level: 'iniciante',
    equipment: ['Sem equipamento'],
    category: 'Abdômen',
    description: 'Exercício isométrico fundamental para o core. Trabalha todo o cilindro abdominal.',
    execution: [
      'Apoio nos antebraços e pontas dos pés',
      'Corpo em linha reta da cabeça aos calcanhares',
      'Contraia abdômen e glúteos simultaneamente',
      'Respire normalmente e mantenha pelo tempo determinado'
    ],
    commonMistakes: [
      'Quadril elevado (pirâmide)',
      'Quadril afundado (arco lombar)',
      'Prender a respiração'
    ],
    tips: ['Progressões: prancha lateral, com elevação de perna alternada, prancha dinâmica'],
    animationType: 'plank'
  },
  {
    id: 'crunch',
    name: 'Crunch Abdominal',
    muscles: ['abdomen'],
    primaryMuscle: 'abdomen',
    level: 'iniciante',
    equipment: ['Sem equipamento'],
    category: 'Abdômen',
    description: 'Exercício de flexão do tronco para o abdômen superior. Clássico e efetivo.',
    execution: [
      'Deite com joelhos dobrados, pés no chão',
      'Mãos leve atrás da cabeça ou cruzadas no peito',
      'Contraia o abdômen elevando o tronco',
      'Suba até sentir contração máxima (não precisa sentar completamente)',
      'Desça controlando'
    ],
    commonMistakes: [
      'Puxar o pescoço com as mãos',
      'Usar impulso',
      'Não contrair o abdômen ativamente'
    ],
    tips: ['Expire ao subir para maior contração do reto abdominal'],
    animationType: 'curl'
  },
  {
    id: 'russian_twist',
    name: 'Russian Twist',
    muscles: ['abdomen'],
    primaryMuscle: 'abdomen',
    level: 'iniciante',
    equipment: ['Sem equipamento', 'Anilha', 'Medicine Ball'],
    category: 'Abdômen',
    description: 'Exercício rotacional para oblíquos e abdômen. Excelente para a cintura.',
    execution: [
      'Sente com joelhos dobrados, levemente reclinado (45°)',
      'Eleve os pés do chão para mais dificuldade (opcional)',
      'Gire o tronco de um lado ao outro',
      'Toque o chão ao lado do quadril com as mãos'
    ],
    commonMistakes: [
      'Girar apenas os braços sem rotacionar o tronco',
      'Perder a tensão do core durante o movimento'
    ],
    tips: ['Com peso: segure anilha ou medicine ball. Versão progressiva: pés elevados'],
    animationType: 'curl'
  },
  {
    id: 'abdominal_infra',
    name: 'Elevação de Pernas',
    muscles: ['abdomen'],
    primaryMuscle: 'abdomen',
    level: 'intermediario',
    equipment: ['Sem equipamento', 'Barra'],
    category: 'Abdômen',
    description: 'Trabalha o abdômen inferior (reto abdominal inferior), área difícil de isolar.',
    execution: [
      'Deite no chão ou segure barra fixa',
      'Pernas estendidas ou levemente flexionadas',
      'Eleve as pernas até 90° contraindo o abdômen',
      'Desça controlando sem tocar o chão'
    ],
    commonMistakes: [
      'Arquear a lombar durante a descida',
      'Usar impulso para subir'
    ],
    tips: ['Na barra fixa: o peso do corpo aumenta consideravelmente a dificuldade'],
    animationType: 'raise'
  },
];

export const getExercisesByMuscle = (muscleId: MuscleGroupId): ExerciseEntry[] =>
  EXERCISE_DATABASE.filter(e => e.primaryMuscle === muscleId);

export const searchExercises = (query: string): ExerciseEntry[] => {
  const q = query.toLowerCase();
  return EXERCISE_DATABASE.filter(
    e =>
      e.name.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q) ||
      e.muscles.some(m => m.includes(q))
  );
};

export const getExerciseById = (id: string): ExerciseEntry | undefined =>
  EXERCISE_DATABASE.find(e => e.id === id);
