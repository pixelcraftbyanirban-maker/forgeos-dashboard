import { Machine, Job, ProductionException, FactoryKPIs, AuditRecord, MachineStateInterval } from '../types';

/**
 * FORGEOS Operational Dataset
 * Calibrated for a 12-spindle High-Mix Low-Volume (HMLV) CNC Machining Facility.
 * 
 * NOTE: Explicitly flagged as illustrative sample data per Section 12 Data Integrity Rules.
 */
export const IS_SAMPLE_DATA = true;
export const DATA_DISCLAIMER = "ILLUSTRATIVE SAMPLE OPERATIONAL DATA • 12-SPINDLE HMLV FACILITY";

// Standard 8-Hour Shift State Interval Profiles (06:00 to 14:00)
const SHIFT_PROFILES: Record<string, MachineStateInterval[]> = {
  HIGH_UTILIZATION: [
    { startHour: "06:00", durationMinutes: 30, state: "SETUP", reason: "Tool loading & offset probe" },
    { startHour: "06:30", durationMinutes: 180, state: "RUNNING", reason: "Op 20 Roughing pass" },
    { startHour: "09:30", durationMinutes: 15, state: "IDLE", reason: "Part flip & fixture blowoff" },
    { startHour: "09:45", durationMinutes: 240, state: "RUNNING", reason: "Op 30 5-Axis finishing" },
    { startHour: "13:45", durationMinutes: 15, state: "IDLE", reason: "In-process manual caliper check" }
  ],
  BALANCED_MILLING: [
    { startHour: "06:00", durationMinutes: 45, state: "SETUP", reason: "Vise alignment & zero-point check" },
    { startHour: "06:45", durationMinutes: 195, state: "RUNNING", reason: "Pocket clearing & contouring" },
    { startHour: "10:00", durationMinutes: 30, state: "IDLE", reason: "Operator chip bin clearance" },
    { startHour: "10:30", durationMinutes: 210, state: "RUNNING", reason: "Thread milling & chamfering" }
  ],
  SETUP_HEAVY: [
    { startHour: "06:00", durationMinutes: 120, state: "SETUP", reason: "Custom 4-jaw chuck dial-in" },
    { startHour: "08:00", durationMinutes: 150, state: "RUNNING", reason: "OD/ID turning cycle" },
    { startHour: "10:30", durationMinutes: 90, state: "SETUP", reason: "Boring bar tool height touch-off" },
    { startHour: "12:00", durationMinutes: 120, state: "RUNNING", reason: "Finish facing & groove cycle" }
  ],
  ALARM_HALTED: [
    { startHour: "06:00", durationMinutes: 30, state: "SETUP", reason: "Pallet 2 clamp setup" },
    { startHour: "06:30", durationMinutes: 180, state: "RUNNING", reason: "Heavy roughing pass" },
    { startHour: "09:30", durationMinutes: 90, state: "ALARM", reason: "Spindle thermal overload (#2041)" },
    { startHour: "11:00", durationMinutes: 180, state: "STOPPED", reason: "Awaiting maintenance technician" }
  ],
  IDLE_STARVED: [
    { startHour: "06:00", durationMinutes: 180, state: "RUNNING", reason: "Batch run completion" },
    { startHour: "09:00", durationMinutes: 45, state: "SETUP", reason: "Tear-down & vacuum clean" },
    { startHour: "09:45", durationMinutes: 255, state: "IDLE", reason: "Awaiting material staging from saw" }
  ]
};

