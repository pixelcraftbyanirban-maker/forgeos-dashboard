import { Machine, Job, ProductionException, FactoryKPIs, AuditRecord, MachineStateInterval } from '../types';

/**
 * FORGEOS Operational Dataset — India-First Localisation
 * Calibrated for a 24-Spindle High-Mix Low-Volume (HMLV) CNC Machining Facility.
 * 
 * Company: SHREE GANESH PRECISION ENGINEERING PVT. LTD.
 * Location: Howrah, West Bengal, India (Baltikuri Industrial Complex)
 * 
 * NOTE: Explicitly flagged as illustrative sample data per Section 12 Data Integrity Rules.
 */
export const IS_SAMPLE_DATA = true;
export const DATA_DISCLAIMER = "ILLUSTRATIVE SAMPLE OPERATIONAL DATA • SHREE GANESH PRECISION ENGINEERING PVT. LTD. (HOWRAH, WB)";

// Standard 8-Hour Shift State Interval Profiles (06:00 to 14:00 IST)
const SHIFT_PROFILES: Record<string, MachineStateInterval[]> = {
  HIGH_UTILIZATION: [
    { startHour: "06:00", durationMinutes: 30, state: "SETUP", reason: "Fixture dial-in & tool offset touch-off" },
    { startHour: "06:30", durationMinutes: 180, state: "RUNNING", reason: "Op 20 Roughing cycle" },
    { startHour: "09:30", durationMinutes: 15, state: "IDLE", reason: "Part flip & fixture air-blow" },
    { startHour: "09:45", durationMinutes: 240, state: "RUNNING", reason: "Op 30 Precision finish milling" },
    { startHour: "13:45", durationMinutes: 15, state: "IDLE", reason: "First-piece vernier check" }
  ],
  BALANCED_MILLING: [
    { startHour: "06:00", durationMinutes: 45, state: "SETUP", reason: "Vise alignment & zero-point dial indicator" },
    { startHour: "06:45", durationMinutes: 195, state: "RUNNING", reason: "Pocket milling & profile contouring" },
    { startHour: "10:00", durationMinutes: 30, state: "IDLE", reason: "Operator chip swarf tray clearance" },
    { startHour: "10:30", durationMinutes: 210, state: "RUNNING", reason: "Thread milling & chamfering pass" }
  ],
  SETUP_HEAVY: [
    { startHour: "06:00", durationMinutes: 120, state: "SETUP", reason: "4-Jaw chuck dial-in & soft jaw boring" },
    { startHour: "08:00", durationMinutes: 150, state: "RUNNING", reason: "Rough turning OD/ID pass" },
    { startHour: "10:30", durationMinutes: 90, state: "SETUP", reason: "Boring bar tool touch-off" },
    { startHour: "12:00", durationMinutes: 120, state: "RUNNING", reason: "Finish facing & groove cycle" }
  ],
  ALARM_HALTED: [
    { startHour: "06:00", durationMinutes: 30, state: "SETUP", reason: "Component clamping setup" },
    { startHour: "06:30", durationMinutes: 180, state: "RUNNING", reason: "Heavy roughing pass" },
    { startHour: "09:30", durationMinutes: 90, state: "ALARM", reason: "Coolant line pressure drop (<10 bar)" },
    { startHour: "11:00", durationMinutes: 180, state: "STOPPED", reason: "Awaiting maintenance supervisor (Vikram Singh)" }
  ],
  IDLE_STARVED: [
    { startHour: "06:00", durationMinutes: 180, state: "RUNNING", reason: "Batch run completion" },
    { startHour: "09:00", durationMinutes: 45, state: "SETUP", reason: "Tear-down & machine bed cleaning" },
    { startHour: "09:45", durationMinutes: 255, state: "IDLE", reason: "Awaiting raw billet staging from stores" }
  ]
};

