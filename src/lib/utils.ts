import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

export function formatGoal(goal: string) {
  const goalMap: Record<string, string> = {
    'emagrecimento': 'Emagrecimento',
    'hipertrofia': 'Hipertrofia',
    'resistencia': 'Resistência Muscular',
    'corrida': 'Foco em Corrida',
    'mobilidade': 'Mobilidade & Flexibilidade',
    'reabilitacao': 'Reabilitação',
    'ganho_massa': 'Ganho de Massa',
    'vo2_max': 'Melhora de VO2 Max',
    'recuperacao_ativa': 'Recuperação Ativa',
    'fortalecimento': 'Fortalecimento',
    'potencia': 'Potência / Explosão'
  };
  return goalMap[goal] || goal;
}

export function getPublicRaceLink(raceId: string) {
  const currentOrigin = window.location.origin;
  // Converte links de desenvolvimento (dev) para pré-visualização pública (pre)
  // Funciona para URLs no formato ais-dev-... ou ais-pre-...
  if (currentOrigin.includes('-dev-')) {
    return `${currentOrigin.replace('-dev-', '-pre-')}/race/${raceId}`;
  }
  return `${currentOrigin}/race/${raceId}`;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null, auth: any) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
