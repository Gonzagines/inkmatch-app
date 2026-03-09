"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
    Star,
    MapPin,
    Calendar,
    Instagram,
    Share2,
    ShieldCheck,
    Clock,
    ChevronLeft,
    ChevronRight,
    Loader2,
    X,
    ZoomIn,
    User,
    Send,
    Camera,
    Image as ImageIcon,
    PenSquare
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { BookingModal } from "@/components/ui/BookingModal";
import { motion, AnimatePresence } from "framer-motion";

export default function ArtistProfile() {
    const { id } = useParams();
    const [artist, setArtist] = useState<any>(null);
    const [portfolio, setPortfolio] = useState<any[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("portfolio");
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    // Review form state
    const [reviewName, setReviewName] = useState("");
    const [reviewScore, setReviewScore] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [reviewPhoto, setReviewPhoto] = useState<string | null>(null);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [submittingReview, setSubmittingReview] = useState(false);
    const [hoverStar, setHoverStar] = useState(0);

    useEffect(() => {
        async function fetchArtistData() {
            if (!id) return;
            const { data: artistData } = await supabase
                .from('tatuadores')
                .select('*')
                .eq('id', id)
                .single();

            if (artistData) {
                setArtist(artistData);

                const [portfolioRes, reviewsRes] = await Promise.all([
                    supabase.from('portfolio').select('*').eq('tatuador_id', id),
                    supabase.from('reseñas').select('*').eq('tatuador_id', id).order('created_at', { ascending: false })
                ]);

                if (portfolioRes.data) setPortfolio(portfolioRes.data);
                if (reviewsRes.data) setReviews(reviewsRes.data);
            }
            setLoading(false);
        }
        fetchArtistData();
    }, [id]);

    const averageRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + (r.puntuacion || 0), 0) / reviews.length).toFixed(1)
        : null;

    const openLightbox = (index: number) => setLightboxIndex(index);
    const closeLightbox = () => setLightboxIndex(null);
    const nextImage = () => {
        if (lightboxIndex !== null) setLightboxIndex((lightboxIndex + 1) % portfolio.length);
    };
    const prevImage = () => {
        if (lightboxIndex !== null) setLightboxIndex((lightboxIndex - 1 + portfolio.length) % portfolio.length);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (lightboxIndex === null) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxIndex, portfolio.length]);

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reviewName.trim() || !reviewComment.trim()) return;
        setSubmittingReview(true);
        try {
            const { error } = await supabase
                .from('reseñas')
                .insert([{
                    tatuador_id: id,
                    cliente_nombre: reviewName,
                    puntuacion: reviewScore,
                    comentario: reviewComment,
                    foto_tatuaje_terminado_url: reviewPhoto || null
                }]);
            if (error) throw error;

            // Refresh reviews
            const { data } = await supabase
                .from('reseñas')
                .select('*')
                .eq('tatuador_id', id)
                .order('created_at', { ascending: false });
            if (data) setReviews(data);

            setReviewName("");
            setReviewScore(5);
            setReviewComment("");
            setReviewPhoto(null);
            setShowReviewForm(false);
        } catch (err: any) {
            alert("Error al enviar reseña: " + err.message);
        } finally {
            setSubmittingReview(false);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    if (loading) return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
            <Loader2 className="animate-spin text-emerald-500" size={48} />
        </div>
    );

    if (!artist) return (
        <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center space-y-4 text-white">
            <h2 className="text-2xl font-bold">Artista no encontrado</h2>
            <Link href="/" className="text-emerald-400 hover:underline">Volver al inicio</Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-neutral-950 text-white">
            {/* Booking Modal */}
            <BookingModal
                isOpen={isBookingOpen}
                onClose={() => setIsBookingOpen(false)}
                artistName={artist.nombre_artistico}
                artistId={artist.id}
            />

            {/* Lightbox */}
            <AnimatePresence>
                {lightboxIndex !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center"
                        onClick={closeLightbox}
                    >
                        <button onClick={closeLightbox} className="absolute top-6 right-6 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-4 md:left-8 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-4 md:right-8 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                            <ChevronRight className="w-6 h-6" />
                        </button>

                        <motion.div
                            key={lightboxIndex}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                            className="max-w-5xl max-h-[85vh] px-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={portfolio[lightboxIndex].imagen_url}
                                alt={portfolio[lightboxIndex].titulo || "Obra"}
                                className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
                            />
                            {portfolio[lightboxIndex].titulo && (
                                <div className="mt-4 text-center">
                                    <p className="text-white/80 font-medium">{portfolio[lightboxIndex].titulo}</p>
                                    <p className="text-neutral-500 text-sm mt-1">{lightboxIndex + 1} / {portfolio.length}</p>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Cover */}
            <div className="relative h-[40vh] overflow-hidden">
                {portfolio.length > 0 && (
                    <img src={portfolio[0].imagen_url} className="w-full h-full object-cover blur-sm opacity-30 scale-110" alt="Cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-neutral-950" />
                <div className="absolute top-8 left-4 sm:left-8">
                    <Link href="/" className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                        <ChevronLeft className="w-5 h-5" />
                        <span className="text-sm font-medium">Volver</span>
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Left Column: Profile Info */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-neutral-900/80 backdrop-blur-xl p-8 rounded-[2rem] border border-neutral-800 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6">
                                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                            </div>

                            <div className="w-32 h-32 rounded-3xl overflow-hidden mb-6 border-4 border-emerald-500 shadow-lg shadow-emerald-500/20">
                                <img src={artist.foto_perfil_url || 'https://via.placeholder.com/400'} className="w-full h-full object-cover" alt={artist.nombre_artistico} />
                            </div>

                            <h1 className="text-3xl font-bold mb-2">{artist.nombre_artistico}</h1>
                            <p className="text-emerald-400 font-medium mb-6">{artist.estilo_principal}</p>

                            <div className="flex items-center space-x-4 mb-8">
                                <div className="flex items-center bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                                    <Star className="w-4 h-4 text-amber-400 fill-amber-400 mr-1.5" />
                                    <span className="font-bold">{averageRating || "—"}</span>
                                </div>
                                <span className="text-neutral-500 text-sm">
                                    {reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas'}
                                </span>
                            </div>

                            <div className="space-y-4 text-neutral-400 mb-8 text-sm">
                                <div className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-3 text-neutral-600" />
                                    {artist.ubicacion || "Buenos Aires"}
                                </div>
                                <div className="flex items-center">
                                    <Clock className="w-4 h-4 mr-3 text-neutral-600" />
                                    Próximo turno disponible: 15 Mar
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsBookingOpen(true)}
                                    className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2 hover:scale-[1.02]"
                                >
                                    <Calendar className="w-5 h-5" />
                                    <span>Agendar Turno</span>
                                </button>
                                <button className="p-4 bg-white/5 border border-neutral-800 rounded-2xl hover:bg-white/10 transition-colors">
                                    <Share2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="bg-neutral-900/80 backdrop-blur-xl p-8 rounded-[2rem] border border-neutral-800">
                            <h3 className="text-lg font-bold mb-4">Sobre mí</h3>
                            <p className="text-neutral-400 leading-relaxed">{artist.biografia}</p>
                            <div className="mt-6 flex items-center space-x-4">
                                <a href={artist.instagram_url} target="_blank" rel="noopener noreferrer">
                                    <Instagram className="w-5 h-5 text-neutral-500 cursor-pointer hover:text-pink-500 transition-colors" />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Portfolio / Reviews */}
                    <div className="lg:col-span-2">
                        <div className="flex space-x-8 border-b border-neutral-800 mb-8">
                            <button
                                onClick={() => setActiveTab("portfolio")}
                                className={`pb-4 text-lg font-bold transition-all relative ${activeTab === "portfolio" ? "text-white" : "text-neutral-500 hover:text-neutral-300"}`}
                            >
                                Portfolio ({portfolio.length})
                                {activeTab === "portfolio" && <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500 rounded-full" />}
                            </button>
                            <button
                                onClick={() => setActiveTab("reviews")}
                                className={`pb-4 text-lg font-bold transition-all relative ${activeTab === "reviews" ? "text-white" : "text-neutral-500 hover:text-neutral-300"}`}
                            >
                                Reseñas ({reviews.length})
                                {activeTab === "reviews" && <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500 rounded-full" />}
                            </button>
                        </div>

                        {/* PORTFOLIO TAB */}
                        {activeTab === "portfolio" && (
                            <>
                                {portfolio.length === 0 ? (
                                    <div className="text-center py-20 text-neutral-500">
                                        <div className="w-20 h-20 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <ZoomIn className="w-8 h-8 text-neutral-700" />
                                        </div>
                                        <p className="text-lg font-medium mb-1">Aún no hay obras</p>
                                        <p className="text-sm">Este artista aún no ha subido fotos a su portfolio.</p>
                                    </div>
                                ) : (
                                    <div className="columns-2 md:columns-3 gap-4 space-y-4">
                                        {portfolio.map((item, index) => (
                                            <motion.div
                                                key={item.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.4, delay: index * 0.06 }}
                                                className="break-inside-avoid group relative rounded-2xl overflow-hidden border border-neutral-800 hover:border-emerald-500/30 transition-all duration-500 cursor-pointer"
                                                onClick={() => openLightbox(index)}
                                            >
                                                <img
                                                    src={item.imagen_url}
                                                    className="w-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                                    alt={item.titulo || "Obra"}
                                                    loading="lazy"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center space-y-2">
                                                        <div className="p-3 bg-white/10 backdrop-blur-lg rounded-full border border-white/20">
                                                            <ZoomIn className="w-5 h-5 text-white" />
                                                        </div>
                                                        {item.titulo && (
                                                            <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white border border-white/10">
                                                                {item.titulo}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {/* REVIEWS TAB */}
                        {activeTab === "reviews" && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.4 }}
                                className="space-y-8"
                            >
                                {/* Average Rating Card */}
                                <div className="bg-neutral-900/80 backdrop-blur-xl p-8 rounded-[2rem] border border-neutral-800 flex flex-col md:flex-row items-center gap-10">
                                    <div className="text-center md:border-r md:border-neutral-800 md:pr-12">
                                        <div className="text-6xl font-extrabold text-white mb-2">{averageRating || "0.0"}</div>
                                        <div className="flex gap-1 mb-2 justify-center">
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <Star
                                                    key={s}
                                                    className={`w-5 h-5 ${s <= Math.round(Number(averageRating)) ? 'text-amber-400 fill-amber-400' : 'text-neutral-700'}`}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-neutral-500 text-sm font-medium">{reviews.length} reseñas</p>

                                        <button
                                            onClick={() => setShowReviewForm(!showReviewForm)}
                                            className="mt-6 flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3.5 rounded-full transition-all font-bold text-sm shadow-lg shadow-emerald-500/20 active:scale-95"
                                        >
                                            <PenSquare className="w-4 h-4" />
                                            <span>Escribir una reseña</span>
                                        </button>
                                    </div>
                                    <div className="flex-1 w-full space-y-2.5">
                                        {[5, 4, 3, 2, 1].map(score => {
                                            const count = reviews.filter(r => r.puntuacion === score).length;
                                            const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                                            return (
                                                <div key={score} className="flex items-center gap-4 text-sm">
                                                    <span className="text-neutral-500 w-4 font-bold">{score}</span>
                                                    <div className="flex-1 h-2.5 bg-neutral-800 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-amber-400 rounded-full transition-all duration-1000 ease-out"
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-neutral-600 w-8 text-xs font-medium">{count}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Write a Review Form (Hidden by default) */}
                                <AnimatePresence>
                                    {showReviewForm && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                            animate={{ opacity: 1, height: 'auto', marginTop: 32 }}
                                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="bg-neutral-900/80 backdrop-blur-xl p-8 rounded-[2rem] border border-neutral-800 shadow-2xl">
                                                <div className="flex items-center justify-between mb-8">
                                                    <h3 className="text-xl font-bold">Dejá tu opinión</h3>
                                                    <button
                                                        onClick={() => setShowReviewForm(false)}
                                                        className="p-2 hover:bg-white/5 rounded-full text-neutral-500 hover:text-white transition-colors"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </div>
                                                <form onSubmit={handleSubmitReview} className="space-y-6">
                                                    <div>
                                                        <label className="block text-sm font-bold text-neutral-400 mb-2">Tu nombre</label>
                                                        <input
                                                            type="text"
                                                            required
                                                            placeholder="Ej: María G."
                                                            className="w-full bg-neutral-800/30 border border-neutral-700/50 rounded-2xl px-5 py-4 text-white outline-none focus:border-emerald-500/50 transition-all focus:bg-neutral-800/60"
                                                            value={reviewName}
                                                            onChange={(e) => setReviewName(e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-bold text-neutral-400 mb-2">Tu puntuación</label>
                                                        <div className="flex gap-3 bg-black/20 p-3 rounded-2xl w-fit">
                                                            {[1, 2, 3, 4, 5].map(s => (
                                                                <button
                                                                    key={s}
                                                                    type="button"
                                                                    onClick={() => setReviewScore(s)}
                                                                    onMouseEnter={() => setHoverStar(s)}
                                                                    onMouseLeave={() => setHoverStar(0)}
                                                                    className="p-1 transition-transform hover:scale-125"
                                                                >
                                                                    <Star
                                                                        className={`w-8 h-8 transition-all ${s <= (hoverStar || reviewScore)
                                                                            ? 'text-amber-400 fill-amber-400 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]'
                                                                            : 'text-neutral-700'
                                                                            }`}
                                                                    />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-bold text-neutral-400 mb-2">Tu comentario</label>
                                                        <textarea
                                                            required
                                                            placeholder="Contá tu experiencia con el artista..."
                                                            className="w-full bg-neutral-800/30 border border-neutral-700/50 rounded-2xl px-5 py-4 text-white outline-none focus:border-emerald-500/50 transition-all focus:bg-neutral-800/60 resize-none min-h-[120px]"
                                                            value={reviewComment}
                                                            onChange={(e) => setReviewComment(e.target.value)}
                                                        />
                                                    </div>

                                                    <div className="space-y-4">
                                                        <label className="block text-sm font-bold text-neutral-400">Adjuntar foto del trabajo</label>
                                                        <div className="flex items-center gap-4">
                                                            <input
                                                                type="file"
                                                                id="review-photo-input"
                                                                accept="image/*"
                                                                className="hidden"
                                                                onChange={(e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (file) {
                                                                        const reader = new FileReader();
                                                                        reader.onloadend = () => {
                                                                            setReviewPhoto(reader.result as string);
                                                                        };
                                                                        reader.readAsDataURL(file);
                                                                    }
                                                                }}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => document.getElementById('review-photo-input')?.click()}
                                                                className={`flex items-center gap-2 px-6 py-4 rounded-2xl border-2 border-dashed transition-all ${reviewPhoto ? 'border-emerald-500 bg-emerald-500/5 text-emerald-400' : 'border-neutral-800 bg-neutral-800/30 text-neutral-500 hover:border-neutral-700 hover:text-neutral-300'
                                                                    }`}
                                                            >
                                                                <Camera className="w-5 h-5" />
                                                                <span className="font-bold text-sm">{reviewPhoto ? 'Cambiar foto' : 'Subir foto'}</span>
                                                            </button>
                                                            {reviewPhoto && (
                                                                <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-neutral-800 group shadow-lg">
                                                                    <img src={reviewPhoto} className="w-full h-full object-cover" alt="Preview" />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setReviewPhoto(null)}
                                                                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                                                    >
                                                                        <X className="w-5 h-5 text-white" />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="submit"
                                                        disabled={submittingReview}
                                                        className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-2xl transition-all flex items-center justify-center space-x-3 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                                                    >
                                                        {submittingReview
                                                            ? <Loader2 className="w-6 h-6 animate-spin" />
                                                            : <>
                                                                <Send className="w-5 h-5 rotate-[-45deg]" />
                                                                <span className="uppercase tracking-wider">Publicar Reseña</span>
                                                            </>
                                                        }
                                                    </button>
                                                </form>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Reviews List */}
                                {reviews.length === 0 ? (
                                    <div className="text-center py-16">
                                        <div className="w-20 h-20 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Star className="w-8 h-8 text-neutral-700" />
                                        </div>
                                        <p className="text-neutral-400 font-medium">Aún no hay reseñas</p>
                                        <p className="text-neutral-600 text-sm mt-1">Sé el primero en dejar tu opinión.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {reviews.map((review, i) => (
                                            <motion.div
                                                key={review.id}
                                                initial={{ opacity: 0, y: 15 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3, delay: i * 0.05 }}
                                                className="bg-neutral-900/60 p-6 rounded-2xl border border-neutral-800 hover:border-neutral-700 transition-colors"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center flex-shrink-0 border border-neutral-700">
                                                        <User className="w-5 h-5 text-neutral-500" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <h4 className="font-bold text-sm">{review.cliente_nombre}</h4>
                                                            <span className="text-neutral-600 text-xs">{formatDate(review.created_at)}</span>
                                                        </div>
                                                        <div className="flex gap-0.5 mb-3">
                                                            {[1, 2, 3, 4, 5].map(s => (
                                                                <Star
                                                                    key={s}
                                                                    className={`w-3.5 h-3.5 ${s <= review.puntuacion ? 'text-amber-400 fill-amber-400' : 'text-neutral-700'}`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <p className="text-neutral-400 text-sm leading-relaxed mb-4">{review.comentario}</p>
                                                        {review.foto_tatuaje_terminado_url && (
                                                            <div className="w-40 aspect-square rounded-xl overflow-hidden border border-neutral-800 group relative">
                                                                <img
                                                                    src={review.foto_tatuaje_terminado_url}
                                                                    alt="Tatuaje terminado"
                                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                                />
                                                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
