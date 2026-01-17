
export interface Photo {
  id: string;
  name: string;
  url: string;
  folderId: string | null;
  createdAt: number;
  size: number;
  mimeType: string;
  isFavorite?: boolean;
  source?: 'local' | 'google_photos' | 'google_drive';
}

export interface Folder {
  id: string;
  name: string;
  createdAt: number;
  photoCount: number;
  shareId?: string;
  isFavorite?: boolean;
}

export type ViewState = 'all' | 'folder' | 'shared' | 'settings' | 'favorites' | 'folders' | 'google_sync';

export interface AppState {
  photos: Photo[];
  folders: Folder[];
  currentFolderId: string | null;
  currentView: ViewState;
  sharedViewId: string | null;
  generalShareId?: string;
  googleConnected: boolean;
  googleUser?: {
    name: string;
    email: string;
    avatar: string;
  };
}
