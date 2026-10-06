import * as THREE from "three";

/** Model-space units. Front is +Z; the silk attaches above the positive Y tip. */
export const SPIDER_DIMENSIONS = {
  envelope: { width: 4.601306, height: 4.716168, depth: 0.887 },
  body: { width: 1.1, height: 2.63, depth: 0.887 },
  abdomen: { width: 1.1, height: 2.03 },
  head: { width: 0.49, height: 0.84 },
  engraving: {
    center: { x: 0, y: 0.805, z: 0.488 },
    width: 0.58,
    height: 0.55,
    floorZ: 0.404,
    plateFrontZ: 0.488,
    depth: 0.084,
  },
  silkAttachment: { x: 0, y: 1.95, z: -0.055 },
  legOrder: [
    "left-upper",
    "left-middle",
    "left-lower",
    "left-bottom",
    "right-upper",
    "right-middle",
    "right-lower",
    "right-bottom",
  ],
} as const;

type Point = readonly [number, number, number];
type Outline = readonly (readonly [number, number])[];
type SpiderModel = {
  group: THREE.Group;
  legs: THREE.Group[];
  materials: THREE.Material[];
  dispose: () => void;
};

const ABDOMEN: Outline = [
  [0, 1.95],
  [0.16, 1.7],
  [0.33, 1.45],
  [0.46, 1.18],
  [0.55, 0.85],
  [0.53, 0.54],
  [0.43, 0.25],
  [0.26, 0.04],
  [0, -0.08],
  [-0.26, 0.04],
  [-0.43, 0.25],
  [-0.53, 0.54],
  [-0.55, 0.85],
  [-0.46, 1.18],
  [-0.33, 1.45],
  [-0.16, 1.7],
];
const SHIELD: Outline = [
  [0, 1.91],
  [0.16, 1.65],
  [0.29, 1.38],
  [0.345, 1.08],
  [0.325, 0.73],
  [0.24, 0.38],
  [0, 0.13],
  [-0.24, 0.38],
  [-0.325, 0.73],
  [-0.345, 1.08],
  [-0.29, 1.38],
  [-0.16, 1.65],
];
const HEAD: Outline = [
  [0, 0.16],
  [0.17, 0.08],
  [0.245, -0.12],
  [0.19, -0.37],
  [0.1, -0.56],
  [0, -0.68],
  [-0.1, -0.56],
  [-0.19, -0.37],
  [-0.245, -0.12],
  [-0.17, 0.08],
];
const X_CUT: Outline = [
  [-0.23, 1.08],
  [0, 0.86],
  [0.23, 1.08],
  [0.29, 1.02],
  [0.055, 0.805],
  [0.29, 0.59],
  [0.23, 0.53],
  [0, 0.75],
  [-0.23, 0.53],
  [-0.29, 0.59],
  [-0.055, 0.805],
  [-0.29, 1.02],
];
const LEG_CHAINS: readonly {
  name: string;
  points: readonly Point[];
  widths: readonly number[];
}[] = [
  {
    name: "upper",
    points: [
      [0.43, 0.91, -0.05],
      [0.61, 1.18, 0],
      [0.99, 2.28, 0.06],
      [1.57, 1.77, -0.07],
      [1.81, 1.29, -0.18],
    ],
    widths: [0.1, 0.155, 0.14, 0.054],
  },
  {
    name: "middle",
    points: [
      [0.47, 0.31, -0.1],
      [0.65, 0.56, -0.06],
      [1.17, 1.43, 0.07],
      [1.86, 0.71, -0.08],
      [2.3, -0.16, -0.28],
    ],
    widths: [0.1, 0.155, 0.16, 0.061],
  },
  {
    name: "lower",
    points: [
      [0.4, -0.14, -0.11],
      [0.63, -0.06, -0.1],
      [1.17, 0.55, 0.03],
      [1.94, -0.45, -0.14],
      [2.23, -1.43, -0.3],
    ],
    widths: [0.105, 0.145, 0.155, 0.061],
  },
  {
    name: "bottom",
    points: [
      [0.29, -0.29, -0.13],
      [0.52, -0.37, -0.12],
      [0.8, -0.52, -0.08],
      [1.1, -1.44, -0.17],
      [1.32, -2.36, -0.28],
    ],
    widths: [0.1, 0.14, 0.14, 0.06],
  },
];

