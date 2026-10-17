'use client';

import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface SceneNode {
  id: string;
  label: string;
  category: 'SUPPLIER' | 'INGREDIENT_LOT' | 'BATCH' | 'FINISHED_LOT' | 'CUSTOMER';
  position: [number, number, number];
  color: string;
  description: string;
}

const NODES_DATA: SceneNode[] = [
  {
    id: 'SUP-01',
    label: 'Greenfield Ingredients',
    category: 'SUPPLIER',
    position: [-3.8, 1.2, 0.5],
    color: '#527D68',
    description: 'Certified Organic Oats & Coconut Oil Supplier (Iowa, USA)',
  },
  {
    id: 'L-204',
    label: 'Lot L-204 (Rolled Oats)',
    category: 'INGREDIENT_LOT',
    position: [-1.8, 0.8, -0.6],
    color: '#E9A23B',
    description: '1,200 kg received on 2026-09-12. Flagged for DON mycotoxin concern.',
  },
  {
    id: 'L-205',
    label: 'Lot L-205 (Wildflower Honey)',
    category: 'INGREDIENT_LOT',
    position: [-2.2, -1.2, 0.9],
    color: '#DCE8DF',
    description: '600 kg received from Sunrise Apiaries. Active & verified.',
  },
  {
    id: 'PB-031',
    label: 'Batch PB-031 (Honey Granola)',
    category: 'BATCH',
    position: [0.3, 1.4, 0.4],
    color: '#FFFFFF',
    description: 'Produced 1,800 pouches on Line 1. Consumed 800 kg of Lot L-204.',
  },
  {
    id: 'PB-032',
    label: 'Batch PB-032 (Energy Bars)',
    category: 'BATCH',
    position: [0.4, -0.9, -0.8],
    color: '#E2E6DF',
    description: 'Produced 950 cartons on Line 3. Consumed 450 kg of Lot L-204.',
  },
  {
    id: 'FP-101',
    label: 'Finished Lot FP-101',
    category: 'FINISHED_LOT',
    position: [2.2, 1.0, 0.2],
    color: '#DCE8DF',
    description: '1,800 Pouches produced. Best-Before 2027-06-17. On QA quarantine hold.',
  },
  {
    id: 'FP-102',
    label: 'Finished Lot FP-102',
    category: 'FINISHED_LOT',
    position: [2.1, -1.1, -0.3],
    color: '#DCE8DF',
    description: '950 Cartons produced. On QA quarantine hold.',
  },
  {
    id: 'ORD-101',
    label: 'Whole Foods Market (ORD-101)',
    category: 'CUSTOMER',
    position: [4.2, 1.5, 0.6],
    color: '#477C9B',
    description: '600 pouches shipped via SwiftCold Logistics to Northeast DC.',
  },
  {
    id: 'ORD-102',
    label: 'FreshDirect Hub (ORD-102)',
    category: 'CUSTOMER',
    position: [4.4, -0.2, -0.7],
    color: '#477C9B',
    description: '450 pouches (FP-101) & 300 cartons (FP-102) dispatched.',
  },
];

const EDGES_DATA: [string, string][] = [
  ['SUP-01', 'L-204'],
  ['L-204', 'PB-031'],
  ['L-204', 'PB-032'],
  ['L-205', 'PB-031'],
  ['L-205', 'PB-032'],
  ['PB-031', 'FP-101'],
  ['PB-032', 'FP-102'],
  ['FP-101', 'ORD-101'],
  ['FP-101', 'ORD-102'],
  ['FP-102', 'ORD-102'],
];

