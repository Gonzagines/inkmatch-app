"use client";

import { Search, Sparkles } from "lucide-react";

const STYLES = [
    { name: "Realismo", icon: "🌌" },
    { name: "Tradicional", icon: "⚓" },
    { name: "Fine Line", icon: "✒️" },
    { name: "Blackwork", icon: "🖤" },
];

export function Hero() {
    return (
        <section className="relative overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-40">
            {/* Background Decor */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl blur-[120px] opacity-20 pointer-events-none">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent rounded-full" />
                <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-900 rounded-full" />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-accent text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <Sparkles className="w-4 h-4" />
                    <span>El arte que buscabas, a un click</span>
                </div>

                <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                    Encuentra al artista perfecto <br />
                    <span className="text-gradient">para tu próximo tatuaje</span>
                </h1>

                <p className="max-w-2xl mx-auto text-lg text-zinc-400 mb-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                    Explora los mejores portfolios del país, realiza simulaciones con IA sobre tu piel
                    y agenda turnos directamente.
                </p>

                {/* Search Bar */}
                <div className="max-w-3xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
                    <div className="relative group p-1 bg-white/5 border border-white/10 rounded-2xl focus-within:border-accent/50 focus-within:bg-white/10 transition-all shadow-2xl">
                        <div className="flex flex-col md:flex-row items-center">
                            <div className="flex-1 flex items-center px-6 py-4 border-b md:border-b-0 md:border-r border-white/10">
                                <Search className="w-5 h-5 text-zinc-500 mr-3" />
                                <input
                                    type="text"
                                    placeholder="Busca por nombre o ubicación..."
                                    className="w-full bg-transparent border-none outline-none text-white placeholder-zinc-500"
                                />
                            </div>
                            <div className="flex-1 hidden md:flex items-center px-6 py-4">
                                <span className="text-zinc-500 mr-2">Estilo:</span>
                                <select className="bg-transparent border-none outline-none text-white cursor-pointer">
                                    <option className="bg-zinc-900">Todos los estilos</option>
                                    <option className="bg-zinc-900">Realismo</option>
                                    <option className="bg-zinc-900">Tradicional</option>
                                    <option className="bg-zinc-900">Fine Line</option>
                                </select>
                            </div>
                            <button className="w-full md:w-auto px-10 py-4 bg-accent hover:bg-accent-hover text-black font-bold rounded-xl transition-all shadow-emerald m-1">
                                Buscar
                            </button>
                        </div>
                    </div>
                </div>

                {/* Style Badges */}
                <div className="flex flex-wrap justify-center gap-3 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
                    {STYLES.map((style) => (
                        <button
                            key={style.name}
                            className="flex items-center space-x-2 px-5 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-full hover:border-accent/50 hover:bg-zinc-800 transition-all group"
                        >
                            <span className="text-xl group-hover:scale-110 transition-transform">{style.icon}</span>
                            <span className="text-sm font-medium text-zinc-300 group-hover:text-white">{style.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}
