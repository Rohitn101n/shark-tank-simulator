export interface SharkProfile {
  id: 'mark' | 'kevin' | 'lori' | 'daymond' | 'barbara' | 'robert';
  name: string;
  nickname: string;
  role: string;
  netWorth: string;
  avatarUrl?: string;
  color: string;
  accentBg: string;
  borderColor: string;
  specialty: string[];
  signatureStyle: string;
  famousQuote: string;
  dealPetPeeve: string;
}

export type SharkStatus =
  | 'LISTENING'
  | 'QUESTIONING'
  | 'CONTEMPLATING'
  | 'MAKING_OFFER'
  | 'FIGHTING'
  | 'OUT';

export interface SharkOffer {
  id: string;
  sharkId: 'mark' | 'kevin' | 'lori' | 'daymond' | 'barbara' | 'robert';
  amount: number;
  equity: number;
  royalty?: {
    amountPerUnit: number;
    threshold?: number; // e.g. until $X is recouped
    inPerpetuityAmount?: number;
    description: string;
  };
  contingencies?: string[]; // e.g. "Contingent on patent grant", "Must launch on QVC in Q3"
  shotClockSeconds?: number; // e.g. 24 seconds or I'm out!
  isJointOffer?: boolean;
  jointWith?: ('mark' | 'kevin' | 'lori' | 'daymond' | 'barbara' | 'robert')[];
  explanation: string;
  createdAt: number;
}

export interface SharkTurnResponse {
  sharkId: 'mark' | 'kevin' | 'lori' | 'daymond' | 'barbara' | 'robert';
  dialogue: string;
  tone: 'aggressive' | 'inquisitive' | 'skeptical' | 'enthusiastic' | 'dismissive' | 'combative' | 'paternal';
  status: SharkStatus;
  interestScore: number; // 0 to 100
  interjectingAgainst?: 'mark' | 'kevin' | 'lori' | 'daymond' | 'barbara' | 'robert';
  interjectionDialogue?: string;
  offer?: SharkOffer | null;
  outReason?: string;
}

export interface PitchData {
  businessName: string;
  tagline: string;
  pitchText: string;
  askAmount: number;
  askEquity: number;
  annualSales: number;
  cogs: number;
  retailPrice: number;
  patents: string;
  category: string;
}

export interface ViabilityMetrics {
  impliedValuation: number;
  grossMarginPercent: number;
  profitPerUnit: number;
  overallScore: number; // 0 to 100
  valuationSanity: 'Fair' | 'Ambitious' | 'Insane' | 'Steal';
  redFlags: string[];
  greenFlags: string[];
  tankVerdict: string;
}

export interface SharkBrawl {
  shark1: string;
  shark2: string;
  dialogue: string;
  topic?: string;
  tensionLevel?: 'HEATED' | 'EXPLOSIVE' | 'CUTTHROAT';
}

export interface MessageLog {
  id: string;
  sender: 'pitcher' | 'shark' | 'system' | 'brawl';
  sharkId?: 'mark' | 'kevin' | 'lori' | 'daymond' | 'barbara' | 'robert';
  text: string;
  timestamp: number;
  offer?: SharkOffer;
  isOutAnnouncement?: boolean;
  brawl?: SharkBrawl;
}

export interface AnswerOption {
  id: string;
  text: string;
  strategy: string;
}

export interface SharkQuestion {
  id: string;
  sharkId: 'mark' | 'kevin' | 'lori' | 'daymond' | 'barbara';
  question: string;
  context: string;
  options: AnswerOption[];
  questionNumber: number;
  totalQuestions: number;
}

export interface DebriefReport {
  grade: 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'D' | 'F';
  dealClosed: boolean;
  winningDeal?: SharkOffer;
  valuationAssessment: string;
  sharkPraise: string[];
  sharkCriticisms: string[];
  pitchDoctorTips: string[];
  investorReadyScore: number;
}
