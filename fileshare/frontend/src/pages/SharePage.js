import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getFileByToken } from '../api/fileApi';

function formatBytes(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function SharePage() {
  const { token } = useParams();
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const shareLink = `${window.location.origin}/receive/${token}`;

  useEffect(() => {
    getFileByToken(token).then(r => { setFileData(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, [token]);

  const copy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '60px' }}>
      <div style={{ width: '32px', height: '32px', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', paddingTop: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 1.5rem 2rem' }}>
      {/* Success */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem', animation: 'fadeUp 0.4s ease both' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>Your file is ready!</h1>
        <p style={{ color: 'var(--text-muted)' }}>Share the link below with your friends.</p>
      </div>

      <div style={{ width: '100%', maxWidth: '520px', display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeUp 0.4s 0.1s ease both', opacity: 0, animationFillMode: 'forwards' }}>
        {/* File info */}
        {fileData && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontSize: '2rem' }}>📄</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{fileData.original_name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.2rem' }}>{formatBytes(fileData.file_size)}</div>
            </div>
          </div>
        )}

        {/* Share link */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.75rem 1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ flex: 1, fontSize: '0.875rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shareLink}</span>
          <button onClick={copy} style={{ background: copied ? 'rgba(106,247,196,0.15)' : 'var(--surface2)', color: copied ? 'var(--accent3)' : 'var(--text)', padding: '0.45rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', transition: 'all 0.2s', flexShrink: 0 }}>
            {copied ? '✓ Copied!' : 'Copy Link'}
          </button>
        </div>

        {/* Share actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <a href={`mailto:?subject=Shared%20a%20file%20with%20you&body=Here's%20your%20file%3A%20${encodeURIComponent(shareLink)}`}
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '0.85rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 500, transition: 'border-color 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            ✉️ Email
          </a>
          <a href={`https://wa.me/?text=${encodeURIComponent('Here\'s a file for you: ' + shareLink)}`} target="_blank" rel="noopener noreferrer"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '0.85rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 500, transition: 'border-color 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            💬 WhatsApp
          </a>
        </div>

        <Link to="/" style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', padding: '0.75rem', borderRadius: '10px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
          ← Upload another file
        </Link>
      </div>
    </div>
  );
}
