"use client";

import { useState, useEffect } from "react";
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
    Loader2,
    Image as ImageIcon
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
    
    // Step 1: Availability
    const [availabilityBlocks, setAvailabilityBlocks] = useState<{ dias: number[], franjas?: { inicio: string, fin: string }[], inicio?: string, fin?: string }[] | null>(null);
    const [selectedDate, setSelectedDate] = useState("");
    const [artistWorkingDay, setArtistWorkingDay] = useState(true);
    const [selectedShift, setSelectedShift] = useState<string | null>(null);
    const [availableFranjas, setAvailableFranjas] = useState<{ label: string, inicio: string, fin: string }[]>([]);
    
    // Step 2: Uploads and Idea
    const [bodyPhotoUrl, setBodyPhotoUrl] = useState<string>("");
    const [designPhotoUrl, setDesignPhotoUrl] = useState<string>("");
    const [uploadingBody, setUploadingBody] = useState(false);
    const [uploadingDesign, setUploadingDesign] = useState(false);
    
    const [designIdea, setDesignIdea] = useState<string>("");
    
    // AI Generation
    const [aiPrompt, setAiPrompt] = useState<string>("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string>("");



    // Reset and Fetch
    useEffect(() => {
        if (isOpen && artistId) {
            const fetchAvail = async () => {
                const { data, error } = await supabase.from('tatuadores').select('horarios_multiples').eq('id', artistId).single();
                
                if (error) {
                    console.error("Error fetching availability:", error);
                }

                let blocks = data?.horarios_multiples;
                if (!blocks || blocks.length === 0) {
                    blocks = [{
                        dias: [1, 2, 3, 4, 5],
                        franjas: [{ inicio: '09:00', fin: '18:00' }]
                    }];
                }
                setAvailabilityBlocks(blocks);
            };
            fetchAvail();
        } else {
            setStep(1); setSelectedDate(""); setSelectedShift(null);
            setBodyPhotoUrl(""); setDesignPhotoUrl(""); setDesignIdea("");
            setAiPrompt(""); setGeneratedImageUrl(""); setArtistWorkingDay(true);
            setAvailableFranjas([]);
        }
    }, [isOpen, artistId]);

    // Handle Date Change Logic
    useEffect(() => {
        if (selectedDate && availabilityBlocks) {
            // "T00:00:00" ensures JS gets the local date correctly if interpreted as YYYY-MM-DD
            const [year, month, day] = selectedDate.split('-');
            const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            const dayIndex = dateObj.getDay(); 
            
            console.log("Día seleccionado (0=Dom, 1=Lun...):", dayIndex);
            
            const validBlocks = availabilityBlocks.filter(b => b.dias.map(Number).includes(dayIndex));
            console.log("Bloque encontrado:", validBlocks);
            
            setArtistWorkingDay(validBlocks.length > 0);
            
            let franjasDelDia: { label: string, inicio: string, fin: string }[] = [];
            validBlocks.forEach(b => {
                const franjas = b.franjas || [{ inicio: b.inicio, fin: b.fin }];
                franjas.forEach((f: any) => {
                    if (!f.inicio || !f.fin) return;
                    
                    const formatTime = (t: string) => t.substring(0, 5); // 09:00:00 -> 09:00
                    const i = formatTime(f.inicio);
                    const e = formatTime(f.fin);
                    
                    const label = i < '14:00' ? 'Mañana' : 'Tarde';
                    franjasDelDia.push({ label, inicio: i, fin: e });
                });
            });

            // Ordenamos las franjas por horario de inicio
            franjasDelDia.sort((a, b) => a.inicio.localeCompare(b.inicio));
            
            setAvailableFranjas(franjasDelDia);
            setSelectedShift(null);
        } else {
            setArtistWorkingDay(true);
            setAvailableFranjas([]);    
        }
    }, [selectedDate, availabilityBlocks]);

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'body' | 'design') => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (type === 'body') setUploadingBody(true);
        else setUploadingDesign(true);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${type}.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from('try-on-uploads').upload(fileName, file);
            
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('try-on-uploads').getPublicUrl(fileName);
            if (type === 'body') setBodyPhotoUrl(publicUrl);
            else setDesignPhotoUrl(publicUrl);
        } catch (err) {
            alert("Error al subir archivo");
        } finally {
            if (type === 'body') setUploadingBody(false);
            else setUploadingDesign(false);
        }
    };

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
            const finalIdeaUrl = generatedImageUrl || designPhotoUrl;
            
            const { error } = await supabase
                .from('turnos')
                .insert([
                    {
                        tatuador_id: artistId,
                        cliente_id: CLIENT_ID,
                        fecha_sugerida: `${selectedDate} (${selectedShift})`,
                        zona_cuerpo_url: bodyPhotoUrl || null,
                        comentarios: designIdea,
                        idea_diseno_url: finalIdeaUrl || null,
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

    if (!isOpen) return null;

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
                                <div className="relative group">
                                    <input
                                        type="date"
                                        onClick={(e) => "showPicker" in HTMLInputElement.prototype && (e.currentTarget as any).showPicker()}
                                        className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-4 text-white outline-none focus:border-accent transition-colors [color-scheme:dark] cursor-pointer"
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        value={selectedDate}
                                    />
                                    {/* Using a custom icon wrapper is not needed if color-scheme:dark is enough, but to ensure high contrast: */}
                                    <CalendarIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-accent pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity" />
                                </div>
                                {selectedDate && !artistWorkingDay && (
                                    <p className="text-red-400 text-sm font-bold bg-red-500/10 p-3 rounded-lg flex items-center gap-2 border border-red-500/20">
                                        <X className="w-4 h-4" /> El tatuador no trabaja este día.
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {availableFranjas.map((franja, idx) => {
                                    const shiftText = `${franja.label} (${franja.inicio} - ${franja.fin})`;
                                    return (
                                        <button 
                                            key={idx}
                                            onClick={() => setSelectedShift(shiftText)}
                                            disabled={!selectedDate || !artistWorkingDay}
                                            className={`p-4 rounded-xl font-bold transition-all ${
                                                selectedShift === shiftText 
                                                    ? 'bg-accent text-black shadow-emerald' 
                                                    : 'bg-zinc-900 border border-white/10 text-zinc-400 hover:border-white/20'
                                            } disabled:opacity-30 disabled:cursor-not-allowed text-sm`}
                                        >
                                            {shiftText}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Step 2: References & IA Layout */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Design Reference Area */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-zinc-400 flex items-center">
                                        <ImageIcon className="w-4 h-4 mr-2" />
                                        1. Idea de diseño (foto)
                                    </label>
                                    <div className="relative aspect-video bg-zinc-900 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center hover:border-accent/50 transition-colors group cursor-pointer overflow-hidden">
                                        {designPhotoUrl ? (
                                            <img src={designPhotoUrl} className="w-full h-full object-cover" alt="Diseño" />
                                        ) : (
                                            <>
                                                {uploadingDesign ? <Loader2 className="w-8 h-8 text-accent animate-spin mb-2" /> : <Upload className="w-8 h-8 text-zinc-600 group-hover:text-accent transition-colors mb-2" />}
                                                <span className="text-xs text-zinc-500">Click para subir foto</span>
                                            </>
                                        )}
                                        <input type="file" disabled={uploadingDesign} onChange={(e) => handleFileUpload(e, 'design')} className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed" />
                                    </div>
                                </div>

                                {/* Body Area */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-zinc-400 flex items-center">
                                        <Camera className="w-4 h-4 mr-2" />
                                        2. Foto de la zona
                                    </label>
                                    <div className="relative aspect-video bg-zinc-900 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center hover:border-accent/50 transition-colors group cursor-pointer overflow-hidden">
                                        {bodyPhotoUrl ? (
                                            <img src={bodyPhotoUrl} className="w-full h-full object-cover" alt="Zona del cuerpo" />
                                        ) : (
                                            <>
                                                {uploadingBody ? <Loader2 className="w-8 h-8 text-accent animate-spin mb-2" /> : <Upload className="w-8 h-8 text-zinc-600 group-hover:text-accent transition-colors mb-2" />}
                                                <span className="text-xs text-zinc-500">Click para subir foto</span>
                                            </>
                                        )}
                                        <input type="file" disabled={uploadingBody} onChange={(e) => handleFileUpload(e, 'body')} className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed" />
                                    </div>
                                </div>
                            </div>

                            {/* Detalle */}
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-zinc-400 flex items-center">
                                    <CalendarIcon className="w-4 h-4 mr-2" />
                                    3. Detalle de la idea
                                </label>
                                <textarea
                                    placeholder="Describí tu idea y especificá el tamaño aproximado (en cm) para facilitar la cotización"
                                    className="w-full h-full min-h-[100px] bg-zinc-900 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-accent transition-colors resize-none"
                                    value={designIdea}
                                    onChange={(e) => setDesignIdea(e.target.value)}
                                />
                            </div>

                            {/* Minimalist AI Section */}
                            <div className="p-4 bg-zinc-900/50 border border-white/5 rounded-2xl space-y-4">
                                <div className="flex gap-3">
                                    <div className="flex items-center justify-center w-12 bg-emerald-500/10 rounded-xl">
                                        <Sparkles className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Tigre realista, blackwork..."
                                        className="flex-1 bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500/50 transition-all"
                                        value={aiPrompt}
                                        onChange={(e) => setAiPrompt(e.target.value)}
                                    />
                                    <button
                                        onClick={handleGenerateAI}
                                        disabled={isGenerating || !aiPrompt}
                                        className="px-4 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold rounded-xl text-sm transition-all disabled:opacity-50 flex items-center"
                                    >
                                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generar IA"}
                                    </button>
                                </div>
                                {generatedImageUrl && !isGenerating && (
                                    <div className="relative h-32 w-32 rounded-xl overflow-hidden shadow-emerald-sm">
                                        <img src={generatedImageUrl} className="w-full h-full object-cover" alt="Boceto IA" />
                                        <div className="absolute top-1 left-1 bg-black/60 px-2 py-0.5 rounded text-[10px] text-emerald-400 font-bold">IA</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Summary */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="bg-zinc-900 rounded-[2rem] p-6 border border-white/10 space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-zinc-500 font-medium">Artista</span>
                                    <span className="text-white font-bold">{artistName}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm border-t border-white/5 pt-4">
                                    <span className="text-zinc-500 font-medium">Fecha y Turno</span>
                                    <span className="text-white font-bold text-right">{selectedDate} <br/> <span className="text-xs text-accent">{selectedShift}</span></span>
                                </div>

                                <div className="border-t border-white/5 pt-4 space-y-2">
                                    <span className="text-zinc-500 font-medium text-sm">Detalle de la idea</span>
                                    <p className="text-zinc-300 text-sm bg-black/20 p-4 rounded-xl italic leading-relaxed">
                                        &quot;{designIdea || "Sin detalle"}&quot;
                                    </p>
                                </div>

                                <div className="border-t border-white/5 pt-4">
                                    <span className="text-zinc-500 font-medium text-sm block mb-3">Archivos adjuntos</span>
                                    <div className="flex gap-4">
                                        {designPhotoUrl || generatedImageUrl ? (
                                            <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10">
                                                <img src={generatedImageUrl || designPhotoUrl} className="w-full h-full object-cover" alt="Diseño" />
                                                <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[10px] text-center py-0.5">Diseño</div>
                                            </div>
                                        ) : null}
                                        {bodyPhotoUrl ? (
                                            <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10">
                                                <img src={bodyPhotoUrl} className="w-full h-full object-cover" alt="Zona" />
                                                <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[10px] text-center py-0.5">Zona</div>
                                            </div>
                                        ) : null}
                                        {!designPhotoUrl && !generatedImageUrl && !bodyPhotoUrl && (
                                            <span className="text-xs text-zinc-600 italic">Sin fotos adjuntas</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-zinc-500 text-center px-8">
                                Al confirmar, el tatuador recibirá tu solicitud y el diseño enviado.
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
                                {artistName} revisará tu propuesta y el diseño enviado.
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
                            disabled={loading || (step === 1 && (!selectedDate || !selectedShift || !artistWorkingDay))}
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
