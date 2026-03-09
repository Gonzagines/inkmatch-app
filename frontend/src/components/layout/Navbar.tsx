"use client";

import Link from "next/link";
import { Ghost, Menu, X, LogOut, User, Palette } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [perfil, setPerfil] = useState<any>(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    useEffect(() => {
        // Check initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                supabase.from('perfiles').select('nombre, rol').eq('id', session.user.id).single()
                    .then(({ data }) => setPerfil(data));
            }
            setLoadingAuth(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                supabase.from('perfiles').select('nombre, rol').eq('id', session.user.id).single()
                    .then(({ data }) => setPerfil(data));
            } else {
                setPerfil(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setPerfil(null);
        window.location.href = '/';
    };

    const dashboardLink = perfil?.rol === 'tatuador' ? '/artist-dashboard' : '/dashboard';

    return (
        <nav className="fixed top-0 w-full z-50 glass border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="p-2 bg-accent rounded-lg shadow-emerald">
                            <Ghost className="w-6 h-6 text-black" />
                        </div>
                        <span className="text-2xl font-bold tracking-tighter">
                            INK<span className="text-accent">MATCH</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/" className="text-sm font-medium hover:text-accent transition-colors">
                            Explorar
                        </Link>
                        <Link href="/artists" className="text-sm font-medium hover:text-accent transition-colors">
                            Tatuadores
                        </Link>

                        {user ? (
                            <>
                                <Link href={dashboardLink} className="text-sm font-medium hover:text-accent transition-colors">
                                    {perfil?.rol === 'tatuador' ? 'Mi Dashboard' : 'Mis Turnos'}
                                </Link>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2">
                                        {perfil?.rol === 'tatuador'
                                            ? <Palette className="w-4 h-4 text-emerald-400" />
                                            : <User className="w-4 h-4 text-emerald-400" />
                                        }
                                        <span className="text-sm font-medium">{perfil?.nombre || user.email?.split('@')[0]}</span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="p-2.5 bg-white/5 border border-white/10 rounded-full hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-all"
                                        title="Cerrar sesión"
                                    >
                                        <LogOut className="w-4 h-4" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link href="/dashboard" className="text-sm font-medium hover:text-accent transition-colors">
                                    Mis Turnos
                                </Link>
                                <Link href="/login" className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-black font-semibold rounded-full transition-all duration-300 shadow-emerald">
                                    Entrar
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-md hover:bg-white/10 transition-colors"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isOpen && (
                <div className="md:hidden glass border-t border-border animate-in slide-in-from-top duration-300">
                    <div className="px-4 pt-4 pb-6 space-y-2">
                        <Link
                            href="/"
                            className="block px-3 py-4 text-base font-medium rounded-xl hover:bg-white/5"
                            onClick={() => setIsOpen(false)}
                        >
                            Explorar
                        </Link>
                        <Link
                            href="/artists"
                            className="block px-3 py-4 text-base font-medium rounded-xl hover:bg-white/5"
                            onClick={() => setIsOpen(false)}
                        >
                            Tatuadores
                        </Link>

                        {user ? (
                            <>
                                <Link
                                    href={dashboardLink}
                                    className="block px-3 py-4 text-base font-medium rounded-xl hover:bg-white/5"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {perfil?.rol === 'tatuador' ? 'Mi Dashboard' : 'Mis Turnos'}
                                </Link>
                                <div className="pt-4 space-y-3">
                                    <div className="flex items-center gap-3 px-3 py-3 bg-white/5 rounded-xl">
                                        {perfil?.rol === 'tatuador'
                                            ? <Palette className="w-4 h-4 text-emerald-400" />
                                            : <User className="w-4 h-4 text-emerald-400" />
                                        }
                                        <span className="text-sm font-medium">{perfil?.nombre || user.email?.split('@')[0]}</span>
                                    </div>
                                    <button
                                        onClick={() => { handleLogout(); setIsOpen(false); }}
                                        className="w-full py-4 bg-red-500/10 border border-red-500/20 text-red-400 font-bold rounded-xl flex items-center justify-center gap-2"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Cerrar sesión
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/dashboard"
                                    className="block px-3 py-4 text-base font-medium rounded-xl hover:bg-white/5"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Mis Turnos
                                </Link>
                                <div className="pt-4">
                                    <Link
                                        href="/login"
                                        className="block w-full py-4 bg-accent text-black font-bold rounded-xl shadow-emerald text-center"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Entrar
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