// 24 CNC Machine Fleet across 3 sections in Howrah facility
export const INITIAL_MACHINES: Machine[] = [
  // SECTION 1: VMC & 5-AXIS MILLING CENTER (8 Machines)
  {
    id: "VMC-01",
    name: "Ace Micromatic MCV-400 (3-Axis VMC)",
    section: "Section 1: VMC Center",
    axisCount: 3,
    state: "RUNNING",
    connectionState: "CURRENT",
    currentJobId: "JOB-2026-001",
    operator: "Rahul Das",
    spindleRpm: 7800,
    maxRpm: 10000,
    feedRateMmpm: 2400,
    maxFeedRate: 5000,
    feedOverridePct: 100,
    oee: { overall: 89.2, availability: 92.5, performance: 96.8, quality: 99.6 },
    lastStateChange: "2h 15m ago",
    telemetryTimestamp: "Just now",
    uptimeHoursToday: 6.9,
    stateHistory: SHIFT_PROFILES.HIGH_UTILIZATION
  },
  {
    id: "VMC-02",
    name: "DMG MORI DMU 50 (5-Axis Machining Center)",
    section: "Section 1: VMC Center",
    axisCount: 5,
    state: "ALARM",
    connectionState: "CURRENT",
    currentJobId: "JOB-2026-002",
    operator: "Amit Kumar",
    spindleRpm: 0,
    maxRpm: 18000,
    feedRateMmpm: 0,
    maxFeedRate: 6000,
    feedOverridePct: 0,
    oee: { overall: 64.5, availability: 68.0, performance: 95.2, quality: 99.8 },
    lastStateChange: "18m ago",
    telemetryTimestamp: "Just now",
    uptimeHoursToday: 3.4,
    stateHistory: SHIFT_PROFILES.ALARM_HALTED
  },
  {
    id: "VMC-03",
    name: "Haas VF-2SS (4-Axis High-Speed VMC)",
    section: "Section 1: VMC Center",
    axisCount: 4,
    state: "RUNNING",
    connectionState: "CURRENT",
    currentJobId: "JOB-2026-003",
    operator: "Suman Ghosh",
    spindleRpm: 11200,
    maxRpm: 12000,
    feedRateMmpm: 3200,
    maxFeedRate: 5500,
    feedOverridePct: 100,
    oee: { overall: 91.4, availability: 94.0, performance: 97.4, quality: 100.0 },
    lastStateChange: "3h 40m ago",
    telemetryTimestamp: "Just now",
    uptimeHoursToday: 7.2,
    stateHistory: SHIFT_PROFILES.HIGH_UTILIZATION
  },
  {
    id: "VMC-04",
    name: "Mazak VTC-800/30SR (5-Axis Traveling Column)",
    section: "Section 1: VMC Center",
    axisCount: 5,
    state: "RUNNING",
    connectionState: "CURRENT",
    currentJobId: "JOB-2026-004",
    operator: "Abhishek Verma",
    spindleRpm: 14000,
    maxRpm: 18000,
    feedRateMmpm: 3800,
    maxFeedRate: 6000,
    feedOverridePct: 100,
    oee: { overall: 93.8, availability: 95.5, performance: 98.4, quality: 99.8 },
    lastStateChange: "4h 10m ago",
    telemetryTimestamp: "Just now",
    uptimeHoursToday: 7.4,
    stateHistory: SHIFT_PROFILES.HIGH_UTILIZATION
  },
  {
    id: "VMC-05",
    name: "BFW Agni BMV 45 (3-Axis Heavy VMC)",
    section: "Section 1: VMC Center",
    axisCount: 3,
    state: "SETUP",
    connectionState: "CURRENT",
    currentJobId: "JOB-2026-005",
    operator: "Rakesh Yadav",
    spindleRpm: 0,
    maxRpm: 8000,
    feedRateMmpm: 0,
    maxFeedRate: 4000,
    feedOverridePct: 0,
    oee: { overall: 71.0, availability: 74.0, performance: 96.0, quality: 100.0 },
    lastStateChange: "35m ago",
    telemetryTimestamp: "Just now",
    uptimeHoursToday: 4.8,
    stateHistory: SHIFT_PROFILES.SETUP_HEAVY
  },
  {
    id: "VMC-06",
    name: "Hermle C42 U (5-Axis Dynamic)",
    section: "Section 1: VMC Center",
    axisCount: 5,
    state: "RUNNING",
    connectionState: "CURRENT",
    currentJobId: "JOB-2026-006",
    operator: "Debashis Roy",
    spindleRpm: 16500,
    maxRpm: 20000,
    feedRateMmpm: 4100,
    maxFeedRate: 7000,
    feedOverridePct: 100,
    oee: { overall: 92.5, availability: 94.0, performance: 98.6, quality: 99.8 },
    lastStateChange: "1h 50m ago",
    telemetryTimestamp: "Just now",
    uptimeHoursToday: 6.8,
    stateHistory: SHIFT_PROFILES.HIGH_UTILIZATION
  },
  {
    id: "VMC-07",
    name: "Makino PS105 (3-Axis Production VMC)",
    section: "Section 1: VMC Center",
    axisCount: 3,
    state: "RUNNING",
    connectionState: "CURRENT",
    currentJobId: "JOB-2026-007",
    operator: "Subir Paul",
    spindleRpm: 9200,
    maxRpm: 12000,
    feedRateMmpm: 2900,
    maxFeedRate: 5000,
    feedOverridePct: 100,
    oee: { overall: 88.6, availability: 91.0, performance: 97.5, quality: 99.9 },
    lastStateChange: "3h 25m ago",
    telemetryTimestamp: "Just now",
    uptimeHoursToday: 6.5,
    stateHistory: SHIFT_PROFILES.BALANCED_MILLING
  },
  {
    id: "VMC-08",
    name: "Jyoti VMC 850 (3-Axis Industrial VMC)",
    section: "Section 1: VMC Center",
    axisCount: 3,
    state: "IDLE",
    connectionState: "CURRENT",
    currentJobId: null,
    operator: "Manoj Sharma",
    spindleRpm: 0,
    maxRpm: 8000,
    feedRateMmpm: 0,
    maxFeedRate: 4000,
    feedOverridePct: 0,
    oee: { overall: 74.2, availability: 78.0, performance: 95.4, quality: 99.7 },
    lastStateChange: "42m ago",
    telemetryTimestamp: "Just now",
    uptimeHoursToday: 4.2,
    stateHistory: SHIFT_PROFILES.IDLE_STARVED
  },

  // SECTION 2: CNC TURNING & LATHE CENTER (8 Machines)
  {
    id: "CNC-01",
    name: "Mazak Quick Turn 250 MSY (4-Axis Mill-Turn)",
    section: "Section 2: CNC Turning Center",
    axisCount: 4,
    state: "RUNNING",
    connectionState: "CURRENT",
    currentJobId: "JOB-2026-008",
    operator: "Bikash Mondal",
    spindleRpm: 3400,
    maxRpm: 4500,
    feedRateMmpm: 1600,
    maxFeedRate: 3500,
    feedOverridePct: 100,
    oee: { overall: 94.1, availability: 96.0, performance: 98.2, quality: 99.8 },
    lastStateChange: "2h 45m ago",
    telemetryTimestamp: "Just now",
    uptimeHoursToday: 7.1,
    stateHistory: SHIFT_PROFILES.HIGH_UTILIZATION
  },
  {
    id: "CNC-02",
    name: "LMW Smarturn II (2-Axis Production Turning)",
    section: "Section 2: CNC Turning Center",
    axisCount: 3,
    state: "RUNNING",
    connectionState: "CURRENT",
    currentJobId: "JOB-2026-009",
    operator: "Sanjay Karmakar",
    spindleRpm: 2800,
    maxRpm: 4000,
    feedRateMmpm: 1400,
    maxFeedRate: 3000,
    feedOverridePct: 100,
    oee: { overall: 89.8, availability: 92.4, performance: 97.4, quality: 99.8 },
    lastStateChange: "4h 00m ago",
    telemetryTimestamp: "Just now",
    uptimeHoursToday: 6.9,
    stateHistory: SHIFT_PROFILES.BALANCED_MILLING
  },
  {
    id: "CNC-03",
    name: "Doosan PUMA 2600SY (4-Axis Sub-Spindle)",
    section: "Section 2: CNC Turning Center",
    axisCount: 4,
    state: "RUNNING",
    connectionState: "CURRENT",
    currentJobId: "JOB-2026-010",
    operator: "Pradip Sen",
    spindleRpm: 3200,
    maxRpm: 4000,
    feedRateMmpm: 1550,
    maxFeedRate: 3200,
    feedOverridePct: 100,
    oee: { overall: 91.0, availability: 93.5, performance: 97.5, quality: 99.8 },
    lastStateChange: "1h 30m ago",
    telemetryTimestamp: "Just now",
    uptimeHoursToday: 6.7,
    stateHistory: SHIFT_PROFILES.HIGH_UTILIZATION
  },
  {
    id: "CNC-04",
    name: "Ace Micromatic LT-20 Classic (2-Axis CNC)",
    section: "Section 2: CNC Turning Center",
    axisCount: 3,
    state: "SETUP",
    connectionState: "CURRENT",
    currentJobId: "JOB-2026-003",
    operator: "Goutam Naskar",
    spindleRpm: 0,
    maxRpm: 3500,
    feedRateMmpm: 0,
    maxFeedRate: 2500,
    feedOverridePct: 0,
    oee: { overall: 69.8, availability: 72.0, performance: 97.0, quality: 100.0 },
    lastStateChange: "32m ago",
    telemetryTimestamp: "Just now",
    uptimeHoursToday: 4.5,
    stateHistory: SHIFT_PROFILES.SETUP_HEAVY
  },
  {
    id: "CNC-05",
    name: "Haas ST-20Y (4-Axis Turn-Mill Center)",
    section: "Section 2: CNC Turning Center",
    axisCount: 4,
    state: "RUNNING",
    connectionState: "CURRENT",
    currentJobId: "JOB-2026-005",
    operator: "Alok Mukherjee",
    spindleRpm: 3800,
    maxRpm: 4500,
    feedRateMmpm: 1800,
    maxFeedRate: 3500,
    feedOverridePct: 100,
    oee: { overall: 92.4, availability: 94.2, performance: 98.3, quality: 99.8 },
    lastStateChange: "3h 15m ago",
    telemetryTimestamp: "Just now",
    uptimeHoursToday: 7.0,
    stateHistory: SHIFT_PROFILES.HIGH_UTILIZATION
  },
  {
    id: "CNC-06",
    name: "Mori Seiki NLX 2500 (4-Axis Precision Lathe)",
    section: "Section 2: CNC Turning Center",
    axisCount: 4,
    state: "RUNNING",
    connectionState: "CURRENT",
    currentJobId: "JOB-2026-007",
    operator: "Tarun Banerjee",
    spindleRpm: 3100,
    maxRpm: 4000,
    feedRateMmpm: 1500,
    maxFeedRate: 3000,
    feedOverridePct: 100,
    oee: { overall: 90.6, availability: 93.0, performance: 97.6, quality: 99.8 },
    lastStateChange: "2h 50m ago",
    telemetryTimestamp: "Just now",
    uptimeHoursToday: 6.6,
    stateHistory: SHIFT_PROFILES.BALANCED_MILLING
  },
  {
    id: "CNC-07",
    name: "LMW LL20T L5 (2-Axis Heavy Turning)",
    section: "Section 2: CNC Turning Center",
    axisCount: 3,
    state: "RUNNING",
    connectionState: "DELAYED",
    currentJobId: "JOB-2026-008",
    operator: "Dipak Dutta",
    spindleRpm: 2600,
    maxRpm: 3500,
    feedRateMmpm: 1250,
    maxFeedRate: 2500,
    feedOverridePct: 90,
    oee: { overall: 85.3, availability: 88.0, performance: 97.0, quality: 99.9 },
    lastStateChange: "1h 10m ago",
    telemetryTimestamp: "2.4m ago (Delayed)",
    uptimeHoursToday: 5.9,
    stateHistory: SHIFT_PROFILES.BALANCED_MILLING
  },
  {
    id: "CNC-08",
    name: "Ace Designers Jobber XL (2-Axis Chucker)",
    section: "Section 2: CNC Turning Center",
    axisCount: 3,
    state: "IDLE",
    connectionState: "CURRENT",
    currentJobId: null,
    operator: "Swapan Biswas",
    spindleRpm: 0,
    maxRpm: 3500,
    feedRateMmpm: 0,
    maxFeedRate: 2500,
    feedOverridePct: 0,
    oee: { overall: 73.5, availability: 77.0, performance: 95.8, quality: 99.6 },
    lastStateChange: "50m ago",
    telemetryTimestamp: "Just now",
    uptimeHoursToday: 4.1,
    stateHistory: SHIFT_PROFILES.IDLE_STARVED
  },

  // SECTION 3: HMC, HEAVY MACHINING & FINISHING (8 Machines)
  {
    id: "HMC-01",
    name: "Makino a61nx (4-Axis Horizontal Machining)",
    section: "Section 3: HMC & Heavy Machining",
    axisCount: 4,
    state: "RUNNING",
    connectionState: "CURRENT",
    currentJobId: "JOB-2026-002",
    operator: "Anupam Roy",
    spindleRpm: 8400,
    maxRpm: 14000,
    feedRateMmpm: 2600,
    maxFeedRate: 5000,
    feedOverridePct: 100,
    oee: { overall: 91.8, availability: 94.0, performance: 97.8, quality: 99.9 },
    lastStateChange: "3h 05m ago",
    telemetryTimestamp: "Just now",
    uptimeHoursToday: 6.8,
    stateHistory: SHIFT_PROFILES.HIGH_UTILIZATION
  },
  {
    id: "HMC-02",
    name: "BFW H-500 (4-Axis Heavy HMC)",
    section: "Section 3: HMC & Heavy Machining",
    axisCount: 4,
    state: "RUNNING",
    connectionState: "CURRENT",
    currentJobId: "JOB-2026-004",
    operator: "Sukumar Roy",
    spindleRpm: 6500,
    maxRpm: 10000,
    feedRateMmpm: 2100,
    maxFeedRate: 4500,
    feedOverridePct: 100,
    oee: { overall: 88.2, availability: 91.5, performance: 96.5, quality: 99.9 },
    lastStateChange: "4h 15m ago",
    telemetryTimestamp: "Just now",
    uptimeHoursToday: 6.9,
    stateHistory: SHIFT_PROFILES.BALANCED_MILLING
  },
  {
    id: "HMC-03",
    name: "Mazak HCN 5000 (4-Axis High-Speed HMC)",
    section: "Section 3: HMC & Heavy Machining",
    axisCount: 4,
    state: "RUNNING",
    connectionState: "CURRENT",
    currentJobId: "JOB-2026-006",
    operator: "Ashis Pal",
    spindleRpm: 12000,
    maxRpm: 15000,
    feedRateMmpm: 3400,
    maxFeedRate: 5500,
    feedOverridePct: 100,
    oee: { overall: 93.2, availability: 95.0, performance: 98.3, quality: 99.8 },
    lastStateChange: "2h 20m ago",
    telemetryTimestamp: "Just now",
    uptimeHoursToday: 7.1,
    stateHistory: SHIFT_PROFILES.HIGH_UTILIZATION
  },
  {
    id: "HMC-04",
    name: "Doosan NHP 5000 (4-Axis Twin Pallet HMC)",
    section: "Section 3: HMC & Heavy Machining",
    axisCount: 4,
    state: "SETUP",
    connectionState: "CURRENT",
    currentJobId: "JOB-2026-009",
    operator: "Partha Sarkar",
    spindleRpm: 0,
    maxRpm: 12000,
    feedRateMmpm: 0,
    maxFeedRate: 5000,
    feedOverridePct: 0,
    oee: { overall: 70.4, availability: 73.0, performance: 96.8, quality: 99.6 },
    lastStateChange: "28m ago",
    telemetryTimestamp: "Just now",
    uptimeHoursToday: 4.6,
    stateHistory: SHIFT_PROFILES.SETUP_HEAVY
  },
  {
    id: "LATHE-01",
    name: "HMT Pinacho Heavy Duty Precision Lathe",
    section: "Section 3: HMC & Heavy Machining",
    axisCount: 3,
    state: "RUNNING",
    connectionState: "CURRENT",
    currentJobId: "JOB-2026-001",
    operator: "Narayan Das",
    spindleRpm: 1800,
    maxRpm: 3000,
    feedRateMmpm: 850,
    maxFeedRate: 2000,
    feedOverridePct: 100,
    oee: { overall: 87.5, availability: 90.0, performance: 97.4, quality: 99.8 },
    lastStateChange: "3h 50m ago",
    telemetryTimestamp: "Just now",
    uptimeHoursToday: 6.6,
    stateHistory: SHIFT_PROFILES.BALANCED_MILLING
  },
  {
    id: "LATHE-02",
    name: "Batliboi Precision Center Lathe",
    section: "Section 3: HMC & Heavy Machining",
    axisCount: 3,
    state: "STOPPED",
    connectionState: "CURRENT",
    currentJobId: null,
    operator: "Joydeb Samanta",
    spindleRpm: 0,
    maxRpm: 2500,
    feedRateMmpm: 0,
    maxFeedRate: 1800,
    feedOverridePct: 0,
    oee: { overall: 58.2, availability: 62.0, performance: 94.0, quality: 99.8 },
    lastStateChange: "1h 45m ago",
    telemetryTimestamp: "Just now",
    uptimeHoursToday: 3.2,
    stateHistory: SHIFT_PROFILES.ALARM_HALTED
  },
  {
    id: "LATHE-03",
    name: "Gedee Weiler Capstan Precision Lathe",
    section: "Section 3: HMC & Heavy Machining",
    axisCount: 3,
    state: "RUNNING",
    connectionState: "CURRENT",
    currentJobId: "JOB-2026-010",
    operator: "Nirmal Ghosh",
    spindleRpm: 2200,
    maxRpm: 3200,
    feedRateMmpm: 950,
    maxFeedRate: 2200,
    feedOverridePct: 100,
    oee: { overall: 90.2, availability: 92.8, performance: 97.5, quality: 99.7 },
    lastStateChange: "2h 10m ago",
    telemetryTimestamp: "Just now",
    uptimeHoursToday: 6.8,
    stateHistory: SHIFT_PROFILES.HIGH_UTILIZATION
  },
  {
    id: "LATHE-04",
    name: "HMT NH-26 Heavy Hollow Spindle Lathe",
    section: "Section 3: HMC & Heavy Machining",
    axisCount: 3,
    state: "IDLE",
    connectionState: "CURRENT",
    currentJobId: null,
    operator: "Biswanath Bera",
    spindleRpm: 0,
    maxRpm: 2800,
    feedRateMmpm: 0,
    maxFeedRate: 2000,
    feedOverridePct: 0,
    oee: { overall: 72.8, availability: 76.5, performance: 95.5, quality: 99.6 },
    lastStateChange: "38m ago",
    telemetryTimestamp: "Just now",
    uptimeHoursToday: 4.3,
    stateHistory: SHIFT_PROFILES.IDLE_STARVED
  }
];

