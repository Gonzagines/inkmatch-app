"use client";

import { useEffect, useState, useRef } from "react";
import { X, Send, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface TurnoChatProps {
    isOpen: boolean;
    onClose: () => void;
    turnoId: number;
    currentUserId: string; // The UUID of the current logged-in user (Client or Artist connected profile)
    otherPartyName: string;
}

export function TurnoChat({ isOpen, onClose, turnoId, currentUserId, otherPartyName }: TurnoChatProps) {
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;

        // Fetch initial messages
        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from("mensajes")
                .select("*")
                .eq("turno_id", turnoId)
                .order("created_at", { ascending: true });

            if (!error && data) {
                setMessages(data);
            }
            setLoading(false);
            scrollToBottom();
        };

        fetchMessages();

        // Subscribe to real-time updates
        const channel = supabase
            .channel(`chat-turno-${turnoId}`)
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "mensajes", filter: `turno_id=eq.${turnoId}` },
                (payload) => {
                    setMessages((prev) => {
                        const exists = prev.some(m => m.id === payload.new.id || (m.tempId && m.tempId === payload.new.tempId));
                        return exists ? prev : [...prev, payload.new];
                    });
                    scrollToBottom();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [isOpen, turnoId]);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const content = newMessage.trim();
        setNewMessage("");

        const tempId = `temp-${Date.now()}`;
        const tempMessage = {
            id: tempId,
            tempId: tempId,
            turno_id: turnoId,
            emisor_id: currentUserId,
            contenido: content,
            created_at: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, tempMessage]);
        scrollToBottom();

        const { data, error } = await supabase.from("mensajes").insert([
            {
                turno_id: turnoId,
                emisor_id: currentUserId,
                contenido: content,
                // If there's no tempId column in the DB, Supabase will ignore it or throw error?
                // Wait! We can't insert a column that doesn't exist.
            }
        ]).select().single();

        if (error) {
            console.error("Error sending message:", error);
            setMessages(prev => prev.filter(m => m.id !== tempId));
            alert("No se pudo enviar el mensaje.");
        } else if (data) {
            setMessages(prev => prev.map(m => m.id === tempId ? data : m));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-lg bg-zinc-950 border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col h-[600px] max-h-[90vh] animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-zinc-900/50">
                    <div>
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Chat con {otherPartyName}
                        </h2>
                        <p className="text-xs text-zinc-500">Consulta sobre tu solicitud #{turnoId}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            <Loader2 className="w-8 h-8 animate-spin text-accent" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex justify-center items-center h-full flex-col text-zinc-500 space-y-2">
                            <p className="text-sm">Aún no hay mensajes.</p>
                            <p className="text-xs">Escribe el primero para comenzar.</p>
                        </div>
                    ) : (
                        messages.map((msg, idx) => {
                            const isMe = msg.emisor_id === currentUserId;
                            return (
                                <div key={idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                    <div
                                        className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                                            isMe 
                                                ? "bg-accent text-black rounded-br-sm" 
                                                : "bg-zinc-800 text-white rounded-bl-sm border border-white/5"
                                        }`}
                                    >
                                        <p className="text-sm">{msg.contenido}</p>
                                        <span className={`text-[10px] opacity-60 mt-1 block ${isMe ? "text-right" : "text-left"}`}>
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-white/10 bg-zinc-900/50">
                    <form onSubmit={handleSendMessage} className="flex space-x-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Escribe un mensaje..."
                            className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-accent transition-colors"
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="p-3 bg-accent hover:bg-accent-hover text-black font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
