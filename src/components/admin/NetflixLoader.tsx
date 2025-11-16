import { useEffect, useState, useRef } from "react";

interface NetflixLoaderProps {
  onComplete: () => void;
}

export function NetflixLoader({ onComplete }: NetflixLoaderProps) {
  const [currentText, setCurrentText] = useState(-1);
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const onCompleteRef = useRef(onComplete);

  // Atualizar ref quando onComplete mudar
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const phrases = [
    "HORA DE FATURAR",
    "BY VÍCTOR HUGO"
  ];

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // Iniciar com primeira frase
    const startTimer = setTimeout(() => {
      setCurrentText(0);
      setIsVisible(true);
    }, 200);

    timers.push(startTimer);

    phrases.forEach((_, index) => {
      if (index === 0) return; // Já iniciada acima

      // Mostrar próxima frase
      const showTimer = setTimeout(() => {
        setIsExiting(false);
        setCurrentText(index);
        setIsVisible(true);
      }, index * 1800 + 200);

      // Esconder frase atual antes da próxima
      const hideTimer = setTimeout(() => {
        setIsExiting(true);
        setIsVisible(false);
      }, index * 1800 + 1400);

      timers.push(showTimer, hideTimer);
    });

    // Esconder última frase
    const finalHideTimer = setTimeout(() => {
      setIsExiting(true);
      setIsVisible(false);
    }, phrases.length * 1800 + 1400);

    timers.push(finalHideTimer);

    // Completar animação e entrar no painel
    const completeTimer = setTimeout(() => {
      onCompleteRef.current();
    }, phrases.length * 1800 + 1800);

    timers.push(completeTimer);

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, []);

  // Gerar notas de dinheiro para animação
  const moneyNotes = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    left: `${10 + Math.random() * 80}%`,
    delay: `${Math.random() * 1.5}s`,
    duration: `${2.5 + Math.random() * 1.5}s`,
    initialRotation: Math.random() * 360,
  }));

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden">
      {/* Efeito de brilho de fundo suave */}
      <div className="absolute inset-0 opacity-20" 
        style={{
          background: 'radial-gradient(circle at center, rgba(34, 197, 94, 0.15) 0%, transparent 70%)'
        }}
      />
      
      {/* Animação de dinheiro caindo */}
      {moneyNotes.map((note) => (
        <div
          key={note.id}
          className="absolute text-3xl md:text-4xl"
          style={{
            left: note.left,
            top: '-5%',
            animation: `moneyFall ${note.duration} ${note.delay} ease-in infinite`,
            '--initial-rotation': `${note.initialRotation}deg`,
            willChange: 'transform, opacity, top',
          } as React.CSSProperties}
        >
          💵
        </div>
      ))}
      
      <div className="text-center relative z-10">
        <div
          className={`transition-all duration-700 ease-out ${
            isVisible && !isExiting
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 translate-y-4"
          }`}
        >
          {currentText >= 0 && (
            <>
              <h1 
                className={`text-3xl md:text-5xl lg:text-7xl font-bold mb-6 tracking-wider uppercase leading-tight
                  ${currentText === 0 ? 'text-green-500' : 'text-white'}
                `}
                style={{
                  textShadow: currentText === 0 
                    ? '0 0 40px rgba(34, 197, 94, 0.8), 0 0 80px rgba(34, 197, 94, 0.5)'
                    : '0 0 30px rgba(255,255,255,0.6), 0 0 60px rgba(255,255,255,0.4)',
                  animation: 'textSlideIn 0.6s ease-out'
                }}
              >
                {phrases[currentText]}
              </h1>
              
              {/* Animação de dinheiro girando - apenas na primeira frase */}
              {currentText === 0 && (
                <div className="mt-8 flex justify-center items-center gap-2">
                  <div className="text-3xl animate-spin" style={{ animationDuration: '2s' }}>
                    💰
                  </div>
                  <div className="text-2xl animate-pulse text-green-400">
                    Carregando...
                  </div>
                  <div className="text-3xl animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}>
                    💰
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes moneyFall {
          0% {
            top: -5%;
            opacity: 1;
            transform: translateX(0) rotate(var(--initial-rotation, 0deg));
          }
          25% {
            transform: translateX(15px) rotate(calc(var(--initial-rotation, 0deg) + 90deg));
          }
          50% {
            opacity: 0.9;
            transform: translateX(-10px) rotate(calc(var(--initial-rotation, 0deg) + 180deg));
          }
          75% {
            transform: translateX(10px) rotate(calc(var(--initial-rotation, 0deg) + 270deg));
          }
          100% {
            top: 105%;
            opacity: 0;
            transform: translateX(-15px) rotate(calc(var(--initial-rotation, 0deg) + 360deg));
          }
        }
        @keyframes textSlideIn {
          from { 
            opacity: 0; 
            transform: translateY(20px) scale(0.95); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
      `}</style>
    </div>
  );
}

