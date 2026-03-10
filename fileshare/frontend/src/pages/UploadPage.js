import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadFile } from '../api/fileApi';

const ACCEPT_ANY = true;
const MAX_SIZE_MB = 50;

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function getFileIcon(type) {
  if (!type) return '📄';
  if (type.startsWith('image/')) return '🖼️';
  if (type.startsWith('video/')) return '🎬';
  if (type.startsWith('audio/')) return '🎵';
  if (type.includes('pdf')) return '📕';
  if (type.includes('zip') || type.includes('archive') || type.includes('compressed')) return '📦';
  if (type.includes('word') || type.includes('document')) return '📝';
  if (type.includes('sheet') || type.includes('excel') || type.includes('csv')) return '📊';
  return '📄';
}

export default function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploaderName, setUploaderName] = useState('');
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef();

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) validateAndSet(dropped);
  }, []);

  const validateAndSet = (f) => {
    setError('');
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File too large. Max size is ${MAX_SIZE_MB} MB.`);
      return;
    }
    setFile(f);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('uploader_name', uploaderName || 'Anonymous');
      fd.append('message', message);
      const res = await uploadFile(fd, setProgress);
      navigate(`/share/${res.data.share_token}`);
    } catch (e) {
      setError(e?.response?.data?.detail || 'Upload failed. Is the Django server running?');
      setUploading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 1.5rem 2rem' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: '3rem', animation: 'fadeUp 0.5s ease both' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: '1rem' }}>
          Share files with<br />
          <span style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>anyone, instantly.</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '480px', lineHeight: 1.6 }}>
          Drop a file, get a link. Share it with your friends. No accounts needed.
        </p>
      </div>

      {/* Upload Card */}
      <div style={{ width: '100%', maxWidth: '560px', animation: 'fadeUp 0.5s 0.1s ease both', opacity: 0, animationFillMode: 'forwards' }}>
        {/* Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => !file && inputRef.current.click()}
          style={{
            border: `2px dashed ${dragging ? 'var(--accent)' : file ? 'var(--accent3)' : 'var(--border)'}`,
            borderRadius: 'var(--radius)',
            background: dragging ? 'rgba(124,106,247,0.06)' : file ? 'rgba(106,247,196,0.04)' : 'var(--surface)',
            padding: '2.5rem',
            textAlign: 'center',
            cursor: file ? 'default' : 'pointer',
            transition: 'all 0.2s ease',
            marginBottom: '1.25rem',
          }}
        >
          <input ref={inputRef} type="file" hidden onChange={(e) => e.target.files[0] && validateAndSet(e.target.files[0])} />
          {file ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '2.5rem' }}>{getFileIcon(file.type)}</span>
              <div style={{ flex: 1, textAlign: 'left', overflow: 'hidden' }}>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.2rem' }}>{formatBytes(file.size)} · {file.type || 'unknown type'}</div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); setFile(null); setProgress(0); }} style={{ background: 'var(--surface2)', color: 'var(--text-muted)', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', flexShrink: 0 }}>Remove</button>
            </div>
          ) : (
            <>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>☁️</div>
              <div style={{ fontWeight: 600, marginBottom: '0.4rem' }}>Drop your file here</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>or <span style={{ color: 'var(--accent)', textDecoration: 'underline' }}>click to browse</span> · Max {MAX_SIZE_MB} MB</div>
            </>
          )}
        </div>

        {/* Optional fields */}
        {file && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem', animation: 'fadeUp 0.3s ease both' }}>
            <input
              value={uploaderName}
              onChange={(e) => setUploaderName(e.target.value)}
              placeholder="Your name (optional)"
              maxLength={100}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.75rem 1rem', color: 'var(--text)', fontSize: '0.9rem', width: '100%' }}
            />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a message for your friend... (optional)"
              maxLength={500}
              rows={2}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.75rem 1rem', color: 'var(--text)', fontSize: '0.9rem', width: '100%', resize: 'none' }}
            />
          </div>
        )}

        {/* Progress */}
        {uploading && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              <span>Uploading…</span><span>{progress}%</span>
            </div>
            <div style={{ background: 'var(--surface)', borderRadius: '99px', overflow: 'hidden', height: '6px' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent), var(--accent2))', transition: 'width 0.2s ease', borderRadius: '99px' }} />
            </div>
          </div>
        )}

        {error && <div style={{ color: '#ff6b6b', fontSize: '0.875rem', marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(255,107,107,0.08)', borderRadius: '10px', border: '1px solid rgba(255,107,107,0.2)' }}>{error}</div>}

        <button
          onClick={handleSubmit}
          disabled={!file || uploading}
          style={{
            width: '100%', padding: '0.9rem', borderRadius: '12px',
            background: file && !uploading ? 'linear-gradient(135deg, var(--accent), var(--accent2))' : 'var(--surface2)',
            color: file && !uploading ? '#fff' : 'var(--text-muted)',
            fontWeight: 700, fontSize: '1rem', fontFamily: 'var(--font-display)',
            letterSpacing: '0.01em', transition: 'all 0.2s',
            transform: file && !uploading ? 'none' : 'none',
          }}
        >
          {uploading ? '⏳ Uploading…' : '🚀 Upload & Get Share Link'}
        </button>
      </div>
    </div>
  );
}
