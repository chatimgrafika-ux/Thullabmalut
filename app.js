// app.js

import { 
    universityList, graduationYears, statusKampusList, docFields, 
    berkasWajib, berkasPendukung, berkasTambahan, fileList, defaultInfoData 
} from './data.js';

// Mengambil fungsi Vue dari Global Object (yang di load CDN)
const { createApp, ref, onMounted, watch, computed } = window.Vue;

const webAppUrl = "[https://script.google.com/macros/s/AKfycbzrVhJu_vO6lYUqBUvYSAVjDLDCH31rFwULqyjDBLdPtuFTnl9fmoFl1zUmGvya8Tek/exec](https://script.google.com/macros/s/AKfycbzrVhJu_vO6lYUqBUvYSAVjDLDCH31rFwULqyjDBLdPtuFTnl9fmoFl1zUmGvya8Tek/exec)";

createApp({
  setup() {
    const isGAS = typeof google !== 'undefined' && google.script && google.script.run;
    const appName = "Portal Pelajar Malut Arab Saudi";
    const appLogo = "[https://lh3.googleusercontent.com/d/1T_gjbh4D8xTkoE3zVF0WoQl5xdhb3nCJ](https://lh3.googleusercontent.com/d/1T_gjbh4D8xTkoE3zVF0WoQl5xdhb3nCJ)";
    
    const showSplash = ref(true);
    const isLoading = ref(false);
    const isViewMode = ref(true);
    const isProfileViewMode = ref(true);
    const user = ref(null);
    const authMode = ref('login');
    const showPass = ref(false);
    const activeTab = ref('home');
    const formTab = ref('identitas');
    const students = ref([]);
    const infoData = ref([]);
    const selectedStudent = ref(null);
    const toast = ref({ show: false, msg: '' });
    const authForm = ref({ email: '', password: '', nama: '', asal: '', confirmPassword: '' });
    
    const pendaftaranKampus = ref([]);

    const formData = ref({
      id: '', user_id: '', email: '', gender: 'Laki-laki', status_dok: '', pengajuan_dok: 'TIDAK',
      nama_p1_id: '', nama_p2_id: '', nama_p3_id: '', nama_p4_id: '',
      nama_p1_ar: '', nama_p2_ar: '', nama_p3_ar: '', nama_p4_ar: '',
      nama_lengkap_id: '', nama_lengkap_ar: '', asal_sek_id: '', asal_sek_ar: '',
      tpt_lahir_id: '', tpt_lahir_ar: '', tgl_lahir_id: '', tgl_lahir_ar: '',
      wa: '', hp: '', thn_lulus: '', no_daftar: '', kampus: '',
      kota_kab: '', provinsi: '', domisili: ''
    });

    const callGAS = (action, data) => {
      return new Promise((resolve, reject) => {
        if (isGAS) {
          google.script.run.withSuccessHandler(resolve).withFailureHandler(reject)[action + "GAS"] 
            ? google.script.run.withSuccessHandler(resolve).withFailureHandler(reject)[action + "GAS"](data) 
            : google.script.run.withSuccessHandler(resolve).withFailureHandler(reject)[action](data);
        } else {
          if (!webAppUrl) return reject("Web App URL belum dikonfigurasi.");
          fetch(webAppUrl, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({ action, data })
          })
          .then(res => res.json())
          .then(resolve)
          .catch(err => reject(err));
        }
      });
    };

    const displayInfo = computed(() => {
        const validData = infoData.value ? infoData.value.filter(item => item.step || item.info) : [];
        return validData.length > 0 ? validData : defaultInfoData;
    });
    
    const formatDriveUrl = (id) => (!id || id.includes('http')) ? id : `https://lh3.googleusercontent.com/d/${id}`;

    const copy = (text, label) => {
      if (!text) return;
      const textArea = document.createElement("textarea");
      textArea.value = text; document.body.appendChild(textArea);
      textArea.select(); 
      try { 
          document.execCommand('copy'); 
          showToast(`${label} Berhasil Disalin!`); 
      } catch (err) { 
          showToast("Gagal menyalin."); 
      }
      document.body.removeChild(textArea);
    };

    const generateHijri = () => {
      if (!formData.value.tgl_lahir_id) return;
      try {
        const hijri = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-uma-nu-arab', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(formData.value.tgl_lahir_id));
        formData.value.tgl_lahir_ar = hijri;
      } catch (e) { console.error(e); }
    };

    const formatIDName = (k) => { if (formData.value[k]) formData.value[k] = formData.value[k].split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' '); };
    const formatARName = (k) => { if (formData.value[k]) formData.value[k] = formData.value[k].replace(/[^\u0600-\u06FF\s]/g, ''); };

    watch(() => [formData.value.nama_p1_id, formData.value.nama_p2_id, formData.value.nama_p3_id, formData.value.nama_p4_id], (n) => formData.value.nama_lengkap_id = n.filter(x => x).join(' '));
    watch(() => [formData.value.nama_p1_ar, formData.value.nama_p2_ar, formData.value.nama_p3_ar, formData.value.nama_p4_ar], (n) => formData.value.nama_lengkap_ar = n.filter(x => x).join(' '));

    const showToast = (msg) => { toast.value = { show: true, msg }; setTimeout(() => { toast.value.show = false }, 3000); };
    const openLink = (url) => url && window.open(url, '_blank');
    
    const tambahKampus = () => {
        pendaftaranKampus.value.push({
            id: 'KMP-' + Date.now().toString(),
            no_daftar: '',
            nama_kampus: '',
            status: 'Belum Mendaftar'
        });
    };

    const hapusKampus = (idx) => {
        pendaftaranKampus.value.splice(idx, 1);
    };

    const statusColor = (status) => {
        if(status === 'Diterima') return 'bg-emerald-100 text-emerald-700';
        if(status === 'Ditolak') return 'bg-red-100 text-red-700';
        if(status === 'Sedang Mendaftar') return 'bg-blue-100 text-blue-700';
        if(status === 'Cadangan') return 'bg-orange-100 text-orange-700';
        return 'bg-slate-100 text-slate-500';
    };

    const toggleAuthMode = () => { 
        authMode.value = authMode.value === 'login' ? 'register' : 'login';
        authForm.value = { email: '', password: '', nama: '', asal: '', confirmPassword: '' };
    };

    const handleAuth = async () => {
      if (authMode.value === 'register') {
        if (!authForm.value.nama || !authForm.value.asal || !authForm.value.email || !authForm.value.password || !authForm.value.confirmPassword) {
          return showToast("Lengkapi semua form pendaftaran!");
        }
        if (authForm.value.password !== authForm.value.confirmPassword) {
          return showToast("Kata sandi tidak cocok!");
        }
      } else {
        if (!authForm.value.email || !authForm.value.password) return showToast("Lengkapi form!");
      }
      
      isLoading.value = true;
      try {
        const res = await callGAS('handleAuth', { 
           mode: authMode.value, 
           email: authForm.value.email, 
           password: authForm.value.password,
           nama: authForm.value.nama,
           asal: authForm.value.asal
        });
        isLoading.value = false;
        if (res.success) {
          user.value = res.user; infoData.value = res.infoData || [];
          localStorage.setItem('portal_malut_session', JSON.stringify(res.user));
          if (res.data) {
             formData.value = { ...formData.value, ...res.data };
             if (res.data.kampus) {
                try {
                    pendaftaranKampus.value = JSON.parse(res.data.kampus);
                } catch(e) {
                    pendaftaranKampus.value = res.data.kampus.split(', ').map(k => ({
                        id: 'KMP-' + Math.random().toString(36).substr(2, 9),
                        no_daftar: '',
                        nama_kampus: k,
                        status: 'Belum Mendaftar'
                    }));
                }
             }
          }
          if (res.students) students.value = res.students;
          showToast("Berhasil!");
        } else showToast(res.msg);
      } catch (e) { isLoading.value = false; showToast("Error: " + e.toString()); }
    };

    const saveData = async () => {
      isLoading.value = true;
      formData.value.kampus = JSON.stringify(pendaftaranKampus.value);
      const payload = JSON.parse(JSON.stringify(formData.value));
      payload.user_id = user.value.id;
      try {
        const res = await callGAS('saveData', payload);
        isLoading.value = false;
        
        if (res && res.success === false) {
           showToast("Gagal: " + res.msg);
        } else {
           showToast("Data Tersimpan!"); 
           isViewMode.value = true; 
           isProfileViewMode.value = true;
        }
      } catch (e) { 
        isLoading.value = false; 
        showToast("Sistem Error: " + e.message); 
        console.error(e);
      }
    };

    const verifyDoc = async (uid, status) => {
       try {
         await callGAS('updateStatus', { uid, status });
         showToast(`Status: ${status}`); selectedStudent.value = null; handleAuth();
       } catch (e) { showToast("Gagal Update"); }
    };

    const logout = () => { localStorage.removeItem('portal_malut_session'); user.value = null; showToast("Berhasil Keluar"); };
    const viewDetail = (st) => selectedStudent.value = st;

    onMounted(() => {
      setTimeout(() => showSplash.value = false, 2500);
      const session = localStorage.getItem('portal_malut_session');
      if (session) { 
        const p = JSON.parse(session); 
        user.value = p; 
        callGAS('fetchInitial', p).then(res => {
          if (res.success) {
            infoData.value = res.infoData || [];
            if (res.data) {
              formData.value = { ...formData.value, ...res.data };
              if (res.data.kampus) {
                try {
                    pendaftaranKampus.value = JSON.parse(res.data.kampus);
                } catch(e) {
                    pendaftaranKampus.value = res.data.kampus.split(', ').map(k => ({
                        id: 'KMP-' + Math.random().toString(36).substr(2, 9),
                        no_daftar: '',
                        nama_kampus: k,
                        status: 'Belum Mendaftar'
                    }));
                }
              }
            }
            if (res.students) students.value = res.students;
          }
        });
      }
    });

    return {
      appName, appLogo, showSplash, isLoading, isViewMode, isProfileViewMode, user, authMode, authForm, showPass,
      activeTab, formTab, formData, toast, students, docFields, fileList, berkasWajib, berkasPendukung, berkasTambahan, universityList, graduationYears, pendaftaranKampus, statusKampusList, displayInfo, selectedStudent,
      toggleAuthMode, handleAuth, saveData, verifyDoc, viewDetail, logout, openLink, copy, generateHijri, formatIDName, formatARName, formatDriveUrl, tambahKampus, hapusKampus, statusColor
    };
  }
}).mount('#app');
