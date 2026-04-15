import React, { useState, useRef, useEffect } from 'react';
import { Download, Upload, Plus, Trash2, User, BookOpen, Star, Briefcase, Award, Settings, Sparkles, Loader2, LogOut } from 'lucide-react';

// Fungsi format tanggal (ex: 2000-01-15 -> 15 Januari 2000)
const formatTanggalIndo = (dateStr) => {
  if (!dateStr) return '';
  const bulanArr = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getDate()} ${bulanArr[d.getMonth()]} ${d.getFullYear()}`;
};

const App = () => {
  // --- STATE AUTENTIKASI & SPLASH ---
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    nama: '',
    asal: '',
    confirmPassword: ''
  });

  // --- STATE CV BUILDER ---
  const [photoDataUrl, setPhotoDataUrl] = useState(null);
  const cvRef = useRef(null);
  const [loadingAI, setLoadingAI] = useState({});

  const [cvData, setCvData] = useState({
    summaryId: '',
    personal: {
      name: '',
      dob: '',
      nationality: 'Indonesia',
      phone: '',
      email: '',
      address: ''
    },
    summary: 'باحث علمي متميز، لديه خلفية قوية في العلوم الشرعية واللغة العربية، حاصل على عدة جوائز في المسابقات القرآنية والدولية.\nDedicated scholar with a strong background in Islamic sciences and Arabic language. Recipient of several awards in Quranic and international competitions.',
    education: [
      {
        id: 1, textId: '', year: '2019 - 2022',
        institutionAr: 'المدرسة الثانوية الإسلامية', institutionEn: 'Islamic Senior High School',
        degreeAr: 'الثانوية العامة - القسم الشرعي', degreeEn: 'High School Diploma - Religious Major',
        gpa: '95/100 (ممتاز)'
      }
    ],
    religious: [
      {
        id: 1, textId: '', titleAr: 'حفظ القرآن الكريم', titleEn: 'Quran Memorization',
        descAr: 'حاصل على إجازة في حفظ القرآن الكريم برواية حفص عن عاصم.', descEn: 'Certified in Quran memorization (Hafizh) with Sanad/Ijazah.'
      },
      {
        id: 2, textId: '', titleAr: 'العلوم الشرعية', titleEn: 'Islamic Sciences',
        descAr: 'دراسة متعمقة في الفقه، التفسير، والحديث تحت إشراف مشايخ معتمدين.', descEn: 'In-depth study of Fiqh, Tafsir, and Hadith under certified scholars.'
      }
    ],
    awards: [
      {
        id: 1, textId: '', year: '2021', titleAr: 'المركز الأول في مسابقة حفظ القرآن', titleEn: '1st Place in National Quran Memorization Competition',
        descAr: 'على المستوى الوطني، وزارة الشؤون الدينية', descEn: 'At the national level, Ministry of Religious Affairs'
      }
    ],
    experience: [
      {
        id: 1, textId: '', year: '2020 - 2022', roleAr: 'إمام وخطيب', roleEn: 'Imam and Khatib',
        orgAr: 'مسجد النور', orgEn: 'An-Nur Mosque',
        descAr: 'إمامة الصلوات وإلقاء خطب الجمعة وتدريس العلوم الإسلامية الأساسية.', descEn: 'Leading prayers, delivering Friday sermons, and teaching basic Islamic sciences.'
      }
    ],
    skills: {
      arabic: 'ممتاز / Fluent', english: 'جيد جداً / Very Good',
      tech: 'إتقان تطبيقات الحاسب الآلي / Proficient in MS Office', soft: 'القيادة، العمل الجماعي / Leadership, Teamwork'
    }
  });

  // --- EFEK & LOADERS ---
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    script.async = true;
    document.body.appendChild(script);
    
    // Safety check for cleanup to prevent errors in some React environments
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // --- LOGIC AUTENTIKASI API GOOGLE APPS SCRIPT ---
  const webAppUrl = "https://script.google.com/macros/s/AKfycbzrVhJu_vO6lYUqBUvYSAVjDLDCH31rFwULqyjDBLdPtuFTnl9fmoFl1zUmGvya8Tek/exec";

  const handleAuth = async () => {
    if (authMode === 'register') {
      if (!authForm.nama || !authForm.asal || !authForm.email || !authForm.password || !authForm.confirmPassword) {
         alert("Mohon lengkapi semua form pendaftaran!");
         return;
      }
      if (authForm.password !== authForm.confirmPassword) {
         alert("Kata sandi tidak cocok!");
         return;
      }
    } else {
      if (!authForm.email || !authForm.password) {
         alert("Mohon isi Email dan Kata Sandi.");
         return;
      }
    }

    setIsAuthLoading(true);

    try {
      const response = await fetch(webAppUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: 'handleAuth',
          data: {
            mode: authMode,
            email: authForm.email,
            password: authForm.password,
            nama: authForm.nama,
            asal: authForm.asal
          }
        })
      });

      const res = await response.json();

      if (res.success) {
        setUser(res.user);
        
        const dbData = res.data || {};
        setCvData(prev => ({
          ...prev,
          personal: {
            ...prev.personal,
            name: dbData.nama_lengkap_id || authForm.nama || '',
            dob: formatTanggalIndo(dbData.tgl_lahir_id),
            email: res.user.email,
            address: dbData.domisili || authForm.asal || ''
          }
        }));
      } else {
        alert(res.msg || "Gagal otentikasi. Silakan periksa kembali data Anda.");
      }
    } catch (err) {
      console.error("Auth Error:", err);
      alert("Sistem Error: Gagal menghubungkan ke server keamanan.");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login');
    setAuthForm({ email: '', password: '', nama: '', asal: '', confirmPassword: '' });
  };

  const handleLogout = () => {
    setUser(null);
  };

  // --- LOGIC CV BUILDER ---
  const fetchWithRetry = async (url, options, retries = 5) => {
    const delays = [1000, 2000, 4000, 8000, 16000];
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
      } catch (err) {
        if (i === retries - 1) throw err;
        await new Promise(resolve => setTimeout(resolve, delays[i]));
      }
    }
  };

  const handleAITranslate = async (section, id = null) => {
    let textToTranslate = '';
    let schema = {};
    const loadingKey = id ? `${section}-${id}` : section;

    if (section === 'summary') {
      textToTranslate = cvData.summaryId;
      schema = { type: "OBJECT", properties: { arabic: { type: "STRING" }, english: { type: "STRING" } } };
    } else {
      const item = cvData[section].find(i => i.id === id);
      textToTranslate = item.textId;
      if (section === 'education') {
        schema = { type: "OBJECT", properties: { institutionAr: { type: "STRING" }, institutionEn: { type: "STRING" }, degreeAr: { type: "STRING" }, degreeEn: { type: "STRING" } } };
      } else if (section === 'experience') {
        schema = { type: "OBJECT", properties: { roleAr: { type: "STRING" }, roleEn: { type: "STRING" }, orgAr: { type: "STRING" }, orgEn: { type: "STRING" }, descAr: { type: "STRING" }, descEn: { type: "STRING" } } };
      } else {
        schema = { type: "OBJECT", properties: { titleAr: { type: "STRING" }, titleEn: { type: "STRING" }, descAr: { type: "STRING" }, descEn: { type: "STRING" } } };
      }
    }

    if (!textToTranslate || textToTranslate.trim() === '') {
      alert('Mohon isi teks bahasa Indonesia terlebih dahulu!');
      return;
    }

    setLoadingAI(prev => ({ ...prev, [loadingKey]: true }));

    try {
      // NOTE: Saat men-deploy ke environment Anda sendiri (seperti Github Pages via Vite), 
      // isikan string di bawah dengan API Key Gemini Anda atau gunakan env variables 
      // (misalnya: import.meta.env.VITE_GEMINI_API_KEY).
      const apiKey = ""; 
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
      const payload = {
        contents: [{ parts: [{ text: textToTranslate }] }],
        systemInstruction: { parts: [{ text: "You are an expert translator for Saudi Arabian university applications. Translate the given Indonesian text into formal Arabic and formal English suitable for a professional academic CV. Keep it concise." }] },
        generationConfig: { responseMimeType: "application/json", responseSchema: schema }
      };

      const result = await fetchWithRetry(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const aiText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (aiText) {
        const parsed = JSON.parse(aiText);
        if (section === 'summary') {
          setCvData(prev => ({ ...prev, summary: `${parsed.arabic}\n${parsed.english}` }));
        } else {
          setCvData(prev => ({
            ...prev,
            [section]: prev[section].map(item => item.id === id ? { ...item, ...parsed } : item)
          }));
        }
      }
    } catch (error) {
      console.error("AI Translation Error:", error);
      alert("Gagal menerjemahkan. Silakan coba lagi.");
    } finally {
      setLoadingAI(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setPhotoDataUrl(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePersonalChange = (e) => {
    setCvData({ ...cvData, personal: { ...cvData.personal, [e.target.name]: e.target.value } });
  };

  const handleSkillChange = (e) => {
    setCvData({ ...cvData, skills: { ...cvData.skills, [e.target.name]: e.target.value } });
  };

  const handleArrayChange = (section, id, field, value) => {
    const newArray = cvData[section].map(item => item.id === id ? { ...item, [field]: value } : item);
    setCvData({ ...cvData, [section]: newArray });
  };

  const addArrayItem = (section, template) => {
    const newId = cvData[section].length > 0 ? Math.max(...cvData[section].map(i => i.id)) + 1 : 1;
    setCvData({ ...cvData, [section]: [...cvData[section], { id: newId, textId: '', ...template }] });
  };

  const removeArrayItem = (section, id) => {
    setCvData({ ...cvData, [section]: cvData[section].filter(item => item.id !== id) });
  };

  const exportPDF = () => {
    if (typeof window.html2pdf === 'undefined') {
      alert('Library PDF sedang dimuat, coba beberapa detik lagi.');
      return;
    }
    const element = cvRef.current;
    const opt = {
      margin: [0, 0, 0, 0],
      filename: `CV_${cvData.personal.name.replace(/\s+/g, '_')}_Scholarship.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    element.classList.add('pdf-mode');
    window.html2pdf().set(opt).from(element).save().then(() => {
      element.classList.remove('pdf-mode');
    });
  };

  const appLogo = "https://lh3.googleusercontent.com/d/1T_gjbh4D8xTkoE3zVF0WoQl5xdhb3nCJ";

  // --- RENDER SPLASH SCREEN ---
  if (showSplash) {
    return (
      <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-28 mb-6 animate-bounce">
          <img src={appLogo} alt="Logo" className="w-full h-full object-contain" onError={(e) => e.target.style.display = 'none'} />
        </div>
        <h3 className="text-center text-slate-700 font-bold">
          <span className="block text-xl mb-1 font-black" dir="rtl">نظام الدخول الموحد</span>
          <span className="block text-sm font-normal text-slate-500 uppercase tracking-widest">Single Sign On</span>
        </h3>
        <div className="mt-8 flex justify-center space-x-2">
            <div className="w-3 h-3 bg-[#1db1a2] rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-[#1db1a2] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-[#1db1a2] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    );
  }

  // --- RENDER LOGIN/REGISTER SCREEN ---
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="w-full max-w-md mx-auto bg-white shadow-xl rounded-[2rem] p-8 border border-slate-100 relative overflow-hidden">
          <div className="text-center mb-10">
            <img src={appLogo} alt="Logo" className="w-24 mx-auto mb-6 object-contain" onError={(e) => e.target.style.display = 'none'} />
            <h3 className="text-center text-slate-700 font-bold">
               <span className="block text-2xl mb-1 font-black" dir="rtl">نظام الدخول الموحد</span>
               <span className="block text-base font-normal text-slate-500 uppercase tracking-widest">Single Sign On</span>
            </h3>
            <p className="text-sm text-slate-500 font-bold mt-8" dir="rtl">
              {authMode === 'login' ? 'الرجاء ادخال اسم المستخدم وكلمة المرور' : 'قم بتعبئة بياناتك لإنشاء حساب جديد'}
            </p>
          </div>
          
          <div className="space-y-4">
            {authMode === 'register' && (
              <>
                <input 
                  type="text" 
                  placeholder="Nama Lengkap / الاسم الكامل" 
                  value={authForm.nama} 
                  onChange={(e) => setAuthForm({...authForm, nama: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-[#1db1a2] focus:ring-1 focus:ring-[#1db1a2] rounded-xl text-center outline-none transition-all" 
                  dir="rtl" 
                />
                <input 
                  type="text" 
                  placeholder="Daerah Asal (Domisili) / المنطقة" 
                  value={authForm.asal} 
                  onChange={(e) => setAuthForm({...authForm, asal: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-[#1db1a2] focus:ring-1 focus:ring-[#1db1a2] rounded-xl text-center outline-none transition-all" 
                  dir="rtl" 
                />
              </>
            )}
            
            <input 
              type="email" 
              placeholder="Email / اسم المستخدم" 
              value={authForm.email} 
              onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
              className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-[#1db1a2] focus:ring-1 focus:ring-[#1db1a2] rounded-xl text-center outline-none transition-all" 
              dir="rtl" 
            />
            
            <input 
              type="password" 
              placeholder="Kata Sandi / كلمة المرور" 
              value={authForm.password} 
              onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
              className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-[#1db1a2] focus:ring-1 focus:ring-[#1db1a2] rounded-xl text-center outline-none transition-all" 
              dir="rtl" 
            />
            
            {authMode === 'register' && (
              <input 
                type="password" 
                placeholder="Konfirmasi Sandi / تأكيد كلمة المرور" 
                value={authForm.confirmPassword} 
                onChange={(e) => setAuthForm({...authForm, confirmPassword: e.target.value})}
                className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-[#1db1a2] focus:ring-1 focus:ring-[#1db1a2] rounded-xl text-center outline-none transition-all" 
                dir="rtl" 
              />
            )}

            <button 
              onClick={handleAuth} 
              disabled={isAuthLoading} 
              className="w-full bg-[#1db1a2] hover:bg-[#168e82] text-white font-bold h-12 rounded-xl mt-4 flex items-center justify-center transition-all disabled:opacity-70"
            >
              {isAuthLoading ? <Loader2 className="animate-spin" size={20} /> : (authMode === 'login' ? 'دخول (Masuk)' : 'تسجيل (Daftar)')}
            </button>
            
            <div className="flex flex-col gap-4 mt-8 text-center">
              <button onClick={toggleAuthMode} className="text-[#1db1a2] text-xs font-black uppercase tracking-tighter hover:underline">
                 {authMode === 'login' ? 'إنشاء حساب جديد (Daftar Akun Baru)' : 'تسجيل الدخول (Sudah Punya Akun)'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER MAIN CV BUILDER ---
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans text-slate-800">
      
      {/* LEFT: FORM INPUT */}
      <div className="w-full md:w-1/2 lg:w-2/5 p-0 bg-white overflow-y-auto border-r border-slate-200 shadow-2xl z-10 flex flex-col h-screen relative">
        
        {/* Header App */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md p-6 flex items-center justify-between border-b border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <img src={appLogo} className="w-10 h-10 object-contain" alt="Logo" onError={(e) => e.target.style.display = 'none'} />
            <div>
              <h1 className="text-[13px] font-black text-slate-800 tracking-tighter uppercase">Portal Pelajar</h1>
              <p className="text-[9px] text-[#1db1a2] uppercase font-black tracking-widest">CV Builder Terintegrasi</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={exportPDF}
              className="flex items-center gap-2 bg-[#1db1a2] hover:bg-[#168e82] text-white px-4 py-2 rounded-xl font-bold transition-colors shadow-md text-xs tracking-wider"
            >
              <Download size={14} /> EXPORT PDF
            </button>
            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 rounded-xl transition-colors" title="Keluar">
              <LogOut size={16} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-20">
          
          {/* FOTO UPLOAD */}
          <section className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-200">
            <h2 className="text-sm font-black flex items-center gap-2 text-slate-800 mb-4 uppercase tracking-wider"><User size={16} className="text-[#1db1a2]"/> Pas Foto (4x6)</h2>
            <div className="flex items-center gap-4">
              <div className="w-20 h-30 bg-white border-2 border-dashed border-[#1db1a2]/30 rounded-xl flex items-center justify-center overflow-hidden shadow-sm" style={{ aspectRatio: '2/3' }}>
                {photoDataUrl ? (
                  <img src={photoDataUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <User size={30} className="text-[#1db1a2]/30" />
                )}
              </div>
              <div>
                <label className="cursor-pointer bg-white border border-slate-200 hover:border-[#1db1a2] hover:text-[#1db1a2] text-slate-600 py-2 px-4 rounded-xl shadow-sm inline-flex items-center gap-2 transition-all text-xs font-bold uppercase tracking-wider">
                  <Upload size={14} /> Unggah Foto
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
                <p className="text-[10px] text-slate-400 mt-2 font-medium">Latar formal dianjurkan.</p>
              </div>
            </div>
          </section>

          {/* DATA PRIBADI (Auto Filled) */}
          <section>
            <h2 className="text-sm font-black flex items-center gap-2 text-slate-800 mb-4 pb-2 border-b border-slate-100 uppercase tracking-wider"><User size={16} className="text-[#1db1a2]"/> Data Pribadi Tersinkronisasi</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Nama Lengkap</label>
                <input type="text" name="name" value={cvData.personal.name} onChange={handlePersonalChange} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:border-[#1db1a2] focus:ring-1 focus:ring-[#1db1a2] outline-none shadow-sm font-medium" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Tanggal Lahir</label>
                  <input type="text" name="dob" value={cvData.personal.dob} onChange={handlePersonalChange} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:border-[#1db1a2] focus:ring-1 focus:ring-[#1db1a2] outline-none shadow-sm font-medium" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Kewarganegaraan</label>
                  <input type="text" name="nationality" value={cvData.personal.nationality} onChange={handlePersonalChange} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:border-[#1db1a2] focus:ring-1 focus:ring-[#1db1a2] outline-none shadow-sm font-medium" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Nomor WA/HP</label>
                  <input type="text" name="phone" value={cvData.personal.phone} onChange={handlePersonalChange} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:border-[#1db1a2] focus:ring-1 focus:ring-[#1db1a2] outline-none shadow-sm font-medium" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Email Akun</label>
                  <input type="email" name="email" value={cvData.personal.email} onChange={handlePersonalChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-[#1db1a2] focus:ring-1 focus:ring-[#1db1a2] outline-none shadow-sm font-medium text-slate-500" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Alamat Sekarang</label>
                <input type="text" name="address" value={cvData.personal.address} onChange={handlePersonalChange} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:border-[#1db1a2] focus:ring-1 focus:ring-[#1db1a2] outline-none shadow-sm font-medium" />
              </div>
            </div>
          </section>

          {/* SUMMARY */}
          <section>
            <h2 className="text-sm font-black flex items-center gap-2 text-slate-800 mb-4 pb-2 border-b border-slate-100 uppercase tracking-wider"><Star size={16} className="text-[#1db1a2]"/> Ringkasan Profesional</h2>
            <div className="bg-[#1db1a2]/10 p-4 rounded-xl mb-4 border border-[#1db1a2]/20 shadow-sm">
              <label className="text-xs font-black text-[#1db1a2] flex items-center gap-2 mb-2 uppercase tracking-wide"><Sparkles size={14}/> AI Auto-Translate</label>
              <textarea 
                value={cvData.summaryId || ''} 
                onChange={(e) => setCvData({...cvData, summaryId: e.target.value})} 
                className="w-full p-3 bg-white border border-[#1db1a2]/20 rounded-xl text-sm focus:border-[#1db1a2] focus:ring-1 focus:ring-[#1db1a2] outline-none mb-3 font-medium" 
                placeholder="Tulis profil / ringkasan Anda dalam bahasa Indonesia di sini..." 
                rows="2"
              ></textarea>
              <button 
                onClick={() => handleAITranslate('summary')} 
                disabled={loadingAI['summary']} 
                className="bg-[#1db1a2] hover:bg-[#168e82] text-white px-4 py-2 rounded-xl text-[10px] flex items-center justify-center gap-2 font-bold uppercase tracking-widest transition-colors disabled:opacity-70 w-full shadow-md"
              >
                {loadingAI['summary'] ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} Terjemahkan (Arab & Inggris)
              </button>
            </div>
            <textarea value={cvData.summary} onChange={(e) => setCvData({...cvData, summary: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl h-32 text-sm focus:border-[#1db1a2] focus:ring-1 focus:ring-[#1db1a2] outline-none shadow-sm font-medium" placeholder="Hasil terjemahan Arab dan Inggris akan muncul di sini..."></textarea>
          </section>

          {/* PENDIDIKAN */}
          <section>
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <h2 className="text-sm font-black flex items-center gap-2 text-slate-800 uppercase tracking-wider"><BookOpen size={16} className="text-[#1db1a2]"/> Pendidikan</h2>
              <button onClick={() => addArrayItem('education', { year: '', institutionAr: '', institutionEn: '', degreeAr: '', degreeEn: '', gpa: '' })} className="text-[#1db1a2] hover:text-[#168e82] text-[10px] font-bold flex items-center gap-1 uppercase tracking-widest bg-[#1db1a2]/10 py-1.5 px-3 rounded-lg"><Plus size={14}/> Tambah</button>
            </div>
            {cvData.education.map((item) => (
              <div key={item.id} className="bg-slate-50 p-4 rounded-2xl mb-4 border border-slate-200 relative shadow-sm">
                <button onClick={() => removeArrayItem('education', item.id)} className="absolute top-3 right-3 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                <div className="space-y-3 mt-1">
                  <div className="bg-[#1db1a2]/10 p-2 rounded-xl border border-[#1db1a2]/20 flex gap-2">
                    <input type="text" placeholder="Ketik dlm B. Indo & klik AI 👉" value={item.textId || ''} onChange={(e) => handleArrayChange('education', item.id, 'textId', e.target.value)} className="w-full p-2 bg-white border border-[#1db1a2]/20 rounded-lg text-xs outline-none" />
                    <button onClick={() => handleAITranslate('education', item.id)} disabled={loadingAI[`education-${item.id}`]} className="bg-[#1db1a2] hover:bg-[#168e82] text-white px-3 rounded-lg flex items-center justify-center shrink-0 disabled:opacity-70 shadow-sm">
                      {loadingAI[`education-${item.id}`] ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} AI
                    </button>
                  </div>
                  <input type="text" placeholder="Tahun (ex: 2019-2022)" value={item.year} onChange={(e) => handleArrayChange('education', item.id, 'year', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-[#1db1a2]" />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="Institusi (Arab)" value={item.institutionAr} onChange={(e) => handleArrayChange('education', item.id, 'institutionAr', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-right font-serif outline-none focus:border-[#1db1a2]" dir="rtl" />
                    <input type="text" placeholder="Institution (English)" value={item.institutionEn} onChange={(e) => handleArrayChange('education', item.id, 'institutionEn', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-[#1db1a2]" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="Jurusan (Arab)" value={item.degreeAr} onChange={(e) => handleArrayChange('education', item.id, 'degreeAr', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-right font-serif outline-none focus:border-[#1db1a2]" dir="rtl" />
                    <input type="text" placeholder="Major (English)" value={item.degreeEn} onChange={(e) => handleArrayChange('education', item.id, 'degreeEn', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-[#1db1a2]" />
                  </div>
                  <input type="text" placeholder="Nilai / GPA" value={item.gpa} onChange={(e) => handleArrayChange('education', item.id, 'gpa', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-[#1db1a2]" />
                </div>
              </div>
            ))}
          </section>

          {/* PENGALAMAN AGAMA */}
          <section>
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <h2 className="text-sm font-black flex items-center gap-2 text-slate-800 uppercase tracking-wider"><Star size={16} className="text-[#1db1a2]"/> Keahlian Keagamaan</h2>
              <button onClick={() => addArrayItem('religious', { titleAr: '', titleEn: '', descAr: '', descEn: '' })} className="text-[#1db1a2] hover:text-[#168e82] text-[10px] font-bold flex items-center gap-1 uppercase tracking-widest bg-[#1db1a2]/10 py-1.5 px-3 rounded-lg"><Plus size={14}/> Tambah</button>
            </div>
            {cvData.religious.map((item) => (
              <div key={item.id} className="bg-slate-50 p-4 rounded-2xl mb-4 border border-slate-200 relative shadow-sm">
                <button onClick={() => removeArrayItem('religious', item.id)} className="absolute top-3 right-3 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                <div className="space-y-3 mt-1">
                  <div className="bg-[#1db1a2]/10 p-2 rounded-xl border border-[#1db1a2]/20 flex gap-2">
                    <input type="text" placeholder="Ketik keahlian dlm B. Indo & klik AI 👉" value={item.textId || ''} onChange={(e) => handleArrayChange('religious', item.id, 'textId', e.target.value)} className="w-full p-2 bg-white border border-[#1db1a2]/20 rounded-lg text-xs outline-none" />
                    <button onClick={() => handleAITranslate('religious', item.id)} disabled={loadingAI[`religious-${item.id}`]} className="bg-[#1db1a2] hover:bg-[#168e82] text-white px-3 rounded-lg flex items-center justify-center shrink-0 disabled:opacity-70 shadow-sm">
                      {loadingAI[`religious-${item.id}`] ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} AI
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="Judul (Arab)" value={item.titleAr} onChange={(e) => handleArrayChange('religious', item.id, 'titleAr', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-right font-serif outline-none focus:border-[#1db1a2]" dir="rtl" />
                    <input type="text" placeholder="Title (English)" value={item.titleEn} onChange={(e) => handleArrayChange('religious', item.id, 'titleEn', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-[#1db1a2]" />
                  </div>
                  <textarea placeholder="Deskripsi (Arab)" value={item.descAr} onChange={(e) => handleArrayChange('religious', item.id, 'descAr', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-right font-serif outline-none focus:border-[#1db1a2]" dir="rtl" rows="2"></textarea>
                  <textarea placeholder="Description (English)" value={item.descEn} onChange={(e) => handleArrayChange('religious', item.id, 'descEn', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-[#1db1a2]" rows="2"></textarea>
                </div>
              </div>
            ))}
          </section>

          {/* PENGHARGAAN */}
          <section>
             <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <h2 className="text-sm font-black flex items-center gap-2 text-slate-800 uppercase tracking-wider"><Award size={16} className="text-[#1db1a2]"/> Penghargaan</h2>
              <button onClick={() => addArrayItem('awards', { year: '', titleAr: '', titleEn: '', descAr: '', descEn: '' })} className="text-[#1db1a2] hover:text-[#168e82] text-[10px] font-bold flex items-center gap-1 uppercase tracking-widest bg-[#1db1a2]/10 py-1.5 px-3 rounded-lg"><Plus size={14}/> Tambah</button>
            </div>
            {cvData.awards.map((item) => (
              <div key={item.id} className="bg-slate-50 p-4 rounded-2xl mb-4 border border-slate-200 relative shadow-sm">
                <button onClick={() => removeArrayItem('awards', item.id)} className="absolute top-3 right-3 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                <div className="space-y-3 mt-1">
                  <div className="bg-[#1db1a2]/10 p-2 rounded-xl border border-[#1db1a2]/20 flex gap-2">
                    <input type="text" placeholder="Ketik prestasi dlm B. Indo & klik AI 👉" value={item.textId || ''} onChange={(e) => handleArrayChange('awards', item.id, 'textId', e.target.value)} className="w-full p-2 bg-white border border-[#1db1a2]/20 rounded-lg text-xs outline-none" />
                    <button onClick={() => handleAITranslate('awards', item.id)} disabled={loadingAI[`awards-${item.id}`]} className="bg-[#1db1a2] hover:bg-[#168e82] text-white px-3 rounded-lg flex items-center justify-center shrink-0 disabled:opacity-70 shadow-sm">
                      {loadingAI[`awards-${item.id}`] ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} AI
                    </button>
                  </div>
                  <input type="text" placeholder="Tahun" value={item.year} onChange={(e) => handleArrayChange('awards', item.id, 'year', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-[#1db1a2]" />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="Penghargaan (Arab)" value={item.titleAr} onChange={(e) => handleArrayChange('awards', item.id, 'titleAr', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-right font-serif outline-none focus:border-[#1db1a2]" dir="rtl" />
                    <input type="text" placeholder="Award (English)" value={item.titleEn} onChange={(e) => handleArrayChange('awards', item.id, 'titleEn', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-[#1db1a2]" />
                  </div>
                   <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="Penyelenggara (Arab)" value={item.descAr} onChange={(e) => handleArrayChange('awards', item.id, 'descAr', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-right font-serif outline-none focus:border-[#1db1a2]" dir="rtl" />
                    <input type="text" placeholder="Issuer (English)" value={item.descEn} onChange={(e) => handleArrayChange('awards', item.id, 'descEn', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-[#1db1a2]" />
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* PENGALAMAN KERJA / ORGANISASI */}
          <section>
             <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <h2 className="text-sm font-black flex items-center gap-2 text-slate-800 uppercase tracking-wider"><Briefcase size={16} className="text-[#1db1a2]"/> Organisasi & Kerja</h2>
              <button onClick={() => addArrayItem('experience', { year: '', roleAr: '', roleEn: '', orgAr: '', orgEn: '', descAr: '', descEn: '' })} className="text-[#1db1a2] hover:text-[#168e82] text-[10px] font-bold flex items-center gap-1 uppercase tracking-widest bg-[#1db1a2]/10 py-1.5 px-3 rounded-lg"><Plus size={14}/> Tambah</button>
            </div>
            {cvData.experience.map((item) => (
              <div key={item.id} className="bg-slate-50 p-4 rounded-2xl mb-4 border border-slate-200 relative shadow-sm">
                <button onClick={() => removeArrayItem('experience', item.id)} className="absolute top-3 right-3 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                <div className="space-y-3 mt-1">
                  <div className="bg-[#1db1a2]/10 p-2 rounded-xl border border-[#1db1a2]/20 flex gap-2">
                    <input type="text" placeholder="Ketik pengalaman dlm B. Indo 👉" value={item.textId || ''} onChange={(e) => handleArrayChange('experience', item.id, 'textId', e.target.value)} className="w-full p-2 bg-white border border-[#1db1a2]/20 rounded-lg text-xs outline-none" />
                    <button onClick={() => handleAITranslate('experience', item.id)} disabled={loadingAI[`experience-${item.id}`]} className="bg-[#1db1a2] hover:bg-[#168e82] text-white px-3 rounded-lg flex items-center justify-center shrink-0 disabled:opacity-70 shadow-sm">
                      {loadingAI[`experience-${item.id}`] ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} AI
                    </button>
                  </div>
                  <input type="text" placeholder="Tahun (ex: 2020 - 2022)" value={item.year} onChange={(e) => handleArrayChange('experience', item.id, 'year', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-[#1db1a2]" />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="Posisi (Arab)" value={item.roleAr} onChange={(e) => handleArrayChange('experience', item.id, 'roleAr', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-right font-serif outline-none focus:border-[#1db1a2]" dir="rtl" />
                    <input type="text" placeholder="Role (English)" value={item.roleEn} onChange={(e) => handleArrayChange('experience', item.id, 'roleEn', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-[#1db1a2]" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="Organisasi (Arab)" value={item.orgAr} onChange={(e) => handleArrayChange('experience', item.id, 'orgAr', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-right font-serif outline-none focus:border-[#1db1a2]" dir="rtl" />
                    <input type="text" placeholder="Organization (English)" value={item.orgEn} onChange={(e) => handleArrayChange('experience', item.id, 'orgEn', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-[#1db1a2]" />
                  </div>
                   <textarea placeholder="Deskripsi (Arab)" value={item.descAr} onChange={(e) => handleArrayChange('experience', item.id, 'descAr', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-right font-serif outline-none focus:border-[#1db1a2]" dir="rtl" rows="2"></textarea>
                  <textarea placeholder="Description (English)" value={item.descEn} onChange={(e) => handleArrayChange('experience', item.id, 'descEn', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-[#1db1a2]" rows="2"></textarea>
                </div>
              </div>
            ))}
          </section>

           {/* SKILLS */}
           <section>
            <h2 className="text-sm font-black flex items-center gap-2 text-slate-800 mb-4 pb-2 border-b border-slate-100 uppercase tracking-wider"><Settings size={16} className="text-[#1db1a2]"/> Keahlian Tambahan</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Bahasa Arab</label>
                <input type="text" name="arabic" value={cvData.skills.arabic} onChange={handleSkillChange} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:border-[#1db1a2] outline-none shadow-sm font-medium" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Bahasa Inggris</label>
                <input type="text" name="english" value={cvData.skills.english} onChange={handleSkillChange} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:border-[#1db1a2] outline-none shadow-sm font-medium" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Teknis (Komputer, dll)</label>
                <input type="text" name="tech" value={cvData.skills.tech} onChange={handleSkillChange} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:border-[#1db1a2] outline-none shadow-sm font-medium" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Soft Skills</label>
                <input type="text" name="soft" value={cvData.skills.soft} onChange={handleSkillChange} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:border-[#1db1a2] outline-none shadow-sm font-medium" />
              </div>
            </div>
          </section>

        </div>
      </div>

      {/* RIGHT: A4 PREVIEW (Recolored with #1db1a2 Theme) */}
      <div className="w-full md:w-1/2 lg:w-3/5 bg-slate-200 p-4 md:p-8 overflow-y-auto flex justify-center items-start h-screen custom-scrollbar">
        {/* A4 Container */}
        <div 
          ref={cvRef}
          className="bg-white shadow-2xl relative"
          style={{ 
            width: '210mm', 
            minHeight: '297mm',
            boxSizing: 'border-box'
          }}
        >
          {/* Header Accent */}
          <div className="h-6 bg-[#1db1a2] w-full absolute top-0 left-0 right-0"></div>
          <div className="h-2 bg-yellow-500 w-full absolute top-6 left-0 right-0"></div>

          <div className="p-[12mm] pt-[18mm]">
            {/* Header Section */}
            <div className="flex items-start justify-between border-b-2 border-[#1db1a2] pb-6 mb-6">
              {/* Photo 4x6 */}
              <div 
                className="border-2 border-[#1db1a2] rounded overflow-hidden shrink-0 shadow-md bg-slate-50 flex items-center justify-center"
                style={{ width: '40mm', height: '60mm' }}
              >
                {photoDataUrl ? (
                  <img src={photoDataUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-slate-300 text-xs text-center p-2">Foto<br/>4x6</span>
                )}
              </div>

              {/* Title & Contact */}
              <div className="flex-1 px-6 text-center">
                <h1 className="text-3xl font-black text-[#168e82] mb-1 tracking-wide uppercase">{cvData.personal.name || 'Nama Lengkap'}</h1>
                <p className="text-lg text-slate-700 font-serif mb-4 font-bold" dir="rtl">{cvData.personal.name || 'الاسم الكامل'}</p>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-slate-600">
                  <div className="text-right">
                    <span dir="rtl" className="font-serif">تاريخ الميلاد: {cvData.personal.dob || '-'}</span>
                  </div>
                  <div className="text-left border-l border-slate-300 pl-4">
                    DOB: {cvData.personal.dob || '-'}
                  </div>

                  <div className="text-right">
                    <span dir="rtl" className="font-serif">الجنسية: {cvData.personal.nationality}</span>
                  </div>
                  <div className="text-left border-l border-slate-300 pl-4">
                    Nationality: {cvData.personal.nationality}
                  </div>

                  <div className="text-right">
                    <span dir="rtl" className="font-serif">الهاتف: {cvData.personal.phone || '-'}</span>
                  </div>
                  <div className="text-left border-l border-slate-300 pl-4">
                    Phone: {cvData.personal.phone || '-'}
                  </div>

                  <div className="text-right">
                    <span dir="rtl" className="font-serif">البريد: {cvData.personal.email || '-'}</span>
                  </div>
                  <div className="text-left border-l border-slate-300 pl-4 text-xs break-all">
                    Email: {cvData.personal.email || '-'}
                  </div>
                </div>
                <div className="mt-2 text-sm text-slate-600 text-center">
                  <span dir="rtl" className="font-serif block">العنوان: {cvData.personal.address || '-'}</span>
                  <span className="block mt-0.5">Address: {cvData.personal.address || '-'}</span>
                </div>
              </div>
            </div>

            {/* Summary */}
            {cvData.summary && (
              <div className="mb-6">
                <div className="flex justify-between items-center bg-[#f0fbf9] px-3 py-1 border-l-4 border-r-4 border-[#1db1a2] mb-3">
                  <h2 className="text-[#168e82] font-black uppercase text-sm tracking-wider">Professional Summary</h2>
                  <h2 className="text-[#168e82] font-bold font-serif text-lg" dir="rtl">ملخص احترافي</h2>
                </div>
                <p className="text-slate-700 text-justify text-sm italic whitespace-pre-line leading-relaxed px-2 font-medium">
                  {cvData.summary}
                </p>
              </div>
            )}

            {/* Education */}
            {cvData.education.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between items-center bg-[#f0fbf9] px-3 py-1 border-l-4 border-r-4 border-[#1db1a2] mb-3">
                  <h2 className="text-[#168e82] font-black uppercase text-sm tracking-wider">Education</h2>
                  <h2 className="text-[#168e82] font-bold font-serif text-lg" dir="rtl">المؤهلات التعليمية</h2>
                </div>
                {cvData.education.map((edu, idx) => (
                  <div key={idx} className="mb-4 px-2">
                    <div className="flex justify-between font-black text-slate-800">
                      <span>{edu.institutionEn}</span>
                      <span className="font-serif text-lg" dir="rtl">{edu.institutionAr}</span>
                    </div>
                    <div className="flex justify-between text-[#1db1a2] text-sm my-1 font-bold">
                      <span>{edu.degreeEn}</span>
                      <span className="font-serif" dir="rtl">{edu.degreeAr}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-sm font-medium">
                      <span>{edu.year} | GPA: {edu.gpa}</span>
                      <span className="font-serif" dir="rtl">{edu.year} | التقدير: {edu.gpa}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Religious Experiences */}
            {cvData.religious.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between items-center bg-[#f0fbf9] px-3 py-1 border-l-4 border-r-4 border-[#1db1a2] mb-3">
                  <h2 className="text-[#168e82] font-black uppercase text-sm tracking-wider">Religious Achievements</h2>
                  <h2 className="text-[#168e82] font-bold font-serif text-lg" dir="rtl">الخبرات والإنجازات الدينية</h2>
                </div>
                <ul className="list-none space-y-3 px-2">
                  {cvData.religious.map((rel, idx) => (
                    <li key={idx} className="flex flex-col border-b border-slate-100 pb-2 last:border-0">
                      <div className="flex justify-between font-black text-slate-800 text-sm">
                        <span>• {rel.titleEn}</span>
                        <span className="font-serif text-base" dir="rtl">{rel.titleAr} •</span>
                      </div>
                      <div className="flex justify-between text-slate-600 text-sm mt-1 font-medium">
                        <span className="w-[48%] pr-2">{rel.descEn}</span>
                        <span className="w-[48%] pl-2 font-serif text-right" dir="rtl">{rel.descAr}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Awards */}
            {cvData.awards.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between items-center bg-[#f0fbf9] px-3 py-1 border-l-4 border-r-4 border-[#1db1a2] mb-3">
                  <h2 className="text-[#168e82] font-black uppercase text-sm tracking-wider">Awards & Honors</h2>
                  <h2 className="text-[#168e82] font-bold font-serif text-lg" dir="rtl">الجوائز والشهادات التقديرية</h2>
                </div>
                {cvData.awards.map((award, idx) => (
                  <div key={idx} className="mb-3 px-2">
                    <div className="flex justify-between font-black text-slate-800 text-sm">
                      <span>{award.titleEn} ({award.year})</span>
                      <span className="font-serif text-base" dir="rtl">{award.titleAr} ({award.year})</span>
                    </div>
                    <div className="flex justify-between text-slate-600 text-sm mt-1 font-medium">
                      <span className="w-[48%] pr-2">{award.descEn}</span>
                      <span className="w-[48%] pl-2 font-serif text-right" dir="rtl">{award.descAr}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Work & Organization Experience */}
            {cvData.experience.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between items-center bg-[#f0fbf9] px-3 py-1 border-l-4 border-r-4 border-[#1db1a2] mb-3">
                  <h2 className="text-[#168e82] font-black uppercase text-sm tracking-wider">Experience</h2>
                  <h2 className="text-[#168e82] font-bold font-serif text-lg" dir="rtl">الخبرات العملية والتطوعية</h2>
                </div>
                {cvData.experience.map((exp, idx) => (
                  <div key={idx} className="mb-4 px-2">
                    <div className="flex justify-between font-black text-slate-800 text-sm">
                      <span>{exp.roleEn}</span>
                      <span className="font-serif text-base" dir="rtl">{exp.roleAr}</span>
                    </div>
                    <div className="flex justify-between text-[#1db1a2] font-bold text-sm my-1">
                      <span>{exp.orgEn} | {exp.year}</span>
                      <span className="font-serif" dir="rtl">{exp.orgAr} | {exp.year}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 font-medium text-sm mt-1">
                      <span className="w-[48%] pr-2">{exp.descEn}</span>
                      <span className="w-[48%] pl-2 font-serif text-right" dir="rtl">{exp.descAr}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Skills */}
            <div className="mb-2">
              <div className="flex justify-between items-center bg-[#f0fbf9] px-3 py-1 border-l-4 border-r-4 border-[#1db1a2] mb-3">
                <h2 className="text-[#168e82] font-black uppercase text-sm tracking-wider">Skills</h2>
                <h2 className="text-[#168e82] font-bold font-serif text-lg" dir="rtl">المهارات</h2>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 px-2 text-sm text-slate-700">
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="font-bold">Arabic:</span>
                  <span className="font-medium">{cvData.skills.arabic}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="font-bold">English:</span>
                  <span className="font-medium">{cvData.skills.english}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="font-bold">Technical:</span>
                  <span className="text-right font-medium">{cvData.skills.tech}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="font-bold">Soft Skills:</span>
                  <span className="text-right font-medium">{cvData.skills.soft}</span>
                </div>
              </div>
            </div>

          </div>
          
          {/* Footer Accent */}
          <div className="h-4 bg-[#1db1a2] w-full absolute bottom-0 left-0 right-0"></div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;500;700;900&display=swap');
        
        .font-sans { font-family: 'Inter', sans-serif; }
        .font-serif { font-family: 'Amiri', serif; }
        
        /* Custom Scrollbars */
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #1db1a2; }

        /* specific fix for PDF export scale */
        .pdf-mode { transform: none !important; margin: 0 !important; }
      `}} />
    </div>
  );
};

export default App;