export const INITIAL_MACHINES: Machine[] = [
  {
    id: "CNC-01",
    name: "DMG MORI DMU 50 (5-Axis)",
    axisCount: 5,
    state: "RUNNING",
    connectionState: "CURRENT",
    currentJobId: "JOB-123442",
    operator: "M. Vance",
    spindleRpm: 14200,
    maxRpm: 20000,
    feedRateMmpm: 3850,
    maxFeedRate: 6000,
    feedOverridePct: 100,
    oee: { overall: 94.5, availability: 96.2, performance: 98.4, quality: 99.8 },
    lastStateChange: "1h 42m ago",
    telemetryTimestamp: "Just now",
    uptimeHoursToday: 6.8,
    stateHistory: SHIFT_PROFILES.HIGH_UTILIZATION
  },
  {
    id: "CNC-02",
    name: "Matsuura MAM72-35V (5-Axis)",
    axisCount: 5,
    state: "RUNNING",
    connectionState: "CURRENT",
    currentJobId: "JOB-123448",
    operator: "R. Sharma",
    spindleRpm: 18000,
    maxRpm: 24000,
    feedRateMmpm: 4200,
    maxFeedRate: 7000,
    feedOverridePct: 100,
    oee: { overall: 91.2, availability: 93.0, performance: 98.1, quality: 100.0 },
    lastStateChange: "3h 10m ago",
    telemetryTimestamp: "Just now",
    uptimeHoursToday: 7.1,
    stateHistory: SHIFT_PROFILES.HIGH_UTILIZATION
  },
  {
    id: "CNC-03",
    name: "Hermle C42 U (5-Axis)",
    axisCount: 5,
    state: "SETUP",
    connectionState: "CURRENT",
    currentJobId: "JOB-123456",
    operator: "K. Lindqvist",
    spindleRpm: 0,
    maxRpm: 18000,
    feedRateMmpm: 0,
    maxFeedRate: 5000,
    feedOverridePct: 0,
    oee: { overall: 68.4, availability: 70.0, performance: 98.0, quality: 99.5 },
    lastStateChange: "24m ago",
    telemetryTimestamp: "12s ago",
    uptimeHoursToday: 4.2,
    stateHistory: SHIFT_PROFILES.SETUP_HEAVY
  },
  {
    id: "CNC-04",
    name: "Mazak Variaxis i-600 (5-Axis)",
    axisCount: 5,
    state: "RUNNING",
    connectionState: "CURRENT",
    currentJobId: "JOB-123460",
    operator: "T. Chen",
    spindleRpm: 12500,
    maxRpm: 18000,
    feedRateMmpm: 3400,
    maxFeedRate: 5500,
    feedOverridePct: 95,
    oee: { overall: 88.6, availability: 91.5, performance: 97.0, quality: 99.8 },
    lastStateChange: "2h 15m ago",
    telemetryTimestamp: "Just now",
    uptimeHoursToday: 6.2,
    stateHistory: SHIFT_PROFILES.BALANCED_MILLING
  },
  {
    id: "CNC-05",
    name: "Haas VF-4SS (4-Axis)",
    axisCount: 4,
    state: "RUNNING",
    connectionState: "CURRENT",
    currentJobId: "JOB-123465",
    operator: "D. Miller",
    spindleRpm: 11800,
    maxRpm: 12000,
    feedRateMmpm: 2900,
    maxFeedRate: 4500,
    feedOverridePct: 100,
    oee: { overall: 86.4, availability: 89.0, performance: 97.2, quality: 99.9 },
    lastStateChange: "4h 05m ago",
    telemetryTimestamp: "Just now",
    uptimeHoursToday: 6.9,
    stateHistory: SHIFT_PROFILES.BALANCED_MILLING
  },
  {
    id: "CNC-06",
    name: "Makino a61nx HMC (4-Axis)",
    axisCount: 4,
    state: "ALARM",
    connectionState: "CURRENT",
    currentJobId: "JOB-123458",
    operator: "J. Kowalski",
    spindleRpm: 0,
    maxRpm: 14000,
    feedRateMmpm: 0,
    maxFeedRate: 5000,
    feedOverridePct: 0,
    oee: { overall: 54.2, availability: 58.0, performance: 94.0, quality: 99.4 },
    lastStateChange: "14m ago",
    telemetryTimestamp: "4s ago",
    uptimeHoursToday: 3.5,
    stateHistory: SHIFT_PROFILES.ALARM_HALTED
  },
  {
    id: "CNC-07",
    name: "Doosan DNM 5700 (3-Axis)",
    axisCount: 3,
    state: "RUNNING",
    connectionState: "CURRENT",
    currentJobId: "JOB-123471",
    operator: "S. Patel",
    spindleRpm: 9800,
    maxRpm: 12000,
    feedRateMmpm: 2400,
    maxFeedRate: 4000,
    feedOverridePct: 90,
    oee: { overall: 89.3, availability: 92.0, performance: 97.1, quality: 100.0 },
    lastStateChange: "1h 50m ago",
    telemetryTimestamp: "Just now",
    uptimeHoursToday: 5.8,
    stateHistory: SHIFT_PROFILES.BALANCED_MILLING
  },
  {
    id: "CNC-08",
    name: "Doosan PUMA 2600SY (Turning Center)",
    axisCount: 4,
    state: "IDLE",
    connectionState: "CURRENT",
    currentJobId: null,
    operator: "Unassigned",
    spindleRpm: 0,
    maxRpm: 4500,
    feedRateMmpm: 0,
    maxFeedRate: 3000,
    feedOverridePct: 0,
    oee: { overall: 72.1, availability: 76.0, performance: 95.0, quality: 99.8 },
    lastStateChange: "38m ago",
    telemetryTimestamp: "Just now",
    uptimeHoursToday: 4.1,
    stateHistory: SHIFT_PROFILES.IDLE_STARVED
  },
  {
    id: "CNC-09",
    name: "Okuma Genos M560V (3-Axis)",
    axisCount: 3,
    state: "RUNNING",
    connectionState: "CURRENT",
    currentJobId: "JOB-123477",
    operator: "A. Rossi",
    spindleRpm: 12000,
    maxRpm: 15000,
    feedRateMmpm: 3100,
    maxFeedRate: 5000,
    feedOverridePct: 100,
    oee: { overall: 92.8, availability: 94.2, performance: 98.6, quality: 99.9 },
    lastStateChange: "5h 12m ago",
    telemetryTimestamp: "Just now",
    uptimeHoursToday: 7.2,
    stateHistory: SHIFT_PROFILES.HIGH_UTILIZATION
  },
  {
    id: "CNC-10",
    name: "Okuma Multus U3000 (Multi-Tasking)",
    axisCount: 5,
    state: "RUNNING",
    connectionState: "CURRENT",
    currentJobId: "JOB-123482",
    operator: "E. Jensen",
    spindleRpm: 8500,
    maxRpm: 12000,
    feedRateMmpm: 2600,
    maxFeedRate: 4500,
    feedOverridePct: 100,
    oee: { overall: 90.1, availability: 92.5, performance: 97.4, quality: 100.0 },
    lastStateChange: "2h 40m ago",
    telemetryTimestamp: "Just now",
    uptimeHoursToday: 6.4,
    stateHistory: SHIFT_PROFILES.HIGH_UTILIZATION
  },
  {
    id: "CNC-11",
    name: "Mori Seiki NLX 2500 (Turning)",
    axisCount: 4,
    state: "STOPPED",
    connectionState: "DELAYED",
    currentJobId: null,
    operator: "H. Weber",
    spindleRpm: 0,
    maxRpm: 4000,
    feedRateMmpm: 0,
    maxFeedRate: 2500,
    feedOverridePct: 0,
    oee: { overall: 61.0, availability: 65.0, performance: 94.0, quality: 99.8 },
    lastStateChange: "1h 15m ago",
    telemetryTimestamp: "2m ago (Delayed)",
    uptimeHoursToday: 3.8,
    stateHistory: SHIFT_PROFILES.ALARM_HALTED
  },
  {
    id: "CNC-12",
    name: "Brother Speedio M140X2 (5-Axis)",
    axisCount: 5,
    state: "RUNNING",
    connectionState: "CURRENT",
    currentJobId: "JOB-123490",
    operator: "L. Moreau",
    spindleRpm: 16000,
    maxRpm: 24000,
    feedRateMmpm: 4500,
    maxFeedRate: 8000,
    feedOverridePct: 100,
    oee: { overall: 93.4, availability: 95.0, performance: 98.4, quality: 99.9 },
    lastStateChange: "3h 30m ago",
    telemetryTimestamp: "Just now",
    uptimeHoursToday: 6.7,
    stateHistory: SHIFT_PROFILES.HIGH_UTILIZATION
  }
];

