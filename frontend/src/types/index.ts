export type Screen = 'home' | 'chat' | 'analysis' | 'status' | 'medical-records' | 'user-profile' | 'login' | 'register' | 'forgot-password' | 'emergency';

export interface Profile {
  name: string;
  birthYear: string;
  gender: string;
  phone: string;
  relativePhone: string;
  conditions: string[];
  allergies: string;
  bloodType: string;
  height: number;
  weight: number;
  bp: string;
  sugar: string;
  hr: string;
  spo2: string;
  lastMeasured: string;
}

export interface Medication {
  name: string;
  timing: string;
  dosage: string;
}

export interface Prescription {
  id: string;
  title: string;
  date: string;
  doctor: string;
  medications: Medication[];
}

export interface HistoryItem {
  date: string;
  month: string;
  year: string;
  title: string;
  hospital: string;
  doctor: string;
  result: string;
}
