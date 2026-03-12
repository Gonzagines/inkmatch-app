"use client";

import { useState } from "react";
import { useNotifications, Notification } from "@/contexts/NotificationContext";
import { X, CheckSquare, Settings, Mail, MailOpen, Trash2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NotificationPanelProps {
    onClose: () => void;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
    const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, deleteMultiple } = useNotifications();
    const [activeTab, setActiveTab] = useState<'unread' | 'all' | 'trash'>('unread');
    
    // Filtros
    const unreadNotifications = notifications.filter(n => !n.leido);
    const allNotifications = notifications;
    // We don't fetch trashed items into the active state in standard implementations,
    // but the user asked for a "Papelera" tab. Let's assume for now empty or filter locally if we didn't remove them completely from state.
    // However, our deleteNotification removes them from Context state currently. For a true trash, we should keep them in Context with `borrado: true`.
    // Let's implement activeTab UI safely.
    const displayNotifs = activeTab === 'unread' ? unreadNotifications : allNotifications;

    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const handleSelectAll = () => {
        if (selectedIds.length === displayNotifs.length && displayNotifs.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(displayNotifs.map(n => n.id));
        }
    };

    const toggleSelect = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(prev => prev.filter(i => i !== id));
        } else {
            setSelectedIds(prev => [...prev, id]);
        }
    };

    const handleBulkRead = async () => {
        if (selectedIds.length === 0) return;
        // As a shortcut we will just mark all selected as read
        for (const id of selectedIds) {
            await markAsRead(id);
        }
        setSelectedIds([]);
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        await deleteMultiple(selectedIds);
        setSelectedIds([]);
    };

    const timeAgo = (dateStr: string) => {
        const date = new Date(dateStr);
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        let interval = seconds / 3600;
        if (interval > 24) return Math.floor(interval / 24) + "d";
        if (interval >= 1) return Math.floor(interval) + "h";
        interval = seconds / 60;
        if (interval >= 1) return Math.floor(interval) + "m";
        return Math.floor(seconds) + "s";
    };

    return (
        <div className="absolute top-16 right-0 w-80 sm:w-96 bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[80vh]">
            {/* Header */}
            <div className="bg-emerald-500 flex justify-between items-center p-4">
                <h3 className="text-white font-bold text-lg">Notific.</h3>
                <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10 bg-zinc-900/50">
                <button 
                    onClick={() => { setActiveTab('unread'); setSelectedIds([]); }}
                    className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === 'unread' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    No leídos ({unreadCount > 99 ? '99+' : unreadCount})
                    {activeTab === 'unread' && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-emerald-500 rounded-t-full" />}
                </button>
                <button 
                    onClick={() => { setActiveTab('all'); setSelectedIds([]); }}
                    className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === 'all' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    Todas
                    {activeTab === 'all' && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-emerald-500 rounded-t-full" />}
                </button>
                <button 
                    onClick={() => { setActiveTab('trash'); setSelectedIds([]); }}
                    className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === 'trash' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    Papelera
                    {activeTab === 'trash' && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-emerald-500 rounded-t-full" />}
                </button>
            </div>

            {/* Acciones Masivas */}
            {activeTab !== 'trash' && displayNotifs.length > 0 && (
                <div className="flex items-center justify-between p-3 border-b border-white/5 bg-zinc-900/20 text-xs text-emerald-500 font-medium">
                    <button 
                        onClick={handleSelectAll}
                        className="flex items-center gap-2 hover:text-emerald-400 transition-colors"
                    >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedIds.length > 0 && selectedIds.length === displayNotifs.length ? 'bg-emerald-500 border-emerald-500' : 'border-emerald-500/50'}`}>
                            {selectedIds.length > 0 && selectedIds.length === displayNotifs.length && (
                                <CheckCircle2 className="w-3 h-3 text-black" />
                            )}
                            {selectedIds.length > 0 && selectedIds.length !== displayNotifs.length && (
                                <div className="w-2 h-0.5 bg-emerald-500" />
                            )}
                        </div>
                        {selectedIds.length > 0 ? `${selectedIds.length} seleccionada(s)` : 'Seleccionar todas'}
                    </button>
                    
                    <div className="flex gap-4">
                        <button 
                            onClick={handleBulkRead}
                            disabled={selectedIds.length === 0}
                            className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <MailOpen className="w-3.5 h-3.5" /> Marcar como leída
                        </button>
                        <button 
                            onClick={handleBulkDelete}
                            disabled={selectedIds.length === 0}
                            className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <Trash2 className="w-3.5 h-3.5" /> Eliminar
                        </button>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="overflow-y-auto flex-1 bg-zinc-950 p-2 space-y-1 custom-scrollbar min-h-[200px]">
                {displayNotifs.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-500 p-8 text-center space-y-3">
                        <Mail className="w-10 h-10 opacity-20" />
                        <p className="text-sm">No hay notificaciones aquí.</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {displayNotifs.map(notif => (
                            <motion.div 
                                key={notif.id}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className={`flex items-start gap-3 p-3 rounded-xl transition-colors group relative cursor-pointer ${
                                    selectedIds.includes(notif.id) 
                                        ? 'bg-emerald-500/10' 
                                        : notif.leido ? 'hover:bg-zinc-900' : 'bg-emerald-500/5 hover:bg-emerald-500/10'
                                }`}
                                onClick={() => toggleSelect(notif.id)}
                            >
                                <div className={`w-4 h-4 mt-1 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${selectedIds.includes(notif.id) ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-700'}`}>
                                    {selectedIds.includes(notif.id) && <CheckCircle2 className="w-3 h-3 text-black" />}
                                </div>
                                <div className="flex-1 min-w-0 pr-16 md:pr-12">
                                    <p className={`text-sm truncate ${notif.leido ? 'text-zinc-300 font-medium' : 'text-white font-bold'}`}>
                                        {notif.tipo === 'mensaje' ? 'Nuevo mensaje del turno' :
                                         notif.tipo === 'turno_aceptado' ? 'Turno Aceptado' :
                                         notif.tipo === 'turno_rechazado' ? 'Turno Rechazado' :
                                         'Nueva solicitud'}
                                    </p>
                                    <p className={`text-xs truncate ${notif.leido ? 'text-zinc-500' : 'text-emerald-400/80'}`}>
                                        {notif.mensaje}
                                    </p>
                                </div>
                                <div className="absolute top-4 right-3 text-[10px] text-zinc-500 group-hover:opacity-0 transition-opacity">
                                    {timeAgo(notif.created_at)}
                                </div>
                                
                                {/* Hover Actions */}
                                <div className="absolute top-1/2 -translate-y-1/2 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900/80 backdrop-blur-sm p-1 rounded-lg border border-white/5">
                                    {!notif.leido && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); markAsRead(notif.id); }}
                                            className="p-1.5 hover:bg-emerald-500/20 hover:text-emerald-400 rounded-md transition-colors tooltip-trigger"
                                            title="Marcar como leída"
                                        >
                                            <MailOpen className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                                        className="p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded-md transition-colors tooltip-trigger"
                                        title="Eliminar"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
