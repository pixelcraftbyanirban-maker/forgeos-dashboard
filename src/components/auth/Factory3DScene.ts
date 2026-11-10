import * as THREE from 'three';
import { AuthSceneStage, TelemetryState } from './types';
import { industrialAudio } from './IndustrialAudio';

export class Factory3DScene {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private animFrameId: number | null = null;
  private clock: THREE.Clock;

  // Animation Stage & Progress
  private currentStage: AuthSceneStage = 'ARRIVAL';
  private stageProgress: number = 0; // 0 to 1 within current stage
  private shutterOpenAmount: number = 0; // 0 (closed) to 1 (fully open)
  private shutterTarget: number = 0;

  // Scene Objects
  private shutterSlats: THREE.Mesh[] = [];
  private shutterHeaderDrum!: THREE.Mesh;
  private shutterBeaconLight!: THREE.PointLight;
  private shutterBeaconMesh!: THREE.Mesh;

  // Manager Character Components
  private managerGroup!: THREE.Group;
  private managerSpine!: THREE.Group;
  private managerHead!: THREE.Group;
  private managerLeftArm!: THREE.Group;
  private managerRightArm!: THREE.Group;
  private managerLeftLeg!: THREE.Group;
  private managerRightLeg!: THREE.Group;
  private managerTabletScreen!: THREE.Mesh;
  private tabletGlowLight!: THREE.PointLight;

  // CNC Machine Components
  private cncGroup!: THREE.Group;
  private cncSpindle!: THREE.Group;
  private cncToolHolder!: THREE.Mesh;
  private cncWorkpiece!: THREE.Mesh;
  private cncTable!: THREE.Mesh;
  private cncAndonGreen!: THREE.Mesh;
  private cncAndonOrange!: THREE.Mesh;
  private cncAndonRed!: THREE.Mesh;
  private cncSparksGroup!: THREE.Points;
  private cncSparkPositions!: Float32Array;
  private cncInternalLight!: THREE.PointLight;
  private isCncMilling: boolean = false;
  private cncSpindleRpm: number = 0;
  private cncToolAngle: number = 0;

  // Camera Target Interpolation
  private camCurrentPos: THREE.Vector3 = new THREE.Vector3(0, 2.2, 8.5);
  private camTargetPos: THREE.Vector3 = new THREE.Vector3(0, 2.2, 8.5);
  private camCurrentLookAt: THREE.Vector3 = new THREE.Vector3(0, 2.0, 0);
  private camTargetLookAt: THREE.Vector3 = new THREE.Vector3(0, 2.0, 0);

  // Mouse Parallax
  private mouseX: number = 0;
  private mouseY: number = 0;
  private targetMouseX: number = 0;
  private targetMouseY: number = 0;

  // Callbacks
  private onTelemetryUpdate?: (telemetry: TelemetryState) => void;
  private onStageComplete?: (stage: AuthSceneStage) => void;

  constructor(
    container: HTMLElement,
    callbacks?: {
      onTelemetryUpdate?: (telemetry: TelemetryState) => void;
      onStageComplete?: (stage: AuthSceneStage) => void;
    }
  ) {
    this.container = container;
    this.onTelemetryUpdate = callbacks?.onTelemetryUpdate;
    this.onStageComplete = callbacks?.onStageComplete;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0d12);
    this.scene.fog = new THREE.FogExp2(0x0a0d12, 0.015);

    const initialWidth = container.clientWidth || window.innerWidth || 1920;
    const initialHeight = container.clientHeight || window.innerHeight || 1080;

    this.camera = new THREE.PerspectiveCamera(
      45,
      initialWidth / initialHeight,
      0.1,
      100
    );
    this.camera.position.copy(this.camCurrentPos);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.setSize(initialWidth, initialHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    container.appendChild(this.renderer.domElement);

    this.clock = new THREE.Clock();

    this.initLighting();
    this.initFactoryEnvironment();
    this.initRollingShutter();
    this.initManagerCharacter();
    this.initCncMachine();
    this.initCncSparks();

    window.addEventListener('resize', this.handleResize);
    window.addEventListener('mousemove', this.handleMouseMove);

    this.animate();
  }

  /* -------------------------------------------------------------
   * LIGHTING
   * ------------------------------------------------------------- */
  private initLighting() {
    // Soft ambient industrial illumination
    const ambientLight = new THREE.AmbientLight(0xd4d8e0, 0.9);
    this.scene.add(ambientLight);

    // Main directional sunlight through skylight
    const sunLight = new THREE.DirectionalLight(0xfffbf2, 1.6);
    sunLight.position.set(12, 20, 14);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 40;
    sunLight.shadow.camera.left = -12;
    sunLight.shadow.camera.right = 12;
    sunLight.shadow.camera.top = 12;
    sunLight.shadow.camera.bottom = -12;
    sunLight.shadow.bias = -0.0004;
    this.scene.add(sunLight);

    // Warm high-bay industrial downlights inside the factory
    const bayLightPositions = [
      new THREE.Vector3(-3.5, 6, -3),
      new THREE.Vector3(3.5, 6, -3),
      new THREE.Vector3(0, 6.5, -8),
      new THREE.Vector3(-4, 6, -11),
      new THREE.Vector3(4, 6, -11),
    ];

    bayLightPositions.forEach((pos) => {
      const downLight = new THREE.SpotLight(0xfffaed, 2.2, 18, Math.PI / 3, 0.4, 1.2);
      downLight.position.copy(pos);
      downLight.target.position.set(pos.x, 0, pos.z);
      downLight.castShadow = true;
      downLight.shadow.mapSize.width = 1024;
      downLight.shadow.mapSize.height = 1024;
      downLight.shadow.bias = -0.0005;
      this.scene.add(downLight);
      this.scene.add(downLight.target);

      // Visual pendant lamp housing
      const lampGeo = new THREE.ConeGeometry(0.45, 0.35, 16, 1, true);
      const lampMat = new THREE.MeshStandardMaterial({
        color: 0x1f242c,
        roughness: 0.5,
        metalness: 0.3,
        side: THREE.DoubleSide,
      });
      const lampMesh = new THREE.Mesh(lampGeo, lampMat);
      lampMesh.position.copy(pos);
      this.scene.add(lampMesh);

      // Emissive bulb lens
      const bulbGeo = new THREE.SphereGeometry(0.18, 16, 16);
      const bulbMat = new THREE.MeshBasicMaterial({ color: 0xfff3d6 });
      const bulb = new THREE.Mesh(bulbGeo, bulbMat);
      bulb.position.set(pos.x, pos.y - 0.1, pos.z);
      this.scene.add(bulb);
    });

    // Forge Orange Accent Light at shutter threshold
    const orangeAccent = new THREE.PointLight(0xf25c19, 1.8, 8, 1.5);
    orangeAccent.position.set(-3.8, 3.2, 0.8);
    this.scene.add(orangeAccent);
  }

