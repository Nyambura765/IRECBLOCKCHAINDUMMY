// Type definitions for the IREC platform

export interface Project {
  address: string;
  approved: boolean;
  name: string;
  description: string;
}

export interface IREC {
  id: string;
  projectAddress: string;
  energyAmount: number; // in kWh
  createdAt: Date;
  owner: string;
  price: number; // in ETH
}

export interface Transaction {
  id: string;
  from: string;
  to: string;
  irecId: string;
  amount: number; // in ETH
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
}

export interface User {
  address: string;
  name?: string;
  email?: string;
  role: 'admin' | 'producer' | 'consumer';
  joinedAt: Date;
}

export interface PlatformSettings {
  platformFee: string; // percentage as string
  minEnergyPerToken: string; // minimum kWh per token
}