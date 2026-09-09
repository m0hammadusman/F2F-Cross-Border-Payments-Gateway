import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SendHorizonal, RefreshCw, ShieldCheck, MoreHorizontal, ArrowRight } from 'lucide-react';
import complianceIcon from '../../assets/icons/04-compliance.svg';
import { getAllTransactions } from '../../utils/storage';
import { transferService } from '../../services/api';
import { getCountryByCode } from '../../data/countries';

export default function AppHome() {
  const navigate = useNavigate();
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    let active = true;
    const fallbackLocal = () => {
      const all = Object.values(getAllTransactions())
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 4);
      setRecent(Array.isArray(all) ? all : []);
    };

    transferService.listTransfers()
      .then((txs) => {
        if (!active) return;
        if (Array.isArray(txs)) {
          setRecent(txs.slice(0, 4));
        } else {
          fallbackLocal();
        }
      })
      .catch(() => {
        if (!active) return;
        fallbackLocal();
      });
    return () => { active = false; };
  }, []);

  return (
    <div>
      <div className="mx-5 mb-3.5 rounded-[22px] p-5 relative overflow-hidden bg-hero-gradient shadow-xl ring-1 ring-white/5">
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/[0.06] to-transparent pointer-events-none" />
        <div className="inline-flex items-center gap-1.5 bg-white/10 text-white/85 text-[11px] font-semibold px-2.5 py-1 rounded-full mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          Hedera testnet
        </div>
        <p className="text-white/60 text-2xl font-script text-center mb-1.5">No wallet required</p>
        <p className="text-white text-lg font-bold leading-snug mb-5 text-center">
          Send across borders, settle in seconds.
        </p>
        <div className="flex justify-between bg-white/[0.06] border border-white/10 rounded-[18px] p-3.5">
          <button onClick={() => navigate('/app/send')} className="flex-1 flex flex-col items-center gap-2 text-white">
            <span className="w-11 h-11 rounded-full bg-white/[0.14] flex items-center justify-center">
              <SendHorizonal className="w-[18px] h-[18px]" />
            </span>
            <span className="text-[11.5px]">Send</span>
          </button>
          <button onClick={() => navigate('/app/transfers')} className="flex-1 flex flex-col items-center gap-2 text-white">
            <span className="w-11 h-11 rounded-full bg-white/[0.14] flex items-center justify-center">
              <RefreshCw className="w-[18px] h-[18px]" />
            </span>
            <span className="text-[11.5px]">Transfers</span>
          </button>
          <button onClick={() => navigate('/app/verify')} className="flex-1 flex flex-col items-center gap-2 text-white">
            <span className="w-11 h-11 rounded-full bg-white/[0.14] flex items-center justify-center">
              <ShieldCheck className="w-[18px] h-[18px]" />
            </span>
            <span className="text-[11.5px]">Verify</span>
          </button>
          <button onClick={() => navigate('/app/profile')} className="flex-1 flex flex-col items-center gap-2 text-white">
            <span className="w-11 h-11 rounded-full bg-white/[0.14] flex items-center justify-center">
              <MoreHorizontal className="w-[18px] h-[18px]" />
            </span>
            <span className="text-[11.5px]">More</span>
          </button>
        </div>
      </div>

      <p className="text-center text-[11.5px] text-ink-muted mx-5 mb-3.5">
        Sandbox demo, real Hedera testnet anchoring underneath.
      </p>

      <div
        onClick={() => window.open('https://hashscan.io/testnet/topic/0.0.9617780', '_blank')}
        className="mx-5 mb-5 bg-surface border border-hairline rounded-2xl shadow-sm p-4 flex items-center gap-3.5 cursor-pointer"
      >
        <img src={complianceIcon} alt="" className="w-10 h-10 rounded-xl flex-shrink-0" />
        <div className="flex-1">
          <p className="text-[13.5px] font-semibold text-ink mb-0.5">Every transfer is verifiable</p>
          <p className="text-xs text-ink-muted leading-snug">Check any record on the real Hedera Mirror Node</p>
        </div>
        <ArrowRight className="w-[15px] h-[15px] text-ink-muted flex-shrink-0" />
      </div>

      <div className="flex items-center justify-between px-5 pb-2.5">
        <span className="text-[15px] font-bold text-ink">Recent activity</span>
        <button onClick={() => navigate('/app/transfers')} className="text-brand-500 text-xs font-semibold">See all</button>
      </div>

      {!Array.isArray(recent) || recent.length === 0 ? (
        <div className="mx-5 mb-6 bg-surface border border-hairline rounded-2xl shadow-sm p-6 text-center">
          <p className="text-sm text-ink-muted">No transfers yet. Try sending one from the demo.</p>
        </div>
      ) : (
        <div className="mx-5 mb-6 bg-surface border border-hairline rounded-2xl shadow-sm overflow-hidden">
          {recent.map((tx) => {
            const country = getCountryByCode(tx.recipientCountry);
            return (
              <div
                key={tx.id}
                onClick={() => navigate(`/app/transaction/${tx.id}`)}
                className="flex items-center gap-3 px-4 py-3.5 border-b border-hairline last:border-b-0 cursor-pointer"
              >
                <span className="w-9 h-9 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {country?.flag || '🌐'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] font-semibold text-ink truncate">{tx.recipientName || 'Recipient'}</p>
                  <p className="text-[11.5px] text-ink-muted mt-0.5">{country?.name || tx.recipientCountry}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[13.5px] font-mono font-semibold text-ink">-{tx.currency} {Number(tx.amount || 0).toFixed(2)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
