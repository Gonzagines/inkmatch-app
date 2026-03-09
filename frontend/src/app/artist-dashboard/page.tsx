"use client";

import { useEffect, useState } from "react";
import {
    Plus,
    LayoutDashboard,
    Image as ImageIcon,
    Calendar,
    MessageSquare,
    Users,
    ExternalLink,
    ChevronRight,
    Loader2,
    CheckCircle2,
    X,
    Upload,
    Camera,
    Sparkles
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ArtistDashboard() {
    const [activeTab, setActiveTab] = useState("overview");
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploading, setUploading] = useState(false);

    // For simplicity in this demo, we assume id 1 is the logged-in artist
    // until real Auth is implemented fixedly.
    const ARTIST_ID = 1;

    useEffect(() => {
        async function fetchDashboardData() {
            const { data, error } = await supabase
                .from('turnos')
                .select('*')
                .eq('tatuador_id', ARTIST_ID)
                .eq('estado', 'pendiente');

            if (data) setAppointments(data);
            setLoading(false);
        }
        fetchDashboardData();
    }, []);

    const handleUploadToPortfolio = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setUploading(true);

        const formData = new FormData(e.currentTarget);
        const titulo = formData.get("titulo") as string;
        const imagen_url = formData.get("imagen_url") as string;

        try {
            const { error } = await supabase
                .from('portfolio')
                .insert([{
                    tatuador_id: ARTIST_ID,
                    titulo,
                    imagen_url: imagen_url || "https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?q=80&w=800&auto=format&fit=crop"
                }]);

            if (error) throw error;
            alert("¡Obra añadida con éxito!");
            setShowUploadModal(false);
        } catch (err: any) {
            alert("Error al subir al portfolio: " + err.message);
        } finally {
            setUploading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
            <Loader2 className="animate-spin text-emerald-500" size={48} />
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <div>
                    <h1 className="text-4xl font-bold mb-2">Panel de <span className="text-gradient">Artista</span></h1>
                    <p className="text-zinc-500">Gestiona tu portfolio y solicitudes de turnos</p>
                </div>
                <button
                    onClick={() => setShowUploadModal(true)}
                    className="px-6 py-3 bg-accent hover:bg-accent-hover text-black font-bold rounded-xl shadow-emerald transition-all flex items-center space-x-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>Subir Trabajo</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Sidebar Navigation */}
                <div className="lg:col-span-1 space-y-2">
                    <nav className="space-y-1">
                        <button
                            onClick={() => setActiveTab("overview")}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'overview' ? 'bg-accent/10 text-accent' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <LayoutDashboard className="w-5 h-5" />
                            <span>Resumen</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("portfolio")}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'portfolio' ? 'bg-accent/10 text-accent' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <ImageIcon className="w-5 h-5" />
                            <span>Mi Portfolio</span>
                        </button>
                        <button className="w-full flex items-center space-x-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                            <Calendar className="w-5 h-5" />
                            <span>Agenda</span>
                        </button>
                        <button className="w-full flex items-center space-x-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all relative">
                            <MessageSquare className="w-5 h-5" />
                            <span>Solicitudes</span>
                            {appointments.length > 0 && (
                                <span className="absolute right-4 w-2 h-2 bg-accent rounded-full shadow-emerald" />
                            )}
                        </button>
                    </nav>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-8">

                    {/* Stats Grid */}
                    {activeTab === "overview" && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="glass p-6 rounded-3xl border-white/10">
                                <p className="text-zinc-500 text-sm mb-1">Vistas este mes</p>
                                <h3 className="text-3xl font-bold">1.2k</h3>
                            </div>
                            <div className="glass p-6 rounded-3xl border-white/10">
                                <p className="text-zinc-500 text-sm mb-1">Solicitudes nuevas</p>
                                <h3 className="text-3xl font-bold text-accent">{appointments.length}</h3>
                            </div>
                            <div className="glass p-6 rounded-3xl border-white/10">
                                <p className="text-zinc-500 text-sm mb-1">Rating promedio</p>
                                <h3 className="text-3xl font-bold">4.9</h3>
                            </div>
                        </div>
                    )}

                    {/* Turnos Pendientes */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center px-2">
                            <h2 className="text-xl font-bold">Turnos Pendientes</h2>
                            <button className="text-accent text-sm font-semibold hover:underline">Ver todas</button>
                        </div>

                        {appointments.length === 0 ? (
                            <div className="glass p-12 rounded-[2rem] border-white/10 text-center text-zinc-500">
                                No tienes solicitudes pendientes.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {appointments.map(req => (
                                    <div key={req.id} className="glass p-6 rounded-[2rem] border-white/10 transition-all hover:bg-white/5 group">
                                        <div className="flex flex-col md:flex-row gap-6">
                                            {/* Body Area Photo */}
                                            <div className="w-full md:w-32 aspect-square rounded-2xl overflow-hidden flex-shrink-0 bg-zinc-800 border border-white/5 relative group">
                                                <img
                                                    src={req.zona_cuerpo_url || 'https://via.placeholder.com/300?text=Zona+Cuerpo'}
                                                    alt="Zona del cuerpo"
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-zinc-400">ZONA</div>
                                            </div>

                                            {/* AI Design Idea Reference */}
                                            {req.idea_diseno_url && (
                                                <div className="w-full md:w-32 aspect-square rounded-2xl overflow-hidden flex-shrink-0 bg-zinc-800 border border-emerald-500/30 relative group shadow-emerald-sm">
                                                    <img
                                                        src={req.idea_diseno_url}
                                                        alt="Idea IA"
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                    <div className="absolute top-2 left-2 bg-emerald-500/80 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-black flex items-center gap-1">
                                                        <Sparkles className="w-2.5 h-2.5" /> IA
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex-1 space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-bold text-lg">Solicitud #{req.id}</h3>
                                                        <p className="text-zinc-500 text-sm flex items-center mt-1">
                                                            <Calendar className="w-3 h-3 mr-1.5" /> {req.fecha_sugerida || "Pendiente coordinar"}
                                                        </p>
                                                    </div>
                                                    <span className="px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-accent text-xs font-bold uppercase">
                                                        Nueva
                                                    </span>
                                                </div>

                                                <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                                                    <p className="text-zinc-400 text-sm leading-relaxed italic">
                                                        &quot;{req.comentarios || "Sin descripción de idea"}&quot;
                                                    </p>
                                                </div>

                                                <div className="flex flex-wrap gap-3">
                                                    <button className="px-6 py-2 bg-accent text-black font-bold rounded-lg text-sm hover:scale-105 transition-transform">
                                                        Aceptar Turno
                                                    </button>
                                                    <button className="px-6 py-2 bg-white/5 border border-white/10 text-white font-bold rounded-lg text-sm hover:bg-white/10 transition-colors">
                                                        Ver Detalles
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="p-8 bg-zinc-900/50 rounded-[2rem] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-center md:text-left">
                            <h3 className="text-lg font-bold mb-1">Comparte tu Portfolio</h3>
                            <p className="text-zinc-500 text-sm">El link para tus clientes está listo.</p>
                        </div>
                        <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors flex items-center space-x-2">
                            <ExternalLink className="w-5 h-5" />
                            <span>Copiar Link</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal para Subir al Portfolio */}
            {showUploadModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowUploadModal(false)} />
                    <div className="relative w-full max-w-lg bg-zinc-950 border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-zinc-900/50">
                            <h2 className="text-xl font-bold">Nueva Obra al Portfolio</h2>
                            <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleUploadToPortfolio} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400">Título / Estilo</label>
                                    <input
                                        name="titulo"
                                        required
                                        placeholder="Ej: Realismo Tigre, Blackwork..."
                                        className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-accent"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400">Link de Imagen (URL)</label>
                                    <input
                                        name="imagen_url"
                                        placeholder="https://..."
                                        className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-accent"
                                    />
                                </div>
                                <div className="p-6 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-zinc-500">
                                    <ImageIcon className="w-10 h-10 mb-2 opacity-20" />
                                    <span className="text-xs uppercase tracking-widest font-bold">Subida de archivo (Proximamente)</span>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={uploading}
                                className="w-full py-4 bg-accent text-black font-bold rounded-xl shadow-emerald flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                            >
                                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <> <Plus className="w-5 h-5" /> <span>Publicar en Portfolio</span> </>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
