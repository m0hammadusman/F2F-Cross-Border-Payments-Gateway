import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { getAllTransactions } from '../../utils/storage';
import { transferService } from '../../services/api';
import { getCountryByCode } from '../../data/countries';

export default function AppTransfers() {
  const navigate = useNavigate();
  const [transfers, setTransfers] = useState([]);

  useEffect(() => {
    let active = true;
    const fallbackLocal = () => {
      const all = Object.values(getAllTransactions()).sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
      setTransfers(Array.isArray(all) ? all : []);
    };

    transferService.listTransfers()
      .then((txs) => {
        if (!active) return;
        if (Array.isArray(txs)) {
          setTransfers(txs);
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
      <div className="px-5 pt-1 pb-4">
        <button
          onClick={() => navigate('/app/send')}
          className="w-full flex items-center justify-center gap-2 bg-brand-gradient text-white text-[14.5px] font-bold py-3.5 rounded-2xl active:scale-[0.98] transition-transform shadow-lg"
        >
          <Plus className="w-4 h-4" />
          New transfer
        </button>
      </div>

      <p className="px-5 pb-2 text-[13px] font-bold text-ink">All transfers</p>

      {!Array.isArray(transfers) || transfers.length === 0 ? (
        <div className="mx-5 mb-6 bg-surface border border-hairline rounded-2xl shadow-sm p-6 text-center">
          <p className="text-sm text-ink-muted">Nothing here yet, real transfers you complete will show up in this list.</p>
        </div>
      ) : (
        <div className="mx-5 mb-6 bg-surface border border-hairline rounded-2xl shadow-sm overflow-hidden">
          {transfers.map((tx) => {
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
                  <p className="text-[11.5px] text-ink-muted mt-0.5">{country?.name || tx.recipientCountry} &middot; {tx.status || 'processing'}</p>
                </div>
                <p className="text-[13.5px] font-mono font-semibold text-ink flex-shrink-0">-{tx.currency} {Number(tx.amount || 0).toFixed(2)}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
