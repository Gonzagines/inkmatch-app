"use client";

import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Ghost, Menu, X, LogOut, User, Palette, Search } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [perfil, setPerfil] = useState<any>(null);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [searchValue, setSearchValue] = useState('');

    // Sync search input with URL params (also handles initial mount)
    useEffect(() => {
        setSearchValue(searchParams.get('q') || '');
    }, [searchParams]);


    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                supabase.from('perfiles').select('nombre, rol').eq('id', session.user.id).single()
                    .then(({ data }) => setPerfil(data));
            }
            setLoadingAuth(false);
        });

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

    const handleSearch = useCallback((value: string) => {
        setSearchValue(value);
        const params = new URLSearchParams(searchParams.toString());
        if (value.trim()) {
            params.set('q', value);
        } else {
            params.delete('q');
        }
        // Only push to home if we're on the home page, otherwise navigate there
        if (pathname === '/') {
            router.replace(`/?${params.toString()}`, { scroll: false });
        } else {
            router.push(`/?${params.toString()}`);
        }
    }, [searchParams, pathname, router]);

    const handleMisTurnos = () => {
        if (user) {
            const dashboardLink = perfil?.rol === 'tatuador' ? '/artist-dashboard' : '/dashboard';
            router.push(dashboardLink);
        } else {
            router.push('/login');
        }
    };

    const dashboardLink = perfil?.rol === 'tatuador' ? '/artist-dashboard' : '/dashboard';

    return (
        <nav className="fixed top-0 w-full z-50 bg-neutral-950/90 backdrop-blur-xl border-b border-neutral-800/50">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center h-16 gap-4">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2 shrink-0">
                        <div className="p-1.5 bg-emerald-500 rounded-lg">
                            <Ghost className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tighter text-white">
                            Ink<span className="text-emerald-400">Match</span>
                        </span>
                    </Link>

                    {/* Nav Links — Left */}
                    <div className="hidden md:flex items-center gap-1 shrink-0">
                        <Link
                            href="/"
                            className="px-3 py-2 text-sm font-semibold text-neutral-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                        >
                            Explorar
                        </Link>
                        <a
                            href="https://www.pinterest.com/search/pins/?q=tattoo%20inspiration"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 text-sm font-semibold text-neutral-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                        >
                            Inspiración
                        </a>
                        <button
                            onClick={handleMisTurnos}
                            className="px-3 py-2 text-sm font-semibold text-neutral-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                        >
                            Mis Turnos
                        </button>
                    </div>

                    {/* Search Bar — Center (flex-grow) */}
                    <div className="hidden md:flex flex-1 max-w-2xl mx-2">
                        <div className="relative w-full group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-emerald-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="Busca por nombre de artista o ciudad"
                                className="w-full bg-white/10 hover:bg-white/15 focus:bg-white/15 border border-neutral-700 focus:border-emerald-500/50 rounded-full pl-10 pr-4 py-2.5 text-sm text-white outline-none transition-all placeholder:text-neutral-500 focus:shadow-sm"
                                value={searchValue}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                            {searchValue && (
                                <button
                                    onClick={() => handleSearch('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/20 transition-colors"
                                >
                                    <X className="w-3.5 h-3.5 text-neutral-400" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="hidden md:flex items-center gap-2 shrink-0">
                        {user ? (
                            <>
                                <Link
                                    href={dashboardLink}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 border border-neutral-700 rounded-full transition-colors"
                                >
                                    {perfil?.rol === 'tatuador'
                                        ? <Palette className="w-4 h-4 text-emerald-500" />
                                        : <User className="w-4 h-4 text-emerald-500" />
                                    }
                                    <span className="text-sm font-semibold text-white">
                                        {perfil?.nombre || user.email?.split('@')[0]}
                                    </span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="p-2.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-red-400 transition-all"
                                    title="Cerrar sesión"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="px-5 py-2.5 text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-black rounded-full transition-all shadow-sm hover:shadow-md"
                                >
                                    Iniciar sesión
                                </Link>
                                <Link
                                    href="/login?mode=register"
                                    className="px-4 py-2.5 text-sm font-semibold text-neutral-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                                >
                                    Registrarse
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden ml-auto">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-full hover:bg-white/10 transition-colors"
                        >
                            {isOpen ? <X className="w-5 h-5 text-neutral-300" /> : <Menu className="w-5 h-5 text-neutral-300" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isOpen && (
                <div className="md:hidden bg-neutral-950 border-t border-neutral-800 animate-in slide-in-from-top duration-300">
                    <div className="px-4 pt-3 pb-4 space-y-2">
                        {/* Mobile Search */}
                        <div className="relative mb-3">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                            <input
                                type="text"
                                placeholder="Busca por nombre de artista o ciudad"
                                className="w-full bg-white/10 border border-neutral-700 rounded-full pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-emerald-500/50 placeholder:text-neutral-500"
                                value={searchValue}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>

                        <Link
                            href="/"
                            className="block px-4 py-3 text-base font-semibold text-neutral-300 rounded-xl hover:bg-white/10"
                            onClick={() => setIsOpen(false)}
                        >
                            Explorar
                        </Link>
                        <a
                            href="https://www.pinterest.com/search/pins/?q=tattoo%20inspiration"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block px-4 py-3 text-base font-semibold text-neutral-300 rounded-xl hover:bg-white/10"
                            onClick={() => setIsOpen(false)}
                        >
                            Inspiración
                        </a>
                        <button
                            onClick={() => { handleMisTurnos(); setIsOpen(false); }}
                            className="block w-full text-left px-4 py-3 text-base font-semibold text-neutral-300 rounded-xl hover:bg-white/10"
                        >
                            Mis Turnos
                        </button>

                        {user ? (
                            <div className="pt-3 space-y-2 border-t border-neutral-800">
                                <Link
                                    href={dashboardLink}
                                    className="flex items-center gap-3 px-4 py-3 bg-white/10 rounded-xl"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {perfil?.rol === 'tatuador'
                                        ? <Palette className="w-4 h-4 text-emerald-500" />
                                        : <User className="w-4 h-4 text-emerald-500" />
                                    }
                                    <span className="text-sm font-semibold text-white">
                                        {perfil?.nombre || user.email?.split('@')[0]}
                                    </span>
                                </Link>
                                <button
                                    onClick={() => { handleLogout(); setIsOpen(false); }}
                                    className="w-full py-3 bg-red-500/10 border border-red-500/20 text-red-400 font-bold rounded-xl flex items-center justify-center gap-2"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Cerrar sesión
                                </button>
                            </div>
                        ) : (
                            <div className="pt-3 space-y-2 border-t border-neutral-800">
                                <Link
                                    href="/login"
                                    className="block w-full py-3 text-center bg-emerald-500 text-black font-bold rounded-full shadow-sm"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Iniciar sesión
                                </Link>
                                <Link
                                    href="/login?mode=register"
                                    className="block w-full py-3 text-center text-neutral-300 font-semibold border border-neutral-700 rounded-full hover:bg-white/10"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Registrarse
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