export const INITIAL_JOBS: Job[] = [
  {
    id: "JOB-123442",
    orderNumber: "#123442",
    customerCode: "AERO-702",
    partName: "Turbine Impeller Blisk",
    partNumber: "BLSK-316-V4",
    material: "Stainless Steel 316L",
    priority: "HIGH",
    quantityTarget: 100,
    quantityCompleted: 50,
    quantityScrapped: 0,
    state: "IN_PROGRESS",
    targetMachineId: "CNC-01",
    plannedStart: "2026-11-05 06:00",
    estCompletion: "2026-11-05 18:30",
    verifiedUnitCost: 12.50,
    currentOperation: "Op 30: 5-Axis Finish Milling",
    progressPercent: 50,
    operations: [
      { id: "OP-1", stepNumber: 10, name: "Billet Rough Facing", machineType: "3-Axis VMC", plannedMinutes: 45, actualMinutes: 42, state: "COMPLETED" },
      { id: "OP-2", stepNumber: 20, name: "Semi-Finish Blade Pockets", machineType: "5-Axis VMC", plannedMinutes: 90, actualMinutes: 88, state: "COMPLETED" },
      { id: "OP-3", stepNumber: 30, name: "5-Axis Finish Blade Profiling", machineType: "5-Axis VMC", plannedMinutes: 120, actualMinutes: 60, state: "IN_PROGRESS" },
      { id: "OP-4", stepNumber: 40, name: "Deburr & CMM Inspection", machineType: "QA Cell", plannedMinutes: 30, actualMinutes: 0, state: "NOT_STARTED" }
    ]
  },
  {
    id: "JOB-125457",
    orderNumber: "#125457",
    customerCode: "HYDR-419",
    partName: "Hydraulic Manifold Block",
    partNumber: "MNFD-6061-A",
    material: "Aluminum 6061-T6",
    priority: "NORMAL",
    quantityTarget: 80,
    quantityCompleted: 0,
    quantityScrapped: 0,
    state: "NOT_STARTED",
    targetMachineId: "CNC-01",
    plannedStart: "2026-11-05 19:00",
    estCompletion: "2026-11-06 04:00",
    verifiedUnitCost: 8.75,
    currentOperation: "Op 10: Rough Squaring & Bore",
    progressPercent: 0,
    operations: [
      { id: "OP-5", stepNumber: 10, name: "Rough Squaring & Bore", machineType: "4-Axis HMC", plannedMinutes: 60, actualMinutes: 0, state: "NOT_STARTED" },
      { id: "OP-6", stepNumber: 20, name: "Cavity Port Machining (SAE)", machineType: "5-Axis VMC", plannedMinutes: 110, actualMinutes: 0, state: "NOT_STARTED" },
      { id: "OP-7", stepNumber: 30, name: "Ultrasonic Cleaning & Anodize", machineType: "Finishing Cell", plannedMinutes: 40, actualMinutes: 0, state: "NOT_STARTED" }
    ]
  },
  {
    id: "JOB-123456",
    orderNumber: "#123456",
    customerCode: "VALV-108",
    partName: "High-Pressure Valve Seat",
    partNumber: "VLV-315-HP",
    material: "Steel 315 / 316",
    priority: "URGENT",
    quantityTarget: 50,
    quantityCompleted: 12,
    quantityScrapped: 2,
    state: "ON_HOLD",
    targetMachineId: "CNC-03",
    plannedStart: "2026-11-05 08:00",
    estCompletion: "2026-11-05 16:00 (Delayed)",
    verifiedUnitCost: 24.80,
    currentOperation: "Op 20: Thread Mill & Bore (Delayed in Setup)",
    progressPercent: 24,
    operations: [
      { id: "OP-8", stepNumber: 10, name: "Rough Turning OD/ID", machineType: "CNC Lathe", plannedMinutes: 40, actualMinutes: 45, state: "COMPLETED" },
      { id: "OP-9", stepNumber: 20, name: "5-Axis Thread Mill & Bore", machineType: "5-Axis VMC", plannedMinutes: 80, actualMinutes: 20, state: "ON_HOLD" },
      { id: "OP-10", stepNumber: 30, name: "Pressure Seal Seat Lapping", machineType: "Grinding Cell", plannedMinutes: 35, actualMinutes: 0, state: "NOT_STARTED" }
    ]
  },
  {
    id: "JOB-123448",
    orderNumber: "#123448",
    customerCode: "ROBO-304",
    partName: "Robotic Articulation Flange",
    partNumber: "ROB-FLG-7X",
    material: "Titanium Ti-6Al-4V",
    priority: "HIGH",
    quantityTarget: 40,
    quantityCompleted: 28,
    quantityScrapped: 0,
    state: "IN_PROGRESS",
    targetMachineId: "CNC-02",
    plannedStart: "2026-11-05 07:00",
    estCompletion: "2026-11-05 15:45",
    verifiedUnitCost: 65.20,
    currentOperation: "Op 20: 5-Axis Simultaneous Contour",
    progressPercent: 70,
    operations: [
      { id: "OP-11", stepNumber: 10, name: "Billet Roughing & Bolt Holes", machineType: "5-Axis VMC", plannedMinutes: 50, actualMinutes: 48, state: "COMPLETED" },
      { id: "OP-12", stepNumber: 20, name: "5-Axis Simultaneous Contour", machineType: "5-Axis VMC", plannedMinutes: 130, actualMinutes: 90, state: "IN_PROGRESS" },
      { id: "OP-13", stepNumber: 30, name: "Coordinate Measuring Verification", machineType: "QA Cell", plannedMinutes: 25, actualMinutes: 0, state: "NOT_STARTED" }
    ]
  },
  {
    id: "JOB-123460",
    orderNumber: "#123460",
    customerCode: "AERO-702",
    partName: "Fuel Nozzle Swirler Plate",
    partNumber: "NZL-718-SP",
    material: "Inconel 718",
    priority: "NORMAL",
    quantityTarget: 60,
    quantityCompleted: 18,
    quantityScrapped: 1,
    state: "IN_PROGRESS",
    targetMachineId: "CNC-04",
    plannedStart: "2026-11-05 08:30",
    estCompletion: "2026-11-05 20:00",
    verifiedUnitCost: 110.00,
    currentOperation: "Op 15: Deep Hole EDM & Drill",
    progressPercent: 30,
    operations: [
      { id: "OP-14", stepNumber: 10, name: "Blank Preparation", machineType: "3-Axis VMC", plannedMinutes: 30, actualMinutes: 29, state: "COMPLETED" },
      { id: "OP-15", stepNumber: 15, name: "Deep Micro-Drilling", machineType: "5-Axis VMC", plannedMinutes: 140, actualMinutes: 42, state: "IN_PROGRESS" },
      { id: "OP-16", stepNumber: 25, name: "Flow Coefficient Verification", machineType: "Flow Bench", plannedMinutes: 20, actualMinutes: 0, state: "NOT_STARTED" }
    ]
  },
  {
    id: "JOB-123465",
    orderNumber: "#123465",
    customerCode: "MED-551",
    partName: "Orthopedic Bone Plate",
    partNumber: "MED-PLT-T3",
    material: "Titanium Grade 5",
    priority: "HIGH",
    quantityTarget: 120,
    quantityCompleted: 72,
    quantityScrapped: 0,
    state: "IN_PROGRESS",
    targetMachineId: "CNC-05",
    plannedStart: "2026-11-05 06:30",
    estCompletion: "2026-11-05 17:00",
    verifiedUnitCost: 38.50,
    currentOperation: "Op 25: Screw Hole Chamfering & Profile",
    progressPercent: 60,
    operations: [
      { id: "OP-17", stepNumber: 10, name: "Profile Roughing", machineType: "4-Axis VMC", plannedMinutes: 60, actualMinutes: 58, state: "COMPLETED" },
      { id: "OP-18", stepNumber: 25, name: "Screw Hole Chamfering & Profile", machineType: "4-Axis VMC", plannedMinutes: 110, actualMinutes: 66, state: "IN_PROGRESS" },
      { id: "OP-19", stepNumber: 35, name: "Electropolish & Laser Mark", machineType: "Finishing Cell", plannedMinutes: 45, actualMinutes: 0, state: "NOT_STARTED" }
    ]
  },
  {
    id: "JOB-123471",
    orderNumber: "#123471",
    customerCode: "AUTO-882",
    partName: "Crankcase Bearing Cap",
    partNumber: "CRK-CAP-40",
    material: "Cast Iron GJS-500",
    priority: "NORMAL",
    quantityTarget: 200,
    quantityCompleted: 140,
    quantityScrapped: 3,
    state: "IN_PROGRESS",
    targetMachineId: "CNC-07",
    plannedStart: "2026-11-05 05:00",
    estCompletion: "2026-11-05 14:30",
    verifiedUnitCost: 6.20,
    currentOperation: "Op 20: Line Bore Finish",
    progressPercent: 70,
    operations: [
      { id: "OP-20", stepNumber: 10, name: "Mating Face Mill", machineType: "3-Axis VMC", plannedMinutes: 50, actualMinutes: 48, state: "COMPLETED" },
      { id: "OP-21", stepNumber: 20, name: "Line Bore Finish", machineType: "3-Axis VMC", plannedMinutes: 90, actualMinutes: 63, state: "IN_PROGRESS" },
      { id: "OP-22", stepNumber: 30, name: "Washing & Rust Prevention", machineType: "Wash Cell", plannedMinutes: 15, actualMinutes: 0, state: "NOT_STARTED" }
    ]
  },
  {
    id: "JOB-123477",
    orderNumber: "#123477",
    customerCode: "OPT-119",
    partName: "Optical Sensor Gimbal Ring",
    partNumber: "GMB-OPT-88",
    material: "Aluminum 7075-T6",
    priority: "NORMAL",
    quantityTarget: 75,
    quantityCompleted: 60,
    quantityScrapped: 0,
    state: "IN_PROGRESS",
    targetMachineId: "CNC-09",
    plannedStart: "2026-11-05 07:30",
    estCompletion: "2026-11-05 16:15",
    verifiedUnitCost: 42.00,
    currentOperation: "Op 30: High-Speed Profiling",
    progressPercent: 80,
    operations: [
      { id: "OP-23", stepNumber: 10, name: "Bearing Pocket Bore", machineType: "3-Axis VMC", plannedMinutes: 40, actualMinutes: 38, state: "COMPLETED" },
      { id: "OP-24", stepNumber: 20, name: "Lightweight Pocketing", machineType: "3-Axis VMC", plannedMinutes: 70, actualMinutes: 69, state: "COMPLETED" },
      { id: "OP-25", stepNumber: 30, name: "High-Speed Profiling", machineType: "3-Axis VMC", plannedMinutes: 50, actualMinutes: 40, state: "IN_PROGRESS" }
    ]
  },
  {
    id: "JOB-123482",
    orderNumber: "#123482",
    customerCode: "DEF-900",
    partName: "Guidance Actuator Spline Shaft",
    partNumber: "ACT-SPL-90",
    material: "17-4 PH Stainless Steel",
    priority: "URGENT",
    quantityTarget: 35,
    quantityCompleted: 14,
    quantityScrapped: 0,
    state: "IN_PROGRESS",
    targetMachineId: "CNC-10",
    plannedStart: "2026-11-05 09:00",
    estCompletion: "2026-11-05 19:30",
    verifiedUnitCost: 78.40,
    currentOperation: "Op 20: Mill-Turn Involute Spline Hobbing",
    progressPercent: 40,
    operations: [
      { id: "OP-26", stepNumber: 10, name: "Turn OD & Thread Ends", machineType: "Mill-Turn Lathe", plannedMinutes: 60, actualMinutes: 58, state: "COMPLETED" },
      { id: "OP-27", stepNumber: 20, name: "Involute Spline Hobbing", machineType: "Mill-Turn Lathe", plannedMinutes: 90, actualMinutes: 36, state: "IN_PROGRESS" },
      { id: "OP-28", stepNumber: 30, name: "Heat Treat H900 & Polish", machineType: "Thermal Cell", plannedMinutes: 180, actualMinutes: 0, state: "NOT_STARTED" }
    ]
  },
  {
    id: "JOB-123490",
    orderNumber: "#123490",
    customerCode: "SEMI-614",
    partName: "Wafer Vacuum Chuck Pedestal",
    partNumber: "WFR-CHK-55",
    material: "Silicon Infiltrated SiC",
    priority: "HIGH",
    quantityTarget: 25,
    quantityCompleted: 15,
    quantityScrapped: 0,
    state: "IN_PROGRESS",
    targetMachineId: "CNC-12",
    plannedStart: "2026-11-05 08:00",
    estCompletion: "2026-11-05 16:45",
    verifiedUnitCost: 195.00,
    currentOperation: "Op 40: Diamond Ultrasonic Milling",
    progressPercent: 60,
    operations: [
      { id: "OP-29", stepNumber: 10, name: "Diamond Grinding Face", machineType: "Surface Grinder", plannedMinutes: 60, actualMinutes: 59, state: "COMPLETED" },
      { id: "OP-30", stepNumber: 20, name: "Ultrasonic Vacuum Port Drill", machineType: "5-Axis Ultrasonic", plannedMinutes: 100, actualMinutes: 98, state: "COMPLETED" },
      { id: "OP-31", stepNumber: 40, name: "Diamond Ultrasonic Milling", machineType: "5-Axis Ultrasonic", plannedMinutes: 120, actualMinutes: 72, state: "IN_PROGRESS" }
    ]
  }
];

