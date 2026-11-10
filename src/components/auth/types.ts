export type AuthSceneStage = 
  | 'ARRIVAL'          // Shutter closed, manager stands ready with tablet
  | 'MANAGER_APPROACH' // Manager walks up to shutter, interacts with tablet
  | 'SHUTTER_OPEN'     // Shutter lifts, revealing illuminated factory interior
  | 'LOGIN_READY'      // Camera settles into 3/4 isometric view, login form visible
  | 'CNC_MACHINING'    // User submitted login, CNC machine runs milling cycle
  | 'DASHBOARD_TRANSITION'; // Final camera dolly into dashboard

export interface TelemetryState {
  spindleRpm: number;
  feedRate: number;
  toolNumber: string;
  axisCoordinates: { x: number; y: number; z: number };
  systemStatus: string;
  cyclePercent: number;
}