  /* -------------------------------------------------------------
   * FACTORY ENVIRONMENT
   * ------------------------------------------------------------- */
  private initFactoryEnvironment() {
    // 1. Concrete Floor with Polished Epoxy Specular Sheen
    const floorGeo = new THREE.PlaneGeometry(50, 50, 20, 20);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x181c24,
      roughness: 0.58,
      metalness: 0.18,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // 2. Yellow & Black Diagonal Hazard Aisle Border (Procedural Texture)
    const hazardCanvas = document.createElement('canvas');
    hazardCanvas.width = 256;
    hazardCanvas.height = 64;
    const hctx = hazardCanvas.getContext('2d');
    if (hctx) {
      hctx.fillStyle = '#E5A912'; // Safety yellow
      hctx.fillRect(0, 0, 256, 64);
      hctx.fillStyle = '#0F1218'; // Dark charcoal
      for (let x = -64; x < 320; x += 32) {
        hctx.beginPath();
        hctx.moveTo(x, 0);
        hctx.lineTo(x + 24, 0);
        hctx.lineTo(x + 8, 64);
        hctx.lineTo(x - 16, 64);
        hctx.closePath();
        hctx.fill();
      }
    }
    const hazardTex = new THREE.CanvasTexture(hazardCanvas);
    hazardTex.wrapS = THREE.RepeatWrapping;
    hazardTex.wrapT = THREE.RepeatWrapping;
    hazardTex.repeat.set(24, 1);

    const stripeMat = new THREE.MeshBasicMaterial({ map: hazardTex });
    
    // Left & right hazard floor strips
    const leftStripe = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 24), stripeMat);
    leftStripe.rotation.x = -Math.PI / 2;
    leftStripe.position.set(-3.2, 0.005, -3);
    this.scene.add(leftStripe);

    const rightStripe = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 24), stripeMat);
    rightStripe.rotation.x = -Math.PI / 2;
    rightStripe.position.set(3.2, 0.005, -3);
    this.scene.add(rightStripe);

    // 3. Structural Columns & Heavy I-Beams
    const columnGeo = new THREE.BoxGeometry(0.55, 8, 0.55);
    const beamGeo = new THREE.BoxGeometry(16, 0.65, 0.45);
    const craneRailGeo = new THREE.BoxGeometry(0.35, 0.75, 30);
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x141820,
      roughness: 0.65,
      metalness: 0.35,
    });
    const craneMat = new THREE.MeshStandardMaterial({
      color: 0xf25c19, // Forge Orange crane rail
      roughness: 0.45,
      metalness: 0.25,
    });

    const colX = [-5.5, 5.5];
    const colZ = [0, -6, -12, -18];

    colX.forEach((x) => {
      colZ.forEach((z) => {
        const col = new THREE.Mesh(columnGeo, metalMat);
        col.position.set(x, 4, z);
        col.castShadow = true;
        col.receiveShadow = true;
        this.scene.add(col);

        // Safety yellow bollard at the base of each column
        const bollard = new THREE.Mesh(
          new THREE.CylinderGeometry(0.12, 0.12, 0.95, 16),
          new THREE.MeshStandardMaterial({ color: 0xe5a912, roughness: 0.4 })
        );
        bollard.position.set(x > 0 ? x - 0.65 : x + 0.65, 0.475, z);
        bollard.castShadow = true;
        this.scene.add(bollard);
      });
    });

    // Cross I-beams across the ceiling
    colZ.forEach((z) => {
      const beam = new THREE.Mesh(beamGeo, metalMat);
      beam.position.set(0, 7.6, z);
      beam.castShadow = true;
      this.scene.add(beam);
    });

    // Overhead Crane Rails along factory length
    colX.forEach((x) => {
      const rail = new THREE.Mesh(craneRailGeo, craneMat);
      rail.position.set(x > 0 ? x - 0.4 : x + 0.4, 7.1, -9);
      this.scene.add(rail);
    });

    // 4. Overhead Ventilation Ducts
    const ductGeo = new THREE.CylinderGeometry(0.5, 0.5, 26, 20);
    const ductMat = new THREE.MeshStandardMaterial({
      color: 0x7c8594,
      roughness: 0.4,
      metalness: 0.6,
    });
    const duct = new THREE.Mesh(ductGeo, ductMat);
    duct.rotation.x = Math.PI / 2;
    duct.position.set(-2.2, 6.8, -9);
    this.scene.add(duct);

    // 5. Exterior Portal Wall Surrounding Shutter
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x1e232d,
      roughness: 0.8,
      metalness: 0.1,
    });

    // Left wall section
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(8, 8, 0.8), wallMat);
    leftWall.position.set(-7.5, 4, 0);
    leftWall.receiveShadow = true;
    this.scene.add(leftWall);

    // Right wall section
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(8, 8, 0.8), wallMat);
    rightWall.position.set(7.5, 4, 0);
    rightWall.receiveShadow = true;
    this.scene.add(rightWall);

    // Top lintel wall section above shutter
    const topWall = new THREE.Mesh(new THREE.BoxGeometry(7, 3, 0.8), wallMat);
    topWall.position.set(0, 6.5, 0);
    topWall.receiveShadow = true;
    this.scene.add(topWall);
  }

  /* -------------------------------------------------------------
   * INDUSTRIAL ROLLING SHUTTER
   * ------------------------------------------------------------- */
  private initRollingShutter() {
    const shutterWidth = 6.4;
    const shutterHeight = 4.8;
    const slatCount = 18;
    const slatHeight = shutterHeight / slatCount;

    // Header Drum Housing (where slats coil)
    const drumGeo = new THREE.CylinderGeometry(0.55, 0.55, shutterWidth + 0.4, 24);
    const drumMat = new THREE.MeshStandardMaterial({
      color: 0x11141a,
      roughness: 0.5,
      metalness: 0.4,
    });
    this.shutterHeaderDrum = new THREE.Mesh(drumGeo, drumMat);
    this.shutterHeaderDrum.rotation.z = Math.PI / 2;
    this.shutterHeaderDrum.position.set(0, shutterHeight + 0.4, 0);
    this.shutterHeaderDrum.castShadow = true;
    this.scene.add(this.shutterHeaderDrum);

    // Shutter Side Guide Frame (Carbide Black Steel)
    const guideFrameMat = new THREE.MeshStandardMaterial({
      color: 0x0c0f14,
      roughness: 0.4,
      metalness: 0.5,
    });
    const leftGuide = new THREE.Mesh(new THREE.BoxGeometry(0.3, shutterHeight + 0.6, 0.4), guideFrameMat);
    leftGuide.position.set(-shutterWidth / 2 - 0.15, shutterHeight / 2, 0);
    this.scene.add(leftGuide);

    const rightGuide = new THREE.Mesh(new THREE.BoxGeometry(0.3, shutterHeight + 0.6, 0.4), guideFrameMat);
    rightGuide.position.set(shutterWidth / 2 + 0.15, shutterHeight / 2, 0);
    this.scene.add(rightGuide);

    // Status Strobe Beacon atop shutter header
    const beaconBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.22, 0.18, 16),
      new THREE.MeshStandardMaterial({ color: 0x0a0d12 })
    );
    beaconBase.position.set(0, shutterHeight + 1.05, 0);
    this.scene.add(beaconBase);

    const beaconLens = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.16, 0.28, 16),
      new THREE.MeshStandardMaterial({
        color: 0xf25c19,
        emissive: 0xf25c19,
        emissiveIntensity: 0.6,
        roughness: 0.2,
      })
    );
    beaconLens.position.set(0, shutterHeight + 1.25, 0);
    this.scene.add(beaconLens);
    this.shutterBeaconMesh = beaconLens;

    this.shutterBeaconLight = new THREE.PointLight(0xf25c19, 1.2, 5);
    this.shutterBeaconLight.position.set(0, shutterHeight + 1.35, 0.2);
    this.scene.add(this.shutterBeaconLight);

    // 18 Articulated Steel Slats
    const slatGeo = new THREE.BoxGeometry(shutterWidth, slatHeight * 0.94, 0.12);
    const slatMat = new THREE.MeshStandardMaterial({
      color: 0x242a34,
      roughness: 0.6,
      metalness: 0.35,
    });

    // Reinforced Bottom Bar with Safety Hazard Chevrons
    const bottomSlatMat = new THREE.MeshStandardMaterial({
      color: 0xf25c19, // Forge Orange bottom kick-rail
      roughness: 0.45,
      metalness: 0.3,
    });

    for (let i = 0; i < slatCount; i++) {
      const isBottom = i === 0;
      const slat = new THREE.Mesh(slatGeo, isBottom ? bottomSlatMat : slatMat);
      slat.position.set(0, (i + 0.5) * slatHeight, 0);
      slat.castShadow = true;
      slat.receiveShadow = true;
      this.scene.add(slat);
      this.shutterSlats.push(slat);
    }
  }

  /* -------------------------------------------------------------
   * STYLIZED FACTORY FLOOR MANAGER (CHARACTER)
   * ------------------------------------------------------------- */
  private initManagerCharacter() {
    this.managerGroup = new THREE.Group();
    // Initial position: in front of closed shutter
    this.managerGroup.position.set(-1.0, 0, 4.8);
    this.managerGroup.rotation.y = Math.PI * 0.12; // angled slightly towards shutter and camera
    this.scene.add(this.managerGroup);

    // Pelvis / Hips
    const hipGeo = new THREE.BoxGeometry(0.55, 0.28, 0.38);
    const workwearMat = new THREE.MeshStandardMaterial({
      color: 0x1b2029, // Charcoal workwear
      roughness: 0.75,
      metalness: 0.1,
    });
    const pelvis = new THREE.Mesh(hipGeo, workwearMat);
    pelvis.position.y = 0.98;
    pelvis.castShadow = true;
    this.managerGroup.add(pelvis);

    // Torso / Jacket
    this.managerSpine = new THREE.Group();
    this.managerSpine.position.set(0, 1.1, 0);
    this.managerGroup.add(this.managerSpine);

    const torsoGeo = new THREE.BoxGeometry(0.68, 0.65, 0.42);
    const torsoMesh = new THREE.Mesh(torsoGeo, workwearMat);
    torsoMesh.position.y = 0.32;
    torsoMesh.castShadow = true;
    this.managerSpine.add(torsoMesh);

    // Forge Orange High-Vis Band across chest & back
    const highVisBand = new THREE.Mesh(
      new THREE.BoxGeometry(0.69, 0.14, 0.43),
      new THREE.MeshStandardMaterial({
        color: 0xf25c19, // Forge Orange
        roughness: 0.4,
        metalness: 0.1,
      })
    );
    highVisBand.position.y = 0.38;
    this.managerSpine.add(highVisBand);

    // Stylized FORGEOS Chest ID Badge
    const badge = new THREE.Mesh(
      new THREE.PlaneGeometry(0.14, 0.08),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    badge.position.set(0.2, 0.48, 0.22);
    this.managerSpine.add(badge);

    // Neck & Head Group
    this.managerHead = new THREE.Group();
    this.managerHead.position.set(0, 0.68, 0);
    this.managerSpine.add(this.managerHead);

    // Neck
    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.14, 0.16, 16),
      new THREE.MeshStandardMaterial({ color: 0xd9a282, roughness: 0.7 })
    );
    neck.position.y = 0.08;
    this.managerHead.add(neck);

    // Stylized Head
    const headMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, 0.42, 0.38),
      new THREE.MeshStandardMaterial({ color: 0xd9a282, roughness: 0.7 })
    );
    headMesh.position.y = 0.28;
    headMesh.castShadow = true;
    this.managerHead.add(headMesh);

    // Safety Goggles
    const goggles = new THREE.Mesh(
      new THREE.BoxGeometry(0.34, 0.12, 0.12),
      new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.1,
        metalness: 0.4,
      })
    );
    goggles.position.set(0, 0.32, 0.18);
    this.managerHead.add(goggles);

    // Orange Safety Hardhat with visor brim
    const helmetCrown = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({
        color: 0xf25c19, // Forge Orange Hardhat
        roughness: 0.35,
        metalness: 0.15,
      })
    );
    helmetCrown.position.set(0, 0.44, 0);
    helmetCrown.castShadow = true;
    this.managerHead.add(helmetCrown);

    const helmetBrim = new THREE.Mesh(
      new THREE.CylinderGeometry(0.34, 0.34, 0.04, 16),
      new THREE.MeshStandardMaterial({
        color: 0xf25c19,
        roughness: 0.35,
        metalness: 0.15,
      })
    );
    helmetBrim.position.set(0, 0.42, 0.04);
    this.managerHead.add(helmetBrim);

    // Left Arm (Holding Industrial Tablet)
    this.managerLeftArm = new THREE.Group();
    this.managerLeftArm.position.set(-0.42, 0.58, 0);
    this.managerSpine.add(this.managerLeftArm);

    const leftUpperArm = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.38, 0.18),
      workwearMat
    );
    leftUpperArm.position.y = -0.19;
    this.managerLeftArm.add(leftUpperArm);

    const leftForearm = new THREE.Group();
    leftForearm.position.set(0, -0.38, 0);
    leftForearm.rotation.x = -Math.PI * 0.45; // Angled forward to hold tablet
    leftForearm.rotation.y = -Math.PI * 0.15;
    this.managerLeftArm.add(leftForearm);

    const leftLowerArmMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.36, 0.16),
      workwearMat
    );
    leftLowerArmMesh.position.y = -0.18;
    leftForearm.add(leftLowerArmMesh);

    // Industrial Ruggedized Tablet
    const tabletCase = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 0.34, 0.05),
      new THREE.MeshStandardMaterial({
        color: 0x0f131a, // Dark rubberized case
        roughness: 0.5,
        metalness: 0.2,
      })
    );
    tabletCase.position.set(0.08, -0.34, 0.16);
    tabletCase.rotation.x = Math.PI * 0.18;
    leftForearm.add(tabletCase);

    // Orange protective bumper corners
    const bumperCornerMat = new THREE.MeshStandardMaterial({ color: 0xf25c19 });
    const bumper = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.36, 0.04), bumperCornerMat);
    bumper.position.copy(tabletCase.position);
    bumper.rotation.copy(tabletCase.rotation);
    bumper.scale.set(1.02, 1.02, 0.7);
    leftForearm.add(bumper);

    // Tablet Emissive Screen
    this.managerTabletScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.42, 0.28),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.85,
        roughness: 0.2,
      })
    );
    this.managerTabletScreen.position.set(0.08, -0.34, 0.19);
    this.managerTabletScreen.rotation.copy(tabletCase.rotation);
    leftForearm.add(this.managerTabletScreen);

    // Screen Glow Light casting on manager's face
    this.tabletGlowLight = new THREE.PointLight(0x38bdf8, 0.9, 1.8);
    this.tabletGlowLight.position.set(-0.35, 1.15, 0.45);
    this.managerGroup.add(this.tabletGlowLight);

    // Right Arm (Interactive gesturing / tapping)
    this.managerRightArm = new THREE.Group();
    this.managerRightArm.position.set(0.42, 0.58, 0);
    this.managerSpine.add(this.managerRightArm);

    const rightUpperArm = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.38, 0.18),
      workwearMat
    );
    rightUpperArm.position.y = -0.19;
    this.managerRightArm.add(rightUpperArm);

    const rightForearm = new THREE.Group();
    rightForearm.position.set(0, -0.38, 0);
    rightForearm.rotation.x = -Math.PI * 0.25;
    this.managerRightArm.add(rightForearm);

    const rightLowerArmMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.36, 0.16),
      workwearMat
    );
    rightLowerArmMesh.position.y = -0.18;
    rightForearm.add(rightLowerArmMesh);

    // Stylized Work Glove Hand
    const glove = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.16, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.6 })
    );
    glove.position.set(0, -0.38, 0);
    rightForearm.add(glove);

    // Legs & Safety Work Boots
    const bootMat = new THREE.MeshStandardMaterial({
      color: 0x090b0e,
      roughness: 0.5,
      metalness: 0.2,
    });
    const steelToeMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.35,
      metalness: 0.7,
    });

    // Left Leg
    this.managerLeftLeg = new THREE.Group();
    this.managerLeftLeg.position.set(-0.18, 0.88, 0);
    this.managerGroup.add(this.managerLeftLeg);

    const leftLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.82, 0.24), workwearMat);
    leftLegMesh.position.y = -0.41;
    leftLegMesh.castShadow = true;
    this.managerLeftLeg.add(leftLegMesh);

    const leftBoot = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 0.44), bootMat);
    leftBoot.position.set(0, -0.86, 0.08);
    leftBoot.castShadow = true;
    this.managerLeftLeg.add(leftBoot);

    const leftSteelToe = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.14), steelToeMat);
    leftSteelToe.position.set(0, -0.86, 0.25);
    this.managerLeftLeg.add(leftSteelToe);

    // Right Leg
    this.managerRightLeg = new THREE.Group();
    this.managerRightLeg.position.set(0.18, 0.88, 0);
    this.managerGroup.add(this.managerRightLeg);

    const rightLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.82, 0.24), workwearMat);
    rightLegMesh.position.y = -0.41;
    rightLegMesh.castShadow = true;
    this.managerRightLeg.add(rightLegMesh);

    const rightBoot = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 0.44), bootMat);
    rightBoot.position.set(0, -0.86, 0.08);
    rightBoot.castShadow = true;
    this.managerRightLeg.add(rightBoot);

    const rightSteelToe = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.14), steelToeMat);
    rightSteelToe.position.set(0, -0.86, 0.25);
    this.managerRightLeg.add(rightSteelToe);
  }

  /* -------------------------------------------------------------
   * STYLIZED AUTOMATED CNC MACHINE
   * ------------------------------------------------------------- */
  private initCncMachine() {
    this.cncGroup = new THREE.Group();
    // Located inside the factory floor on the right side
    this.cncGroup.position.set(2.8, 0, -4.8);
    this.cncGroup.rotation.y = -Math.PI * 0.18; // angled forward to face camera
    this.scene.add(this.cncGroup);

    // Machine Main Body Enclosure (Heavy Cast Iron & Sheet Metal)
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x161a22, // Carbide Black chassis
      roughness: 0.55,
      metalness: 0.35,
    });
    const accentPanelMat = new THREE.MeshStandardMaterial({
      color: 0xf25c19, // Forge Orange accent panels
      roughness: 0.4,
      metalness: 0.2,
    });
    const aluminumTrimMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0, // Clean light aluminum
      roughness: 0.3,
      metalness: 0.4,
    });

    // Lower machine base
    const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.2, 2.6), bodyMat);
    baseMesh.position.y = 0.6;
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    this.cncGroup.add(baseMesh);

    // Forge Orange horizontal base stripe
    const baseStripe = new THREE.Mesh(new THREE.BoxGeometry(3.64, 0.18, 2.64), accentPanelMat);
    baseStripe.position.y = 0.6;
    this.cncGroup.add(baseStripe);

    // Upper Machining Enclosure
    const upperMesh = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.2, 2.6), bodyMat);
    upperMesh.position.y = 2.3;
    upperMesh.castShadow = true;
    this.cncGroup.add(upperMesh);

    // Slanted Top Hood in light aluminum
    const hoodMesh = new THREE.Mesh(new THREE.BoxGeometry(3.62, 0.4, 2.62), aluminumTrimMat);
    hoodMesh.position.y = 3.5;
    this.cncGroup.add(hoodMesh);

    // Front Viewing Window (Recessed Machining Bay Chamber)
    const chamberCutout = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 1.6, 1.8),
      new THREE.MeshStandardMaterial({
        color: 0x202632,
        roughness: 0.65,
        metalness: 0.2,
        side: THREE.BackSide,
      })
    );
    chamberCutout.position.set(0, 2.2, 0.45);
    this.cncGroup.add(chamberCutout);

    // Transparent Polycarbonate Sliding Door
    const windowGlass = new THREE.Mesh(
      new THREE.BoxGeometry(2.35, 1.55, 0.06),
      new THREE.MeshStandardMaterial({
        color: 0xcfd8dc,
        roughness: 0.1,
        metalness: 0.1,
        transparent: true,
        opacity: 0.35,
      })
    );
    windowGlass.position.set(0, 2.2, 1.32);
    this.cncGroup.add(windowGlass);

    // Bright internal LED floodlight inside chamber
    this.cncInternalLight = new THREE.PointLight(0xffffff, 2.4, 4.5);
    this.cncInternalLight.position.set(0, 2.8, 0.5);
    this.cncGroup.add(this.cncInternalLight);

    // Internal T-Slotted Machining Table (X/Y axis)
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x333b48,
      roughness: 0.4,
      metalness: 0.7,
    });
    this.cncTable = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.22, 1.1), tableMat);
    this.cncTable.position.set(0, 1.55, 0.45);
    this.cncTable.castShadow = true;
    this.cncGroup.add(this.cncTable);

    // Precision Clamping Vise
    const vise = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.24, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.8, roughness: 0.3 })
    );
    vise.position.set(0, 1.76, 0.45);
    this.cncGroup.add(vise);

    // Aluminum Raw Billet Workpiece
    const billetGeo = new THREE.BoxGeometry(0.55, 0.28, 0.38);
    const billetMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.25,
      metalness: 0.88,
    });
    this.cncWorkpiece = new THREE.Mesh(billetGeo, billetMat);
    this.cncWorkpiece.position.set(0, 1.98, 0.45);
    this.cncWorkpiece.castShadow = true;
    this.cncGroup.add(this.cncWorkpiece);

    // 3-Axis Spindle Assembly (Z-axis quill)
    this.cncSpindle = new THREE.Group();
    this.cncSpindle.position.set(0, 2.65, 0.45);
    this.cncGroup.add(this.cncSpindle);

    const quillHousing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 0.5, 20),
      new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.4, metalness: 0.6 })
    );
    quillHousing.position.y = 0.25;
    this.cncSpindle.add(quillHousing);

    // Rotating Tool Holder & Carbide Endmill
    this.cncToolHolder = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.08, 0.22, 16),
      new THREE.MeshStandardMaterial({ color: 0xc0c8d4, roughness: 0.2, metalness: 0.95 })
    );
    this.cncToolHolder.position.y = -0.08;
    this.cncSpindle.add(this.cncToolHolder);

    const endmill = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 0.18, 12),
      new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.3, metalness: 0.9 }) // Gold titanium coating
    );
    endmill.position.y = -0.22;
    this.cncSpindle.add(endmill);

    // 3-Color Andon Beacon Stack on Machine Top
    const andonBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.4, 16),
      new THREE.MeshStandardMaterial({ color: 0x111827 })
    );
    andonBase.position.set(1.4, 3.85, 0.6);
    this.cncGroup.add(andonBase);

    // Red (Top)
    this.cncAndonRed = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.09, 0.12, 16),
      new THREE.MeshStandardMaterial({ color: 0x551111, roughness: 0.3 })
    );
    this.cncAndonRed.position.set(1.4, 4.28, 0.6);
    this.cncGroup.add(this.cncAndonRed);

    // Orange/Amber (Middle)
    this.cncAndonOrange = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.09, 0.12, 16),
      new THREE.MeshStandardMaterial({ color: 0x663300, roughness: 0.3 })
    );
    this.cncAndonOrange.position.set(1.4, 4.14, 0.6);
    this.cncGroup.add(this.cncAndonOrange);

    // Green (Bottom)
    this.cncAndonGreen = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.09, 0.12, 16),
      new THREE.MeshStandardMaterial({
        color: 0x059669,
        emissive: 0x059669,
        emissiveIntensity: 0.6,
        roughness: 0.3,
      })
    );
    this.cncAndonGreen.position.set(1.4, 4.0, 0.6);
    this.cncGroup.add(this.cncAndonGreen);
  }

  /* -------------------------------------------------------------
   * PRECISION CNC MILLING SPARKS & COOLANT MIST
   * ------------------------------------------------------------- */
  private initCncSparks() {
    const particleCount = 75;
    const geometry = new THREE.BufferGeometry();
    this.cncSparkPositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      this.cncSparkPositions[i * 3] = 0;
      this.cncSparkPositions[i * 3 + 1] = 0;
      this.cncSparkPositions[i * 3 + 2] = 0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(this.cncSparkPositions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xffd166,
      size: 0.05,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });

    this.cncSparksGroup = new THREE.Points(geometry, material);
    this.cncSparksGroup.position.set(0, 2.12, 0.45);
    this.cncGroup.add(this.cncSparksGroup);
  }

  /* -------------------------------------------------------------
   * CAMERA CHOREOGRAPHY & STAGES
   * ------------------------------------------------------------- */
  public setStage(stage: AuthSceneStage) {
    this.currentStage = stage;
    this.stageProgress = 0;

    switch (stage) {
      case 'ARRIVAL':
        this.camTargetPos.set(0, 2.2, 8.5);
        this.camTargetLookAt.set(0, 2.0, 0);
        this.shutterTarget = 0;
        this.isCncMilling = false;
        industrialAudio.stopCncMachining();
        break;

      case 'MANAGER_APPROACH':
        // Camera tracks the manager stepping up to the shutter
        this.camTargetPos.set(-0.8, 2.1, 6.8);
        this.camTargetLookAt.set(-0.4, 1.8, 2.2);
        industrialAudio.playTabletChirp();
        break;

      case 'SHUTTER_OPEN':
        // Camera moves forward as shutter opens
        this.camTargetPos.set(0, 2.3, 5.2);
        this.camTargetLookAt.set(0, 2.2, -3.0);
        this.shutterTarget = 1;
        industrialAudio.playShutterSound(2.4);
        break;

      case 'LOGIN_READY':
        // Camera settles into dynamic 3/4 isometric perspective
        // Factory interior and CNC machine visible on the right, manager at station
        this.camTargetPos.set(-2.6, 2.2, 4.2);
        this.camTargetLookAt.set(1.4, 1.8, -2.5);
        this.shutterTarget = 1;
        this.isCncMilling = false;
        break;

      case 'CNC_MACHINING':
        // Camera dollies toward the active CNC machine
        this.camTargetPos.set(-0.6, 2.2, 1.2);
        this.camTargetLookAt.set(2.8, 2.0, -4.8);
        this.isCncMilling = true;
        this.shutterTarget = 1;
        industrialAudio.startCncMachining();
        break;

      case 'DASHBOARD_TRANSITION':
        // Cinematic push forward into factory interior
        this.camTargetPos.set(0, 2.4, -6.5);
        this.camTargetLookAt.set(0, 2.4, -18.0);
        industrialAudio.stopCncMachining();
        industrialAudio.playAuthSuccess();
        break;
    }
  }

  /* -------------------------------------------------------------
   * RENDER & ANIMATION LOOP
   * ------------------------------------------------------------- */
  private animate = () => {
    this.animFrameId = requestAnimationFrame(this.animate);

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // 1. Smooth Camera Interpolation (Damping)
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

    // Apply parallax offset to camera position
    const parallaxX = this.mouseX * 0.35;
    const parallaxY = this.mouseY * 0.25;

    this.camCurrentPos.lerp(
      new THREE.Vector3(
        this.camTargetPos.x + parallaxX,
        this.camTargetPos.y + parallaxY,
        this.camTargetPos.z
      ),
      delta * 2.8
    );
    this.camCurrentLookAt.lerp(this.camTargetLookAt, delta * 3.2);

    this.camera.position.copy(this.camCurrentPos);
    this.camera.lookAt(this.camCurrentLookAt);

    // 2. Industrial Rolling Shutter Animation
    this.shutterOpenAmount += (this.shutterTarget - this.shutterOpenAmount) * delta * 2.2;
    const totalSlats = this.shutterSlats.length;

    this.shutterSlats.forEach((slat, idx) => {
      // Slats lift in a realistic staggered mechanical wave from bottom to top
      const slatFraction = idx / totalSlats;
      const liftFactor = Math.max(0, Math.min(1, (this.shutterOpenAmount - slatFraction * 0.4) / 0.6));
      
      const baseY = (idx + 0.5) * (4.8 / totalSlats);
      const targetY = baseY + liftFactor * (5.2 - baseY);
      slat.position.y = targetY;

      // As slats reach the header drum, scale down Z to simulate rolling into canister
      const rollDepth = Math.max(0.1, 1 - Math.max(0, targetY - 4.2) * 1.2);
      slat.scale.z = rollDepth;
      slat.visible = targetY < 5.3;
    });

    // Header drum rotation as shutter rolls
    if (this.shutterHeaderDrum) {
      this.shutterHeaderDrum.rotation.x = this.shutterOpenAmount * Math.PI * 4;
    }

    // Strobe beacon flash when shutter is moving
    const isMovingShutter = Math.abs(this.shutterTarget - this.shutterOpenAmount) > 0.02;
    if (this.shutterBeaconLight && this.shutterBeaconMesh) {
      if (isMovingShutter) {
        const strobe = Math.sin(elapsedTime * 18) > 0 ? 3.0 : 0.2;
        this.shutterBeaconLight.intensity = strobe;
        (this.shutterBeaconMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = strobe * 0.6;
      } else {
        this.shutterBeaconLight.intensity = 0.4;
        (this.shutterBeaconMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.2;
      }
    }

    // 3. Manager Character Animation Rig
    this.updateManagerAnimation(elapsedTime, delta);

    // 4. CNC Machine Operations (Authentication Phase)
    this.updateCncAnimation(elapsedTime, delta);

    this.renderer.render(this.scene, this.camera);
  };

  private updateManagerAnimation(time: number, delta: number) {
    if (!this.managerGroup) return;

    // Subtle natural breathing
    const breath = Math.sin(time * 2.2) * 0.025;
    this.managerSpine.position.y = 1.1 + breath;
    this.managerHead.rotation.x = Math.sin(time * 1.5) * 0.03;

    // Tablet screen subtle flicker / pulse
    if (this.managerTabletScreen) {
      const tabletPulse = 0.8 + Math.sin(time * 5.0) * 0.15;
      (this.managerTabletScreen.material as THREE.MeshStandardMaterial).emissiveIntensity = tabletPulse;
      this.tabletGlowLight.intensity = tabletPulse * 0.85;
    }

    if (this.currentStage === 'ARRIVAL') {
      // Standing ready, looking at shutter
      this.managerGroup.position.set(-1.1, 0, 4.8);
      this.managerHead.rotation.y = THREE.MathUtils.lerp(this.managerHead.rotation.y, 0.2, delta * 3);
      this.managerRightArm.rotation.x = THREE.MathUtils.lerp(this.managerRightArm.rotation.x, 0.1, delta * 3);
    } else if (this.currentStage === 'MANAGER_APPROACH') {
      // Manager walks forward towards shutter
      this.stageProgress = Math.min(1, this.stageProgress + delta * 0.7);
      const walkCycle = Math.sin(time * 8.0);
      
      this.managerGroup.position.z = THREE.MathUtils.lerp(4.8, 2.4, this.stageProgress);
      this.managerLeftLeg.rotation.x = walkCycle * 0.45;
      this.managerRightLeg.rotation.x = -walkCycle * 0.45;
      this.managerRightArm.rotation.x = -walkCycle * 0.35;

      // Arm reaches to tap tablet at end of approach
      if (this.stageProgress > 0.7) {
        this.managerRightArm.rotation.x = THREE.MathUtils.lerp(this.managerRightArm.rotation.x, -Math.PI * 0.38, delta * 5);
        this.managerHead.rotation.x = THREE.MathUtils.lerp(this.managerHead.rotation.x, 0.3, delta * 4); // looking down at tablet
      }

      if (this.stageProgress >= 1 && this.onStageComplete) {
        this.onStageComplete('MANAGER_APPROACH');
      }
    } else if (this.currentStage === 'SHUTTER_OPEN') {
      // Stand firmly, gaze upwards following the opening shutter
      this.managerLeftLeg.rotation.x = 0;
      this.managerRightLeg.rotation.x = 0;
      this.managerHead.rotation.x = THREE.MathUtils.lerp(this.managerHead.rotation.x, -0.35, delta * 3); // looking up at shutter
      this.managerRightArm.rotation.x = THREE.MathUtils.lerp(this.managerRightArm.rotation.x, 0.1, delta * 3);
    } else if (this.currentStage === 'LOGIN_READY') {
      // Steps slightly to the side supervisory station, welcoming posture facing camera & console
      this.managerGroup.position.set(-2.0, 0, 1.8);
      this.managerGroup.rotation.y = THREE.MathUtils.lerp(this.managerGroup.rotation.y, Math.PI * 0.28, delta * 2);
      this.managerHead.rotation.y = THREE.MathUtils.lerp(this.managerHead.rotation.y, -0.2, delta * 3);
      this.managerRightArm.rotation.x = Math.sin(time * 1.5) * 0.08;
    } else if (this.currentStage === 'CNC_MACHINING') {
      // Manager turns and observes CNC machine approvingly while checking tablet
      this.managerGroup.rotation.y = THREE.MathUtils.lerp(this.managerGroup.rotation.y, Math.PI * 0.42, delta * 3);
      this.managerHead.rotation.y = THREE.MathUtils.lerp(this.managerHead.rotation.y, 0.35, delta * 3);
      this.managerHead.rotation.x = THREE.MathUtils.lerp(this.managerHead.rotation.x, -0.05, delta * 3);
    }
  }

  private updateCncAnimation(time: number, delta: number) {
    if (!this.cncGroup) return;

    if (this.isCncMilling) {
      // Spindle Ramps Up to 12,000 RPM
      this.cncSpindleRpm = Math.min(12500, this.cncSpindleRpm + delta * 9000);
      this.cncToolAngle += (this.cncSpindleRpm / 60) * Math.PI * 2 * delta;

      if (this.cncToolHolder) {
        this.cncToolHolder.rotation.y = this.cncToolAngle;
      }

      // X/Y/Z Precision Milling Toolpath Motion
      const toolpathTime = time * 2.8;
      const xOffset = Math.sin(toolpathTime) * 0.22;
      const yOffset = Math.cos(toolpathTime * 1.5) * 0.12;
      const zPlunge = Math.sin(toolpathTime * 3) > 0.2 ? -0.12 : -0.08;

      if (this.cncSpindle) {
        this.cncSpindle.position.x = xOffset;
        this.cncSpindle.position.y = 2.45 + zPlunge;
        this.cncSpindle.position.z = 0.45 + yOffset;
      }

      // Update Milling Sparks & Mist
      const sparkMat = this.cncSparksGroup.material as THREE.PointsMaterial;
      sparkMat.opacity = 0.85;

      const positions = this.cncSparkPositions;
      for (let i = 0; i < positions.length / 3; i++) {
        positions[i * 3] = xOffset + (Math.random() - 0.5) * 0.25;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 0.15;
        positions[i * 3 + 2] = yOffset + (Math.random() - 0.5) * 0.25;
      }
      this.cncSparksGroup.geometry.attributes.position.needsUpdate = true;

      // Andon Light State: Amber pulses during machining, Green steady
      const amberPulse = Math.sin(time * 12) > 0 ? 1.0 : 0.2;
      (this.cncAndonOrange.material as THREE.MeshStandardMaterial).emissive = new THREE.Color(0xf59e0b);
      (this.cncAndonOrange.material as THREE.MeshStandardMaterial).emissiveIntensity = amberPulse;

      // Telemetry Output to UI
      if (this.onTelemetryUpdate) {
        this.onTelemetryUpdate({
          spindleRpm: Math.floor(this.cncSpindleRpm),
          feedRate: 850 + Math.floor(Math.sin(time * 5) * 35),
          toolNumber: 'T04 (Ø12mm Carbide)',
          axisCoordinates: {
            x: Number((xOffset * 100).toFixed(2)),
            y: Number((yOffset * 100).toFixed(2)),
            z: Number((zPlunge * 100).toFixed(2)),
          },
          systemStatus: 'ACTIVE_MILLING',
          cyclePercent: Math.min(100, Math.floor((this.cncSpindleRpm / 12500) * 100)),
        });
      }
    } else {
      // Idle CNC State
      this.cncSpindleRpm = Math.max(0, this.cncSpindleRpm - delta * 6000);
      if (this.cncSpindle) {
        this.cncSpindle.position.y = THREE.MathUtils.lerp(this.cncSpindle.position.y, 2.65, delta * 3);
        this.cncSpindle.position.x = THREE.MathUtils.lerp(this.cncSpindle.position.x, 0, delta * 3);
      }
      if (this.cncSparksGroup) {
        (this.cncSparksGroup.material as THREE.PointsMaterial).opacity = 0;
      }
      (this.cncAndonOrange.material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
    }
  }

  private handleMouseMove = (event: MouseEvent) => {
    // Normalized coordinates -1 to 1
    this.targetMouseX = (event.clientX / window.innerWidth) * 2 - 1;
    this.targetMouseY = -(event.clientY / window.innerHeight) * 2 + 1;
  };

  private handleResize = () => {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth || window.innerWidth || 1920;
    const height = this.container.clientHeight || window.innerHeight || 1080;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public dispose() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('mousemove', this.handleMouseMove);

    // Dispose geometries and materials
    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry?.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material?.dispose();
        }
      }
    });

    this.renderer.dispose();
    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
