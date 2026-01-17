import { GOOGLE_CONFIG, GoogleUser, GooglePhoto, GoogleDriveFile } from '../config/google';

let tokenClient: any = null;
let accessToken: string = '';

export const initGoogleAuth = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!GOOGLE_CONFIG.clientId) {
      console.warn('Google Client ID not configured');
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      try {
        tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CONFIG.clientId,
          scope: GOOGLE_CONFIG.scopes,
          callback: (response: any) => {
            if (response.access_token) {
              accessToken = response.access_token;
            }
          },
        });
        resolve();
      } catch (error) {
        console.error('Error initializing Google Auth:', error);
        reject(error);
      }
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

export const signInWithGoogle = (): Promise<GoogleUser> => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error('Google Auth not initialized'));
      return;
    }

    tokenClient.callback = async (response: any) => {
      if (response.error) {
        reject(new Error(response.error));
        return;
      }

      accessToken = response.access_token;
      
      try {
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        }).then(res => res.json());

        const googleUser: GoogleUser = {
          id: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          accessToken: accessToken,
        };

        resolve(googleUser);
      } catch (error) {
        reject(error);
      }
    };

    tokenClient.requestAccessToken();
  });
};

export const fetchGooglePhotos = async (maxResults: number = 50): Promise<GooglePhoto[]> => {
  if (!accessToken) throw new Error('Not authenticated');

  try {
    const response = await fetch(
      `https://photoslibrary.googleapis.com/v1/mediaItems?pageSize=${maxResults}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const data = await response.json();
    return data.mediaItems || [];
  } catch (error) {
    console.error('Error fetching Google Photos:', error);
    return [];
  }
};

export const fetchGoogleDriveImages = async (maxResults: number = 50): Promise<GoogleDriveFile[]> => {
  if (!accessToken) throw new Error('Not authenticated');

  try {
    const query = encodeURIComponent(
      "mimeType contains 'image/' and trashed=false"
    );
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}&pageSize=${maxResults}&fields=files(id,name,mimeType,thumbnailLink,webContentLink,size,createdTime)`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const data = await response.json();
    return data.files || [];
  } catch (error) {
    console.error('Error fetching Google Drive images:', error);
    return [];
  }
};

export const signOutGoogle = () => {
  accessToken = '';
  if (window.google?.accounts?.oauth2) {
    window.google.accounts.oauth2.revoke(accessToken, () => {
      console.log('Token revoked');
    });
  }
};
