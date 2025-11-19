export enum ProcessingMode {
  FAST = 'FAST',
  QUALITY = 'QUALITY'
}

export enum ToneStyle {
  CONVERSATIONAL = 'Conversational',
  PROFESSIONAL = 'Professional',
  FORMAL = 'Formal',
  CREATIVE = 'Creative',
  SIMPLE = 'Simple'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface HumanizeConfig {
  mode: ProcessingMode;
  tone: ToneStyle;
  originalText: string;
}