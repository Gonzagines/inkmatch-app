"use client";

import Link from "next/link";
import { Star, MapPin, ArrowRight } from "lucide-react";

interface ArtistCardProps {
    id: string;
    name: string;
    style: string;
    location: string;
    rating: number;
    image: string;
    slug: string;
}

export function ArtistCard({ name, style, location, rating, image, slug }: ArtistCardProps) {
    return (
        <div className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-accent/40 transition-all duration-500 shadow-xl">
            {/* Image Container */}
            <div className="aspect-[4/5] overflow-hidden">
                <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 right-4 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg flex items-center space-x-1 border border-white/10">
                    <Star className="w-4 h-4 text-accent fill-accent" />
                    <span className="text-sm font-bold text-white">{rating}</span>
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-accent transition-colors">
                            {name}
                        </h3>
                        <p className="text-accent text-sm font-medium">{style}</p>
                    </div>
                </div>

                <div className="flex items-center text-zinc-400 text-sm mb-6">
                    <MapPin className="w-4 h-4 mr-1" />
                    {location}
                </div>

                <Link
                    href={`/artists/${slug}`}
                    className="flex items-center justify-center w-full py-3 bg-white/5 border border-white/10 rounded-xl text-white font-semibold hover:bg-accent hover:text-black hover:border-accent transition-all duration-300 group/btn"
                >
                    <span>Ver Perfil</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
    );
}
