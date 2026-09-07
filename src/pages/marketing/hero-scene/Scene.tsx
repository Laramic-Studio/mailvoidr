import { useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial, Sparkles, Trail } from '@react-three/drei';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { heroScrollState } from './scrollState';

const PRIMARY = '#3ecf8e';
const PRIMARY_DEEP = '#10b981';

function FacetedCore() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    group.rotation.y += delta * 0.15;
    group.rotation.x = THREE.MathUtils.damp(group.rotation.x, state.pointer.y * 0.2, 4, delta);
    group.rotation.z = THREE.MathUtils.damp(group.rotation.z, state.pointer.x * 0.15, 4, delta);

    const progress = heroScrollState.progress;
    group.position.y = THREE.MathUtils.damp(group.position.y, -progress * 1.2, 4, delta);
    const targetScale = 1 - progress * 0.3;
    group.scale.setScalar(THREE.MathUtils.damp(group.scale.x, targetScale, 4, delta));
  });

  return (
    <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.8}>
      <group ref={groupRef}>
        <mesh>
          <icosahedronGeometry args={[1.4, 0]} />
          <MeshTransmissionMaterial
            color={PRIMARY}
            thickness={0.5}
            roughness={0.05}
            transmission={1}
            ior={1.15}
            chromaticAberration={0.03}
            anisotropy={0.1}
            distortion={0.1}
            distortionScale={0.2}
            temporalDistortion={0.1}
            backside
          />
        </mesh>
        <mesh scale={1.015}>
          <icosahedronGeometry args={[1.4, 0]} />
          <meshBasicMaterial color={PRIMARY} wireframe transparent opacity={0.4} />
        </mesh>
      </group>
    </Float>
  );
}

function LightTrails() {
  const sparkA = useRef<THREE.Mesh>(null);
  const sparkB = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const radius = 1.75;
    if (sparkA.current) {
      sparkA.current.position.set(Math.cos(t * 0.6) * radius, Math.sin(t * 0.8) * radius * 0.6, Math.sin(t * 0.6) * radius);
    }
    if (sparkB.current) {
      const offset = Math.PI;
      sparkB.current.position.set(
        Math.cos(t * 0.75 + offset) * radius,
        Math.sin(t * 1.05 + offset) * radius * 0.6,
        Math.sin(t * 0.75 + offset) * radius,
      );
    }
  });

  return (
    <>
      <Trail width={2} length={4} color={PRIMARY} attenuation={(t) => t * t}>
        <mesh ref={sparkA}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color={PRIMARY} />
        </mesh>
      </Trail>
      <Trail width={2} length={4} color={PRIMARY_DEEP} attenuation={(t) => t * t}>
        <mesh ref={sparkB}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color={PRIMARY_DEEP} />
        </mesh>
      </Trail>
    </>
  );
}

export default function Scene() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      camera={{ position: [0, 0, 5.5], fov: 40 }}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[3, 3, 4]} intensity={30} color={PRIMARY} />
      <pointLight position={[-3, -2, -4]} intensity={12} color="#ffffff" />
      <Sparkles count={50} scale={[6, 4.5, 6]} size={1.6} speed={0.25} color={PRIMARY} opacity={0.4} />
      <FacetedCore />
      <LightTrails />
      <EffectComposer multisampling={0}>
        <Bloom intensity={0.9} luminanceThreshold={0.15} luminanceSmoothing={0.4} mipmapBlur radius={0.7} />
      </EffectComposer>
    </Canvas>
  );
}
