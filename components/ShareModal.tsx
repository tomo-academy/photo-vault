
import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  shareUrl: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, title, shareUrl }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Ensure title includes the app branding if it's the general library
  const displayTitle = title === 'AJ VAULT' || title === 'Entire Library' ? 'AJ VAULT' : title;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-500 overflow-hidden">
      <div className="max-w-sm w-full flex flex-col items-center relative z-10">
        
        {/* Header: Bold Styled Name from Reference */}
        <div className="flex items-center gap-4 mb-10 animate-slide-up select-none" style={{ animationDelay: '100ms' }}>
          <span className="text-4xl">❤️</span>
          <h3 className="text-3xl font-black text-white tracking-[0.1em] uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
            {displayTitle}
          </h3>
          <span className="text-4xl">❤️</span>
        </div>

        {/* QR Container: Premium squircle from reference */}
        <div className="relative animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="bg-white p-8 rounded-[3.5rem] shadow-[0_20px_80px_rgba(0,0,0,0.6)] relative overflow-hidden group">
            <div className="relative z-10">
              <QRCodeSVG 
                value={shareUrl} 
                size={220} 
                level="H" 
                includeMargin={false}
                imageSettings={{
                  // Centered AJ Branding icon with teal accent
                  src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2310a37f'%3E%3Crect width='24' height='24' rx='12' fill='%23000'/%3E%3Ctext x='12' y='16' font-family='Arial' font-weight='black' font-size='10' text-anchor='middle' fill='white'%3EAJ%3C/text%3E%3C/svg%3E",
                  height: 48,
                  width: 48,
                  excavate: true,
                }}
              />
            </div>
            
            {/* Finder pattern accents */}
            <div className="absolute top-6 left-6 w-5 h-5 border-t-4 border-l-4 border-black/10 rounded-tl-lg" />
            <div className="absolute top-6 right-6 w-5 h-5 border-t-4 border-r-4 border-black/10 rounded-tr-lg" />
            <div className="absolute bottom-6 left-6 w-5 h-5 border-b-4 border-l-4 border-black/10 rounded-bl-lg" />
            <div className="absolute bottom-6 right-6 w-5 h-5 border-b-4 border-r-4 border-black/10 rounded-br-lg" />
          </div>
        </div>

        {/* Caption */}
        <p className="text-neutral-500 text-sm font-bold mt-10 mb-12 animate-slide-up tracking-tight" style={{ animationDelay: '300ms' }}>
          Scan the QR code to add this contact.
        </p>

        {/* Actions */}
        <div className="w-full space-y-3 animate-slide-up" style={{ animationDelay: '400ms' }}>
          <div className={`text-center text-[10px] font-black text-[#10a37f] uppercase tracking-[0.3em] h-4 transition-opacity duration-300 ${copied ? 'opacity-100' : 'opacity-0'}`}>
            Link Copied!
          </div>
          
          <button 
            onClick={copyToClipboard}
            className={`w-full py-4.5 font-black rounded-2xl border transition-all flex items-center justify-center gap-3 active:scale-[0.97] uppercase tracking-widest text-xs
              ${copied 
                ? 'bg-green-500/10 border-green-500/50 text-green-400' 
                : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
              }`}
          >
            {copied ? 'Success' : 'Copy Invite Link'}
          </button>
          
          <button 
            onClick={onClose}
            className="w-full py-4 text-neutral-600 hover:text-white font-black transition-all uppercase tracking-[0.25em] text-[10px]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;