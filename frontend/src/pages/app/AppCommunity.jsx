import { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import { communityService } from '../../services/api';
import { formatDate } from '../../utils/formatters';

export default function AppCommunity() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ code: '', displayName: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const loadPosts = () => {
    communityService.listPosts()
      .then((data) => setPosts(Array.isArray(data) ? data : []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  };
  useEffect(() => { loadPosts(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);
    try {
      await communityService.submitPost(form);
      setSuccess(true);
      setForm({ code: '', displayName: '', message: '' });
      loadPosts();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-5 pt-1 pb-6">
      <form onSubmit={submit} className="bg-surface border border-hairline rounded-2xl shadow-sm p-4 mb-5 space-y-2.5">
        <p className="text-[13px] font-bold text-ink mb-1">Share your experience</p>
        <input
          type="text" required placeholder="Community Usage Code"
          value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
          className="w-full box-border border border-hairline bg-canvas rounded-xl px-3.5 py-2.5 text-xs font-mono text-ink outline-none"
        />
        <input
          type="text" placeholder="Display name (optional)"
          value={form.displayName} onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
          className="w-full box-border border border-hairline bg-canvas rounded-xl px-3.5 py-2.5 text-xs text-ink outline-none"
        />
        <textarea
          required minLength={5} rows={2} placeholder="What was your experience like?"
          value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          className="w-full box-border border border-hairline bg-canvas rounded-xl px-3.5 py-2.5 text-xs text-ink outline-none resize-none"
        />
        {error && <p className="text-xs text-danger-400">{error}</p>}
        {success && <p className="text-xs text-success-400">Posted. Thank you.</p>}
        <button disabled={submitting} className="w-full flex items-center justify-center gap-2 bg-brand-gradient text-white text-[13px] font-bold py-3 rounded-xl active:scale-[0.98] transition-transform">
          <Send className="w-3.5 h-3.5" />
          {submitting ? 'Posting...' : 'Post'}
        </button>
      </form>

      <p className="text-[13px] font-bold text-ink mb-2.5">Recent posts</p>
      {loading ? (
        <p className="text-xs text-ink-muted">Loading...</p>
      ) : !Array.isArray(posts) || posts.length === 0 ? (
        <div className="bg-surface border border-hairline rounded-2xl shadow-sm p-5 text-center">
          <p className="text-xs text-ink-muted">No posts yet.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {posts.map((p) => (
            <div key={p.id} className="bg-surface border border-hairline rounded-2xl shadow-sm p-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-ink">{p.displayName}</span>
                <span className="text-[10.5px] text-ink-muted">{formatDate(p.createdAt)}</span>
              </div>
              <p className="text-xs text-ink-muted leading-relaxed">{p.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
