import { useEffect, useRef } from "react";
import * as THREE from "three";

type CloudFieldProps = {
  color?: string;
  className?: string;
  speed?: number;
  density?: number;
  opacity?: number;
};

const VERTEX_SRC = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const FRAGMENT_SRC = `
precision highp float;
varying vec2 vUv;

uniform vec2 uResolution;
uniform float uTime;
uniform vec3 uColor;
uniform float uDensity;
uniform float uOpacity;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 p) {
  float value = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amp * noise(p);
    p *= 2.0;
    amp *= 0.5;
  }
  return value;
}

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / uResolution.y;
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0) * uDensity;

  vec2 driftA = vec2(uTime * 0.6, uTime * 0.15);
  vec2 driftB = vec2(-uTime * 0.35, uTime * 0.25);

  float clouds = fbm(p * 1.6 + driftA) * 0.6 + fbm(p * 3.0 - driftB) * 0.4;
  clouds = smoothstep(0.35, 0.85, clouds);

  float edgeX = smoothstep(0.0, 0.5, 0.5 - abs(uv.x - 0.5));
  float edgeY = smoothstep(0.0, 0.6, 0.5 - abs(uv.y - 0.5));
  float edge = edgeX * edgeY;

  float alpha = clouds * uOpacity * mix(0.4, 1.0, edge);
  gl_FragColor = vec4(uColor, alpha);
}
`;

export function CloudField({
  color = "#2ecc87",
  className,
  speed = 0.05,
  density = 1,
  opacity = 0.55,
}: CloudFieldProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearAlpha(0);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
      uResolution: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uDensity: { value: density },
      uOpacity: { value: opacity },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SRC,
      fragmentShader: FRAGMENT_SRC,
      uniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });

    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(quad);

    const setSize = () => {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      renderer.setSize(w, h, false);
      uniforms.uResolution.value.set(
        renderer.domElement.width,
        renderer.domElement.height,
      );
    };
    setSize();
    const ro = new ResizeObserver(setSize);
    ro.observe(container);

    const clock = new THREE.Clock();
    let raf = 0;
    const animate = () => {
      if (!reduceMotion) uniforms.uTime.value = clock.getElapsedTime() * speed;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      quad.geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [color, speed, density, opacity]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full ${className ?? ""}`}
      aria-hidden="true"
    />
  );
}

export default CloudField;