export const INITIAL_EXCEPTIONS: ProductionException[] = [
  {
    id: "EX-01",
    severity: "CRITICAL",
    category: "MACHINE_ALARM",
    title: "Spindle Thermal Overload (Alarm #2041)",
    description: "CNC-06 Makino a61nx halted during roughing pass on Job #123458. Coolant pressure drop detected below 12 bar limit.",
    timestamp: "14 mins ago",
    machineId: "CNC-06",
    jobId: "#123458",
    acknowledged: false,
    events: [
      { time: "14:18:02", source: "PLC Main Alarm Channel", message: "SPINDLE_OVERLOAD_SHUTDOWN: Alarm 2041 active", channel: "S1_THERMAL", sensorValue: "88.4°C (Limit: 75°C)" },
      { time: "14:17:48", source: "Coolant Pressure Transducer", message: "Pressure drop below safe cutoff threshold", channel: "COOLANT_BAR", sensorValue: "9.2 bar (Min: 12.0 bar)" },
      { time: "14:15:10", source: "Spindle Drive Inverter", message: "Motor torque surge detected during roughing pass", channel: "DRIVE_TORQUE", sensorValue: "118% continuous" }
    ]
  },
  {
    id: "EX-02",
    severity: "WARNING",
    category: "SETUP_DELAY",
    title: "Fixture Verification Exceeded Target (+35m)",
    description: "CNC-03 Hermle C42 setup on Job #123456 delayed due to custom soft-jaw dial indicator recalibration.",
    timestamp: "24 mins ago",
    machineId: "CNC-03",
    jobId: "#123456",
    acknowledged: true,
    acknowledgedBy: "K. Lindqvist",
    events: [
      { time: "14:08:12", source: "Shop Floor Workstation", message: "Operator flagged fixture runout > 0.005mm tolerance", channel: "DIAL_INDICATOR", sensorValue: "+0.012mm runout" },
      { time: "13:45:00", source: "MES Job Scheduler", message: "Planned setup window elapsed (Target: 45 min, Actual: 80 min)", channel: "SETUP_TIMER", sensorValue: "+35 min variance" }
    ]
  },
  {
    id: "EX-03",
    severity: "INFO",
    category: "TOOL_WEAR",
    title: "Tool Life Expiry Warning: 10mm Carbide Ball Nose",
    description: "CNC-01 DMU 50 tool pocket #24 has reached 88% predicted tool wear limit. Tool change suggested before finishing cycle.",
    timestamp: "45 mins ago",
    machineId: "CNC-01",
    jobId: "#123442",
    acknowledged: true,
    acknowledgedBy: "M. Vance",
    events: [
      { time: "13:47:30", source: "Tool Management System", message: "Tool Pocket #24 cut distance: 1,420 meters", channel: "TOOL_24_LIFE", sensorValue: "88% worn (Exp: 1,600m)" }
    ]
  },
  {
    id: "EX-04",
    severity: "WARNING",
    category: "CYCLE_TIME_DEVIATION",
    title: "Cycle Time Deviation (+14.2% over target)",
    description: "CNC-07 Doosan DNM 5700 roughing cycle time exceeded standard target on Cast Iron batch #123471 due to feed override backing off.",
    timestamp: "1h 10m ago",
    machineId: "CNC-07",
    jobId: "#123471",
    acknowledged: false,
    events: [
      { time: "13:22:15", source: "Controller Feed Monitor", message: "Feed override set to 90% by operator", channel: "FEED_OVERRIDE", sensorValue: "90% (Std: 100%)" },
      { time: "13:20:00", source: "Acoustic Emission Sensor", message: "Chatter vibration threshold reached, operator reduced feed", channel: "VIB_Z_RMS", sensorValue: "4.8 mm/s²" }
    ]
  }
];

