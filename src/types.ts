export type FluidSubcategory = 
  | 'engine_oil'
  | 'transmission_fluid'
  | 'differential_fluid'
  | 'gear_oil'
  | 'transfer_case_fluid'
  | 'brake_fluid'
  | 'coolant'
  | 'power_steering_fluid';

export interface FluidOrder {
  subcategory: FluidSubcategory;
  spec: string; // viscosity for oil, DOT for brake fluid, etc.
  quantity?: string;
  brand?: string;
  type?: string; // 'synthetic' | 'conventional' | 'blend' or any other particular
}

export interface PartOrder {
  name: string;
  quantity: number;
  brand?: string;
  notes?: string;
}

export type IdentificationState = 
  | 'NO_CANDIDATE'
  | 'PARTIAL'
  | 'NORMALIZED'
  | 'INVALID'
  | 'AMBIGUOUS'
  | 'VALIDATED'
  | 'DECODE_IN_PROGRESS'
  | 'DECODE_WEAK'
  | 'LOOKUP_IN_PROGRESS'
  | 'LOOKUP_WEAK'
  | 'VEHICLE_IDENTIFIED'
  | 'CONFIRMATION_REQUIRED'
  | 'VEHICLE_LOCKED'
  | 'FALLBACK_TO_PLATE'
  | 'FALLBACK_TO_YMM';

export type IdentificationGrade = 'STRONG' | 'USABLE_BUT_INCOMPLETE' | 'WEAK' | 'FAILED';

export interface VehicleIdentityLock {
  inputType: 'vin' | 'plate' | 'ymm';
  rawInput: string;
  normalizedInput: string;
  validationResult: boolean;
  vinChecksumValid?: boolean;
  plateState?: string;
  decodeResult?: VehicleInfo;
  confidenceScore: number;
  grade: IdentificationGrade;
  status: IdentificationState;
  isConfirmed: boolean;
  timestamp: number;
}

export interface VehicleInfo {
  year?: string;
  make?: string;
  model?: string;
  trim?: string;
  engine?: string;
  drive?: string;
  bodyClass?: string;
  transmission?: string;
  vin?: string;
  licensePlate?: string;
  plateState?: string;
}

export type Language = 'en' | 'hy' | 'auto';

export interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  url: string;
  thumbnailUrl?: string;
  timestamp: number;
}

export interface OrderState {
  id?: string;
  userId?: string;
  vehicle: VehicleInfo;
  vehicleIdentityLock?: VehicleIdentityLock;
  fluids: FluidOrder[];
  parts: PartOrder[];
  media: MediaItem[];
  plateState?: string;
  mechanicName?: string;
  shopName?: string;
  phoneNumber?: string;
  backendOrderId?: string;
  paymentMethod?: string;
  deviceId?: string;
  isConfirmed: boolean;
  status: 'draft' | 'review' | 'confirmed';
  createdAt?: any;
  updatedAt?: any;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  translation?: string;
  timestamp: number;
}

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}
