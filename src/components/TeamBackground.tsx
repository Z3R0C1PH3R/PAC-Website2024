import { Canvas, useFrame, useLoader, extend } from '@react-three/fiber';
import { useRef, useMemo, Suspense, useEffect } from 'react';
import * as THREE from 'three';
import { PerspectiveCamera } from '@react-three/drei';
import { useScroll } from 'framer-motion'; // Add this import

// Single haze shader
const hazeVertexShader = `
varying vec3 vNormal;
varying vec2 vUv;
void main() {
    vNormal = normalize(normalMatrix * normal);
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const hazeFragmentShader = `
varying vec3 vNormal;
varying vec2 vUv;
uniform float time;

void main() {
    vec3 atmosphereColor = vec3(0.4, 0.6, 1.0);
    float alpha = 0.15;
    
    gl_FragColor = vec4(atmosphereColor, alpha);
}
`;

function Stars({ count = 5000 }) {
    const starsRef = useRef<THREE.Points>(null);
  const { scrollYProgress } = useScroll();

  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;     // Increased range
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50; 
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    return positions;
  }, [count]);

  useFrame(() => {
    if (starsRef.current) {
      // Rotate stars based on scroll
      const rotation = scrollYProgress.get() * Math.PI * 2;
      starsRef.current.rotation.y = rotation * 0.5; // Slower rotation
    }
  });

  return (
    <points ref={starsRef}>
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

function Earth() {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  
  // Load all textures
  const [dayMap, nightMap, cloudsMap, normalMap, specularMap] = useLoader(THREE.TextureLoader, [
    '/2k_earth_daymap.jpg',
    '/2k_earth_nightmap.jpg',
    '/clouds.png',
    '/2k_earth_normal_map.png', // Now using PNG instead of TIFF
    '/2k_earth_specular_map.png' // Now using PNG instead of TIFF
  ]);

  useEffect(() => {
    [dayMap, nightMap, cloudsMap, normalMap, specularMap].forEach(texture => {
      if (texture) {
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.anisotropy = 16;
        // Ensure proper color space for normal and specular maps
        if (texture === normalMap || texture === specularMap) {
          texture.colorSpace = THREE.LinearSRGBColorSpace;
        }
      }
    });

    if (specularMap) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = specularMap.image;
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw original texture
      ctx?.drawImage(img, 0, 0);
      
      // Get image data and invert
      const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
      if (imageData) {
        for (let i = 0; i < imageData.data.length; i += 4) {
          for (let j = 0; j < 3; j++) {
            imageData.data[i+j] = 128 + (255 - imageData.data[i+j])/2 ;
          }
        }
        ctx?.putImageData(imageData, 0, 0);
        
        // Create new texture from canvas
        const newTexture = new THREE.CanvasTexture(canvas);
        newTexture.needsUpdate = true;
        specularMap.image = canvas;
        specularMap.needsUpdate = true;
      }
    }
  }, [dayMap, nightMap, cloudsMap, normalMap, specularMap]);

  useFrame(({ clock }) => {
    if (earthRef.current && cloudsRef.current) {
      earthRef.current.rotation.y = clock.getElapsedTime() * 0.1;
      cloudsRef.current.rotation.y = clock.getElapsedTime() * 0.12; // Clouds rotate slightly faster
    }
  });

  return (
    <group position={[0, 0, 0]} rotation={[0, 0, THREE.MathUtils.degToRad(23.5)]}>
      {/* Main Earth sphere */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[1, 256, 256]} /> {/* Increased geometry resolution */}
        <meshStandardMaterial
          map={dayMap}
          displacementMap={normalMap}
          displacementScale={0.1}
          normalMap={normalMap}
          normalScale={new THREE.Vector2(2, 2)}
          roughnessMap={specularMap}
          roughness={1}
          metalness={0.1}
          emissiveMap={nightMap}
          emissive={new THREE.Color(0xfcdb32)}
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Simple atmosphere haze */}
      <mesh scale={1.06}>
        <sphereGeometry args={[1, 64, 64]} />
        <shaderMaterial
          vertexShader={hazeVertexShader}
          fragmentShader={hazeFragmentShader}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          uniforms={{
            time: { value: 0 }
          }}
        />
      </mesh>

      {/* Cloud layer */}
      <mesh ref={cloudsRef} scale={1.052}>
        <sphereGeometry args={[1, 128, 128]} />
        <meshStandardMaterial
          map={cloudsMap}
          transparent={true}
          opacity={1} // Reduced cloud opacity
          depthWrite={false}
          roughness={1}
          metalness={0}
        />
      </mesh>
    </group>
  );
}

function Scene() {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const camRef = useRef<THREE.PerspectiveCamera>(null);
  const { scrollYProgress } = useScroll();

  useFrame(() => {
    if (lightRef.current) {
      const angle = scrollYProgress.get() * Math.PI * 2;
      const radius = 5; // Increased radius for better lighting
      lightRef.current.position.x = Math.cos(angle) * radius;
      lightRef.current.position.z = Math.sin(angle) * radius;
      lightRef.current.lookAt(0, 0, 0);
    }
    if (camRef.current) {
      const angle = (scrollYProgress.get() + 0.2) * Math.PI/2;
      const initialY = 1.5;
      const initialZ = 2.5;
      const radius = Math.sqrt(initialY**2 + initialZ**2);
      // Increased radius for better lighting
      camRef.current.position.y = Math.cos(angle) * radius;
      camRef.current.position.z = Math.sin(angle) * radius;
      camRef.current.lookAt(0, 0.1, 0);
    }
  });

  return (
    <>
      <PerspectiveCamera
        ref={camRef}
        makeDefault
        position={[0, 1.5, 2.5]} // Centered and moved back
        rotation={[-0.5, 0, 0]} // Reset rotation
        fov={50} // Narrower FOV for better view
        near={0.1}
        far={1000}
      />
      <Stars count={3000} />
      {/* <ambientLight intensity={0.1} /> */}
      <directionalLight 
        ref={lightRef}
        position={[5, 0, 0]} 
        intensity={10}
        castShadow
      />
      <Earth />
    </>
  );
}

export function TeamBackground() {
  return (
    <div className="fixed inset-0">
      <Canvas
        shadows
        gl={{ antialias: true, shadowMapType: THREE.PCFSoftShadowMap, }}
      >
        <color attach="background" args={['#000']} />
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
