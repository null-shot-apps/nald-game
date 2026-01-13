'use client';

import { useEffect, useState } from 'react';

// Reward types
type RewardType = 'points-low' | 'points-medium' | 'points-high' | 'badge' | 'role' | 'try-again' | 'cosmetic';

interface Reward {
  id: string;
  type: RewardType;
  label: string;
  value: number | string;
  color: string;
  emoji: string;
}

const rewards: Reward[] = [
  { id: '1', type: 'points-low', label: '10 Points', value: 10, color: '#60A5FA', emoji: '⭐' },
  { id: '2', type: 'points-medium', label: '50 Points', value: 50, color: '#34D399', emoji: '💎' },
  { id: '3', type: 'badge', label: 'Lucky Badge', value: 'lucky-badge', color: '#F59E0B', emoji: '🏅' },
  { id: '4', type: 'points-high', label: '100 Points', value: 100, color: '#A78BFA', emoji: '🌟' },
  { id: '5', type: 'role', label: 'VIP Role (24h)', value: 'vip-24h', color: '#EC4899', emoji: '👑' },
  { id: '6', type: 'try-again', label: 'Try Tomorrow', value: 0, color: '#6B7280', emoji: '🔄' },
  { id: '7', type: 'cosmetic', label: 'Cool Avatar', value: 'avatar-1', color: '#8B5CF6', emoji: '🎨' },
  { id: '8', type: 'points-medium', label: '25 Points', value: 25, color: '#14B8A6', emoji: '✨' },
];

