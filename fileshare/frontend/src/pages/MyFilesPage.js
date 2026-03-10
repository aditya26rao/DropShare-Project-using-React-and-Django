import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listFiles, deleteFile } from '../api/fileApi';

function formatBytes(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function getFileIcon(type) {
  if (!type) return '📄';
  if (type.startsWith('image/')) return '🖼️';
  if (type.startsWith('video/')) return '🎬';
  if (type.startsWith('audio/')) return '🎵';
  if (type.includes('pdf')) return '📕';
  if (type.includes('zip') || type.includes('archive')) return '📦';
  return '📄';
}

export default function MyFilesPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');

  const loadFiles = () => {
    listFiles()
      .then(r => { setFiles(r.data); setLoading(false); })
      .catch(() => { setError('Could not load files. Is the server running?'); setLoading(false); });
  };

  useEffect(() => { loadFiles(); }, []);

  const handleDelete = async (token, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    setDeleting(token);
    try {
      await deleteFile(token);
      setFiles(prev => prev.filter(f => f.share_token !== token));
    } catch {
      alert('Could not delete file.');
    }
    setDeleting(null);
  };

  const copyLink = (token) => {
    navigator.clipboard.writeText(`${window.location.origin}/receive/${token}`);
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: '80px', maxWidth: '760px', margin: '0 auto', padding: '80px 1.5rem 3rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', animation: 'fadeUp 0.4s ease both' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em' }}>My Files</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.3rem', fontSize: '0.9rem' }}>All uploaded files & their share links</p>
        </div>
        <Link to="/" style={{ background: 'var(--accent)', color: '#fff', padding: '0.6rem 1.25rem', borderRadius: '10px', fontSize: '0.875rem', fontWeight: 600 }}>
          + Upload
        </Link>
      </div>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        </div>
      )}

      {error && <div style={{ color: '#ff6b6b', background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.2)', borderRadius: '10px', padding: '1rem', textAlign: 'center' }}>{error}</div>}

      {!loading && !error && files.length === 0 && (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
          <div style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>No files uploaded yet.</div>
          <Link to="/" style={{ color: 'var(--accent)', fontWeight: 600 }}>Upload your first file →</Link>
        </div>
      )}

      {files.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', animation: 'fadeUp 0.4s 0.1s ease both', opacity: 0, animationFillMode: 'forwards' }}>
          {files.map(file => (
            <div key={file.share_token} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'border-color 0.2s' }}>
              <span style={{ fontSize: '1.75rem', flexShrink: 0 }}>{getFileIcon(file.file_type)}</span>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.original_name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.775rem', marginTop: '0.2rem', display: 'flex', gap: '0.75rem' }}>
                  <span>{formatBytes(file.file_size)}</span>
                  <span>{formatDate(file.uploaded_at)}</span>
                  <span>⬇️ {file.download_count}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                <button onClick={() => copyLink(file.share_token)} title="Copy share link" style={{ background: 'var(--surface2)', color: 'var(--text-muted)', padding: '0.4rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem' }}>
                  🔗 Copy
                </button>
                <Link to={`/share/${file.share_token}`} style={{ background: 'var(--surface2)', color: 'var(--text-muted)', padding: '0.4rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', display: 'flex', alignItems: 'center' }}>
                  View
                </Link>
                <button onClick={() => handleDelete(file.share_token, file.original_name)} disabled={deleting === file.share_token} style={{ background: 'rgba(255,107,107,0.1)', color: '#ff6b6b', padding: '0.4rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem' }}>
                  {deleting === file.share_token ? '…' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
