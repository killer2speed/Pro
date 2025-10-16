import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Wifi, Globe, Users, Activity, Clock, Zap, TrendingUp, Lock, Shield, CheckCircle, AlertCircle, Cpu, Database, Server } from 'lucide-react';
import './App.css';
import allCountries from './countries_flags.json';

export default function EFootballChecker() {
  const [userIP, setUserIP] = useState('Loading...');
  const [userCountry, setUserCountry] = useState('Loading...');
  const [activeUsers, setActiveUsers] = useState(0);
  const [connecting, setConnecting] = useState(false);
  const [hackingProgress, setHackingProgress] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [cooldown, setCooldown] = useState(0);
  const [serverPercent, setServerPercent] = useState(0);
  const [ping, setPing] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [boxType, setBoxType] = useState('');
  const [terminalLines, setTerminalLines] = useState([]);
  const [currentStage, setCurrentStage] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [showResultAnimation, setShowResultAnimation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quickScanEpic, setQuickScanEpic] = useState(false);
  const [quickScanShowtime, setQuickScanShowtime] = useState(false);
  const [serverTime, setServerTime] = useState('');
  const canvasRef = useRef(null);
  const terminalRef = useRef(null);

  // Play beep sound
  const playBeep = (frequency = 800, duration = 100) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (e) {
      // Silently fail if audio context is not supported
    }
  };

  // Play success sound
  const playSuccessSound = () => {
    playBeep(1000, 100);
    setTimeout(() => playBeep(1200, 100), 100);
    setTimeout(() => playBeep(1500, 150), 200);
  };

  // Play error sound
  const playErrorSound = () => {
    playBeep(400, 200);
    setTimeout(() => playBeep(300, 300), 200);
  };

  // Play typing sound
  const playTypingSound = () => {
    playBeep(600, 30);
  };

  // Initialize cooldown from localStorage
  useEffect(() => {
    const savedCooldownEnd = localStorage.getItem('cooldownEnd');
    if (savedCooldownEnd) {
      const remainingTime = Math.floor((parseInt(savedCooldownEnd) - Date.now()) / 1000);
      if (remainingTime > 0) {
        setCooldown(remainingTime);
      } else {
        localStorage.removeItem('cooldownEnd');
      }
    }
  }, []);

  // Save cooldown to localStorage
  useEffect(() => {
    if (cooldown > 0) {
      const cooldownEnd = Date.now() + (cooldown * 1000);
      localStorage.setItem('cooldownEnd', cooldownEnd.toString());
      
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      localStorage.removeItem('cooldownEnd');
    }
  }, [cooldown]);

  // Fetch real IP and country, and set up intervals
  useEffect(() => {
    const fetchIPInfo = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        setUserIP(data.ip || 'Unknown');
        setUserCountry(`${data.country_name} ${data.country_code}`);
      } catch (error) {
        const randomIP = `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
        setUserIP(randomIP);
        const randomCountry = allCountries[Math.floor(Math.random() * allCountries.length)];
        setUserCountry(`${randomCountry.name} ${randomCountry.emoji}`);
      }
      
      // Hide loading screen after 2 seconds
      setTimeout(() => setLoading(false), 2000);
    };

    fetchIPInfo();
    
    const baseUsers = Math.floor(Math.random() * 1500) + 500;
    setActiveUsers(baseUsers);
    
    const interval = setInterval(() => {
      setActiveUsers(prev => {
        const change = Math.floor(Math.random() * 20) - 10;
        const newVal = prev + change;
        return Math.max(500, Math.min(2000, newVal));
      });
    }, 3000);

    const notifInterval = setInterval(() => {
      if (isMaintenanceTime()) return;
      const randomCountry = allCountries[Math.floor(Math.random() * allCountries.length)];
      const attempts = Math.floor(Math.random() * 5) + 1;
      const luckPercent = Math.floor(Math.random() * 30) + 70;
      
      const newNotif = {
        id: Date.now(),
        country: `${randomCountry.name} ${randomCountry.emoji}`,
        attempts: attempts,
        luckPercent: luckPercent
      };
      
      setNotifications(prev => [newNotif, ...prev.slice(0, 2)]);
      playBeep(900, 50);
      
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
      }, 4000);
    }, Math.floor(Math.random() * 10000) + 15000);

    return () => {
      clearInterval(interval);
      clearInterval(notifInterval);
    };
  }, []);

  // Matrix rain effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const chars = '01アイウエオカキクケコサシスセソタチツテト';
    const fontSize = 12;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);
    
    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.04)'; // Slightly reduced brightness
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#00ff41';
      ctx.font = fontSize + 'px monospace';
      
      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };
    
    const interval = setInterval(draw, 33);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll terminal to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLines]);

  // Server time effect
  useEffect(() => {
    const updateServerTime = () => {
      const now = new Date();
      setServerTime(now.toUTCString().match(/(\d{2}:\d{2}:\d{2})/)[0]);
    };
    updateServerTime();
    const interval = setInterval(updateServerTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const generateRandomIP = () => {
    return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
  };

  const generateRandomHash = () => {
    return Array.from({length: 16}, () => Math.floor(Math.random() * 16).toString(16)).join('');
  };

  // Typewriter effect for terminal lines
  const addTerminalLineWithTyping = async (text, color = 'text-green-400') => {
    const lineId = Date.now() + Math.random();
    const chars = text.split('');
    
    for (let i = 0; i <= chars.length; i++) {
      const currentText = chars.slice(0, i).join('');
      
      setTerminalLines(prev => {
        const newLines = [...prev];
        const existingIndex = newLines.findIndex(line => line.id === lineId);
        
        if (existingIndex >= 0) {
          newLines[existingIndex] = { text: currentText, color, id: lineId };
        } else {
          newLines.push({ text: currentText, color, id: lineId });
        }
        
        return newLines;
      });
      
      if (i < chars.length) {
        if (Math.random() > 0.7) playTypingSound();
        await new Promise(resolve => setTimeout(resolve, Math.random() * 25 + 15));
      }
    }
  };

  const getRandom = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const getSmartResult = () => {
    const rand = Math.random() * 100;
    let luck;
    if (rand < 20) luck = getRandom(1, 20);
    else if (rand < 50) luck = getRandom(21, 40);
    else if (rand < 80) luck = getRandom(41, 69);
    else if (rand < 98) luck = getRandom(70, 94);
    else luck = getRandom(95, 99);
    return luck;
  };

  const isMaintenanceTime = () => {
    const now = new Date();
    const utcDay = now.getUTCDay(); // 0 for Sunday, 4 for Thursday
    const utcHours = now.getUTCHours();

    // Maintenance is Thursday 2:00 UTC to 8:00 UTC
    if (utcDay === 4 && utcHours >= 2 && utcHours < 8) {
      return true;
    }
    return false;
  };

  const handleServerCheck = async (type) => {
    if (cooldown > 0) return;

    if (isMaintenanceTime()) {
      setResult({
        percent: 0,
        ping: 0,
        server: 'N/A',
        boxType: type,
        timestamp: new Date().toLocaleTimeString(),
        recommendation: {
          icon: '⚙️',
          text: 'SERVER MAINTENANCE',
          subtext: 'eFootball servers are currently under maintenance. Please try again later',
          color: 'text-yellow-400',
          border: 'border-yellow-500',
          bg: 'bg-yellow-500/10',
        },
      });
      setShowModal(true);
      return;
    }

    playBeep(1000, 100);
    setBoxType(type);
    setConnecting(true);
    setResult(null);
    setTerminalLines([]);
    setCurrentStage('Connecting...');

    await addTerminalLineWithTyping('Initiating connection to eFootball™️ servers...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    const servers = [
      { name: 'KONAMI-EU-CENTRAL-01', ip: '198.51.100.1' },
      { name: 'KONAMI-US-EAST-03', ip: '203.0.113.5' },
      { name: 'KONAMI-ASIA-SGP-02', ip: '192.0.2.8' },
    ];
    const randomServer = servers[Math.floor(Math.random() * servers.length)];

    await addTerminalLineWithTyping(`Target server: ${randomServer.name} (${randomServer.ip})`);
    await new Promise(resolve => setTimeout(resolve, 500));

    setCurrentStage('Bypassing security...');
    setHackingProgress(0);
    const progressInterval = setInterval(() => {
      setHackingProgress(prev => {
        const next = prev + Math.random() * 10;
        if (next >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return next;
      });
    }, 200);

    await addTerminalLineWithTyping('Bypassing firewall... [OK]', 'text-cyan-400');
    await new Promise(resolve => setTimeout(resolve, 800));
    await addTerminalLineWithTyping('Authenticating with game server... [OK]', 'text-cyan-400');
    await new Promise(resolve => setTimeout(resolve, 1200));
    await addTerminalLineWithTyping('Injecting packet analysis script... [OK]', 'text-cyan-400');
    await new Promise(resolve => setTimeout(resolve, 1000));

    clearInterval(progressInterval);
    setHackingProgress(100);
    playSuccessSound();
    await addTerminalLineWithTyping('Connection successful! Access granted.', 'text-yellow-400');
    
    setConnecting(false);
    setAnalyzing(true);
    setCurrentStage('Analyzing server data...');

    const analysisSteps = [
      'Reading server packet headers...',
      'Analyzing player drop rates...',
      'Correlating with regional server load...',
      'Checking for active promotions...',
      'Simulating 1000 box draws...',
      'Finalizing luck analysis...'
    ];

    for (const step of analysisSteps) {
      await addTerminalLineWithTyping(step);
      await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 300));
    }

    setAnalyzing(false);
    
    const finalLuck = getSmartResult();
    const finalPing = Math.floor(Math.random() * 80) + 20;
    const finalServerPercent = Math.floor(Math.random() * 40) + 60;

    setServerPercent(finalServerPercent);
    setPing(finalPing);

    let recommendation;
    if (finalLuck >= 95) {
      recommendation = { icon: '💎', text: 'LEGENDARY LUCK!', subtext: 'Open now! Highest chance for Epic/Showtime!', color: 'text-purple-400', border: 'border-purple-500', bg: 'bg-purple-500/10' };
    } else if (finalLuck >= 85) {
      recommendation = { icon: '🔥', text: 'EXCELLENT LUCK', subtext: 'Very high chance for a top player!', color: 'text-red-400', border: 'border-red-500', bg: 'bg-red-500/10' };
    } else if (finalLuck >= 70) {
      recommendation = { icon: '👍', text: 'GOOD LUCK', subtext: 'Good chance to get a featured player.', color: 'text-yellow-400', border: 'border-yellow-500', bg: 'bg-yellow-500/10' };
    } else if (finalLuck >= 50) {
      recommendation = { icon: '🤔', text: 'AVERAGE LUCK', subtext: 'Might be worth a try, but no guarantees.', color: 'text-blue-400', border: 'border-blue-500', bg: 'bg-blue-500/10' };
    } else {
      recommendation = { icon: '👎', text: 'BAD LUCK', subtext: 'Not recommended to open packs now.', color: 'text-gray-400', border: 'border-gray-500', bg: 'bg-gray-500/10' };
    }

    setResult({
      percent: finalLuck,
      ping: finalPing,
      server: randomServer.name,
      boxType: type,
      timestamp: new Date().toLocaleTimeString(),
      recommendation,
    });
    setLastResult(finalLuck);
    setCooldown(60); // 1 minute cooldown

    setTimeout(() => {
      setShowModal(true);
      setTimeout(() => {
        window.open('https://t.me/pes224', '_blank');
      }, 5000);
    }, 1000);
  };

  const openTelegram = () => {
    window.open('https://t.me/pes224', '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-green-400 text-2xl font-mono animate-pulse">
        LOADING SYSTEM...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black text-green-400 font-mono overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 z-0"></canvas>
      <div className="relative z-10 p-3 max-w-md mx-auto">
        {/* Header */}
        <div className="border border-green-500 bg-black/95 p-3 mb-3 shadow-lg shadow-green-500/30 animate-glow">
          <div className="flex items-center gap-2 mb-3">
            <Terminal className="w-6 h-6 animate-pulse" />
            <div className="flex-1">
              <h1 className="text-sm font-bold leading-tight">EFOOTBALL</h1>
              <h2 className="text-xs text-green-300">SERVER ANALYZER</h2>
            </div>
            <div className="text-right">
              <div className="text-xs text-green-300">v5.5</div>
              <div className="text-[10px] text-green-500">PRO</div>
            </div>
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="flex justify-between border-t border-green-500/20 pt-2">
              <span className="text-green-300">YOUR IP:</span>
              <span className="font-bold animate-pulse">{userIP}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-300">LOCATION:</span>
              <span className="font-bold">{userCountry}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-300">ACTIVE USERS:</span>
              <span className="font-bold text-cyan-400">{activeUsers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-300">SERVER TIME:</span>
              <span className="font-bold">{serverTime}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {!connecting && !analyzing && !result && (
          <div className="space-y-3">
            {cooldown > 0 && (
              <div className="border border-red-500 bg-red-500/10 p-4 text-center animate-glow">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="w-5 h-5" />
                  <span className="text-lg font-bold">COOLDOWN ACTIVE</span>
                </div>
                <p className="text-sm">Please wait <span className="font-bold text-xl text-white">{formatTime(cooldown)}</span> before next analysis.</p>
              </div>
            )}
            <button 
              onClick={() => handleServerCheck('Epic')} 
              disabled={cooldown > 0}
              className="w-full bg-purple-600/80 text-white font-bold py-3 rounded-md border-2 border-purple-500 hover:bg-purple-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30 animate-glow"
            >
              <Zap className="w-5 h-5" /> ANALYZE EPIC BOX
            </button>
            <button 
              onClick={() => handleServerCheck('Showtime')} 
              disabled={cooldown > 0}
              className="w-full bg-cyan-600/80 text-white font-bold py-3 rounded-md border-2 border-cyan-500 hover:bg-cyan-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 animate-glow"
            >
              <TrendingUp className="w-5 h-5" /> ANALYZE SHOWTIME BOX
            </button>
          </div>
        )}

        {/* Terminal View */}
        {(connecting || analyzing) && (
          <div ref={terminalRef} className="bg-black/80 border border-green-500/50 p-3 h-64 overflow-y-auto font-mono text-xs shadow-lg shadow-green-500/20 animate-glow-subtle">
            <div className="flex justify-between items-center mb-2 text-gray-400 border-b border-green-500/20 pb-1">
              <span>[ {currentStage} ]</span>
              {connecting && <span className="animate-pulse">Hacking: {Math.round(hackingProgress)}%</span>}
            </div>
            {terminalLines.map((line, index) => (
              <p key={line.id} className={`whitespace-pre-wrap ${line.color}`}>
                <span className="text-gray-500 mr-2">{`> `}</span>{line.text}
              </p>
            ))}
            {analyzing && <div className="w-3 h-3 bg-green-400 animate-pulse mt-2"></div>}
          </div>
        )}

        {/* Result Modal */}
        {showModal && result && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-black/90 border-2 border-green-500/50 rounded-lg p-4 max-w-sm w-full mx-4 shadow-2xl shadow-green-500/30 animate-glow">
              <div className="text-center mb-3 pb-2 border-b border-green-500/20">
                <h3 className="text-xl font-bold text-green-400">ANALYSIS COMPLETE</h3>
                <p className="text-xs text-gray-400">{result.timestamp}</p>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-green-300">BOX TYPE:</span>
                  <span className="font-bold">{result.boxType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-300">LUCK PERCENTAGE:</span>
                  <span className="font-bold text-cyan-400">{result.percent}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-300">SERVER PING:</span>
                  <span className="font-bold">{result.ping}ms</span>
                </div>
                <div className="flex justify-between border-t border-green-500/10 pt-2">
                  <span className="text-green-300">SERVER:</span>
                  <span className="font-bold">{result.server}</span>
                </div>
              </div>

              <div className={`p-3 text-center rounded-md ${result.recommendation.bg} ${result.recommendation.border} border animate-glow ${result.percent < 60 ? 'animate-shake' : ''}`}>
                <div className={`text-4xl mb-2 ${result.percent >= 75 ? 'animate-bounce' : 'animate-pulse'}`}>{result.recommendation.icon}</div>
                <div className={`text-lg font-bold ${result.recommendation.color}`}>{result.recommendation.text}</div>
                <div className="text-xs text-green-300 mt-1">{result.recommendation.subtext}</div>
              </div>

              {isMaintenanceTime() && (
                <button 
                  onClick={openTelegram}
                  className="mt-4 w-full bg-blue-600/80 text-white font-bold py-2 rounded-md border-2 border-blue-500 hover:bg-blue-500 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 animate-glow"
                >
                  Join Telegram Channel
                </button>
              )}

              <button 
                onClick={() => { setShowModal(false); setResult(null); }} 
                className="mt-4 w-full bg-gray-700/80 text-white font-bold py-2 rounded-md border-2 border-gray-600 hover:bg-gray-600 transition-all duration-300"
              >
                CLOSE
              </button>
            </div>
          </div>
        )}

        {/* Live Notifications */}
        <div className="absolute top-3 right-3 space-y-2 w-64 z-20">
          {notifications.map(notif => (
            <div key={notif.id} className="bg-black/80 border border-green-500/30 p-2 rounded-md text-xs animate-slide-in-out shadow-lg shadow-green-500/10">
              <p>User from {notif.country} opened box with <span className="font-bold text-cyan-400">{notif.luckPercent}%</span> luck</p>
              <p className="text-gray-400 text-[10px]">After {notif.attempts} attempt(s) • Just now</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

