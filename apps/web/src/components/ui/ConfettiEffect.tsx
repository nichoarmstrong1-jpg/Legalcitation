import { useEffect, useState } from 'react';

interface ConfettiEffectProps {
  trigger: boolean;
  particleCount?: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  size: number;
  velocityX: number;
  velocityY: number;
  delay: number;
}

const COLORS = ['#22c55e', '#4ade80', '#86efac', '#f59e0b', '#fbbf24', '#627d98', '#486581'];

export function ConfettiEffect({ trigger, particleCount = 35 }: ConfettiEffectProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!trigger) return;

    const newParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: 50 + (Math.random() - 0.5) * 20,
      y: 50,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360,
      size: 4 + Math.random() * 6,
      velocityX: (Math.random() - 0.5) * 60,
      velocityY: -(20 + Math.random() * 40),
      delay: Math.random() * 200,
    }));

    setParticles(newParticles);
    setVisible(true);

    const timer = setTimeout(() => {
      setVisible(false);
      setParticles([]);
    }, 2500);

    return () => clearTimeout(timer);
  }, [trigger, particleCount]);

  if (!visible || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size * 0.6,
            backgroundColor: p.color,
            borderRadius: '1px',
            transform: `rotate(${p.rotation}deg)`,
            animation: `confettiFall 2s ease-out ${p.delay}ms forwards`,
            '--vx': `${p.velocityX}px`,
            '--vy': `${p.velocityY}px`,
          } as React.CSSProperties}
        />
      ))}
      <style>{`
        @keyframes confettiFall {
          0% { opacity: 1; transform: translate(0, 0) rotate(0deg) scale(1); }
          50% { opacity: 1; }
          100% {
            opacity: 0;
            transform: translate(var(--vx), calc(var(--vy) + 300px)) rotate(720deg) scale(0.5);
          }
        }
      `}</style>
    </div>
  );
}
