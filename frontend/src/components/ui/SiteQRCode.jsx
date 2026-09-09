import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import brandIcon from '../../assets/brand/icon.svg';

const BASE_DOMAIN = 'https://f2f-uzh-ddib-26.vercel.app';
export const SITE_URL = (typeof window !== 'undefined' && window.location?.origin && !window.location.origin.includes('localhost'))
  ? `${window.location.origin}/`
  : `${BASE_DOMAIN}/`;

export const APP_URL = (typeof window !== 'undefined' && window.location?.origin && !window.location.origin.includes('localhost'))
  ? `${window.location.origin}/app`
  : `${BASE_DOMAIN}/app`;

/**
 * A scannable QR code with the brand icon centered on top. Lets the
 * person pick which experience to scan into (web or the app shell)
 * rather than only ever pointing at the plain web homepage.
 *
 * Error correction is set to 'H' (~30% redundancy) specifically
 * because a logo sits on top of the code -- without high correction,
 * covering the center would make some scanners fail.
 */
export default function SiteQRCode({ size = 200, caption = 'Scan to open on your phone' }) {
  const canvasRef = useRef(null);
  const [error, setError] = useState(null);
  const [target, setTarget] = useState('web');
  const url = target === 'app' ? APP_URL : SITE_URL;

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    QRCode.toCanvas(canvas, url, {
      width: size,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: { dark: '#14161b', light: '#ffffff' },
    })
      .then(() => {
        const ctx = canvas.getContext('2d');
        const logo = new Image();
        logo.onload = () => {
          const logoSize = size * 0.22;
          const pad = 6;
          const cx = (canvas.width - logoSize) / 2;
          const cy = (canvas.height - logoSize) / 2;

          ctx.save();
          ctx.fillStyle = '#ffffff';
          const r = 10;
          const bx = cx - pad, by = cy - pad, bw = logoSize + pad * 2, bh = logoSize + pad * 2;
          ctx.beginPath();
          ctx.moveTo(bx + r, by);
          ctx.arcTo(bx + bw, by, bx + bw, by + bh, r);
          ctx.arcTo(bx + bw, by + bh, bx, by + bh, r);
          ctx.arcTo(bx, by + bh, bx, by, r);
          ctx.arcTo(bx, by, bx + bw, by, r);
          ctx.closePath();
          ctx.fill();
          ctx.restore();

          ctx.drawImage(logo, cx, cy, logoSize, logoSize);
        };
        logo.src = brandIcon;
      })
      .catch((e) => setError(e.message));
  }, [size, url]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-1 bg-surface-2 rounded-full p-1 border border-hairline">
        <button
          onClick={() => setTarget('web')}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${target === 'web' ? 'bg-brand-500 text-white' : 'text-ink-muted'}`}
        >
          Web
        </button>
        <button
          onClick={() => setTarget('app')}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${target === 'app' ? 'bg-brand-500 text-white' : 'text-ink-muted'}`}
        >
          App
        </button>
      </div>
      <div className="bg-white p-3 rounded-2xl glass">
        {error ? (
          <div className="text-xs text-danger-400 flex items-center justify-center text-center px-2" style={{ width: size, height: size }}>
            QR generation failed
          </div>
        ) : (
          <canvas ref={canvasRef} />
        )}
      </div>
      {caption && (
        <p className="text-xs text-ink-muted text-center max-w-[180px]">
          {target === 'app' ? 'Scan to open the app experience' : caption}
        </p>
      )}
    </div>
  );
}
