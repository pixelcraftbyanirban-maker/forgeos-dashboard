# FORGEOS — Industrial MES Dashboard

An industrial Manufacturing Execution System (MES) and shop-floor data automation dashboard designed for High-Mix, Low-Volume (HMLV) CNC machining shops (10–40 spindles).

Built following the **FORGEOS Brand Identity & Design System** (Swiss Industrial Modernism).

---

## 🛠️ Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (custom industrial design tokens)
- **Icons**: Lucide Icons
- **Typography**: Space Grotesk, Inter, IBM Plex Mono

---

## 🏭 Core Features

- **Factory Overview**: Real-time fleet orientation, spindle status (8/12 active), factory OEE breakdown, and active queue monitoring.
- **Production Management**: Work order tracking, plan-vs-actual cycle times, scrap rates, and expandable operation-level routing.
- **Spindle Fleet Telemetry**: Live RPM, feed rates, feed override %, individual machine OEE, and table/grid view modes.
- **Exceptions & Deviations**: Real-time alerts (thermal overload alarms, setup delays, tool wear) with supervisor sign-off workflow.
- **Audit & Compliance**: Immutable manufacturing event logs with one-click CSV export.
- **Slide-Over Detail Inspector**: Deep inspection of CNC sensor channels and work order routing.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
```

---

## 🎨 Design System Foundations

- **70% Base**: Daylight Pure White (`#FFFFFF`) & Mill Alabaster (`#F4F5F7`)
- **20% Structure**: Carbide Black (`#0A0D12`)
- **10% Accent**: Forge Molten Orange (`#F25C19`)
- **Hairlines & Geometry**: Billet Aluminum (`#CBD5E1`) with 45° chamfered containers