// Production Work Orders localized for Indian Engineering Clients
export const INITIAL_JOBS: Job[] = [
  {
    id: "JOB-2026-001",
    orderNumber: "JOB-2026-001",
    customerCode: "EIC-KOL-102",
    customerName: "Eastern Industrial Components Pvt. Ltd.",
    partName: "Hydraulic Valve Housing",
    partNumber: "HVH-350-SS",
    material: "Forged Steel En-8D / SS 304",
    priority: "HIGH",
    quantityTarget: 500,
    quantityCompleted: 320,
    quantityScrapped: 2,
    state: "IN_PROGRESS",
    targetMachineId: "VMC-01",
    plannedStart: "05-11-2026, 06:00 IST",
    estCompletion: "12-11-2026, 18:30 IST",
    verifiedUnitCost: 1450.00, // ₹1,450.00 per pc
    currentOperation: "Op 30: 4-Axis Bore & Cavity Finish",
    progressPercent: 64,
    hsnCode: "8481",
    operations: [
      { id: "OP-1", stepNumber: 10, name: "Billet Rough Facing & Center Drill", machineType: "3-Axis VMC", plannedMinutes: 45, actualMinutes: 42, state: "COMPLETED" },
      { id: "OP-2", stepNumber: 20, name: "Port Pocket Roughing & Contouring", machineType: "4-Axis VMC", plannedMinutes: 90, actualMinutes: 88, state: "COMPLETED" },
      { id: "OP-3", stepNumber: 30, name: "4-Axis Bore & Cavity Finish", machineType: "4-Axis VMC", plannedMinutes: 120, actualMinutes: 75, state: "IN_PROGRESS" },
      { id: "OP-4", stepNumber: 40, name: "Deburr & CMM Dimensional QA", machineType: "QA Cell", plannedMinutes: 30, actualMinutes: 0, state: "NOT_STARTED" }
    ]
  },
  {
    id: "JOB-2026-002",
    orderNumber: "JOB-2026-002",
    customerCode: "BHS-HOW-408",
    customerName: "Bharat Hydraulic Systems",
    partName: "Pump Impeller (Bronze High-Pressure)",
    partNumber: "IMP-BRZ-500",
    material: "Phosphor Bronze Grade II",
    priority: "URGENT",
    quantityTarget: 60,
    quantityCompleted: 24,
    quantityScrapped: 1,
    state: "ON_HOLD",
    targetMachineId: "VMC-02",
    plannedStart: "05-11-2026, 07:00 IST",
    estCompletion: "10-11-2026, 16:00 IST (Delayed)",
    verifiedUnitCost: 3400.00, // ₹3,400.00 per pc
    currentOperation: "Op 20: 5-Axis Vane Profiling (Delayed in Alarm)",
    progressPercent: 40,
    hsnCode: "8413",
    operations: [
      { id: "OP-5", stepNumber: 10, name: "Hub Rough Turning OD/ID", machineType: "CNC Lathe", plannedMinutes: 50, actualMinutes: 48, state: "COMPLETED" },
      { id: "OP-6", stepNumber: 20, name: "5-Axis Vane Profiling", machineType: "5-Axis VMC", plannedMinutes: 140, actualMinutes: 45, state: "ON_HOLD" },
      { id: "OP-7", stepNumber: 30, name: "Dynamic Balancing & Inspection", machineType: "Balancing Bench", plannedMinutes: 40, actualMinutes: 0, state: "NOT_STARTED" }
    ]
  },
  {
    id: "JOB-2026-003",
    orderNumber: "JOB-2026-003",
    customerCode: "MPW-PUN-711",
    customerName: "Mahindra Precision Works",
    partName: "Precision Spline Shaft",
    partNumber: "SPL-SHF-24X",
    material: "Alloy Steel 40Cr4Mo (En-19)",
    priority: "HIGH",
    quantityTarget: 350,
    quantityCompleted: 140,
    quantityScrapped: 0,
    state: "IN_PROGRESS",
    targetMachineId: "CNC-04",
    plannedStart: "05-11-2026, 06:30 IST",
    estCompletion: "14-11-2026, 19:00 IST",
    verifiedUnitCost: 850.00, // ₹850.00 per pc
    currentOperation: "Op 15: Turning OD & Chuck Setup",
    progressPercent: 40,
    hsnCode: "8483",
    operations: [
      { id: "OP-8", stepNumber: 10, name: "Face, Center & Rough Turn", machineType: "CNC Lathe", plannedMinutes: 45, actualMinutes: 44, state: "COMPLETED" },
      { id: "OP-9", stepNumber: 20, name: "Spline Hobbing & Keyway", machineType: "CNC Mill-Turn", plannedMinutes: 80, actualMinutes: 32, state: "IN_PROGRESS" },
      { id: "OP-10", stepNumber: 30, name: "Induction Hardening & Cylindrical Grind", machineType: "Grinding Cell", plannedMinutes: 60, actualMinutes: 0, state: "NOT_STARTED" }
    ]
  },
  {
    id: "JOB-2026-004",
    orderNumber: "JOB-2026-004",
    customerCode: "KES-KOL-205",
    customerName: "Kolkata Engineering Solutions",
    partName: "Industrial Flange (PN 16 Class)",
    partNumber: "FLG-SS304-150",
    material: "Stainless Steel SS 304",
    priority: "NORMAL",
    quantityTarget: 200,
    quantityCompleted: 150,
    quantityScrapped: 1,
    state: "IN_PROGRESS",
    targetMachineId: "VMC-04",
    plannedStart: "05-11-2026, 08:00 IST",
    estCompletion: "11-11-2026, 14:00 IST",
    verifiedUnitCost: 1120.00, // ₹1,120.00 per pc
    currentOperation: "Op 20: 8-Hole Bolt Pitch Circle Drilling",
    progressPercent: 75,
    hsnCode: "7307",
    operations: [
      { id: "OP-11", stepNumber: 10, name: "Facing & Hub OD Turning", machineType: "CNC Lathe", plannedMinutes: 40, actualMinutes: 38, state: "COMPLETED" },
      { id: "OP-12", stepNumber: 20, name: "PCD Drilling & Serration", machineType: "5-Axis VMC", plannedMinutes: 70, actualMinutes: 52, state: "IN_PROGRESS" },
      { id: "OP-13", stepNumber: 30, name: "Hydrostatic Pressure Test", machineType: "Hydro Rig", plannedMinutes: 25, actualMinutes: 0, state: "NOT_STARTED" }
    ]
  },
  {
    id: "JOB-2026-005",
    orderNumber: "JOB-2026-005",
    customerCode: "TAC-CHE-914",
    customerName: "Trident Auto Components Pvt. Ltd.",
    partName: "Automotive Mounting Block",
    partNumber: "AMB-AL6061-V2",
    material: "Aluminium Alloy 6061-T6",
    priority: "NORMAL",
    quantityTarget: 400,
    quantityCompleted: 260,
    quantityScrapped: 3,
    state: "IN_PROGRESS",
    targetMachineId: "CNC-05",
    plannedStart: "05-11-2026, 07:30 IST",
    estCompletion: "13-11-2026, 17:30 IST",
    verifiedUnitCost: 620.00, // ₹620.00 per pc
    currentOperation: "Op 25: Tapping & Reaming M10",
    progressPercent: 65,
    hsnCode: "8708",
    operations: [
      { id: "OP-14", stepNumber: 10, name: "Block Rough Facing", machineType: "4-Axis VMC", plannedMinutes: 35, actualMinutes: 34, state: "COMPLETED" },
      { id: "OP-15", stepNumber: 25, name: "Precision Tapping & Reaming", machineType: "4-Axis VMC", plannedMinutes: 75, actualMinutes: 48, state: "IN_PROGRESS" },
      { id: "OP-16", stepNumber: 35, name: "Clear Anodize & Packing", machineType: "Finishing Cell", plannedMinutes: 30, actualMinutes: 0, state: "NOT_STARTED" }
    ]
  },
  {
    id: "JOB-2026-006",
    orderNumber: "JOB-2026-006",
    customerCode: "ERC-HOW-319",
    customerName: "Eastern Rail Components",
    partName: "Bearing Housing (Locomotive Bogie)",
    partNumber: "BRG-HSG-FG260",
    material: "Graded Cast Iron FG 260",
    priority: "HIGH",
    quantityTarget: 80,
    quantityCompleted: 56,
    quantityScrapped: 0,
    state: "IN_PROGRESS",
    targetMachineId: "VMC-06",
    plannedStart: "05-11-2026, 06:00 IST",
    estCompletion: "10-11-2026, 15:00 IST",
    verifiedUnitCost: 2250.00, // ₹2,250.00 per pc
    currentOperation: "Op 30: Precision Bore Finish (H7)",
    progressPercent: 70,
    hsnCode: "8607",
    operations: [
      { id: "OP-17", stepNumber: 10, name: "Bottom Face Milling", machineType: "5-Axis VMC", plannedMinutes: 60, actualMinutes: 58, state: "COMPLETED" },
      { id: "OP-18", stepNumber: 20, name: "Side Mounting Ears Milling", machineType: "5-Axis VMC", plannedMinutes: 80, actualMinutes: 78, state: "COMPLETED" },
      { id: "OP-19", stepNumber: 30, name: "Precision Bore Finish (H7)", machineType: "5-Axis VMC", plannedMinutes: 110, actualMinutes: 75, state: "IN_PROGRESS" },
      { id: "OP-20", stepNumber: 40, name: "Air Gauge Bore Inspection", machineType: "QA Cell", plannedMinutes: 30, actualMinutes: 0, state: "NOT_STARTED" }
    ]
  },
  {
    id: "JOB-2026-007",
    orderNumber: "JOB-2026-007",
    customerCode: "SIM-DUR-522",
    customerName: "Shakti Industrial Manufacturing",
    partName: "Gearbox Mounting Plate",
    partNumber: "GMP-MS-25",
    material: "Structural Mild Steel IS 2062",
    priority: "NORMAL",
    quantityTarget: 120,
    quantityCompleted: 0,
    quantityScrapped: 0,
    state: "NOT_STARTED",
    targetMachineId: "CNC-06",
    plannedStart: "06-11-2026, 06:00 IST",
    estCompletion: "16-11-2026, 14:00 IST",
    verifiedUnitCost: 1650.00, // ₹1,650.00 per pc
    currentOperation: "Op 10: Laser Cut Prep & Milling",
    progressPercent: 0,
    hsnCode: "8483",
    operations: [
      { id: "OP-21", stepNumber: 10, name: "Edge Milling & Squaring", machineType: "3-Axis VMC", plannedMinutes: 50, actualMinutes: 0, state: "NOT_STARTED" },
      { id: "OP-22", stepNumber: 20, name: "Mounting Slots & Counterbores", machineType: "4-Axis VMC", plannedMinutes: 90, actualMinutes: 0, state: "NOT_STARTED" },
      { id: "OP-23", stepNumber: 30, name: "Anti-Corrosion Primer Dip", machineType: "Paint Cell", plannedMinutes: 20, actualMinutes: 0, state: "NOT_STARTED" }
    ]
  },
  {
    id: "JOB-2026-008",
    orderNumber: "JOB-2026-008",
    customerCode: "EIC-KOL-102",
    customerName: "Eastern Industrial Components Pvt. Ltd.",
    partName: "Stainless Steel Flexible Coupling",
    partNumber: "CPL-SS316-45",
    material: "Stainless Steel SS 316",
    priority: "NORMAL",
    quantityTarget: 300,
    quantityCompleted: 210,
    quantityScrapped: 1,
    state: "IN_PROGRESS",
    targetMachineId: "CNC-01",
    plannedStart: "05-11-2026, 09:00 IST",
    estCompletion: "15-11-2026, 18:00 IST",
    verifiedUnitCost: 520.00, // ₹520.00 per pc
    currentOperation: "Op 20: Mill-Turn Slitting & Helical Groove",
    progressPercent: 70,
    hsnCode: "8483",
    operations: [
      { id: "OP-24", stepNumber: 10, name: "Turn OD, Face & Bore ID", machineType: "Mill-Turn Lathe", plannedMinutes: 40, actualMinutes: 38, state: "COMPLETED" },
      { id: "OP-25", stepNumber: 20, name: "Slitting & Helical Beam Cut", machineType: "Mill-Turn Lathe", plannedMinutes: 65, actualMinutes: 44, state: "IN_PROGRESS" },
      { id: "OP-26", stepNumber: 30, name: "Ultrasonic Degreasing & Passivation", machineType: "Chemical Cell", plannedMinutes: 25, actualMinutes: 0, state: "NOT_STARTED" }
    ]
  },
  {
    id: "JOB-2026-009",
    orderNumber: "JOB-2026-009",
    customerCode: "BHS-HOW-408",
    customerName: "Bharat Hydraulic Systems",
    partName: "CNC Machined Bracket (Heavy Duty)",
    partNumber: "BKT-HD-4140",
    material: "Forged Alloy Steel AISI 4140",
    priority: "NORMAL",
    quantityTarget: 150,
    quantityCompleted: 45,
    quantityScrapped: 0,
    state: "IN_PROGRESS",
    targetMachineId: "HMC-04",
    plannedStart: "05-11-2026, 08:30 IST",
    estCompletion: "17-11-2026, 17:00 IST",
    verifiedUnitCost: 780.00, // ₹780.00 per pc
    currentOperation: "Op 20: Multi-Face Hole Drilling",
    progressPercent: 30,
    hsnCode: "7326",
    operations: [
      { id: "OP-27", stepNumber: 10, name: "Rough Face & Datum Pad", machineType: "4-Axis HMC", plannedMinutes: 45, actualMinutes: 43, state: "COMPLETED" },
      { id: "OP-28", stepNumber: 20, name: "Multi-Face Hole Drilling", machineType: "4-Axis HMC", plannedMinutes: 90, actualMinutes: 27, state: "IN_PROGRESS" },
      { id: "OP-29", stepNumber: 30, name: "Magnetic Particle Inspection", machineType: "NDT Cell", plannedMinutes: 30, actualMinutes: 0, state: "NOT_STARTED" }
    ]
  },
  {
    id: "JOB-2026-010",
    orderNumber: "JOB-2026-010",
    customerCode: "TAC-CHE-914",
    customerName: "Trident Auto Components Pvt. Ltd.",
    partName: "Precision Aluminium Enclosure Housing",
    partNumber: "ENCL-AL-5X",
    material: "Aluminium AlSi10Mg",
    priority: "HIGH",
    quantityTarget: 75,
    quantityCompleted: 60,
    quantityScrapped: 0,
    state: "IN_PROGRESS",
    targetMachineId: "CNC-03",
    plannedStart: "05-11-2026, 07:00 IST",
    estCompletion: "12-11-2026, 16:30 IST",
    verifiedUnitCost: 4100.00, // ₹4,100.00 per pc
    currentOperation: "Op 30: O-Ring Gasket Groove Milling",
    progressPercent: 80,
    hsnCode: "8708",
    operations: [
      { id: "OP-30", stepNumber: 10, name: "Top Face & Wall Milling", machineType: "4-Axis VMC", plannedMinutes: 50, actualMinutes: 48, state: "COMPLETED" },
      { id: "OP-31", stepNumber: 20, name: "Internal Pocket Cavity", machineType: "4-Axis VMC", plannedMinutes: 80, actualMinutes: 78, state: "COMPLETED" },
      { id: "OP-32", stepNumber: 30, name: "O-Ring Gasket Groove Milling", machineType: "4-Axis VMC", plannedMinutes: 60, actualMinutes: 48, state: "IN_PROGRESS" }
    ]
  }
];

