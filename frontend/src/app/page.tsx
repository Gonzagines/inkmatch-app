'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Instagram, ArrowRight, Loader2, Search, Sparkles, X } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const STYLES = ['Todos', 'Realismo', 'Fine Line', 'Tradicional', 'Blackwork', 'Neo Traditional', 'Acuarela', 'Minimalista'];

export default function Home() {
  const router = useRouter();
  const [tatuadores, setTatuadores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStyle, setActiveStyle] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchTatuadores() {
      const { data } = await supabase.from('tatuadores').select('*');
      if (data) setTatuadores(data);
      setLoading(false);
    }
    fetchTatuadores();
  }, []);

  const filtered = useMemo(() => {
    let result = tatuadores;
    if (activeStyle !== 'Todos') {
      result = result.filter(t => t.estilo_principal?.toLowerCase() === activeStyle.toLowerCase());
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.nombre_artistico?.toLowerCase().includes(q) ||
        t.estilo_principal?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [tatuadores, activeStyle, searchQuery]);

  if (loading) return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
      <Loader2 className="animate-spin text-emerald-500" size={48} />
    </div>
  );

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-neutral-950 to-neutral-950" />
        <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-12">
          <header className="flex justify-between items-center mb-16">
            <Link href="/" className="text-3xl font-bold text-emerald-400 tracking-tighter">
              InkMatch
            </Link>
            <Link href="/registro-tatuador" className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-6 py-3 rounded-full transition-all hover:scale-105">
              Unirme como Tatuador
            </Link>
          </header>

          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-6xl md:text-7xl font-bold tracking-tighter mb-4">
              Encontrá tu <span className="bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">artista ideal</span>
            </h1>
            <p className="text-neutral-400 text-lg md:text-xl">
              Explorá los mejores tatuadores, descubrí su trabajo y agendá tu turno al instante.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto mb-12">
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-500 w-5 h-5 group-focus-within:text-emerald-400 transition-colors" />
              <input
                type="text"
                placeholder="Buscar por nombre de artista..."
                className="w-full bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 focus:border-emerald-500/50 rounded-2xl pl-14 pr-12 py-5 text-white outline-none transition-all placeholder:text-neutral-600"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Style Filter Pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {STYLES.map(style => (
              <button
                key={style}
                onClick={() => setActiveStyle(style)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border ${activeStyle === style
                  ? 'bg-emerald-500 text-black border-emerald-500 shadow-lg shadow-emerald-500/25'
                  : 'bg-neutral-900/50 text-neutral-400 border-neutral-800 hover:border-neutral-600 hover:text-white'
                  }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        {/* Result count */}
        <div className="flex justify-between items-center mb-8">
          <p className="text-neutral-500 text-sm">
            {filtered.length} {filtered.length === 1 ? 'artista' : 'artistas'} encontrados
          </p>
          {activeStyle !== 'Todos' && (
            <button
              onClick={() => setActiveStyle('Todos')}
              className="text-emerald-400 text-sm font-semibold hover:underline"
            >
              Limpiar filtro
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            /* Empty State */
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-24"
            >
              <div className="w-24 h-24 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-neutral-700" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-neutral-300">
                No encontramos artistas {activeStyle !== 'Todos' ? `de "${activeStyle}"` : ''}
              </h3>
              <p className="text-neutral-500 mb-8 max-w-md mx-auto">
                Probá con otro estilo o buscá por nombre para descubrir nuevos tatuadores.
              </p>
              <button
                onClick={() => { setActiveStyle('Todos'); setSearchQuery(''); }}
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-2xl transition-all hover:scale-105 shadow-lg shadow-emerald-500/20"
              >
                Ver todos los artistas
              </button>
            </motion.div>
          ) : (
            /* Grid */
            <motion.div
              key={activeStyle + searchQuery}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filtered.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <Link href={`/artists/${t.id}`} className="block group">
                    <div className="bg-neutral-900 rounded-3xl overflow-hidden border border-neutral-800 hover:border-emerald-500/50 transition-all duration-500 hover:shadow-lg hover:shadow-emerald-500/5">
                      <div className="aspect-square relative overflow-hidden">
                        <img
                          src={t.foto_perfil_url || 'https://via.placeholder.com/400'}
                          alt={t.nombre_artistico}
                          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent opacity-60" />
                        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-emerald-400 border border-emerald-500/30">
                          {t.estilo_principal}
                        </div>
                        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="bg-emerald-500 text-black px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5">
                            Ver Portfolio <ArrowRight size={14} />
                          </div>
                        </div>
                      </div>
                      <div className="p-6 space-y-3">
                        <h2 className="text-xl font-bold group-hover:text-emerald-400 transition-colors">{t.nombre_artistico}</h2>
                        <p className="text-neutral-500 text-sm line-clamp-2 leading-relaxed">{t.biografia}</p>
                        <div className="flex items-center justify-between pt-3 border-t border-neutral-800/50">
                          <span className="text-emerald-400/70 text-xs font-medium flex items-center gap-1">
                            Ver Portfolio <ArrowRight size={12} />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}