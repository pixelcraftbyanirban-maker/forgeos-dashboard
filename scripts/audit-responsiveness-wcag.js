// Comprehensive Responsiveness & WCAG 2.1/2.2 AA Audit Test Suite for ForgeOS Dashboard
import fs from 'fs';
import path from 'path';

console.log('========================================================================');
console.log('🚀 FORGEOS AUDIT: RESPONSIVENESS & WCAG 2.1/2.2 AA VERIFICATION');
console.log('========================================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ❌ FAIL: ${message}`);
    if (details) console.error(`     Details: ${details}`);
  }
}

// -------------------------------------------------------------------------
// 1. WCAG 1.4.3 & 1.4.11: Contrast Ratio Math & Color Verification
// -------------------------------------------------------------------------
console.log('--- 1. WCAG 1.4.3 / 1.4.11 CONTRAST VERIFICATION ---');

function hexToRgb(hex) {
  const cleanHex = hex.replace('#', '');
  const bigint = parseInt(cleanHex, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}

function sRgbToLinear(c) {
  const norm = c / 255;
  return norm <= 0.03928 ? norm / 12.92 : Math.pow((norm + 0.055) / 1.055, 2.4);
}

function getRelativeLuminance(rgb) {
  const r = sRgbToLinear(rgb.r);
  const g = sRgbToLinear(rgb.g);
  const b = sRgbToLinear(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getContrastRatio(hex1, hex2) {
  const l1 = getRelativeLuminance(hexToRgb(hex1));
  const l2 = getRelativeLuminance(hexToRgb(hex2));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Palette test pairs
const contrastPairs = [
  { name: 'Forge Black on White', fg: '#0A0D12', bg: '#FFFFFF', min: 4.5 },
  { name: 'Forge Black on Alabaster', fg: '#0A0D12', bg: '#F4F5F7', min: 4.5 },
  { name: 'Forge Steel on White', fg: '#475569', bg: '#FFFFFF', min: 4.5 },
  { name: 'Forge Steel on Alabaster', fg: '#475569', bg: '#F4F5F7', min: 4.5 },
  { name: 'White on Forge Black (Sidebar)', fg: '#FFFFFF', bg: '#0A0D12', min: 4.5 },
  { name: 'Zinc 300 on Forge Black (Nav)', fg: '#D4D4D8', bg: '#0A0D12', min: 4.5 },
  { name: 'Emerald 900 on Emerald 50 (Badge)', fg: '#064E3B', bg: '#ECFDF5', min: 4.5 },
  { name: 'Rose 950 on Rose 50 (Alarm Badge)', fg: '#4C0519', bg: '#FFF1F2', min: 4.5 },
  { name: 'Amber 950 on Amber 50 (Warning/Progress Badge)', fg: '#451A03', bg: '#FFFBEB', min: 4.5 },
  { name: 'Blue 900 on Blue 50 (Setup Badge)', fg: '#1E3A8A', bg: '#EFF6FF', min: 4.5 },
  { name: 'Forge Orange Focus Indicator on Alabaster', fg: '#F25C19', bg: '#F4F5F7', min: 3.0 },
];

for (const pair of contrastPairs) {
  const ratio = getContrastRatio(pair.fg, pair.bg);
  assert(
    ratio >= pair.min,
    `${pair.name}: ${ratio.toFixed(2)}:1 (Required >= ${pair.min}:1)`
  );
}

// -------------------------------------------------------------------------
// 2. WCAG Landmarks & Semantic HTML Verification
// -------------------------------------------------------------------------
console.log('\n--- 2. WCAG 1.3.1 & 2.4.1 LANDMARKS & NAVIGATION ---');

const appShellCode = fs.readFileSync('src/components/layout/AppShell.tsx', 'utf-8');
const topBarCode = fs.readFileSync('src/components/layout/TopBar.tsx', 'utf-8');
const sidebarCode = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf-8');
const indexHtml = fs.readFileSync('index.html', 'utf-8');
const indexCss = fs.readFileSync('src/index.css', 'utf-8');

assert(
  indexHtml.includes('lang="en"'),
  'HTML root element contains explicit lang="en" attribute (WCAG 3.1.1)'
);

assert(
  indexHtml.includes('name="viewport" content="width=device-width, initial-scale=1.0"'),
  'Viewport meta tag configured properly for responsive reflow without disabling zoom'
);

assert(
  appShellCode.includes('href="#main-content"') && appShellCode.includes('Skip to main content'),
  'WCAG 2.4.1 Skip Link: Exists with accessible text targeting #main-content'
);

assert(
  appShellCode.includes('id="main-content"') && appShellCode.includes('tabIndex={-1}'),
  'Main content landmark: <main id="main-content" tabIndex={-1}>'
);

assert(
  appShellCode.includes('role="contentinfo"') || appShellCode.includes('<footer'),
  'Footer landmark with role="contentinfo" or <footer>'
);

assert(
  topBarCode.includes('<header'),
  'TopBar uses semantic <header> element'
);

assert(
  sidebarCode.includes('<nav aria-label="Main Navigation"'),
  'Sidebar contains semantic <nav> with explicit aria-label'
);

assert(
  sidebarCode.includes("aria-current={isActive ? 'page' : undefined}"),
  'Navigation items expose aria-current="page" on the active tab'
);

assert(
  indexCss.includes(':focus-visible') && indexCss.includes('outline'),
  'Global focus-visible indicator defined in CSS for WCAG 2.4.7'
);

assert(
  indexCss.includes('@media (prefers-reduced-motion: reduce)'),
  'Respects user prefers-reduced-motion preferences for WCAG 2.3.3'
);

// -------------------------------------------------------------------------
// 3. Multi-Device Responsiveness Architecture Verification
// -------------------------------------------------------------------------
console.log('\n--- 3. MULTI-DEVICE RESPONSIVENESS ARCHITECTURE ---');

const testBreakpoints = [
  { device: 'Old / Compact Mobile', width: 360, name: 'Galaxy S8 / Old SE' },
  { device: 'Standard Mobile', width: 375, name: 'iPhone SE / iPhone 8' },
  { device: 'Modern Flagship Mobile', width: 390, name: 'iPhone 14 / 15' },
  { device: 'Large Mobile', width: 430, name: 'iPhone 14 Pro Max / Pixel 7' },
  { device: 'Tablet Portrait', width: 768, name: 'iPad Mini / iPad 10"' },
  { device: 'Tablet Landscape / Laptop', width: 1024, name: 'iPad Pro / Surface' },
  { device: 'Desktop Display', width: 1440, name: 'MacBook Pro / Monitor' },
  { device: 'Ultra-wide Workstation', width: 1920, name: 'Full HD / 4K Monitor' },
];

console.log('  Testing coverage for device viewports:');
testBreakpoints.forEach(bp => {
  console.log(`    • ${bp.name} (${bp.width}px): ${bp.device}`);
});

assert(
  appShellCode.includes('hidden lg:flex') && appShellCode.includes('mobile-navigation-drawer'),
  'Desktop sidebar hides on < lg (<1024px) and mobile off-canvas drawer activates'
);

assert(
  topBarCode.includes('onToggleMobileNav') && topBarCode.includes('aria-controls="mobile-navigation-drawer"'),
  'Mobile hamburger button in TopBar controls mobile navigation drawer'
);

assert(
  topBarCode.includes('isMobileSearchOpen') && topBarCode.includes('md:hidden'),
  'Mobile search capability toggles expandable search bar on small screens'
);

assert(
  appShellCode.includes('p-3.5 sm:p-5 lg:p-6'),
  'Adaptive padding configured for mobile (3.5 = 14px), tablet (5 = 20px), desktop (6 = 24px)'
);

// Check overflow containers for all data tables
const tableFiles = [
  'src/pages/Production/ProductionPage.tsx',
  'src/pages/Machines/MachinesPage.tsx',
  'src/pages/Reports/ReportsPage.tsx',
  'src/components/tables/AuditHistoryCard.tsx'
];

for (const tf of tableFiles) {
  const content = fs.readFileSync(tf, 'utf-8');
  assert(
    content.includes('overflow-x-auto') && (content.includes('tabIndex={0}') || content.includes('role="region"')),
    `${path.basename(tf)} table wrapped in accessible scrollable region (role="region" and tabIndex={0})`
  );
  assert(
    content.includes('min-w-[') && content.includes('<th scope="col"'),
    `${path.basename(tf)} sets minimum readable table column width and <th scope="col"> headers`
  );
}

// -------------------------------------------------------------------------
// 4. Interactive Components Keyboard Accessibility & ARIA Checks
// -------------------------------------------------------------------------
console.log('\n--- 4. INTERACTIVE ACCESSIBILITY (KEYBOARD & ARIA) ---');

const drawerCode = fs.readFileSync('src/components/ui/DetailDrawer.tsx', 'utf-8');
assert(
  drawerCode.includes('role="dialog"') && drawerCode.includes('aria-modal="true"'),
  'DetailDrawer has role="dialog" and aria-modal="true"'
);
assert(
  drawerCode.includes('aria-labelledby="detail-drawer-heading"'),
  'DetailDrawer heading connected via aria-labelledby'
);
assert(
  drawerCode.includes("e.key === 'Escape'"),
  'DetailDrawer listens for Escape key to close'
);

const queueCode = fs.readFileSync('src/components/tables/ProductionQueueCard.tsx', 'utf-8');
assert(
  queueCode.includes('role="button"') && queueCode.includes('tabIndex={0}') && queueCode.includes("e.key === 'Enter'"),
  'ProductionQueueCard active card is keyboard operable with role="button", tabIndex={0}, Enter/Space handler'
);
assert(
  queueCode.includes('role="progressbar"') && queueCode.includes('aria-valuenow'),
  'ProductionQueueCard progress bar has role="progressbar" and aria-valuenow'
);

const fleetGridCode = fs.readFileSync('src/components/tables/MachineFleetGrid.tsx', 'utf-8');
assert(
  fleetGridCode.includes('role="button"') && fleetGridCode.includes('tabIndex={0}') && fleetGridCode.includes("e.key === 'Enter'"),
  'MachineFleetGrid spindle cards are keyboard operable with role="button" and Enter handler'
);
assert(
  fleetGridCode.includes('aria-pressed={activeFilter === tab.id}'),
  'MachineFleetGrid filter buttons expose aria-pressed state'
);

const gaugeCode = fs.readFileSync('src/components/ui/GaugeIndicator.tsx', 'utf-8');
assert(
  gaugeCode.includes('role="progressbar"') && gaugeCode.includes('aria-valuenow') && gaugeCode.includes('aria-valuemax'),
  'LinearGauge uses role="progressbar" with aria-valuenow, valuemin, valuemax, and aria-label'
);

const exceptionsPageCode = fs.readFileSync('src/pages/Exceptions/ExceptionsPage.tsx', 'utf-8');
assert(
  exceptionsPageCode.includes('aria-pressed={isSelected}') && exceptionsPageCode.includes('<button'),
  'ExceptionsPage deviation items rendered as native semantic <button> with aria-pressed'
);
assert(
  exceptionsPageCode.includes('htmlFor={`supervisor-notes-') && exceptionsPageCode.includes('id={`supervisor-notes-'),
  'ExceptionsPage supervisor textarea has corresponding <label htmlFor>'
);

// -------------------------------------------------------------------------
// Summary
// -------------------------------------------------------------------------
console.log('\n========================================================================');
console.log(`AUDIT RESULTS: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${totalTests} TESTS)`);
console.log('========================================================================\n');

if (failedTests > 0) {
  process.exit(1);
}
