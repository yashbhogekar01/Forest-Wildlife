import React, { useState, useEffect } from 'react';
import { 
  Shield, Lock, User, Key, ArrowRight, Sparkles, CheckCircle2, MapPin, Radio, 
  AlertTriangle, Info, HelpCircle, Eye, EyeOff, Building2, Users, RefreshCw, 
  Trees, Phone, FileText, ChevronRight, X, Compass, Globe, Heart, ShieldCheck,
  Send
} from 'lucide-react';

// Authorized Forest Department Officers Registry
const AUTHORIZED_OFFICERS = [
  {
    id: 'PTR-MH-8421',
    aliases: ['ptr-mh-8421', 'rajesh', 'rfo'],
    passwords: ['pench2026', 'rfo123', 'admin'],
    name: 'Dr. Rajesh Sharma',
    designation: 'Range Forest Officer (RFO)',
    role: 'Officer',
    department: 'Range Forest Officer (RFO)',
    sector: 'Pench Tiger Reserve - Maharashtra Sector',
    avatarBg: 'from-amber-500 to-amber-700',
    badgeText: 'COMMAND RFO'
  },
  {
    id: 'PTR-BIO-102',
    aliases: ['ptr-bio-102', 'ananya', 'biologist'],
    passwords: ['bio2026', 'biologist123', 'admin'],
    name: 'Dr. Ananya Roy',
    designation: 'Senior Wildlife Biologist',
    role: 'Biologist',
    department: 'Senior Wildlife Biologist',
    sector: 'Pench Wildlife Research Wing',
    avatarBg: 'from-emerald-600 to-teal-800',
    badgeText: 'RESEARCH'
  },
  {
    id: 'PTR-GUARD-55',
    aliases: ['ptr-guard-55', 'suresh', 'guard'],
    passwords: ['guard123', 'pench123', 'admin'],
    name: 'Suresh Uikey',
    designation: 'Beat Forest Guard',
    role: 'Guard',
    department: 'Beat Forest Guard',
    sector: 'Karmajhiri Core Sector Beat 4',
    avatarBg: 'from-green-600 to-emerald-900',
    badgeText: 'FIELD GUARD'
  },
  {
    id: 'ADMIN',
    aliases: ['admin', 'command'],
    passwords: ['admin', 'admin123', 'pench2026'],
    name: 'HQ Command Admin',
    designation: 'Chief Conservator of Forests',
    role: 'Officer',
    department: 'Chief Conservator of Forests',
    sector: 'Pench HQ Command Centre',
    avatarBg: 'from-slate-700 to-slate-900',
    badgeText: 'ADMIN HQ'
  }
];

