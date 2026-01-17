
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Photo, Folder, AppState, ViewState } from './types';
import { PhotoPlaceholderIcon, FolderIcon, UploadIcon, QRIcon, HeartIcon, EditIcon, TrashIcon, SearchIcon, DownloadIcon, GoogleIcon, SyncIcon } from './components/Icons';
import PhotoCard from './components/PhotoCard';
import ShareModal from './components/ShareModal';
import { initGoogleAuth, signInWithGoogle, fetchGooglePhotos, fetchGoogleDriveImages } from './src/services/googleAuth';

interface SyncTask {
  id: string;
  progress: number;
  status: 'pending' | 'syncing' | 'done';
}

interface SharingTarget {
  id: string | null;
  shareId: string;
  name: string;
}

const generateShareId = () => {
  return Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
};

const App: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const mainGridRef = useRef<HTMLDivElement>(null);

  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('aj_vault_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.currentView) parsed.currentView = 'all';
        return parsed;
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    }
    return {
      photos: Array.from({ length: 40 }).map((_, i) => ({
        id: `p-${i}`,
        name: `Shot_${i + 1}.jpg`,
        url: `https://picsum.photos/seed/${i + 101}/600/600`,
        folderId: null,
        createdAt: Date.now() - (i * 3600000),
        size: Math.floor(Math.random() * 8000000) + 1000000,
        mimeType: 'image/jpeg',
        isFavorite: i % 10 === 0,
        source: 'local'
      })),
      folders: [
        { id: 'f1', name: 'Summer Vibes 2024', createdAt: Date.now() - 86400000 * 5, photoCount: 0, isFavorite: true },
        { id: 'f2', name: 'Family Archive', createdAt: Date.now() - 86400000 * 12, photoCount: 0 },
      ],
      currentFolderId: null,
      currentView: 'all',
      sharedViewId: null,
      googleConnected: false
    };
  });

  const [sharingTarget, setSharingTarget] = useState<SharingTarget | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [syncTask, setSyncTask] = useState<SyncTask | null>(null);
  const [folderSearchQuery, setFolderSearchQuery] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);

  const shareUrl = useMemo(() => {
    if (!sharingTarget) return '';
    return `${window.location.origin}/share/${sharingTarget.shareId}`;
  }, [sharingTarget]);

  useEffect(() => {
    localStorage.setItem('aj_vault_state', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    initGoogleAuth().catch(console.error);
  }, []);

  const handleGoogleConnect = async () => {
    setIsConnectingGoogle(true);
    try {
      const googleUser = await signInWithGoogle();
      setState(prev => ({
        ...prev,
        googleConnected: true,
        googleUser: {
          name: googleUser.name,
          email: googleUser.email,
          avatar: googleUser.picture
        }
      }));
      await startGoogleSync();
    } catch (error) {
      console.error('Google sign-in failed:', error);
      // Fallback to demo mode
      const userEmail = prompt("Demo mode: Enter email:", "user@gmail.com");
      if (userEmail) {
        setState(prev => ({
          ...prev,
          googleConnected: true,
          googleUser: {
            name: userEmail.split('@')[0].toUpperCase(),
            email: userEmail,
            avatar: `https://ui-avatars.com/api/?name=${userEmail}&background=10a37f&color=fff`
          }
        }));
        startSync();
      }
    } finally {
      setIsConnectingGoogle(false);
    }
  };

  const startGoogleSync = async () => {
    setSyncTask({ id: 'google-sync', progress: 0, status: 'syncing' });
    
    try {
      // Fetch from Google Photos
      const googlePhotosData = await fetchGooglePhotos(25);
      const googlePhotos: Photo[] = googlePhotosData.map(gp => ({
        id: `gphoto-${gp.id}`,
        name: gp.filename,
        url: `${gp.baseUrl}=w800-h800`,
        folderId: null,
        createdAt: new Date(gp.mediaMetadata.creationTime).getTime(),
        size: parseInt(gp.mediaMetadata.width) * parseInt(gp.mediaMetadata.height) * 3,
        mimeType: gp.mimeType,
        source: 'google_photos'
      }));

      setSyncTask(prev => prev ? { ...prev, progress: 50 } : null);

      // Fetch from Google Drive
      const googleDriveData = await fetchGoogleDriveImages(25);
      const drivePhotos: Photo[] = googleDriveData.map(gd => ({
        id: `gdrive-${gd.id}`,
        name: gd.name,
        url: gd.thumbnailLink || gd.webContentLink || '',
        folderId: null,
        createdAt: new Date(gd.createdTime).getTime(),
        size: parseInt(gd.size),
        mimeType: gd.mimeType,
        source: 'google_drive'
      }));

      setSyncTask(prev => prev ? { ...prev, progress: 100, status: 'done' } : null);
      
      setState(prev => ({ 
        ...prev, 
        photos: [...googlePhotos, ...drivePhotos, ...prev.photos] 
      }));

      setTimeout(() => setSyncTask(null), 3000);
    } catch (error) {
      console.error('Sync failed, using demo data:', error);
      // Fallback to demo sync
      startSync();
    }
  };

  const startSync = () => {
    setSyncTask({ id: 'google-sync', progress: 0, status: 'syncing' });
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        const googlePhotos: Photo[] = Array.from({ length: 25 }).map((_, i) => ({
          id: `gp-${Date.now()}-${i}`,
          name: `Cloud_Asset_${i + 1}.png`,
          url: `https://picsum.photos/seed/google-${i + 500}/800/800`,
          folderId: null,
          createdAt: Date.now() - (i * 1000000),
          size: Math.floor(Math.random() * 5000000) + 500000,
          mimeType: 'image/png',
          source: Math.random() > 0.5 ? 'google_photos' : 'google_drive'
        }));
        setState(prev => ({ ...prev, photos: [...googlePhotos, ...prev.photos] }));
        setSyncTask({ id: 'google-sync', progress: 100, status: 'done' });
        setTimeout(() => setSyncTask(null), 3000);
      } else {
        setSyncTask(prev => prev ? { ...prev, progress: currentProgress } : null);
      }
    }, 400);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const filteredFoldersList = useMemo(() => {
    const folders = [...state.folders];
    const query = folderSearchQuery.toLowerCase().trim();
    const filtered = query ? folders.filter(f => f.name.toLowerCase().includes(query)) : folders;
    return filtered.sort((a, b) => (a.isFavorite === b.isFavorite ? b.createdAt - a.createdAt : a.isFavorite ? -1 : 1));
  }, [state.folders, folderSearchQuery]);

  const currentFolder = useMemo(() => state.folders.find(f => f.id === state.currentFolderId), [state.folders, state.currentFolderId]);

  const filteredPhotos = useMemo(() => {
    if (state.currentView === 'all') return state.photos;
    if (state.currentView === 'favorites') return state.photos.filter(p => p.isFavorite);
    if (state.currentView === 'folder') return state.photos.filter(p => p.folderId === state.currentFolderId);
    if (state.currentView === 'google_sync') return state.photos.filter(p => p.source && p.source !== 'local');
    return state.photos;
  }, [state.photos, state.currentView, state.currentFolderId]);

  // Increased previews to 15 for a more lush carousel
  const previews = useMemo(() => filteredPhotos.slice(0, 15), [filteredPhotos]);
  
  const folderStats = useMemo(() => ({
    count: filteredPhotos.length,
    size: filteredPhotos.reduce((acc, p) => acc + p.size, 0)
  }), [filteredPhotos]);

  const togglePhotoFavorite = (photoId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setState(prev => ({
      ...prev,
      photos: prev.photos.map(p => p.id === photoId ? { ...p, isFavorite: !p.isFavorite } : p)
    }));
  };

  const setView = (view: ViewState, folderId: string | null = null) => {
    setState(prev => ({ ...prev, currentView: view, currentFolderId: folderId }));
  };

  const handleShare = (folderId: string | null, name: string) => {
    let finalShareId = '';
    if (folderId) {
      const folder = state.folders.find(f => f.id === folderId);
      finalShareId = folder?.shareId || generateShareId();
      if (!folder?.shareId) setState(prev => ({ ...prev, folders: prev.folders.map(f => f.id === folderId ? { ...f, shareId: finalShareId } : f) }));
    } else {
      finalShareId = state.generalShareId || generateShareId();
      if (!state.generalShareId) setState(prev => ({ ...prev, generalShareId: finalShareId }));
    }
    setSharingTarget({ id: folderId, shareId: finalShareId, name });
  };

  const scrollToGrid = () => {
    mainGridRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const renderContent = () => {
    if (state.currentView === 'folders') {
      return (
        <div className="animate-slide-up">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-white tracking-tight">Your Vaults</h2>
            <button onClick={() => {}} className="bg-[#10a37f] text-white p-3 rounded-2xl shadow-lg hover:scale-105 transition-transform"><span className="text-xl font-black">+</span></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredFoldersList.map(folder => (
              <div key={folder.id} onClick={() => setView('folder', folder.id)} className="bg-[#1a1a1a] p-6 rounded-[2.5rem] border border-[#2a2a2a] hover:border-[#10a37f]/50 cursor-pointer transition-all group">
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 bg-[#171717] rounded-2xl flex items-center justify-center text-[#10a37f] group-hover:bg-[#10a37f] group-hover:text-white transition-colors mb-4"><FolderIcon className="w-8 h-8" /></div>
                  {folder.isFavorite && <HeartIcon className="w-5 h-5 text-[#10a37f]" filled />}
                </div>
                <h3 className="text-lg font-black text-white mb-1">{folder.name}</h3>
                <p className="text-[10px] font-bold text-[#8e8e8e] uppercase tracking-widest">{state.photos.filter(p => p.folderId === folder.id).length} Elements</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <>
        {previews.length > 0 && (
          <section className="mb-14 animate-slide-up relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex flex-col">
                <h4 className="text-[10px] font-black text-[#10a37f] uppercase tracking-[0.25em]">Vault Preview</h4>
                <p className="text-lg font-black text-white tracking-tight">Recent Additions</p>
              </div>
              <div className="flex items-center gap-4 ml-8 flex-1">
                <div className="h-px flex-1 bg-[#1a1a1a] opacity-40" />
                <button 
                  onClick={scrollToGrid}
                  className="text-[10px] font-black text-[#10a37f] uppercase tracking-widest hover:underline whitespace-nowrap bg-[#10a37f]/10 px-4 py-2 rounded-full border border-[#10a37f]/20 transition-all hover:bg-[#10a37f]/20"
                >
                  View All Elements →
                </button>
              </div>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar -mx-2 px-2 snap-x snap-mandatory">
              {previews.map((photo, index) => (
                <div 
                  key={`preview-${photo.id}`} 
                  onClick={() => setSelectedPhoto(photo)} 
                  className={`flex-shrink-0 rounded-[2.5rem] overflow-hidden cursor-pointer border border-[#2a2a2a] hover:border-[#10a37f]/50 transition-all duration-500 group snap-start shadow-2xl relative bg-[#1a1a1a]
                    ${index % 3 === 0 ? 'w-48 h-64 md:w-56 md:h-72' : 'w-40 h-40 md:w-48 md:h-48'}
                    ${index % 3 === 1 ? 'mt-4' : ''}
                    ${index % 3 === 2 ? 'mb-4 self-end' : ''}
                  `}
                >
                  <img src={photo.url} alt="" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                  <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => togglePhotoFavorite(photo.id, e)} className={`p-2 rounded-full backdrop-blur-md border ${photo.isFavorite ? 'bg-[#10a37f]/20 border-[#10a37f]/40 text-[#10a37f]' : 'bg-black/20 border-white/10 text-white'}`}>
                      <HeartIcon className="w-4 h-4" filled={photo.isFavorite} />
                    </button>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[10px] font-bold text-white uppercase tracking-widest truncate">{photo.name}</p>
                  </div>
                </div>
              ))}
              
              {/* Extra "View All" card at the end of carousel */}
              <div 
                onClick={scrollToGrid}
                className="flex-shrink-0 w-40 h-40 md:w-48 md:h-48 rounded-[2.5rem] bg-[#1a1a1a] border border-[#2a2a2a] border-dashed flex flex-col items-center justify-center gap-2 hover:border-[#10a37f]/50 hover:bg-[#1a1a1a]/50 transition-all cursor-pointer text-[#8e8e8e] hover:text-[#10a37f] snap-start"
              >
                <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <SearchIcon className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Show All</span>
              </div>
            </div>
          </section>
        )}

        <div ref={mainGridRef} className="flex items-center gap-3 mb-6 scroll-mt-24">
           <div className="flex flex-col">
              <h4 className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.25em]">Storage</h4>
              <p className="text-lg font-black text-white tracking-tight">
                {state.currentView === 'favorites' ? 'Favorite Elements' : state.currentView === 'google_sync' ? 'Google Sync Library' : 'All Elements'}
              </p>
           </div>
           <div className="h-px flex-1 bg-[#1a1a1a] ml-4 opacity-40" />
        </div>
        
        <div className="photo-grid animate-slide-up">
          {filteredPhotos.map(photo => (
            <PhotoCard key={photo.id} photo={photo} onClick={setSelectedPhoto} onToggleFavorite={togglePhotoFavorite} />
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="flex h-screen bg-[#171717] text-[#ececec] overflow-hidden font-sans selection:bg-[#10a37f]/30">
      
      {syncTask && (
        <div className="fixed bottom-10 right-10 z-[100] bg-[#1a1a1a] border border-[#2a2a2a] p-5 rounded-3xl shadow-2xl flex items-center gap-5 min-w-[300px] animate-slide-up">
          <div className="w-12 h-12 bg-[#10a37f]/10 rounded-2xl flex items-center justify-center text-[#10a37f] animate-pulse">
            <SyncIcon className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Google Syncing...</span>
              <span className="text-[10px] font-black text-[#10a37f]">{Math.round(syncTask.progress)}%</span>
            </div>
            <div className="w-full bg-[#1a1a1a] h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#10a37f] h-full transition-all duration-300" style={{ width: `${syncTask.progress}%` }} />
            </div>
          </div>
        </div>
      )}

      <aside className="hidden lg:flex w-80 flex-col border-r border-neutral-900 bg-[#171717] z-30">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3 mb-8 group cursor-pointer" onClick={() => setView('all')}>
            <div className="w-11 h-11 bg-gradient-to-br from-[#10a37f] to-[#0d8c6f] rounded-2xl flex items-center justify-center shadow-[0_8px_20px_rgba(248,113,113,0.3)] group-hover:rotate-6 transition-all duration-500">
              <span className="text-white font-black text-lg tracking-tighter">AJ</span>
            </div>
            <div><h1 className="text-xl font-black text-white tracking-widest uppercase">AJ VAULT</h1><p className="text-[9px] font-black text-[#10a37f] uppercase tracking-[0.3em] -mt-1 opacity-80">Premium Cloud</p></div>
          </div>
          
          <nav className="space-y-2">
            <button onClick={() => setView('all')} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${state.currentView === 'all' ? 'bg-[#10a37f] text-white shadow-lg' : 'text-[#8e8e8e] hover:bg-[#1a1a1a]'}`}><PhotoPlaceholderIcon className="w-5 h-5" /><span className="font-bold text-sm">All Library</span></button>
            <button onClick={() => setView('favorites')} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${state.currentView === 'favorites' ? 'bg-[#10a37f] text-white shadow-lg' : 'text-[#8e8e8e] hover:bg-[#1a1a1a]'}`}><HeartIcon className="w-5 h-5" /><span className="font-bold text-sm">Favorites</span></button>
            <button onClick={() => setView('google_sync')} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${state.currentView === 'google_sync' ? 'bg-[#10a37f] text-white shadow-lg' : 'text-[#8e8e8e] hover:bg-[#1a1a1a]'}`}><GoogleIcon className="w-5 h-5" /><span className="font-bold text-sm">Cloud Library</span></button>
          </nav>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-2 no-scrollbar">
          <div className="mb-8">
            <h3 className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.25em] px-2 mb-4">Linked Accounts</h3>
            <div className={`p-4 rounded-3xl border transition-all ${state.googleConnected ? 'bg-[#10a37f]/5 border-[#10a37f]/20' : 'bg-[#1a1a1a]/50 border-[#2a2a2a]'}`}>
              {!state.googleConnected ? (
                <button onClick={handleGoogleConnect} disabled={isConnectingGoogle} className="w-full flex items-center gap-3 text-[#8e8e8e] hover:text-white transition-colors group">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-white transition-all"><GoogleIcon className="w-5 h-5" /></div>
                  <div className="flex flex-col items-start">
                    <span className="text-[11px] font-black uppercase tracking-tight">Connect Gmail</span>
                    <span className="text-[9px] font-bold text-neutral-700">Import Photos & Drive</span>
                  </div>
                </button>
              ) : (
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <img src={state.googleUser?.avatar} className="w-10 h-10 rounded-xl border border-white/10" alt="" />
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black uppercase tracking-tight text-white">{state.googleUser?.name}</span>
                        <span className="text-[9px] font-bold text-[#10a37f]">Google Active</span>
                      </div>
                   </div>
                   <button onClick={startSync} className="text-[#8e8e8e] hover:text-[#10a37f] transition-all"><SyncIcon className="w-4 h-4" /></button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.25em]">Collections</h3>
          </div>
          <div className="space-y-1.5">
            {filteredFoldersList.map(folder => (
              <button key={folder.id} onClick={() => setView('folder', folder.id)} className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 text-left ${state.currentFolderId === folder.id ? 'bg-[#10a37f] text-white shadow-lg' : 'text-[#8e8e8e] hover:bg-[#1a1a1a] hover:text-[#ececec]'}`}>
                <div className="flex items-center gap-3 truncate"><FolderIcon className="w-5 h-5 flex-shrink-0" /><span className="font-bold text-sm truncate">{folder.name}</span></div>
                {folder.isFavorite && <HeartIcon className="w-3.5 h-3.5" filled />}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-neutral-900">
          <div className="bg-[#141414] rounded-3xl p-5 border border-[#2a2a2a] shadow-inner">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-[#8e8e8e] mb-3"><span>Vault Space</span><span className="text-[#10a37f]">Secure</span></div>
            <div className="w-full bg-[#1a1a1a] h-2 rounded-full overflow-hidden mb-3"><div className="bg-gradient-to-r from-[#10a37f] to-[#0d8c6f] h-full w-[28%] rounded-full shadow-[0_0_10px_#10a37f]" /></div>
            <div className="flex justify-between items-center"><span className="text-[11px] font-bold text-neutral-400">4.2 GB / 15 GB</span><button className="text-[10px] font-black text-[#10a37f] hover:underline uppercase tracking-tighter">Upgrade</button></div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative bg-[#171717] overflow-hidden">
        <header className="h-24 flex items-center justify-between px-6 md:px-10 glass border-b border-neutral-900/50 z-40">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-white tracking-tight">
                {state.currentView === 'all' ? 'Main Vault' : state.currentView === 'favorites' ? 'Favorites' : state.currentView === 'google_sync' ? 'Connected Assets' : currentFolder?.name || 'Vault'}
              </h2>
              {state.googleConnected && <div className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center gap-1.5"><GoogleIcon className="w-2.5 h-2.5" /><span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Active Sync</span></div>}
            </div>
            <div className="flex items-center gap-2.5 text-[12px] font-bold text-[#8e8e8e] mt-1 uppercase tracking-tighter">
              <span>{folderStats.count} Elements</span><span className="w-1 h-1 bg-neutral-700 rounded-full" /><span>{formatSize(folderStats.size)}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer bg-[#10a37f] hover:bg-[#0d8c6f] text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-[#10a37f]/20 border border-white/10 uppercase tracking-tighter"><UploadIcon className="w-4 h-4" /><span className="hidden sm:inline">Add Shots</span><input type="file" multiple className="hidden" onChange={() => {}} accept="image/*" /></label>
            <button onClick={() => handleShare(state.currentFolderId, currentFolder?.name || 'AJ VAULT')} className="bg-[#1a1a1a]/80 hover:bg-[#1a1a1a] text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 transition-all border border-neutral-700/50 uppercase tracking-tighter"><QRIcon className="w-4 h-4" /><span className="hidden sm:inline">Connect</span></button>
          </div>
        </header>

        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-6 md:px-10 py-8 custom-scrollbar relative">
          {renderContent()}
        </div>

        <div className="lg:hidden h-20 glass border-t border-neutral-900 flex items-center justify-around px-4 z-40">
           <button onClick={() => setView('all')} className={`flex flex-col items-center gap-1 ${state.currentView === 'all' ? 'text-[#10a37f]' : 'text-[#8e8e8e]'}`}><PhotoPlaceholderIcon className="w-6 h-6" /><span className="text-[9px] font-black uppercase tracking-widest">Vault</span></button>
           <button onClick={() => setView('google_sync')} className={`flex flex-col items-center gap-1 ${state.currentView === 'google_sync' ? 'text-[#10a37f]' : 'text-[#8e8e8e]'}`}><GoogleIcon className="w-6 h-6" /><span className="text-[9px] font-black uppercase tracking-widest">Cloud</span></button>
           <div className="w-12 h-12 bg-[#10a37f] rounded-full flex items-center justify-center -mt-10 shadow-xl border-4 border-[#0a0a0a]"><UploadIcon className="w-5 h-5 text-white" /></div>
           <button onClick={() => setView('favorites')} className={`flex flex-col items-center gap-1 ${state.currentView === 'favorites' ? 'text-[#10a37f]' : 'text-[#8e8e8e]'}`}><HeartIcon className="w-6 h-6" /><span className="text-[9px] font-black uppercase tracking-widest">Favs</span></button>
           <button onClick={() => handleShare(null, 'AJ VAULT')} className="flex flex-col items-center gap-1 text-[#8e8e8e]"><QRIcon className="w-6 h-6" /><span className="text-[9px] font-black uppercase tracking-widest">Share</span></button>
        </div>
      </main>

      {selectedPhoto && (
        <div className="fixed inset-0 z-[100] glass flex items-center justify-center p-6 animate-in fade-in duration-300" onClick={() => setSelectedPhoto(null)}>
          <div className="absolute top-10 right-10 flex items-center gap-4">
            <button onClick={(e) => { e.stopPropagation(); togglePhotoFavorite(selectedPhoto.id); }} className={`w-12 h-12 bg-[#1a1a1a]/80 rounded-2xl flex items-center justify-center transition-all border border-neutral-700 ${selectedPhoto.isFavorite ? 'text-[#10a37f]' : 'text-white'}`}><HeartIcon className="w-5 h-5" filled={selectedPhoto.isFavorite} /></button>
            <button className="w-12 h-12 bg-[#1a1a1a]/80 text-white rounded-2xl flex items-center justify-center transition-all border border-neutral-700"><DownloadIcon className="w-5 h-5" /></button>
            <button className="w-12 h-12 bg-[#1a1a1a]/80 text-neutral-400 rounded-2xl flex items-center justify-center transition-all border border-neutral-700"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <div className="max-w-4xl w-full max-h-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <img src={selectedPhoto.url} className="max-w-full max-h-[70vh] object-contain rounded-3xl shadow-2xl border border-[#2a2a2a]" />
            <div className="mt-8 bg-[#1a1a1a] p-8 rounded-[2.5rem] border border-[#2a2a2a] w-full max-w-2xl text-center shadow-2xl">
               <div className="flex items-center justify-center gap-3 mb-4">
                  <h3 className="text-2xl font-black text-white">{selectedPhoto.name}</h3>
                  {selectedPhoto.source && selectedPhoto.source !== 'local' && (
                    <div className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg flex items-center gap-1.5"><GoogleIcon className="w-2.5 h-2.5" /><span className="text-[8px] font-black text-white/50 uppercase tracking-widest">{selectedPhoto.source}</span></div>
                  )}
               </div>
               <div className="flex items-center justify-center gap-4 text-xs font-bold text-[#8e8e8e] uppercase tracking-widest">
                  <span>{new Date(selectedPhoto.createdAt).toLocaleDateString()}</span>
                  <span className="w-1.5 h-1.5 bg-[#1a1a1a] rounded-full" />
                  <span>{formatSize(selectedPhoto.size)}</span>
               </div>
               <button className="mt-6 w-full py-4 bg-[#10a37f] text-white font-black rounded-2xl border border-white/5 transition-all uppercase tracking-widest text-[10px]">Download Asset</button>
            </div>
          </div>
        </div>
      )}

      <ShareModal isOpen={!!sharingTarget} onClose={() => setSharingTarget(null)} title={sharingTarget?.name || 'AJ VAULT'} shareUrl={shareUrl} />
    </div>
  );
};

export default App;