function path(points: Outline): THREE.Shape {
  const shape = new THREE.Shape();
  points.forEach(([x, y], i) => (i ? shape.lineTo(x, y) : shape.moveTo(x, y)));
  shape.closePath();
  return shape;
}

/** Closed faceted loft: volume comes from several perimeter rings, never a billboard. */
function armorLoft(
  outline: Outline,
  centerY: number,
  levels: readonly (readonly [number, number])[],
): THREE.BufferGeometry {
  const positions: number[] = [];
  const ring = (level: number, index: number) => {
    const [scale, z] = levels[level];
    const [x, y] = outline[(index + outline.length) % outline.length];
    return new THREE.Vector3(x * scale, centerY + (y - centerY) * scale, z);
  };
  const triangle = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3) =>
    positions.push(...a.toArray(), ...b.toArray(), ...c.toArray());
  // Input outline is clockwise viewed from +Z. Reverse front triangles for outward normals.
  for (let r = 0; r < levels.length - 1; r++) {
    for (let i = 0; i < outline.length; i++) {
      const a = ring(r, i),
        b = ring(r, i + 1),
        c = ring(r + 1, i + 1),
        d = ring(r + 1, i);
      triangle(a, d, b);
      triangle(b, d, c);
    }
  }
  const back = new THREE.Vector3(0, centerY, levels[0][1]);
  const front = new THREE.Vector3(0, centerY, levels.at(-1)![1]);
  for (let i = 0; i < outline.length; i++) {
    triangle(back, ring(0, i), ring(0, i + 1));
    triangle(front, ring(levels.length - 1, i + 1), ring(levels.length - 1, i));
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.computeVertexNormals();
  return geometry;
}

