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
import { TurnoChat } from "@/components/ui/TurnoChat";
import { RejectionModal } from "@/components/ui/RejectionModal";
import { useNotifications } from "@/contexts/NotificationContext";

export default function ArtistDashboard() {
    const [activeTab, setActiveTab] = useState("overview");
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const { notifications } = useNotifications();
    
    // Chat state
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [activeTurnoId, setActiveTurnoId] = useState<number | null>(null);
    const [chatClientName, setChatClientName] = useState("");

    // Action loading state
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    // Rejection Modal State
    const [rejectionTurnoId, setRejectionTurnoId] = useState<number | null>(null);
    const [rejectionClientName, setRejectionClientName] = useState("");

    // Dynamic auth state
    const [artistId, setArtistId] = useState<number | null>(null);
    const [artistUserId, setArtistUserId] = useState<string | null>(null);

    useEffect(() => {
        setupUser();
    }, []);

    async function setupUser() {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) {
                window.location.href = '/login';
                return;
            }
            
            setArtistUserId(session.user.id);
            
            const { data: tatuador, error } = await supabase
                .from('tatuadores')
                .select('id')
                .eq('user_id', session.user.id)
                .single();
                
            if (error || !tatuador) throw error;
            
            setArtistId(tatuador.id);
            fetchDashboardData(tatuador.id);
        } catch (err: any) {
            console.error("Error fetching artist profile:", err);
            window.location.href = '/';
        }
    }

    async function fetchDashboardData(tId?: number) {
        setLoading(true);
        const currentArtistId = tId || artistId;
        if (!currentArtistId) return;

        const { data, error } = await supabase
            .from('turnos')
            .select('*, perfiles(id, nombre, apellido)')
            .eq('tatuador_id', currentArtistId)
            .order("created_at", { ascending: false });

        if (data) setAppointments(data);
        setLoading(false);
    }

    const openChat = (turnoId: number, clientName: string) => {
        setActiveTurnoId(turnoId);
        setChatClientName(clientName);
        setIsChatOpen(true);
    };

    const handleAccept = async (turno: any) => {
        setActionLoading(turno.id);
        try {
            await supabase.from('turnos').update({ estado: 'aceptado' }).eq('id', turno.id);
            // Insert auto message
            if (artistUserId) {
                await supabase.from('mensajes').insert([{
                    turno_id: turno.id,
                    emisor_id: artistUserId,
                    contenido: "¡Hola! He aceptado tu solicitud de turno. Te escribo para coordinar los detalles restantes."
                }]);
            }
            await fetchDashboardData();
        } catch (e) {
            console.error(e);
        } finally {
            setActionLoading(null);
        }
    };

    const handleConsult = async (turno: any) => {
        setActionLoading(turno.id);
        try {
            await supabase.from('turnos').update({ estado: 'consulta' }).eq('id', turno.id);
            // Insert auto message
            if (artistUserId) {
                await supabase.from('mensajes').insert([{
                    turno_id: turno.id,
                    emisor_id: artistUserId,
                    contenido: "¡Hola! Analicé tu solicitud pero necesito hacerte algunas preguntas antes de confirmar."
                }]);
            }
            await fetchDashboardData();
            openChat(turno.id, (turno.perfiles?.nombre || "Cliente"));
        } catch (e) {
            console.error(e);
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = (turno: any) => {
        setRejectionTurnoId(turno.id);
        const name = (turno.perfiles?.nombre || "Cliente") + " " + (turno.perfiles?.apellido || "");
        setRejectionClientName(name.trim());
    };

    const submitReject = async (turnoId: number, reason: string) => {
        setActionLoading(turnoId);
        try {
            await supabase.from('turnos').update({ 
                estado: 'rechazado',
                motivo_rechazo: reason
            }).eq('id', turnoId);
            
            // Auto message explaining the rejection, which will trigger notification
            if (artistUserId) {
                await supabase.from('mensajes').insert([{
                    turno_id: turnoId,
                    emisor_id: artistUserId,
                    contenido: reason
                }]);
            }

            await fetchDashboardData();
        } catch (e) {
            console.error(e);
        } finally {
            setActionLoading(null);
        }
    };

    const handleUploadToPortfolio = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setUploading(true);

        const formData = new FormData(e.currentTarget);
        const titulo = formData.get("titulo") as string;
        const imagen_url = formData.get("imagen_url") as string;

        try {
            if (!artistId) throw new Error("Artist ID no encontrado");
            const { error } = await supabase
                .from('portfolio')
                .insert([{
                    tatuador_id: artistId,
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

    const pendingAppointments = appointments.filter(a => a.estado === 'pendiente' || !a.estado);
    const activeAppointments = appointments.filter(a => a.estado === 'aceptado' || a.estado === 'consulta');

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
                        <button 
                            onClick={() => {
                                setActiveTab("overview");
                                setTimeout(() => {
                                    document.getElementById('solicitudes-pendientes')?.scrollIntoView({ behavior: 'smooth' })
                                }, 100);
                            }}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all relative"
                        >
                            <MessageSquare className="w-5 h-5" />
                            <span>Solicitudes</span>
                            {pendingAppointments.length > 0 && (
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
                                <h3 className="text-3xl font-bold text-accent">{pendingAppointments.length}</h3>
                            </div>
                            <div className="glass p-6 rounded-3xl border-white/10">
                                <p className="text-zinc-500 text-sm mb-1">Rating promedio</p>
                                <h3 className="text-3xl font-bold">4.9</h3>
                            </div>
                        </div>
                    )}

                    {/* Activos (Aceptados/Consultas) */}
                    {activeAppointments.length > 0 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold">Turnos Activos</h2>
                            <div className="space-y-4">
                                {activeAppointments.map(req => (
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
                                                        <h3 className="font-bold text-lg">
                                                            {req.perfiles?.nombre || "Cliente Anónimo"} {req.perfiles?.apellido || ""}
                                                        </h3>
                                                        <p className="text-zinc-500 text-sm flex items-center mt-1">
                                                            <Calendar className="w-3 h-3 mr-1.5" /> {req.fecha_sugerida || "A convenir"}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${req.estado === 'aceptado' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                                                            {req.estado}
                                                        </span>
                                                        <button 
                                                            onClick={() => openChat(req.id, req.perfiles?.nombre || "Cliente")}
                                                            className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex justify-center items-center transition-all group-hover:bg-accent group-hover:text-black group-hover:border-accent relative"
                                                            title="Ir al chat"
                                                        >
                                                            <MessageSquare className="w-5 h-5" />
                                                            {notifications.filter(n => !n.leido && n.tipo === 'mensaje' && n.referencia_id === req.id).length > 0 && (
                                                                <span className="absolute top-1 right-1 w-2.5 h-2.5 border-2 border-zinc-900 bg-red-500 rounded-full" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                                                    <p className="text-zinc-400 text-sm leading-relaxed italic">
                                                        &quot;{req.comentarios || "Sin descripción de idea"}&quot;
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Turnos Pendientes */}
                    <div id="solicitudes-pendientes" className="space-y-6">
                        <div className="flex justify-between items-center px-2">
                            <h2 className="text-xl font-bold">Turnos Pendientes</h2>
                        </div>

                        {pendingAppointments.length === 0 ? (
                            <div className="glass p-12 rounded-[2rem] border-white/10 text-center text-zinc-500">
                                No tienes solicitudes pendientes.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {pendingAppointments.map(req => (
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
                                                        <h3 className="font-bold text-lg">
                                                            Solicitud de {req.perfiles?.nombre || "Anónimo"} {req.perfiles?.apellido || ""}
                                                        </h3>
                                                        <p className="text-zinc-500 text-sm flex items-center mt-1">
                                                            <Calendar className="w-3 h-3 mr-1.5" /> {req.fecha_sugerida || "A convenir"}
                                                        </p>
                                                    </div>
                                                    <span className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-500 text-xs font-bold uppercase">
                                                        Pendiente
                                                    </span>
                                                </div>

                                                <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                                                    <p className="text-zinc-400 text-sm leading-relaxed italic">
                                                        &quot;{req.comentarios || "Sin descripción de idea"}&quot;
                                                    </p>
                                                </div>

                                                <div className="flex flex-wrap gap-3">
                                                    <button 
                                                        onClick={() => handleAccept(req)}
                                                        disabled={actionLoading === req.id}
                                                        className="px-6 py-2 bg-accent text-black font-bold rounded-lg text-sm hover:scale-105 transition-transform disabled:opacity-50 flex items-center gap-2"
                                                    >
                                                        {actionLoading === req.id && <Loader2 className="w-4 h-4 animate-spin" />}
                                                        Aceptar Turno
                                                    </button>
                                                    
                                                    <button 
                                                        onClick={() => handleConsult(req)}
                                                        disabled={actionLoading === req.id}
                                                        className="px-6 py-2 bg-blue-500/20 text-blue-400 font-bold rounded-lg text-sm hover:bg-blue-500/30 transition-colors disabled:opacity-50"
                                                    >
                                                        Enviar Consulta
                                                    </button>

                                                    <button 
                                                        onClick={() => handleReject(req)}
                                                        disabled={actionLoading === req.id}
                                                        className="px-6 py-2 bg-white/5 border border-white/10 text-white font-bold rounded-lg text-sm hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-colors disabled:opacity-50 ml-auto"
                                                    >
                                                        Rechazar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Chat Gatekeeper */}
            {activeTurnoId && artistUserId && (
                <TurnoChat
                    isOpen={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
                    turnoId={activeTurnoId}
                    currentUserId={artistUserId} // Emisor
                    otherPartyName={chatClientName}
                />
            )}

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
                            {/* Inputs resumidos */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">Título de la Obra</label>
                                <input name="titulo" type="text" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">URL de Imagen</label>
                                <input name="imagen_url" type="url" placeholder="Opcional" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl" />
                            </div>
                            <button type="submit" disabled={uploading} className="w-full py-4 bg-accent text-black font-bold rounded-xl disabled:opacity-50">
                                {uploading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Subir al Portfolio"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Rechazo */}
            {rejectionTurnoId && (
                <RejectionModal
                    turnoId={rejectionTurnoId}
                    clientName={rejectionClientName}
                    onClose={() => setRejectionTurnoId(null)}
                    onReject={submitReject}
                />
            )}
        </div>
    );
}
