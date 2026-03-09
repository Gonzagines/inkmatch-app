'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Camera, User, BookOpen, Instagram, Save, Loader2 } from 'lucide-react';

export default function RegistroTatuador() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    biografia: '',
    estilo: '',
    instagram: ''
  });
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let fotoUrl = '';

      // 1. Subir foto de perfil si existe
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('try-on-uploads') // Usamos el mismo bucket por ahora
          .upload(fileName, file);

        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('try-on-uploads').getPublicUrl(fileName);
        fotoUrl = publicUrl;
      }

      // 2. Insertar en la tabla tatuadores
      const { error: insertError } = await supabase
        .from('tatuadores')
        .insert({
          nombre_artistico: formData.nombre,
          biografia: formData.biografia,
          estilo_principal: formData.estilo,
          instagram_url: formData.instagram,
          foto_perfil_url: fotoUrl
        });

      if (insertError) throw insertError;

      alert('¡Perfil creado con éxito!');
      window.location.href = '/'; // Volver al inicio

    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-8">
      <div className="max-w-xl mx-auto bg-neutral-900 p-8 rounded-3xl border border-neutral-800 shadow-2xl">
        <h1 className="text-3xl font-bold text-emerald-400 mb-6 flex items-center gap-2">
          <User /> Crear Perfil de Tatuador
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-400">Nombre Artístico</label>
            <input required type="text" className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500" 
              onChange={(e) => setFormData({...formData, nombre: e.target.value})} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-400">Biografía / Historia</label>
            <textarea className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 h-32 outline-none focus:ring-2 focus:ring-emerald-500"
              onChange={(e) => setFormData({...formData, biografia: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-400">Estilo Principal</label>
              <select className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500"
                onChange={(e) => setFormData({...formData, estilo: e.target.value})}>
                <option value="">Seleccionar...</option>
                <option value="Realismo">Realismo</option>
                <option value="Tradicional">Tradicional</option>
                <option value="Fine Line">Fine Line</option>
                <option value="Blackwork">Blackwork</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-400">Instagram (URL)</label>
              <input type="text" placeholder="https://instagram.com/..." className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500"
                onChange={(e) => setFormData({...formData, instagram: e.target.value})} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-400 flex items-center gap-2">
              <Camera size={16} /> Foto de Perfil
            </label>
            <input type="file" accept="image/*" className="w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-emerald-950 file:text-emerald-400"
              onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>

          <button disabled={loading} type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all">
            {loading ? <Loader2 className="animate-spin" /> : <Save />}
            {loading ? "Guardando..." : "Publicar Perfil"}
          </button>
        </form>
      </div>
    </main>
  );
}