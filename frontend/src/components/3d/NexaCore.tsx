import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export type CoreState = 'idle' | 'listening' | 'processing' | 'completed';

interface NexaCoreProps {
  state?: CoreState;
  onHover?: (hovered: boolean) => void;
  onClick?: () => void;
}

export const NexaCore: React.FC<NexaCoreProps> = ({
  state = 'idle',
  onHover,
  onClick,
}) => {
  const outerGroupRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // Dynamic colors depending on active core state
  const stateColors = useMemo(() => {
    switch (state) {
      case 'listening':
        return {
          primary: new THREE.Color('#38BDF8'),
          accent: new THREE.Color('#10B981'),
          glow: new THREE.Color('#06B6D4'),
          speed: 1.8,
        };
      case 'processing':
        return {
          primary: new THREE.Color('#EC4899'),
          accent: new THREE.Color('#8B5CF6'),
          glow: new THREE.Color('#6366F1'),
          speed: 3.2,
        };
      case 'completed':
        return {
          primary: new THREE.Color('#10B981'),
          accent: new THREE.Color('#38BDF8'),
          glow: new THREE.Color('#34D399'),
          speed: 1.2,
        };
      case 'idle':
      default:
        return {
          primary: new THREE.Color('#6366F1'),
          accent: new THREE.Color('#06B6D4'),
          glow: new THREE.Color('#8B5CF6'),
          speed: 1.0,
        };
    }
  }, [state]);

  // Generate background particle cloud
  const particleCount = 100;
  const particlePositions = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const radius = 2.4 + Math.random() * 2.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    return positions;
  }, []);

  useFrame((stateContext, delta) => {
    const t = stateContext.clock.getElapsedTime();
    const speed = stateColors.speed;

    // Mouse parallax tracking
    if (outerGroupRef.current) {
      const targetX = (stateContext.pointer.x * 0.4);
      const targetY = (stateContext.pointer.y * 0.4);
      outerGroupRef.current.rotation.y += (targetX - outerGroupRef.current.rotation.y) * 0.05;
      outerGroupRef.current.rotation.x += (-targetY - outerGroupRef.current.rotation.x) * 0.05;
    }

    // Outer cage rotation
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = t * 0.35 * speed;
      ring1Ref.current.rotation.y = t * 0.25 * speed;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = -t * 0.4 * speed;
      ring2Ref.current.rotation.z = t * 0.2 * speed;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.x = -t * 0.25 * speed;
      ring3Ref.current.rotation.z = -t * 0.3 * speed;
    }

    // Inner pulsing core
    if (innerRef.current) {
      innerRef.current.rotation.y = t * 0.5 * speed;
      innerRef.current.rotation.x = t * 0.3 * speed;
      const pulseAmp = state === 'processing' ? 0.12 : 0.05;
      const scale = 1 + Math.sin(t * (state === 'processing' ? 6 : 2.5)) * pulseAmp;
      innerRef.current.scale.set(scale, scale, scale);
    }

    // Particle cloud slow drift
    if (particlesRef.current) {
      particlesRef.current.rotation.y = t * 0.08;
    }
  });

  return (
    <group
      ref={outerGroupRef}
      onPointerOver={() => onHover && onHover(true)}
      onPointerOut={() => onHover && onHover(false)}
      onClick={onClick}
    >
      {/* Central Ambient & Point Lighting */}
      <pointLight position={[0, 0, 0]} intensity={state === 'processing' ? 3.5 : 2.0} color={stateColors.glow} distance={8} />
      <pointLight position={[2, 3, 2]} intensity={1.5} color={stateColors.accent} distance={10} />
      <pointLight position={[-2, -3, -2]} intensity={1.2} color={stateColors.primary} distance={10} />

      {/* Inner Crystalline Octahedron Core */}
      <mesh ref={innerRef}>
        <octahedronGeometry args={[0.9, 0]} />
        <meshPhysicalMaterial
          color={stateColors.primary}
          emissive={stateColors.glow}
          emissiveIntensity={state === 'processing' ? 0.9 : 0.4}
          roughness={0.15}
          metalness={0.2}
          transmission={0.65}
          thickness={1.2}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* Wireframe Facet Lattice */}
      <mesh>
        <icosahedronGeometry args={[1.35, 1]} />
        <meshStandardMaterial
          color={stateColors.accent}
          wireframe
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Outer Geodesic Glass Sphere */}
      <mesh>
        <sphereGeometry args={[1.7, 32, 32]} />
        <meshPhysicalMaterial
          color={stateColors.glow}
          roughness={0.1}
          metalness={0.05}
          transmission={0.92}
          ior={1.4}
          transparent
          opacity={0.35}
          depthWrite={false}
        />
      </mesh>

      {/* Orbital Ring 1 */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[2.0, 0.02, 16, 100]} />
        <meshStandardMaterial color={stateColors.accent} emissive={stateColors.accent} emissiveIntensity={0.6} />
      </mesh>

      {/* Orbital Ring 2 */}
      <mesh ref={ring2Ref} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[2.15, 0.02, 16, 100]} />
        <meshStandardMaterial color={stateColors.primary} emissive={stateColors.primary} emissiveIntensity={0.6} />
      </mesh>

      {/* Orbital Ring 3 */}
      <mesh ref={ring3Ref} rotation={[-Math.PI / 4, Math.PI / 6, 0]}>
        <torusGeometry args={[2.3, 0.015, 16, 100]} />
        <meshStandardMaterial color={stateColors.glow} emissive={stateColors.glow} emissiveIntensity={0.5} />
      </mesh>

      {/* Particle Field */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particlePositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.045}
          color={stateColors.accent}
          transparent
          opacity={0.65}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};
