"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock, Sparkles, Settings, LogOut, MessageSquare, Loader2, MapPin, Lock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { TurnoChat } from "@/components/ui/TurnoChat";
import { useNotifications } from "@/contexts/NotificationContext";

const CLIENT_ID = 'e5d8a4e2-29f2-4f00-9b5a-63af08ed1906'; // Mocked Cliente (Gonzalo Ginestar)

export default function ClientDashboard() {
    const [turnos, setTurnos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { notifications } = useNotifications();

    const [isChatOpen, setIsChatOpen] = useState(false);
    const [activeTurnoId, setActiveTurnoId] = useState<number | null>(null);
    const [chatArtistName, setChatArtistName] = useState("");

    useEffect(() => {
        async function fetchTurnos() {
            const { data, error } = await supabase
                .from('turnos')
                .select('*, tatuadores(nombre_artistico, foto_perfil_url, ubicacion)')
                .eq('cliente_id', CLIENT_ID)
                .order('created_at', { ascending: false });

            if (data) setTurnos(data);
            setLoading(false);
        }
        fetchTurnos();
    }, []);

    const openChat = (turnoId: number, artistName: string) => {
        setActiveTurnoId(turnoId);
        setChatArtistName(artistName);
        setIsChatOpen(true);
    };

    const getStatusStyles = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'aceptado': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
            case 'rechazado': return 'bg-red-500/10 border-red-500/20 text-red-400';
            case 'consulta': return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
            default: return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'; // pendiente
        }
    };

    const getStatusText = (status: string) => {
        return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Pendiente';
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <div>
                    <h1 className="text-4xl font-bold mb-2">Hola, <span className="text-gradient">Gonzalo</span></h1>
                    <p className="text-zinc-500">Gestiona tus turnos y comunícate con tus tatuadores</p>
                </div>
                <div className="flex space-x-4">
                    <button className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                        <Settings className="w-5 h-5" />
                    </button>
                    <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all flex items-center space-x-2">
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Salir</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Appointments column */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold flex items-center">
                        <Calendar className="w-5 h-5 mr-3 text-accent" />
                        Mis Turnos
                    </h2>

                    {loading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="w-8 h-8 animate-spin text-accent" />
                        </div>
                    ) : turnos.length === 0 ? (
                        <div className="glass p-12 rounded-3xl border-white/10 text-center text-zinc-500">
                            No tienes turnos solicitados.
                        </div>
                    ) : (
                        turnos.map(apt => {
                            const artistInfo = apt.tatuadores || {};
                            const isChatEnabled = apt.estado === 'aceptado' || apt.estado === 'consulta';

                            return (
                                <div key={apt.id} className="glass p-6 rounded-3xl border-white/10 flex flex-col md:flex-row gap-6 items-center hover:bg-white/5 transition-colors">
                                    <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-zinc-800">
                                        <img src={artistInfo.foto_perfil_url || "https://images.unsplash.com/photo-1590247813693-5541d1c609fd?q=80&w=800"} alt="Tatuador" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 text-center md:text-left">
                                        <h3 className="text-lg font-bold">{artistInfo.nombre_artistico || "Tatuador"}</h3>
                                        <div className="flex flex-col gap-2 mt-2 text-sm text-zinc-400">
                                            <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                                <div className="flex items-center"><Calendar className="w-4 h-4 mr-1.5" /> {apt.fecha_sugerida || "A convenir"}</div>
                                                <div className="flex items-center"><MapPin className="w-4 h-4 mr-1.5" /> {artistInfo.ubicacion || "Buenos Aires"}</div>
                                            </div>
                                            <div className="italic text-xs">&quot;{apt.comentarios}&quot;</div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center md:items-end w-full md:w-auto">
                                        <span 
                                            className={`px-4 py-1.5 border rounded-full text-xs font-bold uppercase tracking-wider ${getStatusStyles(apt.estado)}`}
                                            title={apt.estado === 'rechazado' && apt.motivo_rechazo ? `Motivo: ${apt.motivo_rechazo}` : undefined}
                                        >
                                            {getStatusText(apt.estado)}
                                        </span>
                                        {apt.estado === 'rechazado' && apt.motivo_rechazo && (
                                            <p className="text-[10px] text-red-400/80 mt-1.5 mb-2 max-w-[180px] text-center md:text-right italic leading-tight">
                                                "{apt.motivo_rechazo}"
                                            </p>
                                        )}
                                        <div className={`mt-3 w-full ${apt.estado === 'rechazado' && apt.motivo_rechazo ? '' : 'mt-0'}`}>
                                        <button 
                                            onClick={() => openChat(apt.id, artistInfo.nombre_artistico)}
                                            disabled={!isChatEnabled}
                                            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all w-full justify-center relative ${
                                                isChatEnabled 
                                                ? "bg-white/10 text-white hover:bg-white/20 border border-white/20" 
                                                : "bg-zinc-900 text-zinc-600 cursor-not-allowed border border-white/5"
                                            }`}
                                        >
                                            {isChatEnabled ? (
                                                <div className="relative">
                                                    <MessageSquare className="w-4 h-4" />
                                                    {notifications.filter(n => !n.leido && n.tipo === 'mensaje' && n.referencia_id === apt.id).length > 0 && (
                                                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                                                    )}
                                                </div>
                                            ) : <Lock className="w-4 h-4" />}
                                            <span>Ir al Chat</span>
                                        </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* AI Simulations Sidebar */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold flex items-center">
                        <Sparkles className="w-5 h-5 mr-3 text-accent" />
                        Simulaciones IA
                    </h2>
                    <div className="glass p-8 rounded-3xl border-white/10 text-center">
                        <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Sparkles className="w-8 h-8 text-accent" />
                        </div>
                        <p className="text-sm text-zinc-500 mb-6">Usa nuestras herramientas IA al reservar tu próximo turno.</p>
                        <button className="w-full py-4 border border-accent/30 text-accent font-bold rounded-2xl hover:bg-accent/5 transition-all">
                            Nueva Simulación
                        </button>
                    </div>
                </div>

            </div>

            {activeTurnoId && (
                <TurnoChat
                    isOpen={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
                    turnoId={activeTurnoId}
                    currentUserId={CLIENT_ID}
                    otherPartyName={chatArtistName}
                />
            )}
        </div>
    );
}
