'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, Sparkles, X, ImagePlus, Loader2, ChevronRight, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── helpers ──────────────────────────────────────────────────────────────────

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // strip the data:image/...;base64, prefix
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function ImageDropZone({
  label,
  hint,
  file,
  preview,
  onFile,
  onClear,
  required,
}: {
  label: string;
  hint: string;
  file: File | null;
  preview: string | null;
  onFile: (f: File) => void;
  onClear: () => void;
  required?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const dropped = e.dataTransfer.files[0];
      if (dropped && dropped.type.startsWith('image/')) onFile(dropped);
    },
    [onFile],
  );

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-neutral-300 flex items-center gap-1.5">
        {label}
        {required && <span className="text-emerald-500">*</span>}
      </label>
      <p className="text-xs text-neutral-500">{hint}</p>

      {preview ? (
        <div className="relative rounded-2xl overflow-hidden border border-emerald-500/40 aspect-video bg-neutral-900">
          <img src={preview} alt="preview" className="w-full h-full object-cover" />
          <button
            onClick={onClear}
            className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white rounded-full p-1.5 transition-colors"
          >
            <X size={14} />
          </button>
          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-emerald-400 border border-emerald-500/30">
            {file?.name}
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-neutral-700 hover:border-emerald-500/60 rounded-2xl aspect-video flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300 group bg-neutral-900/30 hover:bg-emerald-500/5"
        >
          <div className="w-12 h-12 bg-neutral-800 group-hover:bg-emerald-500/10 rounded-2xl flex items-center justify-center transition-colors">
            <ImagePlus size={22} className="text-neutral-600 group-hover:text-emerald-400 transition-colors" />
          </div>
          <div className="text-center">
            <p className="text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors">
              Arrastrá o <span className="text-emerald-400 font-semibold">hacé click</span> para subir
            </p>
            <p className="text-xs text-neutral-600 mt-1">JPG, PNG, WEBP — máx 10 MB</p>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
    </div>
  );
}

// ─── main page ─────────────────────────────────────────────────────────────────

