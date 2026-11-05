/**
 * FORGEOS Manufacturing Execution System (MES)
 * Core Domain Types & Strict State Separation
 */

// Category A: Machine States
export type MachineState = 'RUNNING' | 'IDLE' | 'SETUP' | 'STOPPED' | 'ALARM';

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
  verifiedUnitCost: number; // In currency units, e.g. $12.50
  currentOperation: string;
  progressPercent: number;
  operations?: Operation[];
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
  axisCount: 3 | 4 | 5;
  state: MachineState;
  connectionState: ConnectionState;
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
  lastStateChange: string;
  telemetryTimestamp: string;
  uptimeHoursToday: number;
  stateHistory?: MachineStateInterval[];
}

export interface ExceptionEvent {
  time: string;
  source: string;
  message: string;
  channel?: string;
  sensorValue?: string;
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
  acknowledged: boolean;
  acknowledgedBy?: string;
  events?: ExceptionEvent[];
  resolutionNotes?: string;
  resolvedAt?: string;
  resolvedBy?: string;
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
  units: number;
  completionDate: string;
  status: 'COMPLETED';
  machineId: string;
  verifiedBy: string;
  totalCost: number;
}