export const INITIAL_AUDIT_HISTORY: AuditRecord[] = [
  {
    id: "AUD-01",
    orderNumber: "#123450",
    units: 100,
    completionDate: "2026-11-05 16:45",
    status: "COMPLETED",
    machineId: "CNC-01",
    verifiedBy: "QC Lead: S. Harrison",
    totalCost: 1250.00
  },
  {
    id: "AUD-02",
    orderNumber: "#123451",
    units: 75,
    completionDate: "2026-11-04 14:15",
    status: "COMPLETED",
    machineId: "CNC-04",
    verifiedBy: "QC Lead: T. Chen",
    totalCost: 980.50
  },
  {
    id: "AUD-03",
    orderNumber: "#123447",
    units: 150,
    completionDate: "2026-11-03 19:30",
    status: "COMPLETED",
    machineId: "CNC-02",
    verifiedBy: "QC Lead: S. Harrison",
    totalCost: 1875.00
  }
];

export const INITIAL_FACTORY_KPIS: FactoryKPIs = {
  activeSpindlesCount: 8,
  totalSpindlesCount: 12,
  shopUtilizationPct: 83.3,
  factoryOeePct: 87.4,
  availabilityPct: 91.2,
  performancePct: 96.8,
  qualityPct: 99.1,
  runningJobsCount: 8,
  queuedJobsCount: 14,
  completedTodayCount: 3,
  activeExceptionsCount: 2,
  costs: {
    materialCost: 1250.00,
    laborCost: 550.00,
    machineCost: 1500.00,
    totalCost: 3300.00,
    unitCostVerified: 12.50
  },
  lastDataRefresh: "2026-11-05 17:05:00",
  connectionStatus: "CURRENT"
};