export default function LoginPage({ onLogin }) {
  // Role & Form State
  const [loginRole, setLoginRole] = useState('Govt'); // 'Govt' | 'Citizen'
  const [govtDept, setGovtDept] = useState('Range Forest Officer (RFO)');
  const [officialId, setOfficialId] = useState('PTR-MH-8421');
  const [govtPassword, setGovtPassword] = useState('pench2026');
  
  // Citizen Login State
  const [citizenContact, setCitizenContact] = useState('');
  const [citizenPassword, setCitizenPassword] = useState('');
  const [citizenMode, setCitizenMode] = useState('PASSWORD'); // 'PASSWORD' | 'OTP'
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // Common UI State
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showDirectory, setShowDirectory] = useState(false);

  // Dynamic Security Captcha Challenge
  const [captchaNum1, setCaptchaNum1] = useState(7);
  const [captchaNum2, setCaptchaNum2] = useState(4);
  const [captchaInput, setCaptchaInput] = useState('');

  // Modals State
  const [activeModal, setActiveModal] = useState(null); // 'REGISTER' | 'FORGOT' | 'ABOUT' | 'WILDLIFE' | 'CONSERVATION' | 'CONTACT'
  const [regData, setRegData] = useState({ name: '', mobile: '', village: '', email: '', password: '' });

  // Generate new captcha
  const refreshCaptcha = () => {
    setCaptchaNum1(Math.floor(Math.random() * 8) + 2);
    setCaptchaNum2(Math.floor(Math.random() * 8) + 1);
    setCaptchaInput('');
  };

  useEffect(() => {
    refreshCaptcha();
  }, [loginRole]);

  // Government Authority Login Submission
  const handleGovtSubmit = (e) => {
    e?.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Captcha Validation
    if (parseInt(captchaInput, 10) !== (captchaNum1 + captchaNum2)) {
      setErrorMsg(`Security Captcha Failed! Incorrect answer. ${captchaNum1} + ${captchaNum2} = ?`);
      refreshCaptcha();
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const cleanId = (officialId || '').trim().toLowerCase();
      const cleanPass = (govtPassword || '').trim();

      const matchedOfficer = AUTHORIZED_OFFICERS.find(o => 
        (o.id.toLowerCase() === cleanId || o.aliases.includes(cleanId)) &&
        o.passwords.includes(cleanPass)
      );

      if (matchedOfficer) {
        setIsLoading(false);
        setSuccessMsg(`Welcome, ${matchedOfficer.name}! Authenticated as ${matchedOfficer.designation}.`);
        setTimeout(() => {
          onLogin({
            ...matchedOfficer,
            department: govtDept
          });
        }, 600);
      } else {
        setIsLoading(false);
        setErrorMsg('Authentication Failed: Invalid Employee ID or Password. Check credentials or select profile below.');
        refreshCaptcha();
      }
    }, 650);
  };

  // Citizen Login Submission
  const handleCitizenSubmit = (e) => {
    e?.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!citizenContact.trim()) {
      setErrorMsg('Please enter a valid Mobile Number or Email address.');
      return;
    }

    // Captcha Validation
    if (parseInt(captchaInput, 10) !== (captchaNum1 + captchaNum2)) {
      setErrorMsg(`Security Captcha Failed! Incorrect answer. ${captchaNum1} + ${captchaNum2} = ?`);
      refreshCaptcha();
      return;
    }

    if (citizenMode === 'OTP' && !otpSent) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setOtpSent(true);
        setSuccessMsg(`Security OTP sent to ${citizenContact}. Enter OTP 8421 to verify.`);
      }, 700);
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const citizenUser = {
        id: `CTZ-${Math.floor(1000 + Math.random() * 9000)}`,
        name: citizenContact.includes('@') ? citizenContact.split('@')[0] : `Citizen (${citizenContact.slice(-4)})`,
        role: 'Citizen',
        designation: 'Citizen Conservationist & Eco-Volunteer',
        sector: 'Pench Buffer & Village Community Zone',
        contact: citizenContact,
        avatarBg: 'from-amber-600 to-emerald-700'
      };

      setSuccessMsg(`Welcome, ${citizenUser.name}! Logging into Citizen Telemetry Portal...`);
      setTimeout(() => {
        onLogin(citizenUser);
      }, 600);
    }, 600);
  };

  // Instant Officer Autofill
  const handleInstantOfficerLogin = (officer) => {
    setOfficialId(officer.id);
    setGovtPassword(officer.passwords[0]);
    setGovtDept(officer.department);
    setCaptchaInput(`${captchaNum1 + captchaNum2}`);
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      onLogin(officer);
    }, 450);
  };

  // Citizen Self-Registration Handler
  const handleCitizenRegisterSubmit = (e) => {
    e.preventDefault();
    if (!regData.name || !regData.mobile) {
      alert('Please fill in required fields: Name and Mobile Number.');
      return;
    }
    alert(`Registration Successful for ${regData.name}! You can now login with your mobile number: ${regData.mobile}`);
    setCitizenContact(regData.mobile);
    setActiveModal(null);
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col justify-between font-sans overflow-x-hidden selection:bg-emerald-600 selection:text-white bg-emerald-950 text-slate-100">
      
      {/* 🌲 DENSE INDIAN FOREST BACKGROUND VISUAL LAYERS */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 transform scale-105 pointer-events-none z-0"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1561731216-c3a4d99437d5?q=80&w=2000&auto=format&fit=crop')` }}
      />
      
      {/* Dark Forest Green Translucent Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-950/90 via-slate-950/80 to-emerald-900/90 backdrop-blur-[4px] pointer-events-none z-0" />
      
      {/* Sunbeams & Fog Layer */}
      <div className="fixed inset-0 bg-gradient-to-t from-emerald-950/90 via-transparent to-amber-500/10 pointer-events-none z-0" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-400/15 via-transparent to-transparent pointer-events-none z-0" />
      
      {/* Animated Forest Mist & Fog */}
      <div className="fixed inset-0 opacity-30 animate-fog-slide bg-[url('https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=2000&auto=format&fit=crop')] bg-cover mix-blend-overlay pointer-events-none z-0" />

      {/* Floating Micro Forest Particles & Falling Leaves */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-10 left-1/4 text-emerald-400/60 text-sm animate-leaf-fall-1">🍃</div>
        <div className="absolute top-20 right-1/3 text-amber-400/60 text-base animate-leaf-fall-2">🍁</div>
        <div className="absolute top-5 right-1/4 text-emerald-300/50 text-xs animate-leaf-fall-3">🌿</div>
      </div>

      {/* 🐅 TOP HEADER & BRANDING BAR */}
      <header className="relative z-20 w-full border-b border-emerald-500/20 bg-slate-950/85 backdrop-blur-md px-4 sm:px-8 py-3 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3.5">
            <div className="p-1 bg-white/95 border-2 border-amber-400/60 rounded-2xl shadow-lg flex items-center justify-center shrink-0">
              <img 
                src="/pench-logo.jpg" 
                alt="Pench Tiger Reserve Emblem" 
                className="h-10 sm:h-11 w-auto object-contain rounded-xl"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-sm sm:text-base font-black text-amber-400 tracking-wider uppercase">
                  PENCH RAKSHAK PORTAL
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[9px] font-mono font-extrabold bg-emerald-700 text-white rounded border border-emerald-500 uppercase tracking-widest">
                  OFFICIAL FOREST &amp; WILDLIFE PORTAL
                </span>
              </div>
              <p className="text-[11px] text-emerald-200 font-semibold tracking-wide flex items-center gap-1.5 mt-0.5">
                <span>Forest</span> • <span>Wildlife</span> • <span>Conservation</span> • <span>Citizen Engagement</span>
              </p>
            </div>
          </div>

          {/* Top Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-4 text-xs font-bold text-slate-300">
            <button 
              onClick={() => setActiveModal('ABOUT')}
              className="px-3 py-1.5 rounded-xl hover:text-amber-400 hover:bg-emerald-900/50 transition-all"
            >
              About
            </button>
            <button 
              onClick={() => setActiveModal('WILDLIFE')}
              className="px-3 py-1.5 rounded-xl hover:text-amber-400 hover:bg-emerald-900/50 transition-all"
            >
              Wildlife
            </button>
            <button 
              onClick={() => setActiveModal('CONSERVATION')}
              className="px-3 py-1.5 rounded-xl hover:text-amber-400 hover:bg-emerald-900/50 transition-all"
            >
              Conservation
            </button>
            <button 
              onClick={() => setActiveModal('CONTACT')}
              className="px-3 py-1.5 rounded-xl text-amber-400 bg-amber-500/10 border border-amber-400/30 hover:bg-amber-500/20 transition-all flex items-center gap-1"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Contact</span>
            </button>
          </nav>

        </div>
      </header>

      {/* 🌲 MAIN LOGIN SECTION (LEFT INFO PANEL + RIGHT GLASSMORPHISM LOGIN CARD) */}
      <main className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 flex-1 flex flex-col lg:flex-row items-center justify-between gap-8 my-auto">
        
        {/* 🌳 LEFT SIDE: FOREST INFORMATION PANEL */}
        <div className="w-full lg:w-1/2 space-y-6 text-white text-left max-w-xl">
          
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-900/80 border border-emerald-500/40 text-xs text-emerald-300 font-bold tracking-wide uppercase shadow-sm">
              <Trees className="w-4 h-4 text-emerald-400" />
              <span>PENCH TIGER RESERVE • MAHARASHTRA &amp; MP</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-amber-400 tracking-tight leading-tight uppercase drop-shadow-md">
              Protect Our Forests.<br />Protect Our Tigers.
            </h2>

            <p className="text-sm text-slate-200 leading-relaxed font-medium bg-slate-950/40 p-4 rounded-2xl border border-emerald-500/20 backdrop-blur-sm">
              "Technology-driven conservation for a safer and healthier wildlife ecosystem. Powered by AI flank identification, real-time satellite telemetry, and proactive village protection alarms."
            </p>
          </div>

          {/* Three Key Statistics Badge Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Stat 1: Tigers */}
            <div className="bg-slate-900/80 backdrop-blur-md p-3.5 rounded-2xl border border-emerald-500/30 space-y-1 hover:border-amber-400/50 transition-all">
              <div className="flex items-center justify-between text-amber-400 font-bold text-xs">
                <span>🐅 TIGER CONSERVATION</span>
              </div>
              <div className="text-xl font-black text-white font-mono">125 Monitored</div>
              <div className="text-[10px] text-emerald-300 font-medium">Stripe AI Cataloged</div>
            </div>

            {/* Stat 2: Forest Protection */}
            <div className="bg-slate-900/80 backdrop-blur-md p-3.5 rounded-2xl border border-emerald-500/30 space-y-1 hover:border-emerald-400/50 transition-all">
              <div className="flex items-center justify-between text-emerald-400 font-bold text-xs">
                <span>🌲 FOREST PROTECTION</span>
              </div>
              <div className="text-xl font-black text-white font-mono">758 SQ KM</div>
              <div className="text-[10px] text-emerald-300 font-medium">Core Territory Guarded</div>
            </div>

            {/* Stat 3: Citizen Participation */}
            <div className="bg-slate-900/80 backdrop-blur-md p-3.5 rounded-2xl border border-emerald-500/30 space-y-1 hover:border-sky-400/50 transition-all">
              <div className="flex items-center justify-between text-sky-400 font-bold text-xs">
                <span>👥 CITIZEN PARTICIPATION</span>
              </div>
              <div className="text-xl font-black text-white font-mono">4,200+ Volunteers</div>
              <div className="text-[10px] text-sky-300 font-medium">Village Safety Network</div>
            </div>

          </div>

          {/* Official Emergency Contact Banner */}
          <div className="p-3 bg-amber-950/60 border border-amber-500/40 rounded-2xl text-xs text-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-semibold">24x7 Forest Wildlife Patrol Helpline: <strong>1800-233-7000</strong></span>
            </div>
            <span className="text-[10px] font-mono bg-amber-500 text-black font-extrabold px-2 py-0.5 rounded uppercase">TOLL FREE</span>
          </div>

        </div>

        {/* 🔐 RIGHT SIDE: MODERN GLASSMORPHISM LOGIN CARD */}
        <div className="w-full lg:w-1/2 max-w-md">
          <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-2xl border border-emerald-500/40 rounded-3xl shadow-2xl overflow-hidden relative transition-all">
            
            {/* Header Title inside Card */}
            <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white p-6 border-b border-emerald-500/30 text-center relative">
              <span className="px-3 py-0.5 text-[9px] font-mono font-extrabold bg-amber-500 text-black rounded-full uppercase tracking-wider mb-2 inline-block">
                SECURE AUTHENTICATION GATEWAY
              </span>
              <h3 className="text-xl font-extrabold text-white tracking-wide uppercase">
                Welcome to Pench Rakshak
              </h3>
              <p className="text-xs text-emerald-200 font-medium mt-1">
                Secure Access to Forest &amp; Wildlife Management System
              </p>
            </div>

            <div className="p-6 space-y-5 text-slate-800 dark:text-slate-200">

              {/* ROLE SELECTOR: 🏛️ Government Authority vs 👤 Citizen */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Select User Access Role
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => { setLoginRole('Govt'); setErrorMsg(''); setSuccessMsg(''); }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 active:scale-95 ${
                      loginRole === 'Govt'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>🏛️ Govt Authority</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setLoginRole('Citizen'); setErrorMsg(''); setSuccessMsg(''); }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 active:scale-95 ${
                      loginRole === 'Citizen'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>👤 Citizen</span>
                  </button>
                </div>
              </div>

              {/* Alert Error / Success Banners */}
              {errorMsg && (
                <div className="p-3.5 bg-red-50 dark:bg-red-950/80 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-200 rounded-2xl text-xs font-semibold flex items-start gap-2.5 animate-fade-in">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p>{errorMsg}</p>
                  </div>
                </div>
              )}

              {successMsg && (
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 rounded-2xl text-xs font-semibold flex items-start gap-2.5 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 animate-bounce" />
                  <div className="flex-1">
                    <p>{successMsg}</p>
                  </div>
                </div>
              )}

              {/* 🏛️ GOVERNMENT AUTHORITY LOGIN FORM */}
              {loginRole === 'Govt' && (
                <form onSubmit={handleGovtSubmit} className="space-y-4">
                  
                  {/* Department / Designation Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Department / Designation
                    </label>
                    <select
                      value={govtDept}
                      onChange={e => setGovtDept(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Range Forest Officer (RFO)">Range Forest Officer (RFO)</option>
                      <option value="Senior Wildlife Biologist">Senior Wildlife Biologist</option>
                      <option value="Beat Forest Guard">Beat Forest Guard</option>
                      <option value="Chief Conservator of Forests">Chief Conservator of Forests (HQ Admin)</option>
                    </select>
                  </div>

                  {/* Employee / Badge ID */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Official ID / Employee ID
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={officialId}
                        onChange={e => setOfficialId(e.target.value)}
                        placeholder="e.g. PTR-MH-8421 or rfo"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Security Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={govtPassword}
                        onChange={e => setGovtPassword(e.target.value)}
                        placeholder="Enter official password"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
                        title={showPassword ? "Hide Password" : "Show Password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Interactive Security Captcha Box */}
                  <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5 uppercase text-[10px]">
                        <Shield className="w-3.5 h-3.5 text-emerald-600" />
                        Security Captcha Challenge
                      </span>
                      <button
                        type="button"
                        onClick={refreshCaptcha}
                        className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Refresh</span>
                      </button>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="px-3.5 py-1.5 bg-slate-900 text-amber-400 font-mono font-bold text-sm rounded-xl border border-slate-700 tracking-widest select-none shrink-0 shadow-inner">
                        {captchaNum1} + {captchaNum2} = ?
                      </div>
                      <input
                        type="number"
                        required
                        value={captchaInput}
                        onChange={e => setCaptchaInput(e.target.value)}
                        placeholder="Answer"
                        className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Action Buttons: Secure Login & Forgot Password */}
                  <div className="space-y-2 pt-1">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-700/20 hover:shadow-emerald-700/30 transition-all flex items-center justify-center gap-2 active:scale-95 uppercase tracking-wider"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Authenticating Officer...</span>
                        </span>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>Secure Login</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                      <button
                        type="button"
                        onClick={() => setActiveModal('FORGOT')}
                        className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline"
                      >
                        Forgot Password?
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowDirectory(!showDirectory)}
                        className="text-slate-500 dark:text-slate-400 hover:underline flex items-center gap-1 font-semibold text-[11px]"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                        <span>Quick Profiles</span>
                      </button>
                    </div>
                  </div>

                  {/* Security Badge Note */}
                  <div className="text-[11px] font-bold text-slate-500 text-center flex items-center justify-center gap-1 pt-1">
                    <span>🔒 Authorized personnel only</span>
                  </div>

                  {/* Instant Profile Drawer */}
                  {showDirectory && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-2xl space-y-2 text-xs">
                      <div className="flex items-center justify-between text-amber-900 dark:text-amber-200 font-bold border-b border-amber-200/80 pb-1 text-[11px]">
                        <span>Official Test Profiles</span>
                        <span className="text-[9px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-bold">1-Click Login</span>
                      </div>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                        {AUTHORIZED_OFFICERS.map(off => (
                          <button
                            key={off.id}
                            type="button"
                            onClick={() => handleInstantOfficerLogin(off)}
                            className="w-full text-left p-2 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between transition-all group text-[11px]"
                          >
                            <div>
                              <div className="font-bold text-slate-800 dark:text-white group-hover:text-emerald-600">{off.name}</div>
                              <div className="text-[10px] text-slate-500">ID: {off.id} • {off.designation}</div>
                            </div>
                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded shrink-0">Autofill</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                </form>
              )}

              {/* 👤 CITIZEN LOGIN FORM */}
              {loginRole === 'Citizen' && (
                <form onSubmit={handleCitizenSubmit} className="space-y-4">
                  
                  {/* Citizen Contact Field */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Mobile Number / Email
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={citizenContact}
                        onChange={e => setCitizenContact(e.target.value)}
                        placeholder="e.g. 9876543210 or citizen@pench.gov.in"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Mode Toggle: Password vs OTP */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-600 dark:text-slate-400">Authentication Method:</span>
                    <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => { setCitizenMode('PASSWORD'); setOtpSent(false); }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                          citizenMode === 'PASSWORD' ? 'bg-emerald-600 text-white' : 'text-slate-500'
                        }`}
                      >
                        Password
                      </button>
                      <button
                        type="button"
                        onClick={() => setCitizenMode('OTP')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                          citizenMode === 'OTP' ? 'bg-emerald-600 text-white' : 'text-slate-500'
                        }`}
                      >
                        OTP Code
                      </button>
                    </div>
                  </div>

                  {/* Password / OTP Field */}
                  {citizenMode === 'PASSWORD' ? (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={citizenPassword}
                          onChange={e => setCitizenPassword(e.target.value)}
                          placeholder="Enter password"
                          className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                        Enter Security OTP Code {otpSent && "(Demo OTP: 8421)"}
                      </label>
                      <div className="relative">
                        <Send className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required={otpSent}
                          value={otpCode}
                          onChange={e => setOtpCode(e.target.value)}
                          placeholder={otpSent ? "Enter 4-digit OTP (e.g. 8421)" : "Click Send OTP below first"}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Interactive Security Captcha Box */}
                  <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5 uppercase text-[10px]">
                        <Shield className="w-3.5 h-3.5 text-emerald-600" />
                        Captcha Challenge
                      </span>
                      <button
                        type="button"
                        onClick={refreshCaptcha}
                        className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Refresh</span>
                      </button>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="px-3.5 py-1.5 bg-slate-900 text-amber-400 font-mono font-bold text-sm rounded-xl border border-slate-700 tracking-widest select-none shrink-0 shadow-inner">
                        {captchaNum1} + {captchaNum2} = ?
                      </div>
                      <input
                        type="number"
                        required
                        value={captchaInput}
                        onChange={e => setCaptchaInput(e.target.value)}
                        placeholder="Answer"
                        className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Citizen Login Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-700/20 hover:shadow-emerald-700/30 transition-all flex items-center justify-center gap-2 active:scale-95 uppercase tracking-wider"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying Citizen...</span>
                      </span>
                    ) : (
                      <>
                        <User className="w-4 h-4" />
                        <span>{citizenMode === 'OTP' && !otpSent ? 'Send Security OTP' : 'Citizen Login'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Registration Link */}
                  <div className="pt-2 text-center text-xs">
                    <button
                      type="button"
                      onClick={() => setActiveModal('REGISTER')}
                      className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline"
                    >
                      New citizen? Register here →
                    </button>
                  </div>

                </form>
              )}

            </div>
          </div>
        </div>

      </main>

      {/* 🌿 FOOTER BAR */}
      <footer className="relative z-20 w-full bg-slate-950/90 border-t border-emerald-500/20 text-slate-400 text-xs py-4 px-4 sm:px-8 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          
          <div className="space-y-0.5">
            <div className="font-extrabold text-amber-400 tracking-wider uppercase text-xs flex items-center justify-center sm:justify-start gap-2">
              <span>Protect</span> • <span>Monitor</span> • <span>Preserve</span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium">
              Tiger Reserve Forest &amp; Wildlife Management Portal
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
            <button onClick={() => setActiveModal('ABOUT')} className="hover:text-emerald-400 transition-colors">Privacy Policy</button>
            <span>|</span>
            <button onClick={() => setActiveModal('ABOUT')} className="hover:text-emerald-400 transition-colors">Accessibility</button>
            <span>|</span>
            <button onClick={() => setActiveModal('CONTACT')} className="hover:text-emerald-400 transition-colors">Contact Forest Department</button>
          </div>

          <div className="text-[11px] font-mono text-slate-500">
            © 2026 Forest &amp; Wildlife Management System
          </div>

        </div>
      </footer>

      {/* 📜 MODALS LAYER */}

      {/* 1. CITIZEN REGISTRATION MODAL */}
      {activeModal === 'REGISTER' && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 max-w-md w-full text-white space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-amber-400 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Citizen Portal Registration
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCitizenRegisterSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1 text-[10px]">Full Name</label>
                <input
                  type="text"
                  required
                  value={regData.name}
                  onChange={e => setRegData({...regData, name: e.target.value})}
                  placeholder="e.g. Ramesh Patel"
                  className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1 text-[10px]">Mobile Number</label>
                <input
                  type="text"
                  required
                  value={regData.mobile}
                  onChange={e => setRegData({...regData, mobile: e.target.value})}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1 text-[10px]">Village / Town / City</label>
                <input
                  type="text"
                  value={regData.village}
                  onChange={e => setRegData({...regData, village: e.target.value})}
                  placeholder="e.g. Turia Village, Buffer Zone"
                  className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1 text-[10px]">Set Account Password</label>
                <input
                  type="password"
                  required
                  value={regData.password}
                  onChange={e => setRegData({...regData, password: e.target.value})}
                  placeholder="Create password"
                  className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow"
                >
                  Register Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. FORGOT PASSWORD MODAL */}
      {activeModal === 'FORGOT' && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 max-w-md w-full text-white space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-amber-400 flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Password Recovery Gateway
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                Enter your Official Employee ID or registered mobile number to receive a security reset link via Range Control.
              </p>
              <input
                type="text"
                placeholder="Enter Official ID (e.g. PTR-MH-8421)"
                className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-white font-bold"
              />
              <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-[11px] text-emerald-300 font-medium">
                💡 Demo Access Tip: Use default password <strong>pench2026</strong> or select 1-click test profiles.
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow"
                >
                  Close &amp; Return
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTACT MODAL */}
      {activeModal === 'CONTACT' && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full text-white space-y-4 shadow-2xl relative font-sans">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-amber-400 flex items-center gap-2">
                <Phone className="w-5 h-5 text-emerald-400" />
                Pench Reserve Control Room &amp; Contacts
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs font-medium">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Field Director Office</div>
                  <div className="text-[10px] text-slate-400">Civil Lines, Nagpur, MH - 440001</div>
                </div>
                <div className="font-mono font-bold text-amber-400">+91 712 256-4200</div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">24x7 Wildlife Emergency Rescue</div>
                  <div className="text-[10px] text-slate-400">Rapid Response Unit (Toll-Free)</div>
                </div>
                <div className="font-mono font-bold text-emerald-400">1800-233-7000</div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Karmajhiri Core Range Officer</div>
                  <div className="text-[10px] text-slate-400">Main Gate Telemetry HQ</div>
                </div>
                <div className="font-mono font-bold text-sky-400">+91 712 256-4201</div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Turia &amp; Khawasa Buffer Alarm</div>
                  <div className="text-[10px] text-slate-400">Human-Wildlife Proximity Unit</div>
                </div>
                <div className="font-mono font-bold text-teal-400">+91 712 256-4205</div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Official Email &amp; Radio Frequency</div>
                <div className="font-mono text-xs text-amber-300 font-bold mt-0.5">fd.pench.mh@maharashtra.gov.in • VHF Ch-04 (154.250 MHz)</div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-slate-800 text-slate-200 font-bold rounded-xl hover:bg-slate-700"
              >
                Close Directory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ABOUT MODAL */}
      {activeModal === 'ABOUT' && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 max-w-xl w-full text-white space-y-4 shadow-2xl relative font-sans max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-amber-400 flex items-center gap-2">
                <Trees className="w-5 h-5 text-emerald-400" />
                About Pench Tiger Reserve &amp; Geography
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                <strong>Pench Tiger Reserve</strong> nestles in the southern reaches of the Satpura hill ranges along the border of Maharashtra and Madhya Pradesh in Central India. Named after the pristine <strong>Pench River</strong> flowing north to south through the heart of the sanctuary, it covers <strong>1,179 km²</strong> (411 km² Core Critical Habitat + 768 km² Buffer Zone).
              </p>
              
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="font-bold text-amber-300 text-xs uppercase">📖 Inspiration for Kipling's Jungle Book</div>
                <p className="text-[11px] text-slate-300">
                  The dense teak canopy and granite outcrops of Pench were made immortal by Rudyard Kipling's 1894 classic <em>The Jungle Book</em>, serving as the real-world habitat for Mowgli, Akela the Seeonee wolf pack leader, and Sher Khan.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="font-bold text-emerald-400 block">Core Area</span>
                  <span className="text-slate-300">411.33 sq km (Zero-disturbance zone)</span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="font-bold text-teal-400 block">Buffer Area</span>
                  <span className="text-slate-300">768.30 sq km (Eco-sensitive border)</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WILDLIFE MODAL */}
      {activeModal === 'WILDLIFE' && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 max-w-xl w-full text-white space-y-4 shadow-2xl relative font-sans max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-amber-400 flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-400" />
                Pench Wildlife &amp; Biodiversity Catalog
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-2xl space-y-1">
                <div className="font-bold text-amber-400 text-xs uppercase">🐅 Royal Bengal Tiger (Panthera tigris tigris)</div>
                <p className="text-[11px] text-amber-200">
                  Home to over <strong>120+ tigers</strong> with a dense population of ~10 tigers per 100 sq km. Famous legendary matriarchs include <em>Collarwali (T-15)</em> who birthed a world-record 29 cubs over 8 litters.
                </p>
              </div>

              <div className="space-y-2">
                <div className="font-bold text-emerald-400 text-xs uppercase">Key Mammals &amp; Co-predators:</div>
                <p className="text-[11px] text-slate-300">
                  Indian Leopard, Sloth Bear, Dhole (Asiatic Wild Dog), Gaur (Indian Bison), Sambar Deer, Chital (Spotted Deer), Barking Deer, Four-horned Antelope (Chausingha), Wild Boar, Nilgai, and Golden Jackal.
                </p>
              </div>

              <div className="space-y-2">
                <div className="font-bold text-sky-400 text-xs uppercase">Avifauna (285+ Bird Species):</div>
                <p className="text-[11px] text-slate-300">
                  Malabar Pied Hornbill, Crested Serpent Eagle, Changeable Hawk-Eagle, Mottled Wood Owl, Indian Peafowl, Orange-headed Thrush, Osprey, and Pied Kingfisher.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONSERVATION MODAL */}
      {activeModal === 'CONSERVATION' && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 max-w-xl w-full text-white space-y-4 shadow-2xl relative font-sans max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-emerald-400 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Pench Forest Conservation &amp; AI Tech
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                Declared a <strong>Project Tiger Reserve</strong> in 1992, Pench has earned top honours in Management Effectiveness Evaluation (MEE) awarded by the Ministry of Environment, Forest and Climate Change.
              </p>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="font-bold text-emerald-400 uppercase text-xs">🔬 AI-Driven Forest Protection Suite:</div>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300">
                  <li><strong>AI Flank Biometric Pattern Matching:</strong> SHA-256 stripe vector hashing for automated re-identification.</li>
                  <li><strong>Village Proximity Siren Alarm:</strong> Acoustic warning sirens at buffer boundaries when tigers move within 350m of villages.</li>
                  <li><strong>Thermal Drone Monitoring:</strong> Nighttime thermal aerial sweeps over corridor choke points.</li>
                  <li><strong>Health &amp; Disease Surveillance:</strong> Intensive CDV (Canine Distemper) vaccination drives for domestic dogs in perimeter buffer villages.</li>
                </ul>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
