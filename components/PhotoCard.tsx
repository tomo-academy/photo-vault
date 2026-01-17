
import React, { useState } from 'react';
import { Photo } from '../types';
import { PhotoPlaceholderIcon, HeartIcon, GoogleIcon } from './Icons';

interface PhotoCardProps {
  photo: Photo;
  onClick: (photo: Photo) => void;
  onToggleFavorite?: (id: string, e?: React.MouseEvent) => void;
}

const PhotoCard: React.FC<PhotoCardProps> = ({ photo, onClick, onToggleFavorite }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div 
      onClick={() => onClick(photo)}
      className="group relative aspect-square bg-neutral-900 rounded-2xl overflow-hidden cursor-pointer ring-1 ring-neutral-800 hover:ring-2 hover:ring-[#f87171] transition-all duration-300 transform hover:-translate-y-1 active:scale-95 shadow-lg"
    >
      <div className="absolute inset-0 flex items-center justify-center text-neutral-800 transition-colors">
        <PhotoPlaceholderIcon className="w-10 h-10 opacity-20" />
      </div>
      
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-neutral-800 animate-pulse" />
      )}

      {/* Cloud Source Badge */}
      {photo.source && photo.source !== 'local' && (
        <div className="absolute top-3 left-3 z-10">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/10">
            <GoogleIcon className="w-3 h-3" />
            <span className="text-[8px] font-black text-white/70 uppercase tracking-tighter">
              {photo.source === 'google_photos' ? 'Photos' : 'Drive'}
            </span>
          </div>
        </div>
      )}

      <div className={`absolute top-3 right-3 z-10 transition-all duration-300 ${photo.isFavorite ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <button 
          onClick={(e) => onToggleFavorite?.(photo.id, e)}
          className={`p-2 rounded-xl backdrop-blur-md border shadow-lg transition-all active:scale-90 ${photo.isFavorite ? 'bg-[#f87171]/20 border-[#f87171]/40 text-[#f87171]' : 'bg-black/40 border-white/10 text-white hover:bg-[#f87171]'}`}
        >
          <HeartIcon className="w-4 h-4" filled={photo.isFavorite} />
        </button>
      </div>

      {!hasError && (
        <img 
          src={photo.url} 
          alt={photo.name}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${isLoaded ? 'opacity-80 group-hover:opacity-100 group-hover:scale-110' : 'opacity-0'}`}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      )}
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
        <p className="text-[10px] font-medium text-white truncate w-full">{photo.name}</p>
      </div>
    </div>
  );
};

export default PhotoCard;
