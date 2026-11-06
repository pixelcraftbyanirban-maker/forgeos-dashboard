/**
 * FORGEOS Manufacturing Execution System (MES)
 * Core Domain Types & Strict State Separation
 */

// Category A: Machine States (Mutually Exclusive Fleet State Accounting)
export type MachineState = 'RUNNING' | 'IDLE' | 'SETUP' | 'STOPPED' | 'ALARM' | 'OFFLINE' | 'UNKNOWN';

// Telemetry Freshness Standard
export type TelemetryFreshness = 'LIVE' | 'DELAYED' | 'STALE' | 'UNKNOWN';

// User Roles for Role-Based Access
export type UserRole = 
  | 'PRODUCTION_MANAGER'
  | 'SHOP_SUPERVISOR'
  | 'MACHINE_OPERATOR'
  | 'QUALITY_MANAGER'
  | 'INVENTORY_MANAGER'
  | 'SYSTEM_ADMIN';

// Operational Diagnosis for Machine Inspector
export interface OperationalDiagnosis {
  issue: string;
  whyItMatters: string;
  needsAttention: string;
  recommendedInvestigation: string;
  severity: 'CRITICAL' | 'WARNING' | 'NORMAL';
}

// Category B: Production Workflow States
export type ProductionState = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';

// Category C: Data & Connection States
export type ConnectionState = 'CURRENT' | 'DELAYED' | 'DISCONNECTED' | 'INCOMPLETE' | 'MANUAL' | 'ESTIMATED';

export type JobPriority = 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW';

export interface Operation {
  id: string;
  stepNumber: number;
  name: string;
  machineType: string;
  plannedMinutes: number;
  actualMinutes: number;
  state: ProductionState;
}

export interface Job {
  id: string;
  orderNumber: string;
  customerCode?: string;
  customerName?: string;
  partName: string;
  partNumber: string;
  material: string;
  priority: JobPriority;
  quantityTarget: number;
  quantityCompleted: number;
  quantityScrapped: number;
  state: ProductionState;
  targetMachineId: string;
  plannedStart: string;
  estCompletion: string;
  verifiedUnitCost: number; // In INR (₹)
  currentOperation: string;
  progressPercent: number;
  operations?: Operation[];
  hsnCode?: string;
}

export interface MachineStateInterval {
  startHour: string; // e.g. "06:00"
  durationMinutes: number;
  state: MachineState;
  reason?: string;
}

export interface Machine {
  id: string; // e.g. "CNC-01"
  name: string; // e.g. "Hermle C42 5-Axis"
  section?: string; // e.g. "Section 1: VMC & Milling"
  axisCount: 3 | 4 | 5;
  state: MachineState;
  connectionState: ConnectionState;
  telemetryFreshness?: TelemetryFreshness;
  telemetryAgeSeconds?: number;
  currentJobId: string | null;
  operator: string;
  spindleRpm: number;
  maxRpm?: number;
  feedRateMmpm: number;
  maxFeedRate?: number;
  feedOverridePct: number;
  oee: {
    overall: number; // Availability * Performance * Quality
    availability: number;
    performance: number;
    quality: number;
  };
  targetOee?: number; // Configurable target, e.g. 85.0%
  targetCycleTimeSec?: number;
  actualCycleTimeSec?: number;
  partsPlanned?: number;
  partsCompleted?: number;
  remainingParts?: number;
  estJobCompletion?: string;
  activeAlarm?: string;
  downtimeDurationMinutes?: number;
  maintenanceWarning?: string;
  lastStateChange: string;
  telemetryTimestamp: string;
  uptimeHoursToday: number;
  stateHistory?: MachineStateInterval[];
  diagnosis?: OperationalDiagnosis;
}

export interface ExceptionEvent {
  time: string;
  source: string;
  message: string;
  channel?: string;
  sensorValue?: string;
}

export type DeviationStatus = 
  | 'DETECTED' 
  | 'ACKNOWLEDGED' 
  | 'INVESTIGATING' 
  | 'CORRECTIVE_ACTION' 
  | 'VERIFIED' 
  | 'CLOSED';

export type AssigneeRole = 'SUPERVISOR' | 'OPERATOR' | 'MAINTENANCE_TECH' | 'QUALITY_MANAGER';

export interface CorrectiveActionRecord {
  category: string;
  problemDescription: string;
  rootCause: string;
  correctiveAction: string;
  responsiblePerson: string;
  verificationNotes?: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  resolutionTimestamp?: string;
}

export interface ProductionException {
  id: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  category: 'MACHINE_ALARM' | 'CYCLE_TIME_DEVIATION' | 'TOOL_WEAR' | 'SETUP_DELAY' | 'MATERIAL_STAGED';
  title: string;
  description: string;
  timestamp: string;
  machineId: string;
  jobId?: string;
  status: DeviationStatus;
  assignee?: string;
  assigneeRole?: AssigneeRole;
  resolutionDeadline?: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  events?: ExceptionEvent[];
  correctiveAction?: CorrectiveActionRecord;
  internalNotes?: string[];
  escalated?: boolean;
  resolutionNotes?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface MaterialStock {
  id: string;
  name: string;
  grade: string;
  availableStockKg: number;
  minBufferKg: number;
  reservedStockKg: number;
  availableToPromiseKg: number; // availableStockKg - reservedStockKg
  allocatedJob: string;
  location: string;
  supplier: string;
  leadTimeDays: number;
  expectedDeliveryDate?: string;
  reorderQuantityKg: number;
  status: 'HEALTHY' | 'LOW_STOCK' | 'CRITICAL_SHORTAGE' | 'OUT_OF_STOCK' | 'INCOMING';
}

export interface ToolingItem {
  id: string;
  name: string;
  type: string;
  assignedMachine: string;
  condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'WORN' | 'CRITICAL';
  totalExpectedLifeMinutes: number;
  remainingLifeMinutes: number;
  remainingLifePct: number;
  replacementThresholdPct: number; // e.g. 20%
  lastReplacementDate: string;
  estimatedRemainingParts: number;
  replacementInStore: number;
  status: 'OPTIMAL' | 'REPLACE_SOON' | 'EXHAUSTED';
}

export interface RealTimeCosts {
  materialCost: number;
  laborCost: number;
  machineCost: number;
  totalCost: number;
  unitCostVerified: number;
}

export interface FactoryKPIs {
  activeSpindlesCount: number;
  totalSpindlesCount: number;
  shopUtilizationPct: number;
  factoryOeePct: number;
  availabilityPct: number;
  performancePct: number;
  qualityPct: number;
  runningJobsCount: number;
  queuedJobsCount: number;
  completedTodayCount: number;
  activeExceptionsCount: number;
  costs: RealTimeCosts;
  lastDataRefresh: string;
  connectionStatus: ConnectionState;
}

export interface AuditRecord {
  id: string;
  orderNumber: string;
  customerName?: string;
  units: number;
  completionDate: string;
  status: 'COMPLETED';
  machineId: string;
  verifiedBy: string;
  totalCost: number; // In INR (₹)
  challanNumber?: string;
  hsnCode?: string;
}
