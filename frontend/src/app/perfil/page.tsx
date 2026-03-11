'use client';

import { useState, useEffect, useRef } from 'react';
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
    MapPin, 
    Camera,
    Plus,
    X,
    Search,
    Upload
} from 'lucide-react';

interface AvailabilityBlock {
    dias: number[];
    franjas: { inicio: string; fin: string }[];
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
    const [artistId, setArtistId] = useState<string | null>(null);
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

    const [disponibilidadBlocks, setDisponibilidadBlocks] = useState<AvailabilityBlock[]>([
        { dias: [1, 2, 3, 4, 5], franjas: [{ inicio: '09:00', fin: '18:00' }] }
    ]);

    // Extra states for Location & Photo
    const [locationSearch, setLocationSearch] = useState('');
    const [locationResults, setLocationResults] = useState<any[]>([]);
    const [isSearchingLocation, setIsSearchingLocation] = useState(false);
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);
    
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    // Nominatim Autocomplete Debounce
    useEffect(() => {
        if (!locationSearch || locationSearch === artistico.ubicacion) {
            setLocationResults([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setIsSearchingLocation(true);
            try {
                // Limit to 5 results to avoid huge dropdowns
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationSearch)}&limit=5`);
                const data = await res.json();
                setLocationResults(data);
                setShowLocationDropdown(true);
            } catch (error) {
                console.error("Error fetching location:", error);
            } finally {
                setIsSearchingLocation(false);
            }
        }, 600);
        return () => clearTimeout(delayDebounceFn);
    }, [locationSearch]);

    const selectLocation = (displayName: string) => {
        setArtistico(prev => ({ ...prev, ubicacion: displayName }));
        setLocationSearch(displayName);
        setShowLocationDropdown(false);
    };

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
        const { data: artist } = await supabase.from('tatuadores').select('*').eq('user_id', session.user.id).single();
        if (artist) {
            setArtistId(artist.id);
            setArtistico({
                nombre_artistico: artist.nombre_artistico || '',
                biografia: artist.biografia || '',
                estilo_principal: artist.estilo_principal || '',
                instagram_url: artist.instagram_url || '',
                ubicacion: artist.ubicacion || '',
                foto_perfil_url: artist.foto_perfil_url || ''
            });
            setLocationSearch(artist.ubicacion || '');

            // Parse availability blocks
            if (artist.horarios_multiples && artist.horarios_multiples.length > 0) {
                // Ensure all blocks have franjas
                const mappedBlocks = artist.horarios_multiples.map((b: any) => {
                    if (b.franjas) return b;
                    return { ...b, franjas: [{ inicio: b.inicio || '09:00', fin: b.fin || '18:00' }] };
                });
                setDisponibilidadBlocks(mappedBlocks);
            } else {
                // Fallback / Migrate old data
                let dias = artist.dias_laborales || [1, 2, 3, 4, 5];
                if (typeof dias[0] === 'string') {
                    const map: any = { 'Domingo': 0, 'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 'Jueves': 4, 'Viernes': 5, 'Sábado': 6 };
                    dias = dias.map((d: string) => map[d] ?? 1);
                }
                setDisponibilidadBlocks([{
                    dias: dias,
                    franjas: [{
                        inicio: artist.hora_inicio || '09:00',
                        fin: artist.hora_fin || '18:00'
                    }]
                }]);
            }
        }
        setLoading(false);
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (/^\d*$/.test(val)) {
            setPersonales({ ...personales, telefono: val });
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingPhoto(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `profile-${user.id}-${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from('try-on-uploads').upload(fileName, file);
            
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('try-on-uploads').getPublicUrl(fileName);
            setArtistico(prev => ({ ...prev, foto_perfil_url: publicUrl }));
        } catch (err: any) {
            alert("Error al subir foto: " + err.message);
        } finally {
            setUploadingPhoto(false);
        }
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

            // 2. Upsert Tatuadores (creates if not exists)
            const payload: any = {
                user_id: user.id,
                nombre_artistico: artistico.nombre_artistico,
                biografia: artistico.biografia,
                estilo_principal: artistico.estilo_principal,
                instagram_url: artistico.instagram_url,
                ubicacion: artistico.ubicacion,
                foto_perfil_url: artistico.foto_perfil_url,
                horarios_multiples: disponibilidadBlocks
            };
            
            if (artistId) { payload.id = artistId; }

            const { data, error } = await supabase.from('tatuadores').upsert(payload).select().single();
            if (error) throw error;
            
            if (data && !artistId) {
                setArtistId(data.id);
            }

            alert('Perfil guardado con éxito');
        } catch (error: any) {
            alert('Error al guardar: ' + error.message);
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const addBlock = () => {
        setDisponibilidadBlocks(prev => [...prev, { dias: [1, 2, 3, 4, 5], franjas: [{ inicio: '09:00', fin: '18:00' }] }]);
    };

    const removeBlock = (index: number) => {
        setDisponibilidadBlocks(prev => prev.filter((_, i) => i !== index));
    };

    const toggleDayInBlock = (blockIndex: number, dayId: number) => {
        const newBlocks = [...disponibilidadBlocks];
        const block = newBlocks[blockIndex];
        if (block.dias.includes(dayId)) {
            block.dias = block.dias.filter(d => d !== dayId);
        } else {
            block.dias.push(dayId);
        }
        setDisponibilidadBlocks(newBlocks);
    };

    const addFranja = (blockIndex: number) => {
        const newBlocks = [...disponibilidadBlocks];
        newBlocks[blockIndex].franjas.push({ inicio: '15:00', fin: '19:00' });
        setDisponibilidadBlocks(newBlocks);
    };

    const removeFranja = (blockIndex: number, franjaIndex: number) => {
        const newBlocks = [...disponibilidadBlocks];
        newBlocks[blockIndex].franjas = newBlocks[blockIndex].franjas.filter((_, idx) => idx !== franjaIndex);
        setDisponibilidadBlocks(newBlocks);
    };

    const updateBlockTime = (blockIndex: number, franjaIndex: number, field: 'inicio' | 'fin', value: string) => {
        const newBlocks = [...disponibilidadBlocks];
        newBlocks[blockIndex].franjas[franjaIndex][field] = value;
        setDisponibilidadBlocks(newBlocks);
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
                    <div className="bg-neutral-900/50 border border-neutral-800 rounded-[2rem] overflow-visible">
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
                                    <label className="text-sm font-medium text-neutral-500">Teléfono (Solo números)</label>
                                    <input value={personales.telefono} onChange={handlePhoneChange} placeholder="e.g. 123456789" className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-4 focus:ring-2 focus:ring-emerald-500 outline-none" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sección 2: Perfil Artístico */}
                    <div className="bg-neutral-900/50 border border-neutral-800 rounded-[2rem] overflow-visible">
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
                                            <option value="">Seleccione un estilo...</option>
                                            <option value="Realismo">Realismo</option>
                                            <option value="Tradicional">Tradicional</option>
                                            <option value="Blackwork">Blackwork</option>
                                            <option value="Fine Line">Fine Line</option>
                                            <option value="Neo Tradicional">Neo Tradicional</option>
                                            <option value="Otro">Otro</option>
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
                                    
                                    {/* Ubicación Autocomplete */}
                                    <div className="space-y-2 relative">
                                        <label className="text-sm font-medium text-neutral-500 flex items-center gap-2"><MapPin className="w-4 h-4" /> Ubicación del Estudio</label>
                                        <div className="relative">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                                            <input 
                                                value={locationSearch} 
                                                onChange={e => {
                                                    setLocationSearch(e.target.value);
                                                    setArtistico({...artistico, ubicacion: e.target.value});
                                                    setShowLocationDropdown(true);
                                                }} 
                                                onFocus={() => { if(locationResults.length > 0) setShowLocationDropdown(true) }}
                                                placeholder="Lugar donde trabajás..." 
                                                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500 outline-none" 
                                            />
                                            {isSearchingLocation && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 animate-spin" />}
                                        </div>

                                        {showLocationDropdown && locationResults.length > 0 && (
                                            <div className="absolute z-50 mt-2 w-full bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl overflow-hidden">
                                                <div className="max-h-60 overflow-y-auto">
                                                    {locationResults.map((loc: any, idx) => (
                                                        <button 
                                                            key={idx} 
                                                            onClick={() => selectLocation(loc.display_name)}
                                                            className="w-full text-left px-4 py-3 hover:bg-neutral-800 text-sm border-b border-neutral-800/50 last:border-0"
                                                        >
                                                            {loc.display_name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-neutral-500 flex items-center gap-2"><Camera className="w-4 h-4" /> Foto de Perfil</label>
                                    <div className="flex gap-6 items-center bg-neutral-950 p-4 border border-neutral-800 rounded-2xl">
                                        <div className="w-20 h-20 rounded-full overflow-hidden bg-neutral-900 border border-neutral-800 flex-shrink-0">
                                            {artistico.foto_perfil_url ? (
                                                <img src={artistico.foto_perfil_url} className="w-full h-full object-cover" alt="Perfil" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-neutral-600"><User className="w-8 h-8"/></div>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-2 relative">
                                            <p className="text-sm font-medium">Subí o cambiá tu foto de perfil</p>
                                            <p className="text-xs text-neutral-500">Formatos soportados: JPG, PNG. Max 5MB.</p>
                                            
                                            <div className="relative inline-block mt-2">
                                                <button className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors">
                                                    {uploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin text-emerald-500" /> : <Upload className="w-4 h-4 text-emerald-500" />} 
                                                    {uploadingPhoto ? 'Subiendo...' : 'Seleccionar archivo'}
                                                </button>
                                                <input 
                                                    type="file" 
                                                    accept="image/*"
                                                    onChange={handlePhotoUpload} 
                                                    disabled={uploadingPhoto}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sección 3: Disponibilidad Horaria Multi-Rango */}
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
                                <div className="flex justify-between items-end">
                                    <p className="text-neutral-500 text-sm max-w-lg">
                                        Creá "Bloques" de disponibilidad. Por ejemplo: Podés trabajar de Lunes a Miércoles de 9 a 18 y Jueves y Viernes de 15 a 20.
                                    </p>
                                    <button 
                                        onClick={addBlock}
                                        className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-2 transition-colors px-4 py-2 bg-emerald-500/10 rounded-xl"
                                    >
                                        <Plus className="w-4 h-4" /> Agregar Bloque
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {disponibilidadBlocks.map((block, index) => (
                                        <div key={index} className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 relative group transition-all hover:border-neutral-700">
                                            {disponibilidadBlocks.length > 1 && (
                                                <button 
                                                    onClick={() => removeBlock(index)}
                                                    className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 hover:bg-red-400 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                    title="Eliminar bloque"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                            
                                            <div className="mb-6">
                                                <label className="text-sm font-medium text-neutral-400 block mb-3">Días para este bloque</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {DAY_NAMES.map((day) => (
                                                        <button
                                                            key={day.id}
                                                            onClick={() => toggleDayInBlock(index, day.id)}
                                                            className={`px-4 py-2 rounded-full border text-xs font-bold transition-all ${
                                                                block.dias.includes(day.id)
                                                                    ? 'bg-emerald-500 border-emerald-500 text-black shadow-emerald-sm'
                                                                    : 'bg-transparent border-neutral-800 text-neutral-500 hover:border-neutral-600'
                                                            }`}
                                                        >
                                                            {day.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center mb-4 mt-6">
                                                <h4 className="text-sm font-medium text-neutral-400">Franjas Horarias</h4>
                                                <button 
                                                    onClick={() => addFranja(index)} 
                                                    className="text-emerald-400 hover:text-emerald-300 font-bold text-sm flex items-center gap-1 transition-colors"
                                                >
                                                    <Plus className="w-3 h-3" /> Agregar otro horario
                                                </button>
                                            </div>

                                            <div className="space-y-4">
                                                {block.franjas.map((franja, fIdx) => (
                                                    <div key={fIdx} className="grid grid-cols-2 gap-6 bg-neutral-900/50 p-4 rounded-xl relative group/franja">
                                                        {block.franjas.length > 1 && (
                                                            <button 
                                                                onClick={() => removeFranja(index, fIdx)}
                                                                className="absolute -right-2 -top-2 w-6 h-6 bg-red-500 hover:bg-red-400 text-white rounded-full flex items-center justify-center opacity-0 group-hover/franja:opacity-100 transition-opacity shadow-lg"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        )}
                                                        <div>
                                                            <span className="text-[10px] text-neutral-500 block mb-2 uppercase font-bold tracking-wider">Inicia</span>
                                                            <div className="relative">
                                                                <input 
                                                                    type="time" 
                                                                    value={franja.inicio} 
                                                                    onChange={e => updateBlockTime(index, fIdx, 'inicio', e.target.value)}
                                                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white outline-none focus:border-emerald-500 [color-scheme:dark]" 
                                                                />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <span className="text-[10px] text-neutral-500 block mb-2 uppercase font-bold tracking-wider">Termina</span>
                                                            <div className="relative">
                                                                <input 
                                                                    type="time" 
                                                                    value={franja.fin} 
                                                                    onChange={e => updateBlockTime(index, fIdx, 'fin', e.target.value)}
                                                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white outline-none focus:border-emerald-500 [color-scheme:dark]" 
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {disponibilidadBlocks.length === 0 && (
                                        <div className="text-center py-10 bg-neutral-950 rounded-2xl border border-neutral-800 border-dashed">
                                            <p className="text-neutral-500">No hay bloques definidos.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
