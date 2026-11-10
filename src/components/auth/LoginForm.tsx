import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Cpu, KeyRound, User, ArrowRight, Gauge, Activity, Radio, Lock } from 'lucide-react';
import { TelemetryState } from './types';

interface LoginFormProps {
  isLoading: boolean;
  telemetry: TelemetryState | null;
  onLogin: (operatorId: string) => void;
  onSkip: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  isLoading,
  telemetry,
  onLogin,
  onSkip,
}) => {
  const [operatorId, setOperatorId] = useState('arindam.chatterjee@forgeos.internal');
  const [passcode, setPasscode] = useState('••••••••••••');
  const [stationId, setStationId] = useState('CELL-01-VMC');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(operatorId);
  };

  const handleQuickFill = () => {
    setOperatorId('arindam.chatterjee@forgeos.internal');
    setPasscode('FORGEOS-SEC-AUTH-2026');
    setStationId('CELL-01-VMC');
    onLogin('arindam.chatterjee@forgeos.internal');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -30, filter: 'blur(8px)' }}
      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, x: -20, filter: 'blur(6px)' }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-[480px] bg-forge-black/90 backdrop-blur-md border border-forge-steel/30 rounded-none shadow-2xl p-7 text-white"
    >
      {/* Swiss Technical Header */}
      <div className="flex items-center justify-between border-b border-forge-steel/30 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <img
            src="/forgeos-logo.png"
            alt="FORGEOS"
            className="h-7 w-auto object-contain brightness-110"
          />
          <div className="h-4 w-[1px] bg-forge-steel/50" />
          <span className="text-[11px] font-mono tracking-widest text-forge-aluminum uppercase">
            MES GATEWAY // v2.4
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-forge-steel/20 border border-forge-steel/30 text-[10px] font-mono text-forge-aluminum">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>MTCONNECT 1.8</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!isLoading ? (
          <motion.form
            key="login-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* Title & Station Meta */}
            <div>
              <h2 className="text-xl font-display font-semibold tracking-tight text-white flex items-center justify-between">
                <span>SHOP-FLOOR AUTHENTICATION</span>
                <span className="text-xs font-mono font-normal text-forge-orange tracking-wider">
                  SYS.SEC.01
                </span>
              </h2>
              <p className="text-xs text-forge-aluminum mt-1">
                Enter your authorized MES identity to initialize machining cell telemetry and active work orders.
              </p>
            </div>

            {/* Station Selector Pill */}
            <div className="flex items-center justify-between bg-forge-steel/10 border border-forge-steel/30 px-3 py-2 text-xs font-mono">
              <span className="text-forge-steel-muted flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-forge-orange" />
                ASSIGNED TERMINAL:
              </span>
              <select
                value={stationId}
                onChange={(e) => setStationId(e.target.value)}
                className="bg-transparent text-white font-mono text-xs focus:outline-none cursor-pointer"
              >
                <option value="CELL-01-VMC" className="bg-forge-black text-white">
                  BAY 01 // CNC-VMC-01 (ACTIVE)
                </option>
                <option value="CELL-02-LATHE" className="bg-forge-black text-white">
                  BAY 02 // CNC-LATHE-04
                </option>
                <option value="CELL-03-5AXIS" className="bg-forge-black text-white">
                  BAY 03 // 5-AXIS AEROSPACE
                </option>
              </select>
            </div>

            {/* Operator Identifier Input */}
            <div>
              <label className="block text-[11px] font-mono text-forge-aluminum tracking-wider uppercase mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <User className="w-3 h-3 text-forge-orange" />
                  Operator Identifier / Email
                </span>
                <span className="text-[10px] text-forge-steel-muted">RFID / SAML</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={operatorId}
                  onChange={(e) => setOperatorId(e.target.value)}
                  placeholder="name@forgeos.internal"
                  className="w-full bg-[#11161f] border border-forge-steel/40 text-white font-mono text-xs px-3.5 py-2.5 focus:border-forge-orange focus:ring-1 focus:ring-forge-orange focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Security Passcode Input */}
            <div>
              <label className="block text-[11px] font-mono text-forge-aluminum tracking-wider uppercase mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-3 h-3 text-forge-orange" />
                  Hardware Security Key / PIN
                </span>
                <span className="text-[10px] text-forge-steel-muted">FIPS 140-3</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#11161f] border border-forge-steel/40 text-white font-mono text-xs px-3.5 py-2.5 focus:border-forge-orange focus:ring-1 focus:ring-forge-orange focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Quick Demo Operator Login Button */}
            <button
              type="button"
              onClick={handleQuickFill}
              className="w-full py-2 px-3 bg-forge-steel/20 hover:bg-forge-steel/30 border border-forge-steel/40 text-forge-aluminum hover:text-white text-xs font-mono flex items-center justify-between transition-all group"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-forge-orange" />
                <span>QUICK LOGIN: PRODUCTION MANAGER</span>
              </span>
              <span className="text-[10px] text-forge-steel-muted group-hover:text-forge-orange">
                PRESS TO VERIFY →
              </span>
            </button>

            {/* Submit Action */}
            <button
              type="submit"
              className="w-full bg-forge-orange hover:bg-forge-orange-hover text-white font-display font-medium text-sm py-3 px-4 flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.99]"
            >
              <span>COMMENCE SHOP-FLOOR SESSION</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Footer / Skip Link */}
            <div className="flex items-center justify-between pt-2 text-[11px] font-mono text-forge-steel-muted">
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3" />
                256-BIT ENCRYPTED
              </span>
              <button
                type="button"
                onClick={onSkip}
                className="hover:text-forge-aluminum transition-colors underline underline-offset-4"
              >
                Direct Dashboard Pass →
              </button>
            </div>
          </motion.form>
        ) : (
          /* CNC Machine Live Telemetry Loading View */
          <motion.div
            key="telemetry-view"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4 py-2"
          >
            <div className="flex items-center justify-between border-b border-forge-steel/30 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-forge-orange animate-ping" />
                <span className="text-xs font-mono font-medium text-forge-orange tracking-wider">
                  CNC MILLING AUTHENTICATION CYCLE IN PROGRESS
                </span>
              </div>
              <span className="text-xs font-mono text-forge-aluminum">
                {telemetry ? `${telemetry.cyclePercent}%` : '0%'}
              </span>
            </div>

            {/* Live Progress Bar */}
            <div className="w-full bg-forge-steel/20 h-2 border border-forge-steel/40 overflow-hidden">
              <motion.div
                className="bg-forge-orange h-full"
                animate={{ width: `${telemetry?.cyclePercent || 0}%` }}
                transition={{ duration: 0.1, ease: 'linear' }}
              />
            </div>

            {/* Telemetry Readout Grid */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-[#12161f] border border-forge-steel/30 p-2.5">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-forge-aluminum">
                  <Gauge className="w-3 h-3 text-forge-orange" />
                  SPINDLE SPEED
                </div>
                <div className="text-base font-mono font-semibold text-white mt-1">
                  {telemetry ? telemetry.spindleRpm.toLocaleString() : '0'}{' '}
                  <span className="text-[10px] text-forge-steel-muted font-normal">RPM</span>
                </div>
              </div>

              <div className="bg-[#12161f] border border-forge-steel/30 p-2.5">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-forge-aluminum">
                  <Activity className="w-3 h-3 text-emerald-400" />
                  FEED RATE
                </div>
                <div className="text-base font-mono font-semibold text-white mt-1">
                  {telemetry ? telemetry.feedRate : '850'}{' '}
                  <span className="text-[10px] text-forge-steel-muted font-normal">MM/MIN</span>
                </div>
              </div>

              <div className="bg-[#12161f] border border-forge-steel/30 p-2.5 col-span-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-forge-aluminum">
                  <span className="flex items-center gap-1.5">
                    <Cpu className="w-3 h-3 text-forge-orange" />
                    TOOL & INTERPOLATION COORDINATES
                  </span>
                  <span className="text-forge-orange">{telemetry?.toolNumber || 'T04'}</span>
                </div>
                <div className="text-xs font-mono text-forge-aluminum mt-1.5 flex justify-between bg-black/40 px-2 py-1">
                  <span>X: {telemetry ? telemetry.axisCoordinates.x : 0} mm</span>
                  <span>Y: {telemetry ? telemetry.axisCoordinates.y : 0} mm</span>
                  <span>Z: {telemetry ? telemetry.axisCoordinates.z : 0} mm</span>
                </div>
              </div>
            </div>

            {/* Checklist Verification Steps */}
            <div className="space-y-1.5 pt-1 text-[11px] font-mono">
              <div className="flex items-center gap-2 text-emerald-400">
                <span className="text-xs">✓</span>
                <span>PLC SAFETY ENCLOSURE INTERLOCK: LOCKED</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <span className="text-xs">✓</span>
                <span>MTCONNECT PROTOCOL HANDSHAKE: VERIFIED</span>
              </div>
              <div className="flex items-center gap-2 text-forge-orange animate-pulse">
                <span className="text-xs">►</span>
                <span>SPINDLE RAMP & BILLET SURFACING VALIDATION...</span>
              </div>
            </div>

            <div className="text-center pt-2">
              <span className="text-[10px] font-mono text-forge-steel-muted">
                AUTOMATIC REDIRECT TO SHOP-FLOOR DASHBOARD ON ZERO DEFECTS
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