// Operational Deviations localized for Indian Shop Floor Context
export const INITIAL_EXCEPTIONS: ProductionException[] = [
  {
    id: "EX-01",
    severity: "CRITICAL",
    category: "MACHINE_ALARM",
    title: "VMC-02 Machine Alarm: Coolant Line Pressure Drop (<10 bar)",
    description: "DMG MORI DMU 50 halted during Op 20 vane roughing on JOB-2026-002 (Bharat Hydraulic Systems). Coolant pressure sensor tripped at 8.4 bar.",
    timestamp: "18 mins ago (14:12 IST)",
    machineId: "VMC-02",
    jobId: "JOB-2026-002",
    acknowledged: false,
    events: [
      { time: "14:12:05", source: "CNC PLC Interlock Channel", message: "SPINDLE_SAFETY_INTERLOCK: Coolant flow failure", channel: "S1_COOLANT", sensorValue: "8.4 bar (Min: 12.0 bar)" },
      { time: "14:11:40", source: "Coolant Filter Line Sensor", message: "Back-pressure spike detected; brass swarf filter clogged", channel: "PRESSURE_DIFF", sensorValue: "ΔP = 2.8 bar" },
      { time: "14:08:15", source: "Spindle Drive Controller", message: "High cutting load on Bronze Impeller Op 20", channel: "DRIVE_AMPS", sensorValue: "34A peak" }
    ]
  },
  {
    id: "EX-02",
    severity: "WARNING",
    category: "SETUP_DELAY",
    title: "CNC-04 Setup Variance (+35 min): Chuck Soft-Jaw Dial-in",
    description: "Ace Micromatic LT-20 lathe setup on JOB-2026-003 (Mahindra Precision Works) delayed due to 3-jaw soft-jaw trueing and bore dial calibration.",
    timestamp: "32 mins ago (13:58 IST)",
    machineId: "CNC-04",
    jobId: "JOB-2026-003",
    acknowledged: true,
    acknowledgedBy: "Sourav Das (Floor Manager)",
    events: [
      { time: "13:58:20", source: "Shop Floor Terminal Station 2", message: "Operator Goutam Naskar requested dial indicator verification", channel: "DIAL_INDICATOR", sensorValue: "0.015mm TIR (Spec: 0.008mm)" },
      { time: "13:30:00", source: "MES Job Scheduler", message: "Planned setup window elapsed (Target: 45m, Actual: 80m)", channel: "SETUP_TIMER", sensorValue: "+35 min variance" }
    ]
  },
  {
    id: "EX-03",
    severity: "CRITICAL",
    category: "MACHINE_ALARM",
    title: "HMC-01 Spindle Bearing Thermal Warning (Alarm #2041)",
    description: "Makino a61nx spindle bearing temperature exceeded threshold (78.2°C) during continuous roughing pass on Graded Cast Iron batch.",
    timestamp: "45 mins ago (13:45 IST)",
    machineId: "HMC-01",
    jobId: "JOB-2026-006",
    acknowledged: true,
    acknowledgedBy: "Vikram Singh (Maintenance Supervisor)",
    events: [
      { time: "13:45:00", source: "Spindle Chiller Unit #3", message: "Chiller return temperature elevated", channel: "CHILLER_TEMP", sensorValue: "38.5°C" },
      { time: "13:42:10", source: "Bearing PT100 Sensor", message: "Spindle front bearing thermal warning triggered", channel: "BEARING_TEMP", sensorValue: "78.2°C (Max: 70°C)" }
    ]
  },
  {
    id: "EX-04",
    severity: "WARNING",
    category: "CYCLE_TIME_DEVIATION",
    title: "JOB-2026-006 Delivery Dispatch Window Approaching",
    description: "Eastern Rail Components PO# ERC-8841 due on 10-11-2026. Bearing housing batch requires CMM inspection priority at Howrah QA station.",
    timestamp: "1h 15m ago (13:15 IST)",
    machineId: "VMC-06",
    jobId: "JOB-2026-006",
    acknowledged: false,
    events: [
      { time: "13:15:00", source: "MES Production Planner", message: "4-day dispatch countdown triggered for Indian Railways schedule", channel: "SCHEDULE_DISPATCH", sensorValue: "56/80 pcs completed" }
    ]
  },
  {
    id: "EX-05",
    severity: "INFO",
    category: "TOOL_WEAR",
    title: "CNC-07 MTConnect Edge Latency & Tool Wear Warning",
    description: "LMW LL20T telemetry delayed (2.4m latency from Substation Howrah-West). Tool pocket #12 insert reached 85% life on En-8D roughing cycle.",
    timestamp: "1h 40m ago (12:50 IST)",
    machineId: "CNC-07",
    jobId: "JOB-2026-008",
    acknowledged: true,
    acknowledgedBy: "Dipak Dutta (Operator)",
    events: [
      { time: "12:50:00", source: "Edge Gateway 192.168.1.107", message: "Substation packet buffer sync delay", channel: "EDGE_LATENCY", sensorValue: "2.4m delayed" },
      { time: "12:45:20", source: "Tool Life Tracker", message: "CNMG 120408 roughing insert cut cycles: 340 parts", channel: "TOOL_LIFE", sensorValue: "85% utilized" }
    ]
  }
];

