"use client";

import { useState } from "react";
import {
    X,
    Calendar as CalendarIcon,
    Upload,
    Camera,
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    Clock,
    Sparkles,
    Loader2
} from "lucide-react";

import { supabase } from "@/lib/supabase";

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    artistName: string;
    artistId: string | number;
}

export function BookingModal({ isOpen, onClose, artistName, artistId }: BookingModalProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState("");
    const [bodyPhoto, setBodyPhoto] = useState<File | null>(null);
    const [designIdea, setDesignIdea] = useState<string>("");
    const [aiPrompt, setAiPrompt] = useState<string>("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string>("");

    if (!isOpen) return null;

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const handleGenerateAI = async () => {
        if (!aiPrompt) return alert("Por favor escribe una descripción para la IA");
        setIsGenerating(true);
        try {
            const res = await fetch("/api/try-on", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: aiPrompt })
            });
            const data = await res.json();
            // n8n might return { url: "..." } or { output: "..." } or a raw string in an array
            const url = data.url || data.output || (Array.isArray(data) ? data[0] : data);
            if (typeof url === 'string' && url.startsWith('http')) {
                setGeneratedImageUrl(url);
            } else {
                // Fallback or specific error handling
                setGeneratedImageUrl("https://images.unsplash.com/photo-1560707303-4e980ce876ad?q=80&w=800");
            }
        } catch (error) {
            console.error("Error generating AI image:", error);
            alert("Error al generar imagen con IA");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);

        try {
            const CLIENT_ID = 'e5d8a4e2-29f2-4f00-9b5a-63af08ed1906'; // Mocked Cliente (Gonzalo Ginestar)
            const { error } = await supabase
                .from('turnos')
                .insert([
                    {
                        tatuador_id: artistId,
                        cliente_id: CLIENT_ID,
                        fecha_sugerida: selectedDate,
                        zona_cuerpo_url: "https://via.placeholder.com/reference-body",
                        comentarios: designIdea,
                        idea_diseno_url: generatedImageUrl,
                        estado: 'pendiente'
                    }
                ]);

            if (error) throw error;
            setStep(4);
        } catch (error: any) {
            alert("Error al agendar turno: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-zinc-900/50">
                    <div>
                        <h2 className="text-xl font-bold">Agendar con {artistName}</h2>
                        <p className="text-zinc-500 text-sm">Paso {step === 4 ? 3 : step} de 3</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">

                    {/* Step 1: Date & Time */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="p-4 bg-accent/10 border border-accent/20 rounded-2xl flex items-center space-x-3">
                                <Clock className="w-5 h-5 text-accent" />
                                <p className="text-sm text-accent font-medium">Próxima disponibilidad: 15 de Marzo</p>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-zinc-400">Selecciona una fecha aproximada</label>
                                <input
                                    type="date"
                                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-4 text-white outline-none focus:border-accent transition-colors"
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button className="p-4 bg-zinc-900 border border-accent rounded-xl text-accent font-bold">Mañana (10:00 - 14:00)</button>
                                <button className="p-4 bg-zinc-900 border border-white/10 rounded-xl text-zinc-400 hover:border-white/20">Tarde (15:00 - 19:00)</button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: References & IA Layout */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Body Area */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-zinc-400 flex items-center">
                                        <Camera className="w-4 h-4 mr-2" />
                                        Foto de la zona
                                    </label>
                                    <div className="relative aspect-video bg-zinc-900 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center hover:border-accent/50 transition-colors group cursor-pointer">
                                        <Upload className="w-8 h-8 text-zinc-600 group-hover:text-accent transition-colors mb-2" />
                                        <span className="text-xs text-zinc-500">Click para subir foto</span>
                                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                                    </div>
                                </div>

                                {/* Design Idea */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-zinc-400 flex items-center">
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Idea de diseño
                                    </label>
                                    <textarea
                                        placeholder="Describe tu idea para el tatuador..."
                                        className="w-full h-full min-h-[100px] bg-zinc-900 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-accent transition-colors resize-none"
                                        value={designIdea}
                                        onChange={(e) => setDesignIdea(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* AI Section with Emerald styling */}
                            <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-[2rem] space-y-4 relative overflow-hidden group">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div className="p-2 bg-accent/20 rounded-lg">
                                            <Sparkles className="w-5 h-5 text-accent animate-pulse" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white">Generar con IA</h3>
                                            <p className="text-xs text-zinc-500">Crea un boceto instantáneo</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        placeholder="Tigre realista, estilo blackwork..."
                                        className="flex-1 bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-accent transition-all"
                                        value={aiPrompt}
                                        onChange={(e) => setAiPrompt(e.target.value)}
                                    />
                                    <button
                                        onClick={handleGenerateAI}
                                        disabled={isGenerating}
                                        className="px-6 py-3 bg-accent hover:bg-accent-hover text-black font-bold rounded-xl text-sm transition-all flex items-center space-x-2 disabled:opacity-50"
                                    >
                                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                        <span>{isGenerating ? "Generando..." : "Generar"}</span>
                                    </button>
                                </div>

                                {generatedImageUrl && !isGenerating && (
                                    <div className="mt-4 relative aspect-video rounded-2xl overflow-hidden border border-accent/30 group/preview animate-in fade-in zoom-in duration-500 shadow-emerald-sm">
                                        <img src={generatedImageUrl} className="w-full h-full object-cover" alt="AI Generated" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        <div className="absolute bottom-4 left-4">
                                            <span className="text-[10px] font-bold tracking-widest uppercase text-accent bg-black/40 backdrop-blur-md px-2 py-1 rounded">Boceto IA</span>
                                        </div>
                                    </div>
                                )}

                                {isGenerating && (
                                    <div className="mt-4 aspect-video rounded-2xl bg-zinc-900/50 border border-dashed border-white/10 flex flex-col items-center justify-center space-y-3">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-accent blur-xl opacity-20 animate-pulse" />
                                            <Loader2 className="w-8 h-8 text-accent animate-spin relative" />
                                        </div>
                                        <p className="text-xs text-zinc-500 animate-pulse">Generando diseño...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Summary */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="bg-zinc-900 rounded-2xl p-6 border border-white/10 space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-500">Artista</span>
                                    <span className="text-white font-bold">{artistName}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-500">Fecha solicitada</span>
                                    <span className="text-white font-bold">{selectedDate || "A convenir"}</span>
                                </div>
                                {generatedImageUrl && (
                                    <div className="flex justify-between text-sm border-t border-white/5 pt-4">
                                        <span className="text-zinc-500">Diseño IA</span>
                                        <span className="text-accent font-bold">Incluido</span>
                                    </div>
                                )}
                            </div>
                            <p className="text-sm text-zinc-500 text-center px-8">
                                Al confirmar, el tatuador recibirá tu solicitud y el boceto generado por la IA.
                            </p>
                        </div>
                    )}

                    {/* Step 4: Success */}
                    {step === 4 && (
                        <div className="py-10 text-center animate-in zoom-in-90 duration-500">
                            <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-emerald">
                                <CheckCircle2 className="w-12 h-12 text-black" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">¡Solicitud Enviada!</h3>
                            <p className="text-zinc-400 mb-8">
                                {artistName} revisará tu propuesta y el diseño generado.
                            </p>
                            <button
                                onClick={onClose}
                                className="px-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold hover:bg-white/10 transition-all"
                            >
                                Cerrar
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                {step < 4 && (
                    <div className="p-8 border-t border-white/10 bg-zinc-900/30 flex justify-between gap-4">
                        {step > 1 ? (
                            <button
                                onClick={prevStep}
                                className="px-6 py-4 flex items-center space-x-2 text-zinc-400 hover:text-white transition-colors"
                                disabled={loading}
                            >
                                <ChevronLeft className="w-5 h-5" />
                                <span>Anterior</span>
                            </button>
                        ) : (
                            <div />
                        )}

                        <button
                            onClick={step === 3 ? handleSubmit : nextStep}
                            className="flex-1 max-w-[200px] py-4 bg-accent hover:bg-accent-hover text-black font-bold rounded-2xl shadow-emerald flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                            disabled={loading || (step === 1 && !selectedDate)}
                        >
                            {loading ? (
                                <Loader2 className="w-6 h-6 animate-spin text-black" />
                            ) : (
                                <>
                                    <span>{step === 3 ? "Confirmar" : "Siguiente"}</span>
                                    <ChevronRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}
