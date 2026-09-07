'use client';
import { ChangeEvent, DragEvent, useEffect, useState } from 'react';
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
type Album = { _id: string; name: string; coverUrl?: string };
type Memory = {
  _id: string;
  url: string;
  resourceType: 'image' | 'video';
  caption: string;
  date: string;
  album?: Album;
};
const fmt = (d: string) =>
  new Date(d).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
export default function Home() {
  const [token, setToken] = useState(''),
    [email, setEmail] = useState(''),
    [password, setPassword] = useState(''),
    [showPassword, setShowPassword] = useState(false),
    [view, setView] = useState<'timeline' | 'albums'>('timeline'),
    [memories, setMemories] = useState<Memory[]>([]),
    [albums, setAlbums] = useState<Album[]>([]),
    [file, setFile] = useState<File | null>(null),
    [caption, setCaption] = useState(''),
    [date, setDate] = useState(new Date().toISOString().slice(0, 10)),
    [albumId, setAlbumId] = useState(''),
    [busy, setBusy] = useState(false),
    [newAlbum, setNewAlbum] = useState('');
  const headers = () => ({ Authorization: `Bearer ${token}` });
  const load = async () => {
    const [m, a] = await Promise.all([
      fetch(`${API}/memories`, { headers: headers() }),
      fetch(`${API}/albums`, { headers: headers() }),
    ]);
    if (m.ok) setMemories((await m.json()).data);
    if (a.ok) setAlbums((await a.json()).data);
  };
  useEffect(() => {
    const t = localStorage.getItem('mv-token');
    if (t) {
      setToken(t);
    }
  }, []);
  useEffect(() => {
    if (token) load();
  }, [token]);
  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const j = await r.json();
    if (!r.ok) return alert(j.message || 'Could not sign in');
    localStorage.setItem('mv-token', j.token);
    setToken(j.token);
  };
  const upload = async () => {
    if (!file) return;
    setBusy(true);
    const data = new FormData();
    data.append('file', file);
    data.append('caption', caption);
    data.append('date', date);
    if (albumId) data.append('albumId', albumId);
    const r = await fetch(`${API}/memories`, { method: 'POST', headers: headers(), body: data });
    setBusy(false);
    if (!r.ok) return alert('Upload failed. Check your Cloudinary settings.');
    setFile(null);
    setCaption('');
    await load();
  };
  const createAlbum = async () => {
    if (!newAlbum.trim()) return;
    const r = await fetch(`${API}/albums`, {
      method: 'POST',
      headers: { ...headers(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newAlbum }),
    });
    if (r.ok) {
      setNewAlbum('');
      load();
    }
  };
  const pick = (f?: File) => {
    if (f && /^image\/(jpeg|png|webp|gif)$|^video\//.test(f.type)) setFile(f);
    else if (f) alert('Please select an image or video file.');
  };
  if (!token)
    return (
      <main className="relative grid min-h-screen place-items-center overflow-hidden p-5">
        <Flower className="flower-top" />
        <Flower className="flower-bottom flower-sky" />
        <form onSubmit={login} className="card relative z-10 w-full max-w-sm p-7">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-lilac">
            Tessa&apos;s Vault
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Welcome back.</h1>
          <p className="mt-2 text-stone-500">Sign in to your private collection.</p>
          <div className="mt-6 space-y-3">
            <input
              className="field"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="relative">
              <input
                className="field pr-16"
                placeholder="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-4 text-xs font-bold uppercase tracking-wide text-black underline decoration-lilac decoration-2 underline-offset-4"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <button className="w-full rounded-xl bg-ink py-3 font-semibold text-white hover:bg-lilac hover:text-black">
              Enter vault
            </button>
          </div>
        </form>
      </main>
    );
  return (
    <main className="relative mx-auto max-w-6xl overflow-hidden p-4 sm:p-8">
      <Flower className="flower-top flower-sky" />
      <header className="mb-7 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-lilac">
            Your private archive
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">Tessa&apos;s Vault</h1>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <a
            href="/settings"
            className="text-black underline decoration-lilac decoration-2 underline-offset-4"
          >
            Settings
          </a>
          <button
            onClick={() => {
              localStorage.removeItem('mv-token');
              setToken('');
            }}
            className="text-stone-500"
          >
            Sign out
          </button>
        </div>
      </header>
      <section className="card relative mb-7 p-4 sm:p-5">
        <Flower className="flower-bottom" />
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e: DragEvent) => {
            e.preventDefault();
            pick(e.dataTransfer.files[0]);
          }}
          className="rounded-xl border-2 border-dashed border-lilac bg-sky/30 p-5 text-center"
        >
          <input
            id="media"
            className="hidden"
            type="file"
            accept="image/*,video/*"
            capture="environment"
            onChange={(e: ChangeEvent<HTMLInputElement>) => pick(e.target.files?.[0])}
          />
          <label htmlFor="media" className="cursor-pointer">
            <span className="text-2xl">＋</span>
            <p className="mt-1 font-medium">{file ? file.name : 'Add a memory'}</p>
            <p className="text-sm text-stone-500">Drop a photo or video here, or tap to choose</p>
          </label>
        </div>
        {file && (
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_170px_170px_auto]">
            <input
              className="field"
              placeholder="Write a caption…"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
            <input
              className="field"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <select className="field" value={albumId} onChange={(e) => setAlbumId(e.target.value)}>
              <option value="">No album</option>
              {albums.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.name}
                </option>
              ))}
            </select>
            <button
              onClick={upload}
              disabled={busy}
              className="rounded-xl bg-sunshine px-5 py-2 font-semibold text-black hover:bg-lilac"
            >
              {busy ? 'Saving…' : 'Save'}
            </button>
          </div>
        )}
      </section>
      <nav className="mb-6 flex gap-2">
        <button
          onClick={() => setView('timeline')}
          className={`rounded-full px-4 py-2 text-sm ${view === 'timeline' ? 'bg-lilac text-black' : 'bg-white'}`}
        >
          Timeline
        </button>
        <button
          onClick={() => setView('albums')}
          className={`rounded-full px-4 py-2 text-sm ${view === 'albums' ? 'bg-lilac text-black' : 'bg-white'}`}
        >
          Albums
        </button>
      </nav>
      {view === 'timeline' ? (
        <div>
          {memories.length === 0 ? (
            <p className="py-16 text-center text-stone-500">Your story starts with one memory.</p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {memories.map((m) => (
                <article key={m._id} className="card overflow-hidden">
                  <Media m={m} />
                  <div className="p-4">
                    <p className="font-medium">{m.caption || 'Untitled moment'}</p>
                    <p className="mt-1 text-sm text-stone-500">
                      {fmt(m.date)} {m.album && ` · ${m.album.name}`}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="mb-5 flex max-w-md gap-2">
            <input
              className="field"
              placeholder="New album name"
              value={newAlbum}
              onChange={(e) => setNewAlbum(e.target.value)}
            />
            <button
              onClick={createAlbum}
              className="rounded-xl bg-sunshine px-4 text-black hover:bg-lilac"
            >
              Create
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {albums.map((a) => (
              <div className="card p-5" key={a._id}>
                <p className="text-lg font-semibold">{a.name}</p>
                <p className="mt-1 text-sm text-stone-500">
                  {memories.filter((m) => m.album?._id === a._id).length} memories
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
function Media({ m }: { m: Memory }) {
  return m.resourceType === 'video' ? (
    <video className="h-56 w-full bg-black object-cover" controls src={m.url} />
  ) : (
    <img className="h-56 w-full object-cover" src={m.url} alt={m.caption || 'Memory'} />
  );
}

function Flower({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`flower ${className}`}>
      <span />
      <i className="flower-center" />
    </div>
  );
}
