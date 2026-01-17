import React, { useEffect, useState } from 'react';
import { Photo, Folder } from '../../types';
import PhotoCard from '../../components/PhotoCard';
import { QRIcon } from '../../components/Icons';

interface SharedViewProps {
  shareId: string;
}

interface SharedData {
  type: 'folder' | 'library';
  name: string;
  photos: Photo[];
  isValid: boolean;
}

const SharedView: React.FC<SharedViewProps> = ({ shareId }) => {
  const [sharedData, setSharedData] = useState<SharedData | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load shared data from localStorage (in production, this would be an API call)
    const loadSharedData = () => {
      try {
        const savedState = localStorage.getItem('aj_vault_state');
        if (!savedState) {
          setSharedData({ type: 'library', name: 'Shared Content', photos: [], isValid: false });
          setLoading(false);
          return;
        }

        const state = JSON.parse(savedState);
        
        // Check if it's a folder share
        const folder = state.folders?.find((f: Folder) => f.shareId === shareId);
        if (folder) {
          const folderPhotos = state.photos.filter((p: Photo) => p.folderId === folder.id);
          setSharedData({
            type: 'folder',
            name: folder.name,
            photos: folderPhotos,
            isValid: true,
          });
          setLoading(false);
          return;
        }

        // Check if it's a general library share
        if (state.generalShareId === shareId) {
          setSharedData({
            type: 'library',
            name: 'AJ VAULT',
            photos: state.photos || [],
            isValid: true,
          });
          setLoading(false);
          return;
        }

        // Invalid share ID
        setSharedData({ type: 'library', name: 'Shared Content', photos: [], isValid: false });
        setLoading(false);
      } catch (error) {
        console.error('Error loading shared data:', error);
        setSharedData({ type: 'library', name: 'Shared Content', photos: [], isValid: false });
        setLoading(false);
      }
    };

    loadSharedData();
  }, [shareId]);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#10a37f] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#8e8e8e] font-medium">Loading shared content...</p>
        </div>
      </div>
    );
  }

  if (!sharedData?.isValid) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-[#1a1a1a] rounded-3xl flex items-center justify-center mx-auto mb-6">
            <QRIcon className="w-10 h-10 text-[#8e8e8e]" />
          </div>
          <h1 className="text-2xl font-bold text-[#ececec] mb-3">Invalid Share Link</h1>
          <p className="text-[#8e8e8e]">
            This share link is not valid or has expired. Please request a new link from the owner.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      {/* Header */}
      <header className="border-b border-[#2a2a2a] bg-[#171717] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-[#10a37f] to-[#0d8c6f] rounded-xl flex items-center justify-center">
                  <span className="text-white font-black text-sm">AJ</span>
                </div>
                <h1 className="text-2xl font-bold text-[#ececec]">{sharedData.name}</h1>
              </div>
              <p className="text-sm text-[#8e8e8e] font-medium">
                {sharedData.photos.length} photos · {formatSize(sharedData.photos.reduce((acc, p) => acc + p.size, 0))}
              </p>
            </div>
            <div className="px-4 py-2 bg-[#10a37f]/10 border border-[#10a37f]/20 rounded-xl">
              <span className="text-xs font-bold text-[#10a37f] uppercase tracking-wider">Shared View</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        {sharedData.photos.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#8e8e8e] text-lg">No photos in this {sharedData.type}</p>
          </div>
        ) : (
          <div className="photo-grid">
            {sharedData.photos.map(photo => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                onClick={setSelectedPhoto}
                onToggleFavorite={() => {}} // Disable favorite toggle in shared view
              />
            ))}
          </div>
        )}
      </main>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-6"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            <div className="relative">
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute -top-12 right-0 text-[#8e8e8e] hover:text-[#ececec] transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.name}
                className="w-full max-h-[80vh] object-contain rounded-3xl"
              />
              <div className="mt-6 bg-[#1a1a1a] p-6 rounded-3xl border border-[#2a2a2a]">
                <h3 className="text-xl font-bold text-[#ececec] mb-2">{selectedPhoto.name}</h3>
                <div className="flex items-center gap-4 text-sm text-[#8e8e8e]">
                  <span>{new Date(selectedPhoto.createdAt).toLocaleDateString()}</span>
                  <span>·</span>
                  <span>{formatSize(selectedPhoto.size)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharedView;
