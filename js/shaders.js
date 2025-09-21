// Custom shaders for the Sun's corona effect and other visual enhancements

const SunShaders = {
    vertex: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    
    fragment: `
        uniform float time;
        uniform vec3 color;
        uniform float intensity;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        // Noise function for surface turbulence
        float noise(vec3 p) {
            return fract(sin(dot(p, vec3(12.9898, 78.233, 54.53))) * 43758.5453);
        }
        
        float turbulence(vec3 p) {
            float value = 0.0;
            float amplitude = 1.0;
            float frequency = 1.0;
            
            for(int i = 0; i < 4; i++) {
                value += amplitude * noise(p * frequency);
                amplitude *= 0.5;
                frequency *= 2.0;
            }
            
            return value;
        }
        
        void main() {
            // Create animated surface patterns
            vec3 pos = vPosition + time * 0.1;
            float turb = turbulence(pos * 2.0);
            
            // Create pulsing effect
            float pulse = sin(time * 2.0) * 0.1 + 0.9;
            
            // Fresnel effect for glow
            float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
            
            // Combine effects
            vec3 finalColor = color * (turb * 0.3 + 0.7) * pulse * intensity;
            finalColor += color * fresnel * 0.5;
            
            gl_FragColor = vec4(finalColor, 1.0);
        }
    `
};

const CoronaShaders = {
    vertex: `
        varying vec2 vUv;
        varying vec3 vNormal;
        
        void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    
    fragment: `
        uniform float time;
        uniform vec3 color;
        uniform float opacity;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        
        float noise(vec2 p) {
            return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }
        
        void main() {
            // Create corona flare effect
            vec2 center = vec2(0.5, 0.5);
            float dist = distance(vUv, center);
            
            // Animated noise for corona movement
            float n = noise(vUv * 10.0 + time * 0.5);
            
            // Create radial gradient with noise
            float corona = (1.0 - dist) * n * opacity;
            corona = smoothstep(0.0, 1.0, corona);
            
            // Fresnel glow
            float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
            
            vec3 finalColor = color * corona;
            float alpha = corona * fresnel * opacity;
            
            gl_FragColor = vec4(finalColor, alpha);
        }
    `
};

const AtmosphereShaders = {
    vertex: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
            vNormal = normalize(normalMatrix * normal);
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    
    fragment: `
        uniform vec3 color;
        uniform float opacity;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
            // Simple atmospheric glow
            float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
            
            gl_FragColor = vec4(color, fresnel * opacity);
        }
    `
};

const RingShaders = {
    vertex: `
        varying vec2 vUv;
        varying float vDistance;
        
        void main() {
            vUv = uv;
            vDistance = length(position.xz);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    
    fragment: `
        uniform float innerRadius;
        uniform float outerRadius;
        uniform vec3 color;
        uniform float opacity;
        uniform sampler2D ringTexture;
        
        varying vec2 vUv;
        varying float vDistance;
        
        void main() {
            float normalizedDistance = (vDistance - innerRadius) / (outerRadius - innerRadius);
            
            if (normalizedDistance < 0.0 || normalizedDistance > 1.0) {
                discard;
            }
            
            // Sample ring texture or create procedural rings
            float ringPattern = sin(normalizedDistance * 50.0) * 0.5 + 0.5;
            ringPattern *= smoothstep(0.0, 0.1, normalizedDistance) * smoothstep(1.0, 0.9, normalizedDistance);
            
            vec3 finalColor = color * ringPattern;
            float alpha = ringPattern * opacity;
            
            gl_FragColor = vec4(finalColor, alpha);
        }
    `
};
