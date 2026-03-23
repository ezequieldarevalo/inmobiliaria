"use client";

import { useState, useRef, useCallback } from "react";
import {
  GripVertical, Trash2, Star, Plus, Image as ImageIcon,
  ArrowUp, ArrowDown, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface PhotoManagerProps {
  images: string[];
  coverIndex: number;
  onChange: (images: string[], coverIndex: number) => void;
  readonly?: boolean;
}

const PHOTO_CATEGORIES = [
  "Portada", "Living", "Cocina", "Dormitorio", "Baño",
  "Balcón", "Exterior", "Garage", "Jardín", "Otro",
];

export function PhotoManager({ images, coverIndex, onChange, readonly = false }: PhotoManagerProps) {
  const [newUrl, setNewUrl] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  const addImage = () => {
    const url = newUrl.trim();
    if (!url) return;
    try {
      new URL(url);
    } catch {
      return;
    }
    onChange([...images, url], coverIndex);
    setNewUrl("");
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    let newCover = coverIndex;
    if (index === coverIndex) newCover = 0;
    else if (index < coverIndex) newCover = coverIndex - 1;
    onChange(newImages, Math.min(newCover, Math.max(0, newImages.length - 1)));
  };

  const setCover = (index: number) => {
    onChange(images, index);
  };

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const newImages = [...images];
    const [moved] = newImages.splice(from, 1);
    newImages.splice(to, 0, moved);
    let newCover = coverIndex;
    if (from === coverIndex) newCover = to;
    else if (from < coverIndex && to >= coverIndex) newCover = coverIndex - 1;
    else if (from > coverIndex && to <= coverIndex) newCover = coverIndex + 1;
    onChange(newImages, newCover);
  };

  const handleDragStart = (index: number) => {
    if (readonly) return;
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (index: number) => {
    if (dragIndex !== null && dragIndex !== index) {
      moveImage(dragIndex, index);
    }
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-4">
      {/* Header with count */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
          <ImageIcon size={16} className="text-emerald-400" />
          Fotos ({images.length})
        </h3>
        {images.length > 0 && !readonly && (
          <p className="text-[10px] text-gray-600">Arrastrá para reordenar · ★ = portada</p>
        )}
      </div>

      {/* Grid of photos */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {images.map((img, i) => (
            <div
              key={`${img}-${i}`}
              draggable={!readonly}
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDrop={() => handleDrop(i)}
              onDragEnd={handleDragEnd}
              className={`relative group rounded-xl overflow-hidden border-2 transition-all cursor-pointer aspect-[4/3] ${
                dragOverIndex === i ? "border-emerald-400 scale-105" :
                i === coverIndex ? "border-emerald-500 ring-2 ring-emerald-500/20" :
                dragIndex === i ? "border-gray-600 opacity-50" :
                "border-gray-800 hover:border-gray-600"
              }`}
              onClick={() => setPreviewImg(img)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt={`Foto ${i + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150' fill='%23374151'%3E%3Crect width='200' height='150'/%3E%3Ctext x='50%25' y='50%25' fill='%236b7280' text-anchor='middle' dy='.3em' font-size='14'%3EError%3C/text%3E%3C/svg%3E"; }}
              />

              {/* Cover badge */}
              {i === coverIndex && (
                <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Star size={10} className="fill-white" /> PORTADA
                </div>
              )}

              {/* Index badge */}
              <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                {i + 1}
              </div>

              {/* Category suggestion */}
              {i < PHOTO_CATEGORIES.length && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5">
                  <span className="text-[10px] text-gray-300">{PHOTO_CATEGORIES[Math.min(i, PHOTO_CATEGORIES.length - 1)]}</span>
                </div>
              )}

              {/* Hover actions */}
              {!readonly && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setCover(i)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      i === coverIndex ? "bg-emerald-600 text-white" : "bg-gray-800/80 text-gray-300 hover:bg-emerald-600 hover:text-white"
                    }`}
                    title="Portada"
                  >
                    <Star size={14} className={i === coverIndex ? "fill-white" : ""} />
                  </button>
                  <button
                    onClick={() => moveImage(i, i - 1)}
                    disabled={i === 0}
                    className="p-1.5 rounded-lg bg-gray-800/80 text-gray-300 hover:bg-gray-700 disabled:opacity-30 transition-colors"
                    title="Mover arriba"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    onClick={() => moveImage(i, i + 1)}
                    disabled={i === images.length - 1}
                    className="p-1.5 rounded-lg bg-gray-800/80 text-gray-300 hover:bg-gray-700 disabled:opacity-30 transition-colors"
                    title="Mover abajo"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    onClick={() => removeImage(i)}
                    className="p-1.5 rounded-lg bg-red-900/80 text-red-300 hover:bg-red-800 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={14} />
                  </button>
                  <div className="p-1.5 rounded-lg bg-gray-800/80 text-gray-400 cursor-grab">
                    <GripVertical size={14} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {images.length === 0 && (
        <div className="border-2 border-dashed border-gray-800 rounded-xl p-8 text-center">
          <ImageIcon size={40} className="text-gray-700 mx-auto mb-3" />
          <p className="text-sm text-gray-500 mb-1">Sin fotos cargadas</p>
          <p className="text-xs text-gray-600">Agregá URLs de imágenes para mostrar la propiedad</p>
        </div>
      )}

      {/* Add URL input */}
      {!readonly && (
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://ejemplo.com/foto.jpg"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addImage(); } }}
            className="flex-1 px-3 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Button onClick={addImage} disabled={!newUrl.trim()}>
            <Plus size={16} className="mr-1" /> Agregar
          </Button>
        </div>
      )}

      {/* Suggested order info */}
      {!readonly && images.length > 0 && images.length < 5 && (
        <div className="bg-emerald-600/5 border border-emerald-600/20 rounded-xl p-3">
          <p className="text-xs text-emerald-400 font-medium mb-1">📸 Orden sugerido para portales:</p>
          <p className="text-[11px] text-gray-500">1. Portada → 2. Living → 3. Cocina → 4. Dormitorios → 5. Baños → 6. Exterior</p>
        </div>
      )}

      {/* Preview modal */}
      {previewImg && (
        <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4" onClick={() => setPreviewImg(null)}>
          <button className="absolute top-4 right-4 text-white/70 hover:text-white" onClick={() => setPreviewImg(null)}>
            <X size={28} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewImg} alt="Preview" className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg" />
        </div>
      )}
    </div>
  );
}

/* Portal-style gallery preview */
export function PhotoGallery({ images, coverIndex = 0 }: { images: string[]; coverIndex?: number }) {
  const [activeIndex, setActiveIndex] = useState(coverIndex);
  const [previewOpen, setPreviewOpen] = useState(false);

  if (!images.length) return null;

  const orderedImages = [...images];
  if (coverIndex > 0 && coverIndex < orderedImages.length) {
    const [cover] = orderedImages.splice(coverIndex, 1);
    orderedImages.unshift(cover);
  }

  return (
    <>
      <div className="space-y-2">
        {/* Main image */}
        <div
          className="relative aspect-[16/9] rounded-xl overflow-hidden cursor-pointer bg-gray-900 border border-gray-800"
          onClick={() => setPreviewOpen(true)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={orderedImages[activeIndex] || orderedImages[0]}
            alt="Propiedad"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-lg">
            {activeIndex + 1} / {orderedImages.length}
          </div>
        </div>

        {/* Thumbnails */}
        {orderedImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {orderedImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                  i === activeIndex ? "border-emerald-500" : "border-gray-800 opacity-60 hover:opacity-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen gallery */}
      {previewOpen && (
        <div className="fixed inset-0 bg-black/95 z-[60] flex flex-col items-center justify-center" onClick={() => setPreviewOpen(false)}>
          <button className="absolute top-4 right-4 text-white/70 hover:text-white z-10" onClick={() => setPreviewOpen(false)}>
            <X size={28} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={orderedImages[activeIndex]} alt="" className="max-h-[80vh] max-w-[90vw] object-contain" />
          <div className="flex gap-2 mt-4 overflow-x-auto max-w-[90vw] pb-2" onClick={(e) => e.stopPropagation()}>
            {orderedImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                  i === activeIndex ? "border-emerald-500" : "border-gray-700 opacity-50 hover:opacity-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