// Historical Production Audit Trail & GST / Delivery Challan Compliance
export const INITIAL_AUDIT_HISTORY: AuditRecord[] = [
  {
    id: "AUD-01",
    orderNumber: "JOB-2026-088",
    customerName: "Eastern Rail Components",
    units: 150,
    completionDate: "04-11-2026, 17:30 IST",
    status: "COMPLETED",
    machineId: "VMC-03",
    verifiedBy: "Priya Sharma (Quality Manager)",
    totalCost: 187500.00, // ₹1,87,500.00
    challanNumber: "DC-2026/HOW/088",
    hsnCode: "8607"
  },
  {
    id: "AUD-02",
    orderNumber: "JOB-2026-085",
    customerName: "Mahindra Precision Works",
    units: 80,
    completionDate: "03-11-2026, 15:45 IST",
    status: "COMPLETED",
    machineId: "CNC-01",
    verifiedBy: "Priya Sharma (Quality Manager)",
    totalCost: 132000.00, // ₹1,32,000.00
    challanNumber: "DC-2026/HOW/085",
    hsnCode: "8708"
  },
  {
    id: "AUD-03",
    orderNumber: "JOB-2026-081",
    customerName: "Bharat Hydraulic Systems",
    units: 200,
    completionDate: "02-11-2026, 18:20 IST",
    status: "COMPLETED",
    machineId: "VMC-05",
    verifiedBy: "Priya Sharma (Quality Manager)",
    totalCost: 290000.00, // ₹2,90,000.00
    challanNumber: "DC-2026/HOW/081",
    hsnCode: "8481"
  },
  {
    id: "AUD-04",
    orderNumber: "JOB-2026-077",
    customerName: "Trident Auto Components Pvt. Ltd.",
    units: 300,
    completionDate: "01-11-2026, 14:10 IST",
    status: "COMPLETED",
    machineId: "CNC-05",
    verifiedBy: "Priya Sharma (Quality Manager)",
    totalCost: 186000.00, // ₹1,86,000.00
    challanNumber: "DC-2026/HOW/077",
    hsnCode: "8708"
  }
];

// Factory KPIs for 24-Machine Plant in Howrah, WB
export const INITIAL_FACTORY_KPIS: FactoryKPIs = {
  activeSpindlesCount: 16,
  totalSpindlesCount: 24,
  shopUtilizationPct: 79.2,
  factoryOeePct: 84.8,
  availabilityPct: 89.4,
  performancePct: 95.2,
  qualityPct: 99.6,
  runningJobsCount: 16,
  queuedJobsCount: 18,
  completedTodayCount: 4,
  activeExceptionsCount: 2,
  costs: {
    materialCost: 475000.00,  // ₹4,75,000.00
    laborCost: 125000.00,     // ₹1,25,000.00
    machineCost: 380000.00,   // ₹3,80,000.00
    totalCost: 980000.00,     // ₹9,80,000.00
    unitCostVerified: 850.00  // ₹850.00
  },
  lastDataRefresh: "05-11-2026, 14:30 IST",
  connectionStatus: "CURRENT"
};