/** Eight-sided blade sections with a raised central ridge and deliberately sharp facets. */
function bladeGeometry(
  a: THREE.Vector3,
  b: THREE.Vector3,
  radius: number,
  terminal: boolean,
): THREE.BufferGeometry {
  const direction = b.clone().sub(a).normalize();
  const side = new THREE.Vector3(-direction.y, direction.x, 0).normalize();
  const depth = new THREE.Vector3().crossVectors(direction, side).normalize();
  const cross = [
    [-1, 0],
    [-0.62, 0.57],
    [0, 0.94],
    [0.62, 0.57],
    [1, 0],
    [0.62, -0.57],
    [0, -0.84],
    [-0.62, -0.57],
  ];
  const sections = terminal
    ? [
        [0, 0.73],
        [0.22, 0.72],
        [0.67, 0.34],
        [1, 0.012],
      ]
    : [
        [0, 0.42],
        [0.22, 1],
        [0.73, 0.79],
        [1, 0.33],
      ];
  const vertices: THREE.Vector3[][] = sections.map(([t, scale]) =>
    cross.map(([sx, sz]) =>
      a
        .clone()
        .lerp(b, t)
        .addScaledVector(side, sx * radius * scale)
        .addScaledVector(depth, sz * radius * scale * 0.64),
    ),
  );
  const positions: number[] = [];
  const triangle = (aa: THREE.Vector3, bb: THREE.Vector3, cc: THREE.Vector3) =>
    positions.push(...aa.toArray(), ...bb.toArray(), ...cc.toArray());
  for (let r = 0; r < sections.length - 1; r++)
    for (let i = 0; i < cross.length; i++) {
      const next = (i + 1) % cross.length;
      triangle(vertices[r][i], vertices[r + 1][i], vertices[r][next]);
      triangle(vertices[r][next], vertices[r + 1][i], vertices[r + 1][next]);
    }
  for (let i = 0; i < cross.length; i++) {
    const next = (i + 1) % cross.length;
    triangle(a, vertices[0][i], vertices[0][next]);
    triangle(b, vertices.at(-1)![next], vertices.at(-1)![i]);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.computeVertexNormals();
  return geometry;
}

export function createSpider(): SpiderModel {
  const group = new THREE.Group();
  group.name = "XEVEN_Spider";
  group.userData = {
    asset: "XEVEN dimensional spider",
    version: 5,
    frontAxis: "+Z",
    upAxis: "+Y",
  };
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = [
    new THREE.MeshStandardMaterial({
      name: "xeven-shell-black",
      color: 0x12191d,
      metalness: 0.86,
      roughness: 0.3,
      flatShading: true,
    }),
    new THREE.MeshStandardMaterial({
      name: "xeven-plate-black",
      color: 0x0b1115,
      metalness: 0.9,
      roughness: 0.24,
      flatShading: true,
    }),
    new THREE.MeshStandardMaterial({
      name: "xeven-joint-black",
      color: 0x080e12,
      metalness: 0.78,
      roughness: 0.36,
      flatShading: true,
    }),
    new THREE.MeshStandardMaterial({
      name: "xeven-joint-gunmetal",
      color: 0x303e45,
      metalness: 0.88,
      roughness: 0.29,
      flatShading: true,
    }),
    new THREE.MeshStandardMaterial({
      name: "xeven-chamfer-metal",
      color: 0x556b75,
      metalness: 0.89,
      roughness: 0.22,
      flatShading: true,
    }),
    new THREE.MeshStandardMaterial({
      name: "xeven-engraving-floor",
      color: 0x010406,
      metalness: 0.5,
      roughness: 0.55,
    }),
    new THREE.MeshStandardMaterial({
      name: "xeven-engraving-lip",
      color: 0x405965,
      metalness: 0.87,
      roughness: 0.24,
      emissive: 0x051219,
      emissiveIntensity: 0.16,
    }),
  ];
  const [
    shell,
    plate,
    jointBlack,
    gunmetal,
    chamfer,
    engravingFloor,
    engravingLip,
  ] = materials;
  const addMesh = (
    parent: THREE.Object3D,
    name: string,
    geometry: THREE.BufferGeometry,
    material: THREE.Material | THREE.Material[],
  ) => {
    geometries.add(geometry);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };

  // The abdomen is a sealed, faceted 0.78-unit deep hull; the shield sits above it.
  addMesh(
    group,
    "abdomen-hull",
    armorLoft(ABDOMEN, 0.88, [
      [0.64, -0.398],
      [1, -0.055],
      [0.83, 0.25],
      [0.58, 0.382],
    ]),
    shell,
  );
  addMesh(
    group,
    "head-hull",
    armorLoft(HEAD, -0.23, [
      [0.64, -0.28],
      [1, -0.06],
      [0.68, 0.2],
      [0.27, 0.245],
    ]),
    shell,
  );

  const shield = path(SHIELD);
  const cut = new THREE.Path();
  X_CUT.forEach(([x, y], i) => (i ? cut.lineTo(x, y) : cut.moveTo(x, y)));
  cut.closePath();
  shield.holes.push(cut);
  const shieldGeometry = new THREE.ExtrudeGeometry(shield, {
    depth: 0.058,
    bevelEnabled: true,
    bevelSegments: 1,
    bevelSize: 0.008,
    bevelThickness: 0.008,
    steps: 1,
    curveSegments: 1,
  });
  const shieldMesh = addMesh(
    group,
    "abdomen-shield-with-real-x-cavity",
    shieldGeometry,
    [plate, gunmetal],
  );
  shieldMesh.position.z = 0.422;

  // This is below the opening. The X is a cavity, not a decal or a white face.
  const engraving = new THREE.Group();
  engraving.name = "spider-back-x";
  engraving.userData = {
    center: [0, 0.805, 0.488],
    cavityDepth: 0.084,
    engraved: true,
  };
  group.add(engraving);
  const floor = addMesh(
    engraving,
    "engraving-recessed-floor",
    new THREE.ShapeGeometry(path(X_CUT)),
    engravingFloor,
  );
  floor.position.z = 0.404;
  // A real, narrow planar metal lip hugs the cavity; the front plate remains pierced.
  const lipShape = path(
    X_CUT.map(([x, y]) => [x * 1.018, 0.805 + (y - 0.805) * 1.018] as const),
  );
  const lipHole = new THREE.Path();
  X_CUT.forEach(([x, y], i) =>
    i ? lipHole.lineTo(x, y) : lipHole.moveTo(x, y),
  );
  lipHole.closePath();
  lipShape.holes.push(lipHole);
  const lip = addMesh(
    engraving,
    "engraving-chamfer-highlight",
    new THREE.ShapeGeometry(lipShape),
    engravingLip,
  );
  lip.position.z = 0.4885;

  // Thin shield perimeter catches a key/rim light without adding a pale plaque.
  const edgeShape = path(
    SHIELD.map(([x, y]) => [x * 1.005, 1.02 + (y - 1.02) * 1.005] as const),
  );
  const edgeHole = new THREE.Path();
  SHIELD.forEach(([x, y], i) =>
    i
      ? edgeHole.lineTo(x * 0.988, 1.02 + (y - 1.02) * 0.988)
      : edgeHole.moveTo(x * 0.988, 1.02 + (y - 1.02) * 0.988),
  );
  edgeHole.closePath();
  edgeShape.holes.push(edgeHole);
  const edge = addMesh(
    group,
    "shield-machined-perimeter",
    new THREE.ShapeGeometry(edgeShape),
    chamfer,
  );
  edge.position.z = 0.489;

  const jointBarrelGeometry = new THREE.CylinderGeometry(1, 1, 1, 12, 1);
  const jointRingGeometry = new THREE.TorusGeometry(1, 0.15, 4, 12);
  const jointCapGeometry = new THREE.CylinderGeometry(1, 1, 1, 6, 1);
  const legs: THREE.Group[] = [];
  for (const side of [-1, 1]) {
    for (let row = 0; row < LEG_CHAINS.length; row++) {
      const definition = LEG_CHAINS[row];
      const points = definition.points.map(
        ([x, y, z]) => new THREE.Vector3(x * side, y, z),
      );
      const root = points[0];
      const leg = new THREE.Group();
      leg.name = `leg-${side < 0 ? "left" : "right"}-${definition.name}`;
      leg.position.copy(root);
      leg.userData = {
        side,
        row,
        restRotation: [0, 0, 0],
        root: root.toArray(),
      };
      group.add(leg);
      legs.push(leg);
      const local = points.map((p) => p.clone().sub(root));
      for (let j = 0; j < local.length - 1; j++) {
        const segment = addMesh(
          leg,
          `${leg.name}-${["coxa", "femur", "tibia", "needle"][j]}`,
          bladeGeometry(local[j], local[j + 1], definition.widths[j], j === 3),
          shell,
        );
        segment.userData.segment = j;
      }
      for (let j = 1; j < local.length - 1; j++) {
        const radius = j === 1 ? 0.068 : j === 2 ? 0.076 : 0.048;
        const barrel = addMesh(
          leg,
          `${leg.name}-joint-${j}-barrel`,
          jointBarrelGeometry,
          jointBlack,
        );
        barrel.position.copy(local[j]);
        barrel.rotation.x = Math.PI / 2;
        barrel.scale.set(radius, radius * 1.85, radius);
        const ring = addMesh(
          leg,
          `${leg.name}-joint-${j}-washer`,
          jointRingGeometry,
          gunmetal,
        );
        ring.position.copy(local[j]);
        ring.position.z += radius * 0.94;
        ring.scale.setScalar(radius * 0.7);
        const cap = addMesh(
          leg,
          `${leg.name}-joint-${j}-hex-cap`,
          jointCapGeometry,
          jointBlack,
        );
        cap.position.copy(local[j]);
        cap.position.z += radius * 1.03;
        cap.rotation.x = Math.PI / 2;
        cap.rotation.y = Math.PI / 6;
        cap.scale.set(radius * 0.34, radius * 0.12, radius * 0.34);
      }
    }
  }
  group.updateMatrixWorld(true);
  let disposed = false;
  return {
    group,
    legs,
    materials,
    dispose() {
      if (disposed) return;
      disposed = true;
      for (const geometry of geometries) geometry.dispose();
      for (const material of materials) material.dispose();
      group.removeFromParent();
    },
  };
}
