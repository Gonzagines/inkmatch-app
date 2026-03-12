import { useState } from "react";
import { X, AlertCircle } from "lucide-react";

interface RejectionModalProps {
    turnoId: number;
    clientName: string;
    onClose: () => void;
    onReject: (turnoId: number, reason: string) => Promise<void>;
}

export function RejectionModal({ turnoId, clientName, onClose, onReject }: RejectionModalProps) {
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason.trim()) return;
        setIsSubmitting(true);
        await onReject(turnoId, reason.trim());
        setIsSubmitting(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-zinc-950 border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-red-500/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/20 text-red-400 rounded-full">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-red-500">Rechazar Turno</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-4">
                        <p className="text-zinc-300 text-sm leading-relaxed">
                            Estás a punto de rechazar la solicitud de <strong>{clientName}</strong>. 
                            Por favor, explica brevemente el motivo de tu decisión para brindarle una mejor experiencia al cliente.
                        </p>
                        
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">
                                Motivo del rechazo <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Ej: No realizo este estilo, disponibilidad agotada, presupuesto no acorde..."
                                required
                                rows={4}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500/50 resize-none transition-colors"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-white/10">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 px-4 font-bold rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={!reason.trim() || isSubmitting}
                            className="flex-1 py-3 px-4 font-bold rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? "Rechazando..." : "Confirmar Rechazo"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
