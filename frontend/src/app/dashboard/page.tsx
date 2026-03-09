"use client";

import { Calendar, Clock, Sparkles, Settings, LogOut } from "lucide-react";

export default function ClientDashboard() {
    const APPOINTMENTS = [
        {
            id: "1",
            artist: "Elena Black",
            date: "15 Mar, 2024",
            time: "10:00 AM",
            status: "Pendiente",
            image: "https://images.unsplash.com/photo-1590247813693-5541d1c609fd?q=80&w=800&auto=format&fit=crop",
        }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <div>
                    <h1 className="text-4xl font-bold mb-2">Hola, <span className="text-gradient">Alex</span></h1>
                    <p className="text-zinc-500">Gestiona tus turnos y simulaciones de tatuajes</p>
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
                        Próximos Turnos
                    </h2>

                    {APPOINTMENTS.map(apt => (
                        <div key={apt.id} className="glass p-6 rounded-3xl border-white/10 flex flex-col md:flex-row gap-6 items-center">
                            <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                                <img src={apt.image} alt={apt.artist} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-lg font-bold">{apt.artist}</h3>
                                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2 text-sm text-zinc-400">
                                    <div className="flex items-center"><Calendar className="w-4 h-4 mr-1.5" /> {apt.date}</div>
                                    <div className="flex items-center"><Clock className="w-4 h-4 mr-1.5" /> {apt.time}</div>
                                </div>
                            </div>
                            <div className="flex flex-col items-center md:items-end gap-3">
                                <span className="px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-accent text-xs font-bold uppercase tracking-wider">
                                    {apt.status}
                                </span>
                                <button className="text-sm font-medium text-zinc-500 hover:text-white transition-colors">Cancelar</button>
                            </div>
                        </div>
                    ))}
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
                        <p className="text-sm text-zinc-500 mb-6">Aún no tienes simulaciones guardadas.</p>
                        <button className="w-full py-4 border border-accent/30 text-accent font-bold rounded-2xl hover:bg-accent/5 transition-all">
                            Nueva Simulación
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