export default function SpinWheel() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [hasSpun, setHasSpun] = useState(false);
  const [wonReward, setWonReward] = useState<Reward | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [timeUntilNextSpin, setTimeUntilNextSpin] = useState('');
  const [totalPoints, setTotalPoints] = useState(0);
  const [badges, setBadges] = useState<string[]>([]);

  // Check if user has spun today
  useEffect(() => {
    const lastSpinTime = localStorage.getItem('lastSpinTime');
    const storedPoints = localStorage.getItem('totalPoints');
    const storedBadges = localStorage.getItem('badges');
    
    if (storedPoints) setTotalPoints(parseInt(storedPoints));
    if (storedBadges) setBadges(JSON.parse(storedBadges));
    
    if (lastSpinTime) {
      const lastSpin = new Date(parseInt(lastSpinTime));
      const now = new Date();
      const hoursSince = (now.getTime() - lastSpin.getTime()) / (1000 * 60 * 60);
      
      if (hoursSince < 24) {
        setHasSpun(true);
      }
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!hasSpun) return;
    
    const interval = setInterval(() => {
      const lastSpinTime = localStorage.getItem('lastSpinTime');
      if (!lastSpinTime) return;
      
      const lastSpin = new Date(parseInt(lastSpinTime));
      const nextSpin = new Date(lastSpin.getTime() + 24 * 60 * 60 * 1000);
      const now = new Date();
      const diff = nextSpin.getTime() - now.getTime();
      
      if (diff <= 0) {
        setHasSpun(false);
        setTimeUntilNextSpin('');
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeUntilNextSpin(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [hasSpun]);

  const spinWheel = () => {
    if (isSpinning || hasSpun) return;
    
    setIsSpinning(true);
    setShowConfetti(false);
    
    // Random reward selection
    const randomIndex = Math.floor(Math.random() * rewards.length);
    const selectedReward = rewards[randomIndex];
    
    // Calculate rotation (multiple full spins + landing position)
    const segmentAngle = 360 / rewards.length;
    const targetAngle = 360 - (randomIndex * segmentAngle + segmentAngle / 2);
    const spins = 5; // Number of full rotations
    const finalRotation = rotation + (360 * spins) + targetAngle;
    
    setRotation(finalRotation);
    
    // After spin completes
    setTimeout(() => {
      setIsSpinning(false);
      setHasSpun(true);
      setWonReward(selectedReward);
      localStorage.setItem('lastSpinTime', Date.now().toString());
      
      // Update rewards
      if (selectedReward.type.includes('points')) {
        const newPoints = totalPoints + (selectedReward.value as number);
        setTotalPoints(newPoints);
        localStorage.setItem('totalPoints', newPoints.toString());
      }
      
      if (selectedReward.type === 'badge') {
        const newBadges = [...badges, selectedReward.value as string];
        setBadges(newBadges);
        localStorage.setItem('badges', JSON.stringify(newBadges));
      }
      
      // Show confetti for wins (not try-again)
      if (selectedReward.type !== 'try-again') {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
      }
    }, 4000);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Confetti */}
      {showConfetti && (
        <div className="confetti-container">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                backgroundColor: ['#FFD700', '#FF69B4', '#00CED1', '#FF6347', '#32CD32'][Math.floor(Math.random() * 5)],
              }}
            />
          ))}
        </div>
      )}

      {/* Header with stats */}
      <div className="relative z-10 p-4 md:p-6 flex justify-between items-center">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 md:px-6 py-3 border border-white/20">
          <div className="text-white/70 text-xs md:text-sm">Total Points</div>
          <div className="text-white text-xl md:text-2xl font-bold">{totalPoints}</div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 md:px-6 py-3 border border-white/20">
          <div className="text-white/70 text-xs md:text-sm">Badges</div>
          <div className="text-white text-xl md:text-2xl font-bold">{badges.length}</div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-8 md:py-12">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-2 text-center">
          Daily Spin 🎡
        </h1>
        <p className="text-white/80 text-base md:text-lg mb-8 md:mb-12 text-center">
          Spin once every 24 hours for rewards!
        </p>

        {/* Wheel container */}
        <div className="relative mb-8 md:mb-12">
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[30px] border-t-yellow-400 drop-shadow-lg" />
          </div>

          {/* Wheel */}
          <div className="relative w-[280px] h-[280px] md:w-[400px] md:h-[400px]">
            <div
              className="wheel-container"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
              }}
            >
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {rewards.map((reward, index) => {
                  const segmentAngle = 360 / rewards.length;
                  const startAngle = index * segmentAngle - 90;
                  const endAngle = startAngle + segmentAngle;
                  
                  const startRad = (startAngle * Math.PI) / 180;
                  const endRad = (endAngle * Math.PI) / 180;
                  
                  const x1 = 50 + 50 * Math.cos(startRad);
                  const y1 = 50 + 50 * Math.sin(startRad);
                  const x2 = 50 + 50 * Math.cos(endRad);
                  const y2 = 50 + 50 * Math.sin(endRad);
                  
                  const largeArc = segmentAngle > 180 ? 1 : 0;
                  
                  return (
                    <g key={reward.id}>
                      <path
                        d={`M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`}
                        fill={reward.color}
                        stroke="white"
                        strokeWidth="0.5"
                      />
                      <text
                        x="50"
                        y="50"
                        fill="white"
                        fontSize="8"
                        fontWeight="bold"
                        textAnchor="middle"
                        transform={`rotate(${index * segmentAngle + segmentAngle / 2} 50 50) translate(0 -25)`}
                      >
                        {reward.emoji}
                      </text>
                    </g>
                  );
                })}
                
                {/* Center circle */}
                <circle cx="50" cy="50" r="12" fill="white" stroke="#333" strokeWidth="1" />
              </svg>
            </div>
          </div>
        </div>

        {/* Spin button */}
        <button
          onClick={spinWheel}
          disabled={isSpinning || hasSpun}
          className={`
            px-8 md:px-12 py-4 md:py-5 rounded-full text-lg md:text-2xl font-bold
            transition-all duration-300 transform
            ${isSpinning || hasSpun
              ? 'bg-gray-500 cursor-not-allowed opacity-50'
              : 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:scale-110 hover:shadow-2xl cursor-pointer'
            }
            text-white shadow-xl
          `}
        >
          {isSpinning ? '🎡 Spinning...' : hasSpun ? '⏰ Spin Used' : '🎯 SPIN NOW!'}
        </button>

        {/* Countdown */}
        {hasSpun && timeUntilNextSpin && (
          <div className="mt-6 bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/20">
            <div className="text-white/70 text-sm text-center mb-1">Next spin in</div>
            <div className="text-white text-2xl md:text-3xl font-bold text-center">{timeUntilNextSpin}</div>
          </div>
        )}

        {/* Won reward display */}
        {wonReward && hasSpun && (
          <div className="mt-6 bg-white/10 backdrop-blur-md rounded-2xl px-8 py-6 border border-white/20 animate-bounce-in">
            <div className="text-center">
              <div className="text-5xl mb-2">{wonReward.emoji}</div>
              <div className="text-white text-xl md:text-2xl font-bold">{wonReward.label}</div>
              {wonReward.type !== 'try-again' && (
                <div className="text-white/70 text-sm mt-2">Added to your profile!</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Reward legend */}
      <div className="relative z-10 px-4 pb-8">
        <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-white/20">
          <h3 className="text-white text-lg md:text-xl font-bold mb-4 text-center">Possible Rewards</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {rewards.map((reward) => (
              <div key={reward.id} className="flex items-center gap-2 bg-white/5 rounded-lg p-2">
                <span className="text-2xl">{reward.emoji}</span>
                <span className="text-white text-xs md:text-sm">{reward.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

