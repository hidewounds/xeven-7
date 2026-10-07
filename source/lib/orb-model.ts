import * as THREE from "three";

const smooth = (a: number, b: number, t: number) =>
  THREE.MathUtils.smootherstep(t, a, b);
/** One intact orb becomes a particle veil. No sectors, tearing, or corner pull. */
export function orbPhase(t: number) {
  return {
    dissolve: smooth(1.25, 2.8, t),
    spread: smooth(1.5, 4.05, t),
    cover: smooth(3.15, 4.02, t),
    reveal: smooth(4.18, 6.12, t),
  };
}
export const orbSize = (width: number, height: number) =>
  Math.min(width * 0.48, height * 0.28, 216);
export function particleSeed(index: number) {
  // Integer hashing gives identical initial SVG geometry in SSR, Chrome and Safari.
  let value = (index + 0x9e3779b9) >>> 0;
  const next = () => {
    value = Math.imul(value ^ (value >>> 16), 0x21f0aaad);
    value = Math.imul(value ^ (value >>> 15), 0x735a2d97);
    value = (value ^ (value >>> 15)) >>> 0;
    return value / 4294967296;
  };
  return [next(), next(), next()];
}
export type OrbPixels = {
  data: Uint8ClampedArray;
  width: number;
  height: number;
};
export function sampleOrbParticles(pixels: OrbPixels, count: number) {
  const candidates: number[] = [];
  for (let i = 0; i < pixels.width * pixels.height; i++)
    if (pixels.data[i * 4 + 3] > 90) candidates.push(i);
  if (!candidates.length)
    throw new Error("The orb texture has no visible pixels.");
  const positions = new Float32Array(count * 3),
    colors = new Float32Array(count * 3),
    targets = new Float32Array(count * 3);
  const color = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const [a, b, c] = particleSeed(i + 1),
      pixel =
        candidates[
          Math.min(candidates.length - 1, Math.floor(a * candidates.length))
        ];
    const x = (((pixel % pixels.width) + 0.5) / pixels.width) * 2 - 1,
      y = 1 - ((Math.floor(pixel / pixels.width) + 0.5) / pixels.height) * 2;
    positions.set(
      [x, y, Math.sqrt(Math.max(0, 0.65 - x * x - y * y)) * 0.6],
      i * 3,
    );
    color.setRGB(
      pixels.data[pixel * 4] / 255,
      pixels.data[pixel * 4 + 1] / 255,
      pixels.data[pixel * 4 + 2] / 255,
      THREE.SRGBColorSpace,
    );
    colors.set([color.r, color.g, color.b], i * 3);
    targets.set([b * 2 - 1, c * 2 - 1, a], i * 3);
  }
  return { positions, colors, targets };
}
const common = /* glsl */ `
 uniform float uTime,uDissolve,uSpread,uCover,uReveal,uAspect,uSize,uDpr;
 uniform vec2 uResolution;
 float hash21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float aperture(vec2 p){
   float angle=atan(p.y,p.x);
   float ripple=(sin(angle*5.+uTime*.7)*.008+sin(angle*9.-uTime*.4)*.004)*sin(uReveal*3.14159);
   return length(p)-ripple-uReveal*(length(vec2(uAspect,1.))+.2);
 }
 vec3 breathe(vec3 p){
   float angle=sin(uTime*.38)*.075;
   p.xz=mat2(cos(angle),-sin(angle),sin(angle),cos(angle))*p.xz;
   p.xy*=1.+sin(uTime*1.3)*.012;
   return p;
 }
`;
export function createOrb(
  texture: THREE.Texture,
  particles: ReturnType<typeof sampleOrbParticles>,
) {
  const group = new THREE.Group();
  const uniforms = {
    uTime: { value: 0 },
    uDissolve: { value: 0 },
    uSpread: { value: 0 },
    uCover: { value: 0 },
    uReveal: { value: 0 },
    uAspect: { value: 1 },
    uSize: { value: 0.25 },
    uDpr: { value: 1 },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uMap: { value: texture },
  };
  const geometries: THREE.BufferGeometry[] = [],
    materials: THREE.Material[] = [];
  const skinGeo = new THREE.PlaneGeometry(2, 2, 64, 64),
    pos = skinGeo.attributes.position;
  for (let i = 0; i < pos.count; i++)
    pos.setZ(
      i,
      Math.sqrt(Math.max(0, 0.65 - pos.getX(i) ** 2 - pos.getY(i) ** 2)) * 0.6,
    );
  const skinMat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    vertexShader:
      common +
      /* glsl */ `
    varying vec2 vUv;
    void main(){vUv=uv;vec3 p=breathe(position);gl_Position=vec4(p.x*uSize/uAspect,p.y*uSize,0.,1.);}
  `,
    fragmentShader:
      common +
      /* glsl */ `
    uniform sampler2D uMap;varying vec2 vUv;
    void main(){
      vec2 flow=vUv+vec2(sin(vUv.y*18.+uTime*.45),cos(vUv.x*15.-uTime*.38))*.001;
      vec4 ink=texture2D(uMap,flow);
      float grain=hash21(floor(vUv*240.));
      float burn=smoothstep(grain-.07,grain+.07,uDissolve);
      float edge=pow(max(0.,1.-abs(grain-uDissolve)*19.),3.)*step(.01,uDissolve)*(1.-uDissolve);
      gl_FragColor=vec4(ink.rgb+vec3(.1,.19,.24)*edge,ink.a*(1.-burn));
      #include <colorspace_fragment>
    }
  `,
  });
  const skin = new THREE.Mesh(skinGeo, skinMat);
  skin.name = "intact-orb-skin";
  skin.frustumCulled = false;
  skin.renderOrder = 1;
  group.add(skin);
  geometries.push(skinGeo);
  materials.push(skinMat);
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute(
    "position",
    new THREE.BufferAttribute(particles.positions, 3),
  );
  dustGeo.setAttribute(
    "aColor",
    new THREE.BufferAttribute(particles.colors, 3),
  );
  dustGeo.setAttribute(
    "aTarget",
    new THREE.BufferAttribute(particles.targets, 3),
  );
  const dustMat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.NormalBlending,
    vertexShader:
      common +
      /* glsl */ `
    attribute vec3 aColor,aTarget;varying vec3 vColor;varying float vAlpha;
    void main(){
      float release=smoothstep(aTarget.z*.45,aTarget.z*.45+.55,uDissolve);
      float travel=smoothstep(0.,1.,clamp((uSpread-aTarget.z*.09)/.91,0.,1.));
      vec3 origin=breathe(position)*uSize;
      vec2 destination=aTarget.xy*vec2(uAspect,1.)*1.13;
      vec2 p=mix(origin.xy,destination,travel);
      vec2 tangent=vec2(-destination.y,destination.x);
      p+=tangent*sin(travel*3.14159)*(.16+.12*aTarget.z);
      p+=vec2(sin(uTime*.6+aTarget.z*23.),cos(uTime*.7+aTarget.z*31.))*.025*travel;
      p+=normalize(destination+vec2(.001))*uReveal*uReveal*.12;
      gl_Position=vec4(p.x/uAspect,p.y,0.,1.);
      gl_PointSize=(1.1+aTarget.z*2.1+uCover*2.2)*uDpr;
      float sparkle=.7+.3*sin(uTime*1.8+aTarget.z*36.);
      vColor=mix(aColor*1.8+vec3(.04,.045,.06),mix(vec3(.18,.28,.34),vec3(.5,.3,.43),aTarget.z),travel*.75)*sparkle;
      vAlpha=release*(.5+aTarget.z*.5);
    }
  `,
    fragmentShader:
      common +
      /* glsl */ `
    varying vec3 vColor;varying float vAlpha;
    void main(){
      vec2 p=(gl_FragCoord.xy/uResolution*2.-1.)*vec2(uAspect,1.);
      float edge=aperture(p);
      float cleared=uReveal>.0001?smoothstep(-.015,.075,edge):1.;
      vec2 point=gl_PointCoord-.5;float r=length(point);
      float alpha=(1.-smoothstep(.15,.5,r))*vAlpha*cleared;
      if(alpha<.005)discard;
      gl_FragColor=vec4(vColor,alpha);
      #include <colorspace_fragment>
    }
  `,
  });
  const dust = new THREE.Points(dustGeo, dustMat);
  dust.name = "orb-particle-cloud";
  dust.frustumCulled = false;
  dust.renderOrder = 3;
  group.add(dust);
  geometries.push(dustGeo);
  materials.push(dustMat);
  const veilGeo = new THREE.PlaneGeometry(2, 2),
    veilMat = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,
      fragmentShader:
        common +
        /* glsl */ `
    varying vec2 vUv;
    void main(){
      vec2 p=(vUv*2.-1.)*vec2(uAspect,1.);
      float grain=hash21(floor(gl_FragCoord.xy/2.));
      float edge=aperture(p);
      float opening=uReveal>.0001?smoothstep(-.018,.055,edge+(grain-.5)*.045):1.;
      float rim=exp(-abs(edge)*28.)*step(.0001,uReveal);
      vec3 color=vec3(.008,.01,.018)+vec3(.009,.012,.019)*grain;
      color+=vec3(.06,.11,.14)*rim;
      gl_FragColor=vec4(color,uCover*opening);
      #include <colorspace_fragment>
    }
  `,
    });
  const veil = new THREE.Mesh(veilGeo, veilMat);
  veil.name = "particle-reveal-veil";
  veil.frustumCulled = false;
  veil.renderOrder = 2;
  group.add(veil);
  geometries.push(veilGeo);
  materials.push(veilMat);
  return {
    group,
    uniforms,
    update(t: number, width: number, height: number, dpr: number) {
      const phase = orbPhase(t);
      uniforms.uTime.value = t;
      uniforms.uDissolve.value = phase.dissolve;
      uniforms.uSpread.value = phase.spread;
      uniforms.uCover.value = phase.cover;
      uniforms.uReveal.value = phase.reveal;
      uniforms.uAspect.value = width / height;
      uniforms.uSize.value = orbSize(width, height) / height;
      uniforms.uDpr.value = dpr;
      uniforms.uResolution.value.set(
        Math.round(width * dpr),
        Math.round(height * dpr),
      );
    },
    dispose() {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      group.clear();
    },
  };
}