function NetworkMesh({ 
  onSelectNode, 
  activeNodeId 
}: { 
  onSelectNode: (node: SceneNode | null) => void; 
  activeNodeId: string | null;
}) {
  const groupRef = useRef<THREE.Group>(null);

  // Slow ambient rotation
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.08;
    }
  });

  const nodeMap = useMemo(() => {
    const map = new Map<string, SceneNode>();
    NODES_DATA.forEach(n => map.set(n.id, n));
    return map;
  }, []);

  return (
    <group ref={groupRef}>
      {/* 3D Connecting Lines */}
      {EDGES_DATA.map(([fromId, toId], idx) => {
        const from = nodeMap.get(fromId);
        const to = nodeMap.get(toId);
        if (!from || !to) return null;

        const isHighlighted = activeNodeId === fromId || activeNodeId === toId;

        const points = [
          new THREE.Vector3(...from.position),
          new THREE.Vector3(...to.position),
        ];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const mat = new THREE.LineBasicMaterial({
          color: isHighlighted ? '#E9A23B' : '#527D68',
          transparent: true,
          opacity: isHighlighted ? 0.95 : 0.35,
        });
        const lineObj = new THREE.Line(lineGeo, mat);

        return <primitive key={`line-${idx}`} object={lineObj} />;
      })}

      {/* 3D Nodes */}
      {NODES_DATA.map((node) => {
        const isSelected = activeNodeId === node.id;
        return (
          <group 
            key={node.id} 
            position={node.position}
            onClick={(e) => {
              e.stopPropagation();
              onSelectNode(node);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              document.body.style.cursor = 'default';
            }}
          >
            <mesh>
              <sphereGeometry args={[isSelected ? 0.22 : 0.16, 24, 24]} />
              <meshStandardMaterial 
                color={node.color} 
                emissive={node.color}
                emissiveIntensity={isSelected ? 0.8 : 0.3}
                roughness={0.2}
                metalness={0.4}
              />
            </mesh>

            {/* Subtle glow outer sphere */}
            <mesh>
              <sphereGeometry args={[isSelected ? 0.32 : 0.22, 16, 16]} />
              <meshBasicMaterial 
                color={node.color} 
                transparent 
                opacity={isSelected ? 0.35 : 0.15} 
                wireframe={false} 
              />
            </mesh>

            {/* Floating label facing camera */}
            <Billboard position={[0, 0.32, 0]}>
              <Text
                fontSize={isSelected ? 0.16 : 0.13}
                color={isSelected ? '#E9A23B' : '#DCE8DF'}
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.015}
                outlineColor="#102C25"
                font={undefined}
              >
                {node.label}
              </Text>
            </Billboard>
          </group>
        );
      })}
    </group>
  );
}

export function TraceSphere() {
  const [activeNode, setActiveNode] = useState<SceneNode | null>(NODES_DATA[1]); // default to L-204
  const [isClient, setIsClient] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    setIsClient(true);
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }
  }, []);

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden bg-[#102C25] border border-[#173D32] shadow-2xl flex flex-col">
      {/* 3D Top Header Overlay */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between pointer-events-none gap-2">
        <div className="flex items-center gap-2 bg-[#173D32]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#527D68]/40 text-xs text-[#DCE8DF]">
          <Sparkles className="w-3.5 h-3.5 text-[#E9A23B]" />
          <span>Interactive Supply Chain Graph</span>
          <span className="text-[10px] text-[#A5C2B4] font-mono">3D TraceSphere</span>
        </div>
        <div className="text-[11px] text-[#A5C2B4] bg-[#102C25]/80 px-2.5 py-1 rounded-full border border-[#527D68]/30">
          Rotate & Click Nodes to Inspect Flow
        </div>
      </div>

      {/* Main 3D Canvas / WebGL Fallback */}
      <div className="w-full h-full flex-1">
        {isClient && hasWebGL ? (
          <Canvas
            camera={{ position: [0, 0, 8], fov: 45 }}
            style={{ width: '100%', height: '100%', background: 'transparent' }}
          >
            <ambientLight intensity={0.7} />
            <pointLight position={[10, 10, 10]} intensity={1.2} />
            <pointLight position={[-10, -10, -5]} intensity={0.5} color="#527D68" />
            <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
              <NetworkMesh onSelectNode={setActiveNode} activeNodeId={activeNode?.id || null} />
            </Float>
            <OrbitControls 
              enableZoom={false} 
              autoRotate={false} 
              maxPolarAngle={Math.PI / 1.7} 
              minPolarAngle={Math.PI / 3} 
            />
          </Canvas>
        ) : (
          /* High-fidelity fallback poster when WebGL is loading or unavailable */
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-[#DCE8DF] bg-radial from-[#173D32] to-[#102C25]">
            <ShieldCheck className="w-12 h-12 text-[#E9A23B] mb-3" />
            <h4 className="text-lg font-bold text-white mb-1">TraceSphere Relationship Network</h4>
            <p className="text-xs text-[#A5C2B4] max-w-md mb-4">
              Deterministic links connect Greenfield Ingredients (Supplier) &rarr; Lot L-204 &rarr; Batches PB-031 &amp; PB-032 &rarr; Finished Lots &rarr; Customer Orders.
            </p>
            <Link
              href="/app/trace"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#E9A23B] text-black hover:bg-amber-400 transition-colors"
            >
              Open 2D Operational Explorer &rarr;
            </Link>
          </div>
        )}
      </div>

      {/* Selected Node Drawer Card */}
      {activeNode && (
        <div className="absolute bottom-4 left-4 right-4 z-10 bg-[#102C25]/90 backdrop-blur-md p-4 rounded-xl border border-[#527D68]/50 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#173D32] text-[#E9A23B] font-semibold border border-[#E9A23B]/30">
                {activeNode.category.replace(/_/g, ' ')}
              </span>
              <h5 className="font-bold text-sm text-[#F7F6F0]">{activeNode.label}</h5>
            </div>
            <p className="text-xs text-[#CBD8D1] max-w-xl">{activeNode.description}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/app/trace?search=${activeNode.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E9A23B] text-black hover:bg-amber-400 font-semibold text-xs transition-colors shadow-xs"
            >
              <span>Explore in Trace Engine</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
