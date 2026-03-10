import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getFileByToken, downloadFile } from '../api/fileApi';

function formatBytes(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
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

export default function ReceivePage() {
  const { token } = useParams();
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getFileByToken(token)
      .then(r => { setFileData(r.data); setLoading(false); })
      .catch(e => {
        const msg = e?.response?.status === 410 ? 'This share link has expired.' : 'File not found or the link is invalid.';
        setError(msg);
        setLoading(false);
      });
  }, [token]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '60px' }}>
      <div style={{ width: '32px', height: '32px', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '60px', textAlign: 'center', gap: '1rem', padding: '80px 1.5rem' }}>
      <div style={{ fontSize: '3rem' }}>😕</div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700 }}>{error}</h2>
      <Link to="/" style={{ color: 'var(--accent)', fontSize: '0.9rem' }}>← Go to homepage</Link>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', paddingTop: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 1.5rem 2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem', animation: 'fadeUp 0.4s ease both' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>{getFileIcon(fileData.file_type)}</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
          {fileData.uploader_name !== 'Anonymous' ? `${fileData.uploader_name} shared a file with you` : 'Someone shared a file with you'}
        </h1>
        {fileData.message && (
          <div style={{ marginTop: '1rem', padding: '0.875rem 1.25rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', maxWidth: '420px', margin: '1rem auto 0', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.95rem', lineHeight: 1.6 }}>
            "{fileData.message}"
          </div>
        )}
      </div>

      <div style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeUp 0.4s 0.1s ease both', opacity: 0, animationFillMode: 'forwards' }}>
        {/* File card */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <span style={{ fontSize: '2.25rem', flexShrink: 0 }}>{getFileIcon(fileData.file_type)}</span>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, fontSize: '1rem', wordBreak: 'break-word' }}>{fileData.original_name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{formatBytes(fileData.file_size)}</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {[
              ['Uploaded', formatDate(fileData.uploaded_at)],
              ['Downloads', fileData.download_count],
            ].map(([label, val]) => (
              <div key={label} style={{ background: 'var(--surface2)', borderRadius: '8px', padding: '0.6rem 0.75rem' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>{label}</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Download button */}
        <a href={downloadFile(token)} download={fileData.original_name}
          style={{ display: 'block', width: '100%', padding: '0.95rem', borderRadius: '12px', background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff', fontWeight: 700, fontSize: '1rem', fontFamily: 'var(--font-display)', textAlign: 'center', letterSpacing: '0.01em', transition: 'opacity 0.2s' }}>
          ⬇️ Download File
        </a>

        <Link to="/" style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Upload your own files →
        </Link>
      </div>
    </div>
  );
}
