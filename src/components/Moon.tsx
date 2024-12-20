import { useEffect, useRef, useState, Suspense, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, useLoader, Canvas } from '@react-three/fiber';
import { useScroll } from 'framer-motion';
import { TIFFLoader } from 'three/examples/jsm/loaders/TIFFLoader';
import { PerspectiveCamera } from '@react-three/drei';
import { BufferGeometry, Float32BufferAttribute } from 'three';

// Add easing function at the top level
const easeOutExpo = (x: number): number => {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
};

function Stars({ count = 5000 }) {
  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50; // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50; // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 150; // z
    }
    return positions;
  }, [count]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#ffffff"
        sizeAttenuation={true}
        transparent={true}
        opacity={0.8}
      />
    </points>
  );
}

function Moon() {
  const moonRef = useRef<THREE.Mesh>(null);
  const { scrollY } = useScroll();
  const [moonRadius] = useState(1737.4); // NASA's specified moon radius in km

  // Load TIFF textures
  const colorMap = useLoader(TIFFLoader, '/moon-color.tif');
  const displacementMap = useLoader(TIFFLoader, '/moon-displacement.tif');

  useEffect(() => {
    if (colorMap && displacementMap) {
      // Center textures on 0° longitude
      colorMap.center.set(0.5, 0.5);
      displacementMap.center.set(0.5, 0.5);

      // Set proper texture wrapping
      colorMap.wrapS = colorMap.wrapT = THREE.RepeatWrapping;
      displacementMap.wrapS = displacementMap.wrapT = THREE.RepeatWrapping;
    }
  }, [colorMap, displacementMap]);
  
  useFrame(({ clock }) => {
    if (moonRef.current) {
      moonRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    //   moonRef.current.rotation.y = scrollY.get() * 0.0005;
    }
  });

  return (
    <mesh ref={moonRef} position={[-2, 0, 1]} castShadow receiveShadow> {/* Shifted left */}
      <sphereGeometry 
        args={[2, 512, 512]} // Even higher resolution for smoother surface
      />
      <meshStandardMaterial
        map={colorMap}
        displacementMap={displacementMap}
        displacementScale={0.015} // Reduced from 0.15 for subtler terrain
        // displacementBias={0.05} // Adjusted to match scale
        // normalMap={displacementMap}
        // normalScale={new THREE.Vector2(0.05, 0.05)} // Softer normal mapping
        metalness={0}
        roughness={0.9}
        emissive={new THREE.Color(0x222222)} // Slight self-illumination
        emissiveIntensity={0.1}        
      />
    </mesh>
  );
}

function Saturn() {
  const saturnRef = useRef<THREE.Group>(null);
  const saturnTexture = useLoader(THREE.TextureLoader, '/saturn.jpg');
  const ringTexture = useLoader(THREE.TextureLoader, '/saturn_ring.png');
  
  // Create custom ring geometry with proper UVs
  const ringGeometry = useMemo(() => {
    const geometry = new THREE.RingGeometry(1.5, 4, 128);
    const pos = geometry.attributes.position;
    const v3 = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v3.fromBufferAttribute(pos, i);
      geometry.attributes.uv.setXY(i, v3.length() < 2.5 ? 0 : 1, 1);
    }
    return geometry;
  }, []);

  useFrame(({ clock }) => {
    if (saturnRef.current) {
      // Rotate around the tilted axis
      // saturnRef.current.rotation.x = Math.PI * 0.1 + Math.sin(clock.getElapsedTime() * 0.5)*0.5;
      saturnRef.current.rotation.y = clock.getElapsedTime() * 0.1;
      // saturnRef.current.rotation.z = Math.PI * -0.1 + Math.sin(clock.getElapsedTime() * 0.5)*0.1;

    }
  });

  return (
    <group 
      ref={saturnRef} 
      position={[2, 0, 70]} 
      rotation={[Math.PI * 0.25, 0, -Math.PI * 0.1]} // Tilted at 45 degrees with slight z-axis rotation
      castShadow 
      receiveShadow
    >
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[1.5, 64, 64]} />
        <meshStandardMaterial 
          map={saturnTexture}
          metalness={0}
          roughness={1}
        />
      </mesh>
      <mesh 
        rotation={[Math.PI/2, Math.PI, 0]} // Combined 90° (π/2) X rotation with π Y rotation
        castShadow 
        receiveShadow
      >
        <primitive object={ringGeometry} />
        <meshStandardMaterial 
          map={ringTexture}
          transparent
          opacity={1}
          alphaTest={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function Scene() {
  const spotLightRef = useRef();
  const cameraRef = useRef<THREE.Camera>();
  const { scrollYProgress } = useScroll();
  const [isLoading, setIsLoading] = useState(true);
  const startTime = useRef(Date.now());

  useEffect(() => {
    if (spotLightRef.current) {
      // Set the spotlight's target to Saturn's position
      spotLightRef.current.target.position.set(2.5, 0, 70);
      spotLightRef.current.target.updateMatrixWorld();
    }
  }, []);

  useFrame(() => {
    if (cameraRef.current) {
      const timeSinceStart = (Date.now() - startTime.current) / 1000;
      const rawProgress = Math.min(1, timeSinceStart / 0.5);
      const loadingAnimation = easeOutExpo(rawProgress); // Apply easing

      if (timeSinceStart > 0.5 && isLoading) {
        setIsLoading(false);
      }

      const scrollEffect = 80 * (Math.cos((scrollYProgress.get()+1)*Math.PI) + 1)/2;
      const initialZoom = THREE.MathUtils.lerp(0, 5, loadingAnimation); // Changed from 0,4 to 2,5
      const targetZ = initialZoom + scrollEffect;

      cameraRef.current.position.z = THREE.MathUtils.lerp(
        cameraRef.current.position.z,
        targetZ,
        0.15
      );
    }
  });

  return (
    <>
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        position={[0, 0, 0]} // Changed initial position to z=2
        fov={45}
        near={0.1}
        far={100}
      />
      <Stars count={6000} />
      <ambientLight color="#ffffff" intensity={0.2} />
      <spotLight
        position={[20, 0, 2]}
        angle={Math.PI / 16}
        penumbra={0.5}
        intensity={1000}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0003}
        shadow-normalBias={0.05}
      />
      <spotLight
        ref={spotLightRef}
        position={[-10, 0, 70]}
        angle={Math.PI / 8}
        penumbra={0.3}
        intensity={500}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0003}
        shadow-normalBias={0.05}
      />
      <pointLight
        position={[2, 10, 70]}
        intensity={50}
        color="#ffffff"
      />
      <Moon />
      <Saturn />
    </>
  );
}

export function MoonCanvas() {
  return (
    <div className="fixed inset-0">
      <Canvas shadows gl={{ antialias: true, shadowMapType: THREE.PCFSoftShadowMap, }}>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
