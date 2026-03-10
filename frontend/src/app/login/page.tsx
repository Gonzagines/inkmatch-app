'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Mail,
    Lock,
    Phone,
    MapPin,
    Palette,
    Instagram,
    Camera,
    Clock,
    CalendarDays,
    Loader2,
    ArrowRight,
    Eye,
    EyeOff,
    Sparkles,
    ChevronLeft,
    ChevronDown,
    BookOpen,
    Plus,
    Trash2,
    Save
} from 'lucide-react';
import Link from 'next/link';

const STYLES = ['Realismo', 'Tradicional', 'Fine Line', 'Blackwork', 'Neotradicional', 'Acuarela', 'Geométrico', 'Minimalista'];
const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// ── Collapsible Section component (defined OUTSIDE to avoid re-mount) ──
function CollapsibleSection({ title, icon: Icon, children, defaultOpen = true }: {
    title: string;
    icon: any;
    children: React.ReactNode;
    defaultOpen?: boolean;
}) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 rounded-[2rem] shadow-2xl overflow-hidden">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between p-7 hover:bg-white/[.02] transition-colors"
            >
                <h3 className="text-sm font-bold text-neutral-400 flex items-center gap-2">
                    <Icon className="w-4 h-4" /> {title}
                </h3>
                <ChevronDown className={`w-4 h-4 text-neutral-600 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="px-8 pb-8 pt-0 space-y-5">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ── Schedule slot type ──
interface ScheduleSlot {
    id: string;
    dias: string[];
    horaInicio: string;
    horaFin: string;
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                <Loader2 className="animate-spin text-emerald-500" size={48} />
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}

function LoginContent() {
    const searchParams = useSearchParams();
    const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';

    // Auth mode
    const [mode, setMode] = useState<'login' | 'register'>(initialMode);
    const [role, setRole] = useState<'cliente' | 'tatuador'>('cliente');

    // Sync mode if query param changes
    useEffect(() => {
        const m = searchParams.get('mode');
        if (m === 'register') setMode('register');
        else if (m === 'login') setMode('login');
    }, [searchParams]);

    // Shared fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordSecure = password.length >= 8 && /[A-Z]/.test(password) && /[^A-Za-z0-9]/.test(password);

    // Profile fields
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [telefono, setTelefono] = useState('');
    const [ubicacion, setUbicacion] = useState('');

    // Tattoo artist fields
    const [nombreArtistico, setNombreArtistico] = useState('');
    const [biografia, setBiografia] = useState('');
    const [estilo, setEstilo] = useState('');
    const [instagram, setInstagram] = useState('');
    const [foto, setFoto] = useState<File | null>(null);
    const [fotoPreview, setFotoPreview] = useState<string | null>(null);
    const [ubicacionEstudio, setUbicacionEstudio] = useState('');

    // Schedule slots (multiple)
    const [scheduleSlots, setScheduleSlots] = useState<ScheduleSlot[]>([
        { id: 'initial-slot', dias: [], horaInicio: '09:00', horaFin: '18:00' }
    ]);

    // UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── Schedule helpers ──
    const addScheduleSlot = () => {
        setScheduleSlots(prev => [...prev, { id: crypto.randomUUID(), dias: [], horaInicio: '09:00', horaFin: '18:00' }]);
    };

    const removeScheduleSlot = (id: string) => {
        if (scheduleSlots.length <= 1) return;
        setScheduleSlots(prev => prev.filter(s => s.id !== id));
    };

    const updateSlot = (id: string, field: keyof ScheduleSlot, value: any) => {
        setScheduleSlots(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const toggleSlotDay = (slotId: string, day: string) => {
        setScheduleSlots(prev => prev.map(s => {
            if (s.id !== slotId) return s;
            const dias = s.dias.includes(day) ? s.dias.filter(d => d !== day) : [...s.dias, day];
            return { ...s, dias };
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFoto(file);
            const reader = new FileReader();
            reader.onloadend = () => setFotoPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    // ── Login ──
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
            if (authError) throw authError;

            const { data: perfil } = await supabase
                .from('perfiles')
                .select('rol')
                .eq('id', data.user.id)
                .single();

            window.location.href = perfil?.rol === 'tatuador' ? '/artist-dashboard' : '/';
        } catch (err: any) {
            setError(err.message === 'Invalid login credentials' ? 'Email o contraseña incorrectos' : err.message);
        } finally {
            setLoading(false);
        }
    };

    // ── Register ──
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
            if (authError) throw authError;
            if (!authData.user) throw new Error('No se pudo crear el usuario');

            const userId = authData.user.id;

            const { error: profileError } = await supabase
                .from('perfiles')
                .insert({ 
                    id: userId, 
                    email, 
                    nombre, 
                    apellido, 
                    telefono, 
                    ubicacion: role === 'tatuador' ? ubicacionEstudio : ubicacion, 
                    rol: role 
                });

            if (profileError) throw profileError;

            if (role === 'tatuador') {
                let fotoUrl = '';
                if (foto) {
                    const fileExt = foto.name.split('.').pop();
                    const fileName = `${userId}-profile.${fileExt}`;
                    const { error: uploadError } = await supabase.storage.from('try-on-uploads').upload(fileName, foto);
                    if (uploadError) throw uploadError;
                    const { data: { publicUrl } } = supabase.storage.from('try-on-uploads').getPublicUrl(fileName);
                    fotoUrl = publicUrl;
                }

                // Flatten schedule: collect all unique days, and use first slot's times as primary
                const allDays = [...new Set(scheduleSlots.flatMap(s => s.dias))];

                const { error: artistError } = await supabase
                    .from('tatuadores')
                    .insert({
                        user_id: userId,
                        nombre_artistico: nombreArtistico,
                        biografia,
                        estilo_principal: estilo,
                        instagram_url: instagram,
                        foto_perfil_url: fotoUrl,
                        ubicacion: ubicacionEstudio,
                        dias_laborales: allDays,
                        hora_inicio: scheduleSlots[0]?.horaInicio || '09:00',
                        hora_fin: scheduleSlots[0]?.horaFin || '18:00',
                    });

                if (artistError) throw artistError;
            }

            setSuccess('¡Cuenta creada con éxito! Redirigiendo...');
            setTimeout(() => {
                window.location.href = role === 'tatuador' ? '/artist-dashboard' : '/';
            }, 1500);
        } catch (err: any) {
            setError(err.message?.includes('already registered') ? 'Este email ya está registrado. Intentá iniciar sesión.' : err.message);
        } finally {
            setLoading(false);
        }
    };

    // ═══════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════
    return (
        <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[128px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/3 rounded-full blur-[128px]" />
            </div>

            <div className="w-full max-w-lg relative z-10">
                {/* Back to home */}
                <Link href="/" className="inline-flex items-center gap-2 text-neutral-500 hover:text-white transition-colors mb-8 text-sm group">
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Volver al inicio
                </Link>

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 mb-6">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">InkMatch</span>
                    </div>
                    <h1 className="text-4xl font-extrabold mb-3">
                        {mode === 'login' ? 'Bienvenido de vuelta' : 'Creá tu cuenta'}
                    </h1>
                    <p className="text-neutral-500 text-sm">
                        {mode === 'login' ? 'Ingresá con tu email para continuar' : 'Unite a la comunidad de tatuajes más grande'}
                    </p>
                </motion.div>

                {/* Mode toggle */}
                <div className="flex bg-neutral-900/80 border border-neutral-800 rounded-2xl p-1.5 mb-8">
                    {(['login', 'register'] as const).map((m) => (
                        <button
                            key={m}
                            onClick={() => { setMode(m); setError(''); setSuccess(''); }}
                            className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition-all ${mode === m ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-neutral-500 hover:text-white'}`}
                        >
                            {m === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {/* ══════════ LOGIN ══════════ */}
                    {mode === 'login' && (
                        <motion.form
                            key="login"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            onSubmit={handleLogin}
                            className="space-y-6"
                        >
                            <div className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 rounded-[2rem] p-8 space-y-6 shadow-2xl">
                                {/* Email */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-emerald-400 transition-colors" />
                                        <input type="email" required placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)}
                                            className="w-full bg-neutral-900/50 border border-neutral-800 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-emerald-500/50 focus:bg-neutral-900 transition-all placeholder:text-neutral-700 text-sm" />
                                    </div>
                                </div>
                                {/* Password */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Contraseña</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-emerald-400 transition-colors" />
                                        <input type={showPassword ? 'text' : 'password'} required placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                                            className="w-full bg-neutral-900/50 border border-neutral-800 rounded-2xl pl-12 pr-12 py-4 text-white outline-none focus:border-emerald-500/50 focus:bg-neutral-900 transition-all placeholder:text-neutral-700 text-sm" />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-white transition-colors">
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {error && <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/20 text-red-400 px-5 py-3 rounded-2xl text-sm font-medium">{error}</motion.div>}

                            <button type="submit" disabled={loading}
                                className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20 disabled:opacity-50 active:scale-[0.98]">
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ArrowRight className="w-5 h-5" /><span>Iniciar Sesión</span></>}
                            </button>
                        </motion.form>
                    )}

                    {/* ══════════ REGISTER ══════════ */}
                    {mode === 'register' && (
                        <motion.form
                            key="register"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            onSubmit={handleRegister}
                            className="space-y-6"
                        >
                            {/* Role toggle */}
                            <div className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 rounded-[2rem] p-6 shadow-2xl">
                                <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-4">¿Qué tipo de cuenta querés?</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <button type="button" onClick={() => setRole('cliente')}
                                        className={`p-5 rounded-2xl border-2 transition-all text-left ${role === 'cliente' ? 'border-emerald-500 bg-emerald-500/5 shadow-lg shadow-emerald-500/10' : 'border-neutral-800 hover:border-neutral-700'}`}>
                                        <User className={`w-6 h-6 mb-3 ${role === 'cliente' ? 'text-emerald-400' : 'text-neutral-600'}`} />
                                        <p className={`font-bold text-sm ${role === 'cliente' ? 'text-white' : 'text-neutral-500'}`}>Soy Cliente</p>
                                        <p className="text-[11px] text-neutral-600 mt-1">Busco un tatuador</p>
                                    </button>
                                    <button type="button" onClick={() => setRole('tatuador')}
                                        className={`p-5 rounded-2xl border-2 transition-all text-left ${role === 'tatuador' ? 'border-emerald-500 bg-emerald-500/5 shadow-lg shadow-emerald-500/10' : 'border-neutral-800 hover:border-neutral-700'}`}>
                                        <Palette className={`w-6 h-6 mb-3 ${role === 'tatuador' ? 'text-emerald-400' : 'text-neutral-600'}`} />
                                        <p className={`font-bold text-sm ${role === 'tatuador' ? 'text-white' : 'text-neutral-500'}`}>Soy Tatuador</p>
                                        <p className="text-[11px] text-neutral-600 mt-1">Quiero publicar mi trabajo</p>
                                    </button>
                                </div>
                            </div>

                            {/* ── Datos personales (collapsible) ── */}
                            <CollapsibleSection title="Datos personales" icon={User} defaultOpen={true}>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Nombre</label>
                                        <div className="relative group">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-emerald-400 transition-colors" />
                                            <input type="text" required placeholder="Juan" value={nombre} onChange={e => setNombre(e.target.value)}
                                                className="w-full bg-neutral-900/50 border border-neutral-800 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-emerald-500/50 focus:bg-neutral-900 transition-all placeholder:text-neutral-700 text-sm" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Apellido</label>
                                        <div className="relative group">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-emerald-400 transition-colors" />
                                            <input type="text" required placeholder="Pérez" value={apellido} onChange={e => setApellido(e.target.value)}
                                                className="w-full bg-neutral-900/50 border border-neutral-800 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-emerald-500/50 focus:bg-neutral-900 transition-all placeholder:text-neutral-700 text-sm" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-emerald-400 transition-colors" />
                                        <input type="email" required placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)}
                                            className="w-full bg-neutral-900/50 border border-neutral-800 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-emerald-500/50 focus:bg-neutral-900 transition-all placeholder:text-neutral-700 text-sm" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Contraseña</label>
                                        <div className="flex gap-2 mb-1">
                                            <span className={`h-1 w-8 rounded-full transition-all ${password.length >= 8 ? 'bg-emerald-500' : 'bg-neutral-800'}`} />
                                            <span className={`h-1 w-8 rounded-full transition-all ${/[A-Z]/.test(password) ? 'bg-emerald-500' : 'bg-neutral-800'}`} />
                                            <span className={`h-1 w-8 rounded-full transition-all ${/[^A-Za-z0-9]/.test(password) ? 'bg-emerald-500' : 'bg-neutral-800'}`} />
                                        </div>
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-emerald-400 transition-colors" />
                                        <input 
                                            type={showPassword ? 'text' : 'password'} 
                                            required 
                                            placeholder="••••••••" 
                                            value={password} 
                                            onChange={e => setPassword(e.target.value)}
                                            className="w-full bg-neutral-900/50 border border-neutral-800 rounded-2xl pl-12 pr-12 py-4 text-white outline-none focus:border-emerald-500/50 focus:bg-neutral-900 transition-all placeholder:text-neutral-700 text-sm" 
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-white transition-colors">
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-neutral-500 flex flex-wrap gap-x-3 gap-y-1 px-1">
                                        <span className={password.length >= 8 ? 'text-emerald-400' : ''}>• Min. 8 caracteres</span>
                                        <span className={/[A-Z]/.test(password) ? 'text-emerald-400' : ''}>• Una mayúscula</span>
                                        <span className={/[^A-Za-z0-9]/.test(password) ? 'text-emerald-400' : ''}>• Un carácter especial</span>
                                    </p>
                                </div>
                                <div className={`grid ${role === 'cliente' ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Teléfono</label>
                                        <div className="relative group">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-emerald-400 transition-colors" />
                                            <input type="tel" placeholder="541112345678" value={telefono} onChange={e => setTelefono(e.target.value.replace(/\D/g, ''))}
                                                className="w-full bg-neutral-900/50 border border-neutral-800 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-emerald-500/50 focus:bg-neutral-900 transition-all placeholder:text-neutral-700 text-sm" />
                                        </div>
                                    </div>
                                    {role === 'cliente' && (
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Ubicación</label>
                                            <div className="relative group">
                                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-emerald-400 transition-colors" />
                                                <input type="text" placeholder="Buenos Aires" value={ubicacion} onChange={e => setUbicacion(e.target.value)}
                                                    className="w-full bg-neutral-900/50 border border-neutral-800 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-emerald-500/50 focus:bg-neutral-900 transition-all placeholder:text-neutral-700 text-sm" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CollapsibleSection>

                            {/* ── Perfil artístico (collapsible, only for tatuador) ── */}
                            <AnimatePresence>
                                {role === 'tatuador' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden space-y-6"
                                    >
                                        <CollapsibleSection title="Perfil artístico" icon={Palette} defaultOpen={true}>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Nombre Artístico</label>
                                                <div className="relative group">
                                                    <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-emerald-400 transition-colors" />
                                                    <input type="text" required placeholder="Tu nombre de artista" value={nombreArtistico} onChange={e => setNombreArtistico(e.target.value)}
                                                        className="w-full bg-neutral-900/50 border border-neutral-800 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-emerald-500/50 focus:bg-neutral-900 transition-all placeholder:text-neutral-700 text-sm" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Biografía / Historia</label>
                                                <div className="relative group">
                                                    <BookOpen className="absolute left-4 top-4 w-4 h-4 text-neutral-600 group-focus-within:text-emerald-400 transition-colors" />
                                                    <textarea placeholder="Contá sobre tu trayectoria..." value={biografia} onChange={e => setBiografia(e.target.value)}
                                                        className="w-full bg-neutral-900/50 border border-neutral-800 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-emerald-500/50 focus:bg-neutral-900 transition-all placeholder:text-neutral-700 text-sm resize-none min-h-[100px]" />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Estilo Principal</label>
                                                    <div className="relative group">
                                                        <Palette className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 pointer-events-none" />
                                                        <select required value={estilo} onChange={e => setEstilo(e.target.value)}
                                                            className="w-full bg-neutral-900/50 border border-neutral-800 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-emerald-500/50 focus:bg-neutral-900 transition-all text-sm appearance-none cursor-pointer">
                                                            <option value="">Seleccionar...</option>
                                                            {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Instagram (URL)</label>
                                                    <div className="relative group">
                                                        <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-emerald-400 transition-colors" />
                                                        <input type="url" placeholder="https://instagram.com/..." value={instagram} onChange={e => setInstagram(e.target.value)}
                                                            className="w-full bg-neutral-900/50 border border-neutral-800 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-emerald-500/50 focus:bg-neutral-900 transition-all placeholder:text-neutral-700 text-sm" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Ubicación del Estudio</label>
                                                <div className="relative group">
                                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-emerald-400 transition-colors" />
                                                    <input type="text" required placeholder="Palermo, CABA" value={ubicacionEstudio} onChange={e => setUbicacionEstudio(e.target.value)}
                                                        className="w-full bg-neutral-900/50 border border-neutral-800 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-emerald-500/50 focus:bg-neutral-900 transition-all placeholder:text-neutral-700 text-sm" />
                                                </div>
                                            </div>
                                            {/* Profile photo */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Foto de Perfil</label>
                                                <div className="flex items-center gap-4">
                                                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                                    <button type="button" onClick={() => fileInputRef.current?.click()}
                                                        className={`flex items-center gap-3 px-6 py-4 rounded-2xl border-2 border-dashed transition-all ${fotoPreview ? 'border-emerald-500 bg-emerald-500/5 text-emerald-400' : 'border-neutral-800 text-neutral-600 hover:border-neutral-700'}`}>
                                                        <Camera className="w-5 h-5" />
                                                        <span className="text-sm font-bold">{fotoPreview ? 'Cambiar foto' : 'Subir foto'}</span>
                                                    </button>
                                                    {fotoPreview && (
                                                        <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-neutral-800 shadow-lg">
                                                            <img src={fotoPreview} className="w-full h-full object-cover" alt="Preview" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CollapsibleSection>

                                        {/* ── Disponibilidad horaria (collapsible) ── */}
                                        <CollapsibleSection title="Disponibilidad horaria" icon={CalendarDays} defaultOpen={true}>
                                            <div className="space-y-5">
                                                {scheduleSlots.map((slot, idx) => (
                                                    <div key={slot.id} className="bg-black/20 rounded-2xl p-5 border border-neutral-800/50 space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                                                                Horario {scheduleSlots.length > 1 ? `#${idx + 1}` : ''}
                                                            </span>
                                                            {scheduleSlots.length > 1 && (
                                                                <button type="button" onClick={() => removeScheduleSlot(slot.id)}
                                                                    className="p-1.5 text-neutral-700 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            )}
                                                        </div>

                                                        {/* Days */}
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-bold text-neutral-600 uppercase tracking-wider">Días</label>
                                                            <div className="flex flex-wrap gap-2">
                                                                {DAYS.map(day => (
                                                                    <button key={day} type="button" onClick={() => toggleSlotDay(slot.id, day)}
                                                                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${slot.dias.includes(day)
                                                                            ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                                                                            : 'bg-neutral-900 border border-neutral-800 text-neutral-500 hover:border-neutral-700'
                                                                            }`}>
                                                                        {day.slice(0, 3)}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Hours */}
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <label className="text-xs font-bold text-neutral-600 uppercase tracking-wider">Hora inicio</label>
                                                                <div className="relative group">
                                                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-emerald-400 transition-colors" />
                                                                    <input type="time" value={slot.horaInicio} onChange={e => updateSlot(slot.id, 'horaInicio', e.target.value)}
                                                                        className="w-full bg-neutral-900/50 border border-neutral-800 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-emerald-500/50 transition-all text-sm" />
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-xs font-bold text-neutral-600 uppercase tracking-wider">Hora fin</label>
                                                                <div className="relative group">
                                                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-emerald-400 transition-colors" />
                                                                    <input type="time" value={slot.horaFin} onChange={e => updateSlot(slot.id, 'horaFin', e.target.value)}
                                                                        className="w-full bg-neutral-900/50 border border-neutral-800 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-emerald-500/50 transition-all text-sm" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}

                                                <button type="button" onClick={addScheduleSlot}
                                                    className="w-full py-4 border-2 border-dashed border-neutral-800 rounded-2xl text-neutral-500 hover:border-emerald-500/30 hover:text-emerald-400 hover:bg-emerald-500/5 transition-all flex items-center justify-center gap-2 text-sm font-bold">
                                                    <Plus className="w-4 h-4" />
                                                    Agregar otro horario
                                                </button>
                                            </div>
                                        </CollapsibleSection>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Error / Success */}
                            {error && <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/20 text-red-400 px-5 py-3 rounded-2xl text-sm font-medium">{error}</motion.div>}
                            {success && <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-5 py-3 rounded-2xl text-sm font-medium">{success}</motion.div>}

                            <button type="submit" disabled={loading || (mode === 'register' && !isPasswordSecure)}
                                className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20 disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]">
                                {loading
                                    ? <Loader2 className="w-5 h-5 animate-spin" />
                                    : <><ArrowRight className="w-5 h-5" /><span>Crear cuenta como {role === 'cliente' ? 'Cliente' : 'Tatuador'}</span></>
                                }
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