export default function SimuladorPage() {
  // body photo
  const [bodyFile, setBodyFile] = useState<File | null>(null);
  const [bodyPreview, setBodyPreview] = useState<string | null>(null);

  // design photo (optional)
  const [designFile, setDesignFile] = useState<File | null>(null);
  const [designPreview, setDesignPreview] = useState<string | null>(null);

  // description
  const [description, setDescription] = useState('');

  // result
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── handlers ────────────────────────────────────────────────────────────────

  function handleBodyFile(f: File) {
    setBodyFile(f);
    setBodyPreview(URL.createObjectURL(f));
  }
  function clearBody() {
    setBodyFile(null);
    setBodyPreview(null);
  }

  function handleDesignFile(f: File) {
    setDesignFile(f);
    setDesignPreview(URL.createObjectURL(f));
  }
  function clearDesign() {
    setDesignFile(null);
    setDesignPreview(null);
  }

  // ── simulate ────────────────────────────────────────────────────────────────

  async function handleSimulate() {
    if (!bodyFile) {
      setError('Por favor subí una foto de la zona del cuerpo.');
      return;
    }
    if (!description.trim()) {
      setError('Por favor describí el tatuaje que querés.');
      return;
    }

    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const zonaBase64 = await fileToBase64(bodyFile);
      const zonaType = bodyFile.type;

      let disenoBase64: string | undefined;
      let disenoType: string | undefined;
      if (designFile) {
        disenoBase64 = await fileToBase64(designFile);
        disenoType = designFile.type;
      }

      const res = await fetch('/api/simulate-tattoo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, zonaBase64, zonaType, disenoBase64, disenoType }),
      });

      const data = await res.json();

      if (data.error) {
        throw new Error(typeof data.error === 'string' ? data.error : data.error.message || 'Error al contactar la IA');
      }

      const text = data.text;
      if (!text) throw new Error('La IA no devolvió texto. Revisá que GEMINI_API_KEY esté configurada.');

      setResult(text);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  }

  // ─── render ─────────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      {/* ── Hero header ── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-neutral-950 to-neutral-950" />
        <div className="relative max-w-4xl mx-auto px-6 pt-16 pb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-4 py-2 rounded-full mb-6">
            <Wand2 size={14} />
            Powered by IA
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tighter mb-4">
            Simulador de{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
              Tatuajes IA
            </span>
          </h1>
          <p className="text-neutral-400 text-lg max-w-xl mx-auto">
            Subí una foto de la zona, describí tu idea y nuestra IA te dirá cómo quedaría el tatuaje en tu cuerpo.
          </p>
        </div>
      </div>

      {/* ── Form + Result ── */}
      <div className="max-w-4xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* LEFT — inputs */}
          <div className="space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-6">

              <ImageDropZone
                label="Foto de la zona del cuerpo"
                hint="Subí una foto clara del área donde querés el tatuaje (brazo, espalda, pecho, etc.)"
                file={bodyFile}
                preview={bodyPreview}
                onFile={handleBodyFile}
                onClear={clearBody}
                required
              />

              <div className="border-t border-neutral-800" />

              <ImageDropZone
                label="Diseño de referencia"
                hint="Opcional — subí una imagen del tatuaje o estilo que te inspiró"
                file={designFile}
                preview={designPreview}
                onFile={handleDesignFile}
                onClear={clearDesign}
              />

              <div className="border-t border-neutral-800" />

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-300 flex items-center gap-1.5">
                  Describí tu tatuaje <span className="text-emerald-500">*</span>
                </label>
                <p className="text-xs text-neutral-500">
                  Estilo, colores, elementos, tamaño estimado, significado… cuanto más detallés, mejor.
                </p>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ej: Un lobo aullando a la luna en estilo blackwork, mediano, con detalles geométricos en el fondo..."
                  rows={4}
                  className="w-full bg-neutral-800/50 border border-neutral-700 hover:border-neutral-600 focus:border-emerald-500/60 rounded-2xl px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none resize-none transition-colors"
                />
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-2xl"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* CTA */}
              <button
                onClick={handleSimulate}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-emerald-500/25 active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Analizando con IA…
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Simular tatuaje
                    <ChevronRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT — result */}
          <div className="lg:sticky lg:top-24 h-fit">
            <AnimatePresence mode="wait">
              {loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 flex flex-col items-center justify-center gap-4 min-h-[400px]"
                >
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                    <Wand2 size={20} className="absolute inset-0 m-auto text-emerald-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-white font-semibold">Analizando tu tatuaje…</p>
                    <p className="text-neutral-500 text-sm mt-1">La IA está evaluando la zona y el diseño</p>
                  </div>
                </motion.div>
              )}

              {result && !loading && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-neutral-900 border border-emerald-500/30 rounded-3xl overflow-hidden"
                >
                  {/* header */}
                  <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-6 py-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                      <Sparkles size={15} className="text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-emerald-400">Análisis de la IA</p>
                      <p className="text-xs text-neutral-500">Basado en tu foto y descripción</p>
                    </div>
                  </div>

                  {/* content — render markdown-ish via simple formatting */}
                  <div className="p-6 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-track-neutral-900 scrollbar-thumb-neutral-700">
                    <ResultText text={result} />
                  </div>

                  {/* footer */}
                  <div className="border-t border-neutral-800 px-6 py-4">
                    <p className="text-xs text-neutral-600 text-center">
                      Este análisis es orientativo. Consultá siempre con tu tatuador antes de tatuar.
                    </p>
                  </div>
                </motion.div>
              )}

              {!result && !loading && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-neutral-900/50 border border-neutral-800 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center gap-4 min-h-[400px] text-center"
                >
                  <div className="w-16 h-16 bg-neutral-800 rounded-2xl flex items-center justify-center">
                    <Upload size={24} className="text-neutral-600" />
                  </div>
                  <div>
                    <p className="text-neutral-400 font-medium">El análisis aparecerá aquí</p>
                    <p className="text-neutral-600 text-sm mt-1">
                      Completá el formulario y hacé click en "Simular tatuaje"
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}

// ─── Result renderer ──────────────────────────────────────────────────────────
// Converts Gemini's markdown-ish response into styled JSX

function ResultText({ text }: { text: string }) {
  const lines = text.split('\n');

  return (
    <div className="space-y-3 text-sm leading-relaxed">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;

        // **bold** headings
        if (line.startsWith('**') && line.endsWith('**')) {
          return (
            <h3 key={i} className="text-emerald-400 font-bold text-base pt-2">
              {line.replace(/\*\*/g, '')}
            </h3>
          );
        }

        // numbered list items or bullets
        if (/^(\d+\.|-)/.test(line.trim())) {
          return (
            <p key={i} className="text-neutral-300 pl-4 border-l-2 border-emerald-500/30">
              {formatInline(line.replace(/^(\d+\.|-)/, '').trim())}
            </p>
          );
        }

        return (
          <p key={i} className="text-neutral-300">
            {formatInline(line)}
          </p>
        );
      })}
    </div>
  );
}

function formatInline(text: string) {
  // Replace **bold** with <strong>
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <strong key={i} className="text-white font-semibold">
            {part.replace(/\*\*/g, '')}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}
