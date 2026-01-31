import React, { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { GLOBAL_TARGETS, CAUSALITY_PHYSICS } from '../constants';
import { ShieldAlert, Activity, Globe, Info } from 'lucide-react';

interface EarthVisualizerProps {
  annualCO2: number;
  showCausality?: boolean;
}

const EarthVisualizer: React.FC<EarthVisualizerProps> = ({ annualCO2, showCausality = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer;
    camera: THREE.PerspectiveCamera;
    earthMaterial: THREE.ShaderMaterial;
    atmosMaterial: THREE.ShaderMaterial;
    clouds: THREE.Mesh;
    earthGroup: THREE.Group;
  } | null>(null);

  // PLANETARY STATE CALCULATION
  // Integrated state reflects the cumulative annual impact of behavior.
  const stabilityIndex = Math.max(0, 100 - (annualCO2 / GLOBAL_TARGETS.HIGH_INTENSITY_THRESHOLD) * 100);
  const isHealthy = annualCO2 <= GLOBAL_TARGETS.PARIS_AGREEMENT_ANNUAL_MAX;
  const isCritical = annualCO2 > GLOBAL_TARGETS.WORLD_AVERAGE_ANNUAL;

  // Visual pollution scaling
  const pollutionFactor = useMemo(() => {
    const min = GLOBAL_TARGETS.PARIS_AGREEMENT_ANNUAL_MAX;
    const max = GLOBAL_TARGETS.HIGH_INTENSITY_THRESHOLD;
    return Math.min(1.0, Math.max(0.0, (annualCO2 - min) / (max - min)));
  }, [annualCO2]);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);

    const fitPlanet = (w: number, h: number) => {
      const aspect = w / h;
      const sphereRadius = 1.18;
      const fovRad = (camera.fov * Math.PI) / 180;
      let dist = sphereRadius / Math.tan(fovRad / 2);
      if (aspect < 1) dist = dist / aspect;
      camera.position.z = dist * 1.1;
    };

    fitPlanet(width, height);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const loader = new THREE.TextureLoader();
    const earthGroup = new THREE.Group();
    earthGroup.position.y = 0.05;
    scene.add(earthGroup);

    const tex = {
      diff: loader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg'),
      norm: loader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg'),
      spec: loader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg'),
      cloud: loader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png'),
      light: loader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_lights_2048.png')
    };

    const earthMat = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: tex.diff },
        tNormal: { value: tex.norm },
        tSpecular: { value: tex.spec },
        tLights: { value: tex.light },
        pollution: { value: pollutionFactor },
        stability: { value: stabilityIndex / 100 },
        uTime: { value: 0 },
        lightDir: { value: new THREE.Vector3(5, 3, 5).normalize() }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPos;
        void main() {
          vUv = uv;
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          vNormal = normalize(normalMatrix * normal);
          vViewPos = -mvPos.xyz;
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform sampler2D tNormal;
        uniform sampler2D tSpecular;
        uniform sampler2D tLights;
        uniform float pollution;
        uniform float stability;
        uniform float uTime;
        uniform vec3 lightDir;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPos;

        void main() {
          vec3 n = normalize(vNormal);
          vec3 v = normalize(vViewPos);
          vec4 diff = texture2D(tDiffuse, vUv);
          vec3 night = texture2D(tLights, vUv).rgb;
          float specM = texture2D(tSpecular, vUv).r;
          
          float veg = clamp((diff.g - diff.r) * 2.5, 0.0, 1.0);
          vec3 arid = mix(diff.rgb, vec3(0.55, 0.42, 0.3) * (diff.r + diff.g + diff.b) * 0.45, pollution * veg);
          vec3 surface = mix(diff.rgb, arid, pollution * 0.9);
          
          float dNL = dot(n, lightDir);
          float dayS = smoothstep(-0.2, 0.2, dNL);
          float nightS = 1.0 - dayS;
          
          vec3 diffuse = surface * max(dNL, 0.0);
          vec3 h = normalize(lightDir + v);
          float spec = pow(max(dot(n, h), 0.0), 32.0);
          vec3 specular = vec3(0.4, 0.6, 1.0) * spec * specM * (1.0 - pollution * 0.7) * dayS;
          vec3 lights = night * nightS * (1.6 - pollution * 0.8);

          float edge = pow(1.0 - max(dot(v, n), 0.0), 5.0);
          vec3 limbColor = mix(vec3(0.1, 0.4, 1.0), vec3(1.0, 0.2, 0.05), pollution);
          
          // Subtle shimmer on low stability
          float shimmer = sin(uTime * 2.5 + vUv.y * 10.0) * (1.0 - stability) * 0.05;
          vec3 limb = limbColor * edge * max(dNL, 0.2 + shimmer);

          gl_FragColor = vec4(diffuse * 1.25 + specular + lights + limb + surface * 0.06, 1.0);
        }
      `
    });
    const earth = new THREE.Mesh(new THREE.SphereGeometry(1, 128, 128), earthMat);
    earthGroup.add(earth);

    const cloudMat = new THREE.MeshPhongMaterial({
      map: tex.cloud,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      shininess: 0
    });
    const clouds = new THREE.Mesh(new THREE.SphereGeometry(1.018, 128, 128), cloudMat);
    earthGroup.add(clouds);

    const atmosMat = new THREE.ShaderMaterial({
      uniforms: {
        pollution: { value: pollutionFactor },
        stability: { value: stabilityIndex / 100 },
        uTime: { value: 0 },
        lightDir: { value: new THREE.Vector3(5, 3, 5).normalize() }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPos;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          vViewPos = -mvPos.xyz;
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        uniform float pollution;
        uniform float stability;
        uniform float uTime;
        uniform vec3 lightDir;
        varying vec3 vNormal;
        varying vec3 vViewPos;
        void main() {
          vec3 v = normalize(vViewPos);
          float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 7.0);
          
          // Color shift based on stability/pollution
          vec3 baseColor = vec3(0.3, 0.6, 1.0);
          vec3 stressedColor = vec3(1.0, 0.35, 0.1);
          vec3 scatter = mix(baseColor, stressedColor, pollution);
          
          float sun = max(dot(vNormal, lightDir), 0.0);
          
          // Shimmer/flicker effect increases as stability decreases
          float shimmer = sin(uTime * 1.8) * cos(uTime * 0.7) * (1.0 - stability) * 0.2;
          float glow = intensity * (0.45 + sun * 0.55 + shimmer);
          
          gl_FragColor = vec4(scatter, glow * (1.1 + pollution * 0.6));
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });
    const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(1.16, 128, 128), atmosMat);
    earthGroup.add(atmosphere);

    const light = new THREE.DirectionalLight(0xffffff, 4.5);
    light.position.set(5, 3, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.15));

    sceneRef.current = { renderer, camera, earthMaterial: earthMat, atmosMaterial: atmosMat, clouds, earthGroup };

    let rid: number;
    const render = (time: number) => {
      rid = requestAnimationFrame(render);
      const uTime = time * 0.001;

      earthGroup.rotation.y += 0.0001;
      clouds.rotation.y += 0.00015;

      if (sceneRef.current) {
        sceneRef.current.earthMaterial.uniforms.uTime.value = uTime;
        sceneRef.current.atmosMaterial.uniforms.uTime.value = uTime;
      }

      renderer.render(scene, camera);
    };
    rid = requestAnimationFrame(render);

    const resize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      fitPlanet(w, h);
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(rid);
      window.removeEventListener('resize', resize);
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (!sceneRef.current) return;
    const { earthMaterial, atmosMaterial, clouds } = sceneRef.current;
    earthMaterial.uniforms.pollution.value = pollutionFactor;
    earthMaterial.uniforms.stability.value = stabilityIndex / 100;
    atmosMaterial.uniforms.pollution.value = pollutionFactor;
    atmosMaterial.uniforms.stability.value = stabilityIndex / 100;
    (clouds.material as THREE.MeshPhongMaterial).opacity = 0.8 - (pollutionFactor * 0.35);
  }, [pollutionFactor, stabilityIndex]);

  return (
    <div className="relative w-full h-[90vh] min-h-[850px] bg-slate-950 flex flex-col items-center justify-center overflow-hidden rounded-[64px] border border-white/5 shadow-3xl">
      {/* Background Deep Space */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/10 to-slate-950"></div>
        {[...Array(300)].map((_, i) => (
          <div key={i} className="absolute bg-white rounded-full" style={{ width: (Math.random() > 0.98 ? 2 : 0.8) + 'px', height: (Math.random() > 0.98 ? 2 : 0.8) + 'px', top: Math.random() * 100 + '%', left: Math.random() * 100 + '%', opacity: Math.random() * 0.4 + 0.1 }} />
        ))}
      </div>

      <div ref={containerRef} className="absolute inset-0 z-10 flex items-center justify-center">
        <canvas ref={canvasRef} className="w-full h-full pointer-events-none drop-shadow-[0_0_100px_rgba(255,255,255,0.03)]" />
      </div>

      {/* Forensic Telemetry HUD: Upper Right */}
      {showCausality && (
        <div className="absolute top-12 right-12 z-40 pointer-events-auto">
          <div className="bg-slate-950/60 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 w-72 space-y-6 shadow-2xl ring-1 ring-white/10 transition-all hover:bg-slate-950/80">
            <div className="flex items-center gap-3">
              <Activity className="w-4 h-4 text-indigo-400" />
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/90">Integrated State</h4>
            </div>
            <div className="space-y-5">
              <div className="space-y-1">
                <div className="text-[9px] font-black uppercase text-white/70 tracking-widest">Atmospheric Mass Accretion</div>
                <div className="text-3xl font-black text-white tracking-tighter tabular-nums leading-none">
                  {annualCO2.toLocaleString()} <span className="text-[9px] text-white/60 font-bold ml-1">kg/yr</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[9px] font-black uppercase text-white/70 tracking-widest">Radiative Balance Delta</div>
                <div className="text-3xl font-black text-white tracking-tighter tabular-nums leading-none">
                  +{((annualCO2 / 1e12) * CAUSALITY_PHYSICS.PPM_PER_GT_CO2 * 1000).toFixed(4)} <span className="text-[9px] text-white/60 font-bold ml-1">m-mW</span>
                </div>
              </div>
            </div>
            <div className="pt-5 border-t border-white/5">
              <p className="text-[9px] text-white/60 leading-relaxed uppercase font-black tracking-widest italic">
                Continuous integration of behavior over historical baseline.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stability Metrics HUD - Bottom bar */}
      <div className="absolute bottom-12 left-12 right-12 z-20 pointer-events-none flex items-end justify-between">
        <div className="bg-slate-950/40 backdrop-blur-3xl border border-white/10 px-12 py-10 rounded-[56px] pointer-events-auto shadow-2xl ring-1 ring-white/5">
          <div className="flex items-center gap-3 mb-4">
            <ShieldAlert className="w-4 h-4 text-white/30" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/80">System Stability Coefficient</h3>
          </div>
          <div className="text-9xl font-black tracking-tighter text-white tabular-nums flex items-baseline leading-none">
            {stabilityIndex.toFixed(1)}<span className="text-2xl font-bold text-white/50 ml-6 tracking-widest">%</span>
          </div>
          <p className="mt-6 text-[9px] font-black text-white/60 uppercase tracking-widest italic flex items-center gap-2">
            <Globe className="w-3 h-3" /> State reflects continuous, cumulative integration.
          </p>
        </div>

        <div className="flex flex-col items-end gap-6 pointer-events-auto">
          <div className="bg-slate-950/40 backdrop-blur-2xl border border-white/10 px-10 py-8 rounded-[40px] flex items-center gap-10 shadow-2xl ring-1 ring-white/5">
            <div className="space-y-2 text-right">
              <div className="flex items-center justify-end gap-3">
                <span className={`text-[11px] font-black uppercase tracking-[0.4em] ${isHealthy ? 'text-emerald-400' : (isCritical ? 'text-rose-500' : 'text-amber-400')}`}>
                  {isHealthy ? 'Equilibrium' : (isCritical ? 'Emergency' : 'Strain')}
                </span>
                <div className={`w-3.5 h-3.5 rounded-full ${isHealthy ? 'bg-emerald-400' : isCritical ? 'bg-rose-500' : 'bg-amber-400'} animate-pulse shadow-[0_0_20px_currentColor]`} />
              </div>
              <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Forensic Integration Node: ACTIVE</p>
            </div>
            <div className="w-64 h-2 bg-white/5 rounded-full overflow-hidden shadow-inner ring-1 ring-white/10">
              <div
                className={`h-full transition-all duration-[4000ms] ease-out ${isHealthy ? 'bg-emerald-500' : isCritical ? 'bg-rose-500' : 'bg-amber-500'}`}
                style={{ width: `${stabilityIndex}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Visual Depth layers */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none z-30 opacity-70"></div>
      <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent z-15 pointer-events-none opacity-95"></div>
    </div>
  );
};

export default EarthVisualizer;