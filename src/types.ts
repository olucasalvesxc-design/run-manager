export type RaceType = 'street' | 'treadmill' | 'online';
export type ParticipationType = 'paid' | 'beneficent' | 'free';
export type RaceStatus = 'active' | 'paused' | 'closed';
export type Gender = 'male' | 'female';
export type PaymentStatus = 'pending' | 'confirmed';

export interface Organizer {
  id: string;
  email: string;
  name: string;
  whatsapp?: string;
  isTrainer?: boolean;
  trainerPlan?: 'free' | 'pro' | 'elite';
  trainerPlanStatus?: 'active' | 'inactive';
  createdAt: any;
}

export interface Exercise {
  id: string;
  name: string;
  series: number;
  reps: string;
  rest: string;
  notes?: string;
  videoUrl?: string;
}

export type WorkoutGoal = 
  | 'emagrecimento' 
  | 'hipertrofia' 
  | 'resistencia' 
  | 'corrida' 
  | 'mobilidade' 
  | 'reabilitacao' 
  | 'ganho_massa' 
  | 'vo2_max' 
  | 'recuperacao_ativa'
  | 'fortalecimento'
  | 'potencia';

export interface Workout {
  id: string;
  trainerId: string;
  clientId: string;
  title: string;
  goal: WorkoutGoal;
  division: string; // Ex: Treino A, B, C
  exercises: Exercise[];
  notes?: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: any;
  updatedAt?: any;
}

export interface Consultation {
  id: string;
  trainerId: string;
  clientId: string;
  clientName: string;
  date: string;
  time: string;
  type: 'online' | 'presencial';
  status: 'scheduled' | 'finished' | 'canceled';
  notes?: string;
  createdAt: any;
}

export interface TrainerClient {
  id: string;
  trainerId: string;
  name: string;
  email: string;
  whatsapp: string;
  goal: WorkoutGoal;
  status: 'active' | 'paused' | 'encerrado';
  notes?: string;
  lastWorkoutDate?: any;
  nextConsultationDate?: any;
  createdAt: any;
}

export type UserRole = 'athlete' | 'organizer' | 'admin';

export interface Profile {
  id: string;
  email: string;
  organizerName?: string;
  role: UserRole;
  profileImageUrl?: string;
  bio?: string;
  whatsapp?: string;
  instagram?: string;
  pixName?: string;
  pixDocument?: string;
  pixKey?: string;
  pixKeyType?: string;
  pixProofWhatsapp?: string;
  planName?: string;
  planStatus?: 'active' | 'inactive' | 'trial';
  subscriptionId?: string;
  currentPeriodStart?: any;
  currentPeriodEnd?: any;
  createdAt: any;
}

export interface Race {
  id: string;
  organizerId: string;
  name: string;
  date: string;
  time: string;
  location: string;
  description: string;
  distance?: string;
  donationDescription?: string;
  type: RaceType;
  price: number;
  pixKey?: string;
  participationType: ParticipationType;
  capacity: number;
  status: RaceStatus;
  logoUrl?: string;
  createdAt: any;
}

export type RegistrationStatus = 'aguardando_pagamento' | 'aguardando_doacao' | 'confirmado' | 'pago' | 'cancelado';

export interface Registration {
  id: string;
  raceId: string;
  organizerId: string;
  runnerName: string;
  email: string;
  whatsapp: string;
  gender: Gender;
  birthDate: string;
  age?: number;
  jerseySize: string;
  emergencyContact: string;
  team?: string;
  cpf: string;
  city: string;
  status: RegistrationStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  createdAt: any;
}
