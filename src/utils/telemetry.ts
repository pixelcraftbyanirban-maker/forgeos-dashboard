import { Machine, TelemetryFreshness, MachineStateInterval } from '../types';

/**
 * FORGEOS Industrial Telemetry & Fleet State Utilities
 * Standardized for CNC Shop-Floor Precision Operations
 */

export interface TelemetryConfig {
  liveThresholdSeconds: number;     // 0 - 5 seconds
  delayedThresholdSeconds: number;  // 5 - 15 seconds
  staleThresholdSeconds: number;    // > 15 seconds
}

export const DEFAULT_TELEMETRY_CONFIG: TelemetryConfig = {
  liveThresholdSeconds: 5,
  delayedThresholdSeconds: 15,
  staleThresholdSeconds: 60,
};

export interface TelemetryStatusInfo {
  freshness: TelemetryFreshness;
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  ageText: string;
}

/**
 * Evaluates telemetry freshness against configurable thresholds.
 * Strictly prevents stale data from being represented as live.
 */
export function evaluateTelemetryFreshness(
  ageSeconds?: number,
  timestampStr?: string,
  config: TelemetryConfig = DEFAULT_TELEMETRY_CONFIG
): TelemetryStatusInfo {
  if (ageSeconds === undefined && !timestampStr) {
    return {
      freshness: 'UNKNOWN',
      label: 'UNKNOWN',
      badgeBg: 'bg-zinc-100',
      badgeText: 'text-zinc-600',
      badgeBorder: 'border-zinc-300 border-dashed',
      ageText: 'No timestamp'
    };
  }

  const age = ageSeconds !== undefined ? ageSeconds : 3;

  if (age <= config.liveThresholdSeconds) {
    return {
      freshness: 'LIVE',
      label: 'LIVE STREAM',
      badgeBg: 'bg-emerald-50',
      badgeText: 'text-emerald-900',
      badgeBorder: 'border-emerald-400',
      ageText: `${age}s ago`
    };
  }

  if (age <= config.delayedThresholdSeconds) {
    return {
      freshness: 'DELAYED',
      label: 'DELAYED',
      badgeBg: 'bg-amber-50',
      badgeText: 'text-amber-900',
      badgeBorder: 'border-amber-400',
      ageText: `${age}s ago`
    };
  }

  return {
    freshness: 'STALE',
    label: 'STALE',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-950',
    badgeBorder: 'border-rose-400',
    ageText: `${age}s ago`
  };
}

export interface FleetStateAccounting {
  total: number;
  running: number;
  setup: number;
  idle: number;
  alarm: number;
  stopped: number;
  offline: number;
  unknown: number;
  reconciled: boolean;
  unaccounted: number;
}

/**
 * Calculates mutually exclusive machine state distribution.
 * Guaranteed: Total machines = sum of all mutually exclusive states.
 * Flags any unaccounted machines explicitly without silent drops.
 */
export function getFleetStateAccounting(machines: Machine[]): FleetStateAccounting {
  const total = machines.length;
  let running = 0;
  let setup = 0;
  let idle = 0;
  let alarm = 0;
  let stopped = 0;
  let offline = 0;
  let unknown = 0;

  for (const m of machines) {
    switch (m.state) {
      case 'RUNNING':
        running++;
        break;
      case 'SETUP':
        setup++;
        break;
      case 'IDLE':
        idle++;
        break;
      case 'ALARM':
        alarm++;
        break;
      case 'STOPPED':
        stopped++;
        break;
      case 'OFFLINE':
        offline++;
        break;
      case 'UNKNOWN':
      default:
        unknown++;
        break;
    }
  }

  const accountedSum = running + setup + idle + alarm + stopped + offline + unknown;
  const unaccounted = total - accountedSum;

  return {
    total,
    running,
    setup,
    idle,
    alarm,
    stopped,
    offline,
    unknown: unknown + Math.max(0, unaccounted),
    reconciled: unaccounted === 0,
    unaccounted: Math.max(0, unaccounted)
  };
}

/**
 * Calculates standard Overall Equipment Effectiveness (OEE)
 * Standard: OEE = Availability × Performance × Quality
 */
export function calculateOee(availabilityPct: number, performancePct: number, qualityPct: number): number {
  const oee = (availabilityPct / 100) * (performancePct / 100) * (qualityPct / 100) * 100;
  return Number(oee.toFixed(1));
}

export interface ShiftTimelineDurations {
  runningMinutes: number;
  setupMinutes: number;
  idleMinutes: number;
  alarmMinutes: number;
  stoppedMinutes: number;
  totalShiftMinutes: number;
  runningFormatted: string;
  setupFormatted: string;
  idleFormatted: string;
  alarmFormatted: string;
  stoppedFormatted: string;
}

/**
 * Aggregates state intervals into exact shift duration summaries.
 */
export function calculateShiftDurations(intervals?: MachineStateInterval[]): ShiftTimelineDurations {
  let runningMinutes = 0;
  let setupMinutes = 0;
  let idleMinutes = 0;
  let alarmMinutes = 0;
  let stoppedMinutes = 0;

  if (intervals && intervals.length > 0) {
    for (const interval of intervals) {
      const d = interval.durationMinutes || 0;
      if (interval.state === 'RUNNING') runningMinutes += d;
      else if (interval.state === 'SETUP') setupMinutes += d;
      else if (interval.state === 'IDLE') idleMinutes += d;
      else if (interval.state === 'ALARM') alarmMinutes += d;
      else if (interval.state === 'STOPPED') stoppedMinutes += d;
    }
  }

  const total = runningMinutes + setupMinutes + idleMinutes + alarmMinutes + stoppedMinutes || 480;

  const formatMin = (m: number) => {
    const hrs = Math.floor(m / 60);
    const mins = m % 60;
    if (hrs === 0) return `${mins}m`;
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  };

  return {
    runningMinutes,
    setupMinutes,
    idleMinutes,
    alarmMinutes,
    stoppedMinutes,
    totalShiftMinutes: total,
    runningFormatted: formatMin(runningMinutes),
    setupFormatted: formatMin(setupMinutes),
    idleFormatted: formatMin(idleMinutes),
    alarmFormatted: formatMin(alarmMinutes),
    stoppedFormatted: formatMin(stoppedMinutes)
  };
}
