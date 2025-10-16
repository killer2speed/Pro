import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Wifi, Globe, Users, Activity, Clock, Zap, TrendingUp, Lock, Shield, CheckCircle, AlertCircle, Cpu, Database, Server } from 'lucide-react';
import './App.css';

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
  const canvasRef = useRef(null);
  const terminalRef = useRef(null);

  const countries = ['Egypt 🇪🇬', 'Saudi Arabia 🇸🇦', 'UAE 🇦🇪', 'Morocco 🇲🇦', 'Jordan 🇯🇴', 'Iraq 🇮🇶', 'Kuwait 🇰🇼', 'Lebanon 🇱🇧', 'Tunisia 🇹🇳'];

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

  // Fetch real IP and country
  useEffect(() => {
    const fetchIPInfo = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        setUserIP(data.ip || 'Unknown');
        
        const countryMap = {
          'EG': 'Egypt 🇪🇬',
          'SA': 'Saudi Arabia 🇸🇦',
          'AE': 'UAE 🇦🇪',
          'MA': 'Morocco 🇲🇦',
          'JO': 'Jordan 🇯🇴',
          'IQ': 'Iraq 🇮🇶',
          'KW': 'Kuwait 🇰🇼',
          'LB': 'Lebanon 🇱🇧',
          'TN': 'Tunisia 🇹🇳'
        };
        
        setUserCountry(countryMap[data.country_code] || `${data.country_name} ${data.country_code}`);
      } catch (error) {
        const randomIP = `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
        setUserIP(randomIP);
        setUserCountry(countries[Math.floor(Math.random() * countries.length)]);
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
      const randomCountry = countries[Math.floor(Math.random() * countries.length)];
      const attempts = Math.floor(Math.random() * 5) + 1;
      const luckPercent = Math.floor(Math.random() * 30) + 70;
      
      const newNotif = {
        id: Date.now(),
        country: randomCountry,
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
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
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

  const getSmartResult = () => {
    if (lastResult && lastResult < 60) {
      const random = Math.random();
      if (random < 0.6) {
        return Math.floor(Math.random() * 40) + 20;
      } else {
        return Math.floor(Math.random() * 10) + 60;
      }
    }
    
    if (lastResult && lastResult >= 60 && lastResult < 75) {
      const random = Math.random();
      if (random < 0.4) {
        return Math.floor(Math.random() * 40) + 30;
      } else if (random < 0.8) {
        return Math.floor(Math.random() * 20) + 60;
      } else {
        return Math.floor(Math.random() * 15) + 75;
      }
    }

    if (lastResult && lastResult >= 75) {
      const random = Math.random();
      if (random < 0.5) {
        return Math.floor(Math.random() * 20) + 55;
      } else {
        return Math.floor(Math.random() * 15) + 75;
      }
    }

    const random = Math.random();
    if (random < 0.5) {
      return Math.floor(Math.random() * 40) + 20;
    } else if (random < 0.85) {
      return Math.floor(Math.random() * 15) + 60;
    } else {
      return Math.floor(Math.random() * 15) + 75;
    }
  };

  const handleServerCheck = async (type) => {
    if (cooldown > 0) return;

    playBeep(1000, 100);
    setBoxType(type);
    setConnecting(true);
    setResult(null);
    setServerPercent(0);
    setPing(0);
    setTerminalLines([]);
    setHackingProgress(0);
    setAnalyzing(false);
    setShowResultAnimation(false);

    setCurrentStage('INITIATING BREACH PROTOCOL...');
    await new Promise(resolve => setTimeout(resolve, 1500));

    const totalDuration = Math.floor(Math.random() * 20000) + 25000;
    const startTime = Date.now();

    const hackingStages = [
      {
        messages: [
          '> [BREACH] Initializing neural network connection...',
          `> [SCAN] Probing eFootball game servers across ${Math.floor(Math.random() * 15) + 8} regions...`,
          `> [DETECT] Located ${Math.floor(Math.random() * 12) + 5} active game nodes`,
          `> [TARGET] Primary server: ${generateRandomIP()} | Port: ${Math.floor(Math.random() * 9000) + 1000}`,
          `> [HANDSHAKE] Establishing encrypted socket tunnel...`,
          `> [SUCCESS] Connection established | Latency: ${Math.floor(Math.random() * 30) + 15}ms`,
        ]
      },
      {
        messages: [
          '> [FIREWALL] Detecting security layers...',
          `> [IDENTIFY] Firewall: ${['Fortinet FortiGate Pro', 'Cisco ASA 5585-X', 'pfSense Enterprise', 'Cloudflare Magic Transit'][Math.floor(Math.random() * 4)]}`,
          `> [EXPLOIT] Injecting polymorphic bypass packets...`,
          `> [SCAN] Port range [${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}] | Status: SCANNING`,
          `> [BREACH] Port ${Math.floor(Math.random() * 9000) + 1000} OPEN | Vulnerability detected`,
          `> [BYPASS] Firewall penetration: COMPLETE ✓`,
          `> [STEALTH] Masking traffic signature...`,
        ]
      },
      {
        messages: [
          '> [CRYPTO] Encryption layer detected...',
          `> [ANALYZE] Protocol: AES-256-GCM + RSA-4096 + SHA-512`,
          `> [CRACK] Generating quantum decryption keys...`,
          `> [KEY] Hash: 0x${generateRandomHash()}`,
          `> [HANDSHAKE] Performing RSA key exchange...`,
          `> [TUNNEL] SSL/TLS secure channel established ✓`,
          `> [VERIFY] Certificate chain validated`,
        ]
      },
      {
        messages: [
          '> [DATABASE] Accessing eFootball game database...',
          `> [AUTH] Token: Bearer ${generateRandomHash().substring(0, 12)}`,
          `> [SESSION] ID: ${generateRandomHash().substring(0, 8).toUpperCase()}`,
          `> [QUERY] SELECT * FROM luck_algorithms WHERE box_type="${type}"`,
          `> [RESPONSE] 200 OK | ${Math.floor(Math.random() * 3000) + 1000} records retrieved`,
          `> [METRICS] Reading real-time server load data...`,
          `> [SYNC] Synchronizing with game master server...`,
        ]
      },
      {
        messages: [
          `> [ANALYZE] Processing ${type} BOX probability matrices...`,
          `> [FETCH] Downloading luck algorithm parameters...`,
          `> [COMPUTE] Analyzing ${Math.floor(Math.random() * 5000) + 2000} data points`,
          `> [PREDICT] Calculating optimal box opening window...`,
          `> [CORRELATE] Cross-referencing with live player data...`,
          `> [ML] Running machine learning prediction model...`,
          `> [COMPLETE] Data analysis: FINISHED ✓`,
        ]
      }
    ];

    const stageTime = totalDuration / hackingStages.length;

    for (let i = 0; i < hackingStages.length; i++) {
      const stage = hackingStages[i];
      
      for (let j = 0; j < stage.messages.length; j++) {
        const elapsed = Date.now() - startTime;
        const progress = (elapsed / totalDuration) * 100;
        setHackingProgress(Math.min(progress, 99));
        
        await addTerminalLineWithTyping(stage.messages[j]);
        await new Promise(resolve => setTimeout(resolve, stageTime / stage.messages.length - 500));
      }
    }

    setHackingProgress(100);
    playBeep(1200, 150);
    setConnecting(false);
    setAnalyzing(true);

    setCurrentStage('FINALIZING ANALYSIS...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    const finalPercent = getSmartResult();
    const finalPing = Math.floor(Math.random() * 40) + 45;

    setServerPercent(finalPercent);
    setPing(finalPing);

    await new Promise(resolve => setTimeout(resolve, 1000));

    const servers = [
      'FRANKFURT-DE03',
      'LONDON-UK01', 
      'PARIS-FR02',
      'AMSTERDAM-NL01',
      'MADRID-ES04',
      'MILAN-IT02'
    ];

    const recommendation = finalPercent < 60 
      ? { icon: '⚠️', text: 'POOR LUCK - POSTPONE OPENING', subtext: 'Server congestion detected. Try again later.', color: 'text-red-400', border: 'border-red-500', bg: 'bg-red-500/10' }
      : finalPercent < 75
      ? { icon: '✓', text: 'MODERATE LUCK - YOU MAY TRY', subtext: 'Acceptable conditions. Proceed with caution.', color: 'text-yellow-400', border: 'border-yellow-500', bg: 'bg-yellow-500/10' }
      : { icon: '★', text: 'EXCELLENT LUCK - OPEN NOW!', subtext: 'Optimal server conditions detected!', color: 'text-green-400', border: 'border-green-500', bg: 'bg-green-500/10' };

    // Play result sound
    if (finalPercent >= 75) {
      playSuccessSound();
    } else if (finalPercent < 60) {
      playErrorSound();
    } else {
      playBeep(800, 200);
    }

    setShowResultAnimation(true);
    setResult({
      server: servers[Math.floor(Math.random() * servers.length)],
      percent: finalPercent,
      ping: finalPing,
      recommendation,
      boxType: type,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
    });

    setLastResult(finalPercent);
    setAnalyzing(false);
    setCooldown(180);

    setTimeout(() => {
      setShowModal(true);
    }, 10000);
  };

  const openTelegram = () => {
    window.open('https://t.me/pes224', '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <Terminal className="w-16 h-16 text-green-400 mx-auto animate-bounce" />
          </div>
          <div className="text-green-400 text-2xl font-bold mb-2 animate-pulse">EFOOTBALL ANALYZER</div>
          <div className="text-green-300 text-sm animate-pulse">Initializing secure connection...</div>
          <div className="mt-4 flex justify-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-400 relative overflow-hidden font-mono">
      <canvas ref={canvasRef} className="fixed inset-0 opacity-10" />
      
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/5 to-transparent animate-scan" />
      </div>

      {/* Scan lines effect */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 65, 0.1) 2px, rgba(0, 255, 65, 0.1) 4px)'
        }} />
      </div>

      {/* Success Notifications */}
      <div className="fixed top-2 left-2 right-2 z-50 space-y-2">
        {notifications.map((notif) => (
          <div 
            key={notif.id}
            className="bg-green-900/90 border border-green-500 p-2 text-xs animate-slideIn backdrop-blur-sm shadow-lg shadow-green-500/50"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400 animate-pulse" />
              <div className="flex-1">
                <div className="text-green-300">
                  User from <span className="font-bold">{notif.country}</span> opened box with <span className="font-bold text-yellow-400">{notif.luckPercent}% luck</span>
                </div>
                <div className="text-green-500 text-[10px]">After {notif.attempts} attempt(s) • Just now</div>
              </div>
            </div>
          </div>
        ))}
      </div>

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
              <div className="text-xs text-green-300">v5.3</div>
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
          </div>
        </div>

        {/* Action Buttons */}
        {!connecting && !analyzing && !result && (
          <div className="space-y-3">
            {cooldown > 0 && (
              <div className="border border-red-500 bg-red-500/10 p-4 text-center animate-glow">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="w-5 h-5 animate-spin text-red-400" />
                  <span className="text-red-400 font-bold">COOLDOWN ACTIVE</span>
                </div>
                <div className="text-3xl font-mono text-red-400 animate-pulse">{formatTime(cooldown)}</div>
                <div className="text-xs text-red-300 mt-1">Next analysis available in...</div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={async () => {
                  if (cooldown > 0) return;
                  setQuickScanEpic(true);
                  playBeep(1200, 100);
                  await new Promise(resolve => setTimeout(resolve, 1500));
                  setQuickScanEpic(false);
                  handleServerCheck('EPIC');
                }}
                disabled={cooldown > 0}
                className={`border-2 p-3 font-bold text-xs transition-all ${
                  cooldown > 0
                    ? 'border-gray-600 text-gray-600 cursor-not-allowed opacity-50'
                    : quickScanEpic
                    ? 'border-yellow-500 text-yellow-400 bg-yellow-500/30 animate-wiggle animate-yellowGlow'
                    : 'border-orange-500 text-orange-400 hover:bg-orange-500/20 hover:shadow-lg hover:shadow-orange-500/50 active:scale-95'
                }`}
              >
                <Cpu className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleServerCheck('EPIC')}
                disabled={cooldown > 0}
                className={`flex-1 border-2 p-4 font-bold text-sm transition-all ${
                  cooldown > 0
                    ? 'border-gray-600 text-gray-600 cursor-not-allowed opacity-50'
                    : 'border-orange-500 text-orange-400 hover:bg-orange-500/20 hover:shadow-lg hover:shadow-orange-500/50 active:scale-95 animate-glow'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5" />
                  <span>EPIC BOX SCAN</span>
                </div>
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={async () => {
                  if (cooldown > 0) return;
                  setQuickScanShowtime(true);
                  playBeep(1200, 100);
                  await new Promise(resolve => setTimeout(resolve, 1500));
                  setQuickScanShowtime(false);
                  handleServerCheck('SHOWTIME');
                }}
                disabled={cooldown > 0}
                className={`border-2 p-3 font-bold text-xs transition-all ${
                  cooldown > 0
                    ? 'border-gray-600 text-gray-600 cursor-not-allowed opacity-50'
                    : quickScanShowtime
                    ? 'border-yellow-500 text-yellow-400 bg-yellow-500/30 animate-wiggle animate-yellowGlow'
                    : 'border-pink-500 text-pink-400 hover:bg-pink-500/20 hover:shadow-lg hover:shadow-pink-500/50 active:scale-95'
                }`}
              >
                <Database className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleServerCheck('SHOWTIME')}
                disabled={cooldown > 0}
                className={`flex-1 border-2 p-4 font-bold text-sm transition-all ${
                  cooldown > 0
                    ? 'border-gray-600 text-gray-600 cursor-not-allowed opacity-50'
                    : 'border-pink-500 text-pink-400 hover:bg-pink-500/20 hover:shadow-lg hover:shadow-pink-500/50 active:scale-95 animate-glow'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Activity className="w-5 h-5" />
                  <span>SHOWTIME BOX SCAN</span>
                </div>
              </button>
            </div>

            <button
              onClick={openTelegram}
              className="w-full border border-cyan-500 text-cyan-400 hover:bg-cyan-500/20 p-3 text-sm font-bold transition-all hover:shadow-lg hover:shadow-cyan-500/50 active:scale-95"
            >
              <div className="flex items-center justify-center gap-2">
                <Globe className="w-4 h-4" />
                <span>JOIN TELEGRAM CHANNEL</span>
              </div>
            </button>
          </div>
        )}

        {/* Connecting Phase */}
        {connecting && (
          <div className="border-2 border-green-500 bg-black/95 p-4 shadow-lg shadow-green-500/30 animate-glow">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 animate-pulse text-cyan-400" />
                  <span className="text-xs font-bold text-cyan-300 animate-pulse">{currentStage}</span>
                </div>
                <span className="text-xs text-green-300 font-bold">{Math.floor(hackingProgress)}%</span>
              </div>
              <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 via-cyan-500 to-green-500 transition-all duration-500 ease-out animate-pulse"
                  style={{ width: `${hackingProgress}%` }}
                />
              </div>
            </div>
            <div 
              ref={terminalRef}
              className="bg-black/80 border border-green-500/20 p-3 h-56 overflow-y-auto space-y-1 text-xs custom-scrollbar"
            >
              {terminalLines.map(line => (
                <div key={line.id} className={`${line.color} animate-fadeIn font-mono`}>{line.text}</div>
              ))}
              <div className="animate-pulse text-green-400">▊</div>
            </div>
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-cyan-400">
              <Lock className="w-4 h-4 animate-spin" />
              <span className="animate-pulse">ENCRYPTED CONNECTION ACTIVE</span>
            </div>
          </div>
        )}

        {/* Analyzing Phase */}
        {analyzing && (
          <div className="border-2 border-yellow-500 bg-black/95 p-4 shadow-lg shadow-yellow-500/30 animate-bg-pulse">
            <div className="text-yellow-400 text-center text-sm font-bold mb-4 animate-pulse">
              {currentStage}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-yellow-500/50 p-3 text-center bg-yellow-500/5 animate-glow">
                <TrendingUp className="w-6 h-6 mx-auto mb-1 text-yellow-400 animate-bounce" />
                <div className="text-yellow-300 text-xs mb-1">LUCK %</div>
                <div className="text-3xl font-bold tabular-nums text-yellow-400 animate-pulse">{serverPercent}%</div>
              </div>
              <div className="border border-yellow-500/50 p-3 text-center bg-yellow-500/5 animate-glow">
                <Wifi className="w-6 h-6 mx-auto mb-1 text-yellow-400 animate-bounce" />
                <div className="text-yellow-300 text-xs mb-1">PING</div>
                <div className="text-3xl font-bold tabular-nums text-yellow-400 animate-pulse">{ping}ms</div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-yellow-400">
              <Activity className="w-4 h-4 animate-spin" />
              <span className="animate-pulse">ANALYZING DATA STREAMS</span>
            </div>
          </div>
        )}

        {/* Result Phase */}
        {result && (
          <div className={`border-2 ${result.recommendation.border} bg-black/95 p-4 shadow-lg ${result.recommendation.border.replace('border-', 'shadow-')}/30 ${showResultAnimation ? 'animate-zoomIn' : ''}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-400 animate-pulse" />
                <span className="text-sm font-bold text-green-300">ANALYSIS COMPLETE</span>
              </div>
              <span className="text-xs text-green-300">{result.timestamp}</span>
            </div>
            <div className="space-y-2 text-xs mb-3 animate-slideUp">
              <div className="flex justify-between border-t border-green-500/10 pt-2">
                <span className="text-green-300">SERVER:</span>
                <span className="font-bold">{result.server}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-300">LUCK PERCENTAGE:</span>
                <span className="font-bold text-cyan-400">{result.percent}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-300">PING:</span>
                <span className="font-bold">{result.ping}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-300">BOX TYPE:</span>
                <span className="font-bold">{result.boxType}</span>
              </div>
            </div>
            <div className={`p-3 text-center rounded-md ${result.recommendation.bg} ${result.recommendation.border} border animate-glow ${result.percent < 60 ? 'animate-shake' : ''}`}>
              <div className={`text-4xl mb-2 ${result.percent >= 75 ? 'animate-bounce' : 'animate-pulse'}`}>{result.recommendation.icon}</div>
              <div className={`text-lg font-bold ${result.recommendation.color}`}>{result.recommendation.text}</div>
              <div className="text-xs text-green-300 mt-1">{result.recommendation.subtext}</div>
            </div>
            <button onClick={() => setResult(null)} className="w-full border border-green-500 text-green-400 hover:bg-green-500/20 p-3 text-sm font-bold transition-all mt-3 hover:shadow-lg hover:shadow-green-500/50 active:scale-95">
              <span>NEW ANALYSIS</span>
            </button>
          </div>
        )}

        {/* Modal */}
        {showModal && result && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className={`p-6 rounded-lg shadow-2xl max-w-sm w-full text-center border-2 ${result.recommendation.border} ${result.recommendation.bg} animate-zoomIn`}>
              <div className={`text-6xl mb-4 ${result.percent >= 75 ? 'animate-bounce' : 'animate-pulse'}`}>{result.recommendation.icon}</div>
              <h3 className={`text-2xl font-bold mb-2 ${result.recommendation.color}`}>{result.recommendation.text}</h3>
              <p className="text-green-300 mb-4">{result.recommendation.subtext}</p>
              <button onClick={() => setShowModal(false)} className="w-full border border-green-500 text-green-400 hover:bg-green-500/20 p-3 text-sm font-bold transition-all hover:shadow-lg hover:shadow-green-500/50 active:scale-95">
                <span>CLOSE</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
      </div>
    </div>
  );
}

