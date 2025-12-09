export enum RiskLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export interface Coordinate {
  x: number;
  y: number;
}

export interface UserProfile {
  id: string;
  name: string;
  nationality: string;
  passportNumber: string; // Masked in UI
  verificationHash: string;
  photoUrl: string;
  role?: string;
  validUntil?: number;
}

export interface IncidentAlert {
  id: string;
  userId: string;
  type: 'PANIC' | 'HARASSMENT' | 'MEDICAL' | 'LOST' | 'OTHER';
  description?: string;
  timestamp: number;
  location: Coordinate;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
  riskScore: number;
  responder?: {
    name: string;
    designation: string;
    contact: string;
  };
  timeline?: { status: string; note: string; timestamp: number }[];
  resolutionNotes?: string;
}

export interface RiskAssessment {
  score: number;
  level: RiskLevel;
  summary: string;
  precautions: string[];
}

export enum AppMode {
  AUTH = 'AUTH',
  TOURIST = 'TOURIST',
  AUTHORITY = 'AUTHORITY'
}