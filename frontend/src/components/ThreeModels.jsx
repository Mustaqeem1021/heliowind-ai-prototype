import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Cylinder, Sphere } from '@react-three/drei';

export const WindTurbine = ({ windSpeed = 5 }) => {
  const bladesRef = useRef();

  useFrame((state, delta) => {
    if (bladesRef.current) {
      // Rotate based on wind speed (cap it so it doesn't go crazy)
      const speed = Math.max(0, Math.min(windSpeed, 30)); 
      bladesRef.current.rotation.z -= delta * (speed * 0.2);
    }
  });

  return (
    <group position={[0, -2, 0]} scale={0.8}>
      {/* Tower */}
      <Cylinder args={[0.2, 0.4, 5, 16]} position={[0, 2.5, 0]}>
        <meshStandardMaterial color="#d4d4d8" roughness={0.7} />
      </Cylinder>
      
      {/* Nacelle */}
      <Box args={[0.8, 0.6, 1.2]} position={[0, 5.2, 0.2]}>
        <meshStandardMaterial color="#f4f4f5" roughness={0.5} />
      </Box>

      {/* Hub & Blades Group */}
      <group position={[0, 5.2, 0.8]} ref={bladesRef}>
        <Sphere args={[0.3, 16, 16]} scale={[1, 1, 1.5]}>
          <meshStandardMaterial color="#e4e4e7" roughness={0.3} />
        </Sphere>
        
        {/* Blade 1 */}
        <Box args={[0.1, 4, 0.3]} position={[0, 2, 0]} rotation={[0, 0, 0]}>
          <meshStandardMaterial color="#fafafa" roughness={0.4} />
        </Box>
        {/* Blade 2 */}
        <Box args={[0.1, 4, 0.3]} position={[1.732, -1, 0]} rotation={[0, 0, (Math.PI * 2) / 3]}>
          <meshStandardMaterial color="#fafafa" roughness={0.4} />
        </Box>
        {/* Blade 3 */}
        <Box args={[0.1, 4, 0.3]} position={[-1.732, -1, 0]} rotation={[0, 0, (Math.PI * 4) / 3]}>
          <meshStandardMaterial color="#fafafa" roughness={0.4} />
        </Box>
      </group>
    </group>
  );
};

export const SolarPanelArray = ({ cloudCover = 0 }) => {
  // We want to dim the emissive/color slightly based on cloud cover to simulate shadows
  const shadowFactor = cloudCover / 100;
  // HSL: deeper blue/black when cloudy, brighter when clear
  const panelColor = `hsl(210, 80%, ${30 - shadowFactor * 15}%)`;
  
  return (
    <group position={[0, -1, 0]} scale={1.2} rotation={[0, Math.PI / 4, 0]}>
      {/* Array of panels */}
      {[-1, 0, 1].map((x) => (
        [-1, 0, 1].map((z) => (
          <group key={`${x}-${z}`} position={[x * 2.2, 0, z * 2.2]}>
             {/* Stand */}
             <Cylinder args={[0.05, 0.05, 1, 8]} position={[0, 0.5, 0]}>
               <meshStandardMaterial color="#71717a" roughness={0.8} />
             </Cylinder>
             {/* Panel */}
             <Box args={[1.8, 0.1, 1.8]} position={[0, 1, 0]} rotation={[0.4, 0, 0]}>
               <meshStandardMaterial 
                 color={panelColor} 
                 metalness={0.8} 
                 roughness={0.2} 
               />
             </Box>
          </group>
        ))
      ))}
    </group>
  );
};
