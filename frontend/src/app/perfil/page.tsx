'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
    User, 
    Palette, 
    Calendar, 
    Save, 
    Loader2, 
    ChevronDown, 
    ChevronUp, 
    Instagram, 
    Mail, 
    Phone, 
    MapPin, 
    Type,
    Camera,
    Plus,
    X
} from 'lucide-react';

interface AvailabilityRange {
    inicio: string;
    fin: string;
}

const DAY_NAMES = [
    { id: 0, name: 'Domingo' },
    { id: 1, name: 'Lunes' },
    { id: 2, name: 'Martes' },
    { id: 3, name: 'Miércoles' },
    { id: 4, name: 'Jueves' },
    { id: 5, name: 'Viernes' },
    { id: 6, name: 'Sábado' },
];

export default function PerfilPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [sections, setSections] = useState({
        personales: true,
        artistico: false,
        disponibilidad: false
    });

    // Form States
    const [personales, setPersonales] = useState({
        nombre: '',
        apellido: '',
        email: '',
        telefono: ''
    });

    const [artistico, setArtistico] = useState({
        nombre_artistico: '',
        biografia: '',
        estilo_principal: '',
        instagram_url: '',
        ubicacion: '',
        foto_perfil_url: ''
    });

    const [disponibilidad, setDisponibilidad] = useState({
        dias_laborales: [1, 2, 3, 4, 5] as number[],
        rangos: [{ inicio: '09:00', fin: '18:00' }] as AvailabilityRange[]
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            window.location.href = '/login';
            return;
        }
        setUser(session.user);

        // Fetch Perfil (Personales)
        const { data: profile } = await supabase.from('perfiles').select('*').eq('id', session.user.id).single();
        if (profile) {
            setPersonales({
                nombre: profile.nombre || '',
                apellido: profile.apellido || '',
                email: session.user.email || '',
                telefono: profile.telefono || ''
            });
        }

        // Fetch Tatuador (Artistico & Disponibilidad)
        const { data: artist } = await supabase.from('tatuadores').select('*').eq('usuario_id', session.user.id).single();
        if (artist) {
            setArtistico({
                nombre_artistico: artist.nombre_artistico || '',
                biografia: artist.biografia || '',
                estilo_principal: artist.estilo_principal || '',
                instagram_url: artist.instagram_url || '',
                ubicacion: artist.ubicacion || '',
                foto_perfil_url: artist.foto_perfil_url || ''
            });

            // Parse availability
            // Ensure dias_laborales is stored as numbers (0-6)
            let dias = artist.dias_laborales || [1, 2, 3, 4, 5];
            // If they are names, convert to indices
            if (typeof dias[0] === 'string') {
                const map: any = { 'Domingo': 0, 'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 'Jueves': 4, 'Viernes': 5, 'Sábado': 6 };
                dias = dias.map((d: string) => map[d] ?? 1);
            }

            setDisponibilidad({
                dias_laborales: dias,
                rangos: artist.horarios_multiples || [{ inicio: artist.hora_inicio || '09:00', fin: artist.hora_fin || '18:00' }]
            });
        }
        setLoading(false);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // 1. Update Perfiles
            await supabase.from('perfiles').update({
                nombre: personales.nombre,
                apellido: personales.apellido,
                telefono: personales.telefono
            }).eq('id', user.id);

            // 2. Update Tatuadores
            const { data: artist } = await supabase.from('tatuadores').select('id').eq('usuario_id', user.id).single();
            if (artist) {
                await supabase.from('tatuadores').update({
                    nombre_artistico: artistico.nombre_artistico,
                    biografia: artistico.biografia,
                    estilo_principal: artistico.estilo_principal,
                    instagram_url: artistico.instagram_url,
                    ubicacion: artistico.ubicacion,
                    foto_perfil_url: artistico.foto_perfil_url,
                    dias_laborales: disponibilidad.dias_laborales,
                    hora_inicio: disponibilidad.rangos[0]?.inicio || '09:00',
                    hora_fin: disponibilidad.rangos[0]?.fin || '18:00',
                    horarios_multiples: disponibilidad.rangos
                }).eq('id', artist.id);
            }

            alert('Perfil actualizado con éxito');
        } catch (error: any) {
            alert('Error al guardar: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const toggleDay = (day: number) => {
        setDisponibilidad(prev => ({
            ...prev,
            dias_laborales: prev.dias_laborales.includes(day)
                ? prev.dias_laborales.filter(d => d !== day)
                : [...prev.dias_laborales, day]
        }));
    };

    const addRange = () => {
        setDisponibilidad(prev => ({
            ...prev,
            rangos: [...prev.rangos, { inicio: '15:00', fin: '19:00' }]
        }));
    };

    const removeRange = (index: number) => {
        setDisponibilidad(prev => ({
            ...prev,
            rangos: prev.rangos.filter((_, i) => i !== index)
        }));
    };

    if (loading) return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        </div>
    );

    return (
        <main className="min-h-screen bg-neutral-950 text-white pb-20 pt-10">
            <div className="max-w-4xl mx-auto px-6">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight mb-2">Mi Perfil</h1>
                        <p className="text-neutral-500">Gestioná tu información personal, profesional y disponibilidad.</p>
                    </div>
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-emerald-500 hover:bg-emerald-400 text-black px-8 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-emerald-sm disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Sección 1: Datos Personales */}
                    <div className="bg-neutral-900/50 border border-neutral-800 rounded-[2rem] overflow-hidden">
                        <button 
                            onClick={() => setSections(s => ({ ...s, personales: !s.personales }))}
                            className="w-full p-8 flex justify-between items-center hover:bg-white/5 transition-colors"
                        >
                            <div className="flex items-center gap-4 text-emerald-400">
                                <User className="w-6 h-6" />
                                <h3 className="text-xl font-bold text-white">Datos Personales</h3>
                            </div>
                            {sections.personales ? <ChevronUp /> : <ChevronDown />}
                        </button>
                        
                        {sections.personales && (
                            <div className="p-8 pt-0 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-500">Nombre</label>
                                    <input value={personales.nombre} onChange={e => setPersonales({...personales, nombre: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-4 focus:ring-2 focus:ring-emerald-500 outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-500">Apellido</label>
                                    <input value={personales.apellido} onChange={e => setPersonales({...personales, apellido: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-4 focus:ring-2 focus:ring-emerald-500 outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-500">Email</label>
                                    <input disabled value={personales.email} className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl p-4 text-neutral-600 cursor-not-allowed outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-500">Teléfono</label>
                                    <input value={personales.telefono} onChange={e => setPersonales({...personales, telefono: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-4 focus:ring-2 focus:ring-emerald-500 outline-none" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sección 2: Perfil Artístico */}
                    <div className="bg-neutral-900/50 border border-neutral-800 rounded-[2rem] overflow-hidden">
                        <button 
                            onClick={() => setSections(s => ({ ...s, artistico: !s.artistico }))}
                            className="w-full p-8 flex justify-between items-center hover:bg-white/5 transition-colors"
                        >
                            <div className="flex items-center gap-4 text-emerald-400">
                                <Palette className="w-6 h-6" />
                                <h3 className="text-xl font-bold text-white">Perfil Artístico</h3>
                            </div>
                            {sections.artistico ? <ChevronUp /> : <ChevronDown />}
                        </button>
                        
                        {sections.artistico && (
                            <div className="p-8 pt-0 space-y-6 animate-in slide-in-from-top-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-neutral-500">Nombre Artístico</label>
                                        <input value={artistico.nombre_artistico} onChange={e => setArtistico({...artistico, nombre_artistico: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-4 focus:ring-2 focus:ring-emerald-500 outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-neutral-500">Estilo Principal</label>
                                        <select value={artistico.estilo_principal} onChange={e => setArtistico({...artistico, estilo_principal: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-4 focus:ring-2 focus:ring-emerald-500 outline-none appearance-none">
                                            <option value="Realismo">Realismo</option>
                                            <option value="Tradicional">Tradicional</option>
                                            <option value="Blackwork">Blackwork</option>
                                            <option value="Fine Line">Fine Line</option>
                                            <option value="Neo Tradicional">Neo Tradicional</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-500">Biografía</label>
                                    <textarea value={artistico.biografia} onChange={e => setArtistico({...artistico, biografia: e.target.value})} className="w-full h-32 bg-neutral-950 border border-neutral-800 rounded-xl p-4 focus:ring-2 focus:ring-emerald-500 outline-none resize-none" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-neutral-500 flex items-center gap-2"><Instagram className="w-4 h-4" /> Instagram URL</label>
                                        <input value={artistico.instagram_url} onChange={e => setArtistico({...artistico, instagram_url: e.target.value})} placeholder="https://instagram.com/tuperfil" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-4 focus:ring-2 focus:ring-emerald-500 outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-neutral-500 flex items-center gap-2"><MapPin className="w-4 h-4" /> Ubicación del Estudio</label>
                                        <input value={artistico.ubicacion} onChange={e => setArtistico({...artistico, ubicacion: e.target.value})} placeholder="Ej: San Telmo, CABA" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-4 focus:ring-2 focus:ring-emerald-500 outline-none" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-500 flex items-center gap-2"><Camera className="w-4 h-4" /> Foto de Perfil (URL)</label>
                                    <div className="flex gap-4 items-center">
                                        <div className="w-16 h-16 rounded-full overflow-hidden bg-neutral-800">
                                            {artistico.foto_perfil_url ? <img src={artistico.foto_perfil_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-neutral-600"><User /></div>}
                                        </div>
                                        <input value={artistico.foto_perfil_url} onChange={e => setArtistico({...artistico, foto_perfil_url: e.target.value})} className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl p-4 focus:ring-2 focus:ring-emerald-500 outline-none" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sección 3: Disponibilidad Horaria */}
                    <div className="bg-neutral-900/50 border border-neutral-800 rounded-[2rem] overflow-hidden">
                        <button 
                            onClick={() => setSections(s => ({ ...s, disponibilidad: !s.disponibilidad }))}
                            className="w-full p-8 flex justify-between items-center hover:bg-white/5 transition-colors"
                        >
                            <div className="flex items-center gap-4 text-emerald-400">
                                <Calendar className="w-6 h-6" />
                                <h3 className="text-xl font-bold text-white">Disponibilidad Horaria</h3>
                            </div>
                            {sections.disponibilidad ? <ChevronUp /> : <ChevronDown />}
                        </button>
                        
                        {sections.disponibilidad && (
                            <div className="p-8 pt-0 space-y-8 animate-in slide-in-from-top-2">
                                <div className="space-y-4">
                                    <label className="text-sm font-medium text-neutral-500">Días Laborales</label>
                                    <div className="flex flex-wrap gap-2">
                                        {DAY_NAMES.map((day) => (
                                            <button
                                                key={day.id}
                                                onClick={() => toggleDay(day.id)}
                                                className={`px-4 py-2 rounded-full border text-xs font-bold transition-all ${
                                                    disponibilidad.dias_laborales.includes(day.id)
                                                        ? 'bg-emerald-500 border-emerald-500 text-black shadow-emerald-sm'
                                                        : 'bg-transparent border-neutral-800 text-neutral-500 hover:border-neutral-600'
                                                }`}
                                            >
                                                {day.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium text-neutral-500">Franjas Horarias</label>
                                        <button 
                                            onClick={addRange}
                                            className="text-xs text-emerald-400 font-bold flex items-center gap-1 hover:text-emerald-300 transition-colors"
                                        >
                                            <Plus className="w-3 h-3" /> Agregar otro horario
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {disponibilidad.rangos.map((range, index) => (
                                            <div key={index} className="flex items-center gap-4 bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
                                                <div className="flex-1 grid grid-cols-2 gap-4">
                                                    <div>
                                                        <span className="text-[10px] text-neutral-600 block mb-1 uppercase font-bold">Inicia</span>
                                                        <input 
                                                            type="time" 
                                                            value={range.inicio} 
                                                            onChange={e => {
                                                                const newRangos = [...disponibilidad.rangos];
                                                                newRangos[index].inicio = e.target.value;
                                                                setDisponibilidad({...disponibilidad, rangos: newRangos});
                                                            }}
                                                            className="w-full bg-transparent text-white outline-none [color-scheme:dark]" 
                                                        />
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] text-neutral-600 block mb-1 uppercase font-bold">Termina</span>
                                                        <input 
                                                            type="time" 
                                                            value={range.fin} 
                                                            onChange={e => {
                                                                const newRangos = [...disponibilidad.rangos];
                                                                newRangos[index].fin = e.target.value;
                                                                setDisponibilidad({...disponibilidad, rangos: newRangos});
                                                            }}
                                                            className="w-full bg-transparent text-white outline-none [color-scheme:dark]" 
                                                        />
                                                    </div>
                                                </div>
                                                {disponibilidad.rangos.length > 1 && (
                                                    <button onClick={() => removeRange(index)} className="p-2 text-neutral-600 hover:text-red-400">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
