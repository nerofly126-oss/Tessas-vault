'use client';
import { ChangeEvent, DragEvent, useEffect, useState } from 'react';
import {
  AppBar,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import MenuIcon from '@mui/icons-material/Menu';
const API = process.env.NEXT_PUBLIC_API_URL || 'https://tessasvaultbackend.vercel.app/api';
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
    [uploadOpen, setUploadOpen] = useState(false),
    [preview, setPreview] = useState<Memory | null>(null),
    [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null),
    [caption, setCaption] = useState(''),
    [date, setDate] = useState(new Date().toISOString().slice(0, 10)),
    [albumId, setAlbumId] = useState(''),
    [busy, setBusy] = useState(false),
    [newAlbum, setNewAlbum] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState('');
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
    if (token) {
      load();
      const messages = [
        'You’re beautiful, Tessa.',
        'Your light makes ordinary days glow.',
        'A soft reminder: you are deeply loved.',
        'You make the world a little more lovely.',
        'Today looks good on you.',
      ];
      setWelcomeMessage(messages[Math.floor(Math.random() * messages.length)]);
      setShowWelcome(true);
      const timer = window.setTimeout(() => setShowWelcome(false), 2700);
      return () => window.clearTimeout(timer);
    }
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
    setUploadOpen(false);
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
  const deleteMemory = async (memory: Memory) => {
    if (
      !window.confirm(
        `Delete “${memory.caption || 'this memory'}”? This also removes the original file.`,
      )
    )
      return;
    const response = await fetch(`${API}/memories/${memory._id}`, {
      method: 'DELETE',
      headers: headers(),
    });
    if (!response.ok) return alert('Could not delete this memory. Please try again.');
    await load();
  };
  const pick = (f?: File) => {
    if (f && /^image\/(jpeg|png|webp|gif)$|^video\//.test(f.type)) setFile(f);
    else if (f) alert('Please select an image or video file.');
  };
  const videoCount = memories.filter((memory) => memory.resourceType === 'video').length;
  if (!token)
    return (
      <main className="page-enter relative grid min-h-screen place-items-center overflow-hidden p-5">
        <Flower className="flower-top flower-float" />
        <Flower className="flower-bottom flower-sky flower-float" />
        <Butterfly className="butterfly-top butterfly-yellow" />
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
    <>
      {showWelcome && <Welcome message={welcomeMessage} />}
      <main className="page-enter relative mx-auto max-w-6xl overflow-hidden px-3 pb-8 pt-28 sm:px-8 sm:pb-8 sm:pt-24">
      <Flower className="flower-top flower-sky flower-float hidden sm:block" />
      <Butterfly className="butterfly-top butterfly-yellow hidden sm:block" />
      <Butterfly className="butterfly-side butterfly-sky hidden sm:block" />
      <Butterfly className="butterfly-low hidden sm:block" />
      <Butterfly className="butterfly-mid butterfly-yellow hidden lg:block" />
      <Butterfly className="butterfly-far butterfly-sky hidden lg:block" />
      <Flower className="flower-left flower-float hidden lg:block" />
      <Flower className="flower-right flower-float hidden lg:block" />
      <Flower className="flower-mid flower-sky flower-float hidden lg:block" />
      <Flower className="flower-low flower-float hidden lg:block" />
      <PreviewDialog memory={preview} close={() => setPreview(null)} />
      <AppBar
        position="fixed"
        elevation={0}
        className="z-40 border-b border-black/15"
        sx={{
          top: 0,
          left: 0,
          right: 0,
          width: '100%',
          bgcolor: 'rgba(255,255,255,.72)',
          color: '#111111',
          backdropFilter: 'blur(18px) saturate(160%)',
        }}
      >
        <Toolbar className="mx-auto flex min-h-20 w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:min-h-0 sm:px-8">
          <div className="min-w-0">
            <Typography
              variant="overline"
              sx={{ color: '#B9A7E8', fontWeight: 800, letterSpacing: '.18em' }}
            >
              Your private archive
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1 }}>
              Tessa&apos;s Vault
            </Typography>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              onClick={() => setUploadOpen(true)}
              variant="contained"
              color="secondary"
              startIcon={<AddPhotoAlternateOutlinedIcon />}
            >
              Add memory
            </Button>
            <IconButton
              onClick={(event) => setMenuAnchor(event.currentTarget)}
              aria-label="Open navigation menu"
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        slotProps={{
          paper: { sx: { mt: 1, minWidth: 170, border: '1px solid rgba(17,17,17,.12)' } },
        }}
      >
        <MenuItem component="a" href="/settings" onClick={() => setMenuAnchor(null)}>
          <SettingsOutlinedIcon fontSize="small" className="mr-3" />
          Settings
        </MenuItem>
        <MenuItem
          onClick={() => {
            localStorage.removeItem('mv-token');
            setToken('');
            setMenuAnchor(null);
          }}
        >
          <LogoutIcon fontSize="small" className="mr-3" />
          Sign out
        </MenuItem>
      </Menu>
      <section className="relative z-10 mb-5 grid grid-cols-3 gap-2 sm:gap-3">
        <Stat
          label="Memories saved"
          value={memories.length}
          detail="Every little moment"
          tone="bg-white"
        />
        <Stat
          label="Albums made"
          value={albums.length}
          detail="Your curated chapters"
          tone="bg-lilac"
        />
        <Stat
          label="Video moments"
          value={videoCount}
          detail="Moving memories"
          tone="bg-sunshine"
        />
      </section>
      {uploadOpen && (
        <UploadModal
          close={() => setUploadOpen(false)}
          file={file}
          pick={pick}
          caption={caption}
          setCaption={setCaption}
          date={date}
          setDate={setDate}
          albumId={albumId}
          setAlbumId={setAlbumId}
          albums={albums}
          upload={upload}
          busy={busy}
        />
      )}
      <nav className="gallery-toolbar relative z-10 mb-5 flex w-full sm:mb-6 sm:inline-flex">
        <button
          onClick={() => setView('timeline')}
          className={`flex-1 border-b-4 px-5 py-3 text-sm font-semibold transition sm:flex-none ${view === 'timeline' ? 'border-lilac bg-lilac/30 text-black' : 'border-transparent text-stone-500 hover:bg-sky/30 hover:text-black'}`}
        >
          Timeline
        </button>
        <button
          onClick={() => setView('albums')}
          className={`flex-1 border-b-4 px-5 py-3 text-sm font-semibold transition sm:flex-none ${view === 'albums' ? 'border-lilac bg-lilac/30 text-black' : 'border-transparent text-stone-500 hover:bg-sky/30 hover:text-black'}`}
        >
          Albums
        </button>
      </nav>
      {view === 'timeline' ? (
        <div className="relative z-10">
          {memories.length === 0 ? (
            <div className="card grid min-h-64 place-items-center p-8 text-center">
              <div>
                <span className="text-4xl">✿</span>
                <p className="mt-3 font-semibold">Your story starts with one memory.</p>
                <p className="mt-1 text-sm text-stone-500">Tap “Add memory” to preserve it here.</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {memories.map((m) => (
                <article
                  key={m._id}
                  className="card gallery-card group overflow-hidden transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                >
                  <button
                    className="block w-full text-left"
                    onClick={() => setPreview(m)}
                    aria-label={`Preview ${m.caption || 'memory'}`}
                  >
                    <Media m={m} />
                  </button>
                  <div className="flex items-start justify-between gap-3 p-4">
                    <div>
                      <p className="font-medium">{m.caption || 'Untitled moment'}</p>
                      <p className="mt-1 text-sm text-stone-500">
                        {fmt(m.date)} {m.album && ` · ${m.album.name}`}
                      </p>
                    </div>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => setPreview(m)}
                      sx={{ minWidth: 0, px: 1 }}
                    >
                      <VisibilityOutlinedIcon fontSize="small" className="mr-1" />
                      Preview
                    </Button>
                    <Button
                      color="error"
                      size="small"
                      onClick={() => deleteMemory(m)}
                      sx={{ minWidth: 0, px: 1 }}
                      aria-label={`Delete ${m.caption || 'memory'}`}
                    >
                      <DeleteOutlineIcon fontSize="small" className="mr-1" />
                      Delete
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="relative z-10">
          <div className="mb-5 flex max-w-md flex-col gap-2 sm:flex-row">
            <input
              className="field"
              placeholder="New album name"
              value={newAlbum}
              onChange={(e) => setNewAlbum(e.target.value)}
            />
            <button
              onClick={createAlbum}
              className="rounded-xl bg-sunshine px-4 py-3 font-semibold text-black hover:bg-lilac sm:py-0"
            >
              Create
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {albums.map((a, index) => (
              <div className="card gallery-card group overflow-hidden" key={a._id}>
                <div
                  className={`h-3 ${index % 3 === 0 ? 'bg-lilac' : index % 3 === 1 ? 'bg-sky' : 'bg-sunshine'}`}
                />
                <div className="p-5">
                  <p className="text-lg font-semibold">{a.name}</p>
                  <p className="mt-1 text-sm text-stone-500">
                    {memories.filter((m) => m.album?._id === a._id).length} memories
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </main>
    </>
  );
}
function UploadModal({
  close,
  file,
  pick,
  caption,
  setCaption,
  date,
  setDate,
  albumId,
  setAlbumId,
  albums,
  upload,
  busy,
}: {
  close: () => void;
  file: File | null;
  pick: (file?: File) => void;
  caption: string;
  setCaption: (value: string) => void;
  date: string;
  setDate: (value: string) => void;
  albumId: string;
  setAlbumId: (value: string) => void;
  albums: Album[];
  upload: () => Promise<void>;
  busy: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-end bg-black/40 p-0 sm:place-items-center sm:p-5"
      role="dialog"
      aria-modal="true"
    >
      <section className="relative max-h-[92dvh] w-full max-w-xl overflow-y-auto border-t-4 border-lilac bg-white p-5 pb-8 shadow-2xl sm:max-h-[88vh] sm:border-4 sm:p-7">
        {busy && (
          <div className="absolute inset-0 z-20 grid place-items-center bg-white/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <CircularProgress color="secondary" />
              <p className="font-semibold">Saving your memory…</p>
              <p className="text-sm text-stone-500">Please keep this window open.</p>
            </div>
          </div>
        )}
        <button
          onClick={close}
          className="absolute right-5 top-5 z-10 grid h-9 w-9 place-items-center border border-black bg-sky"
          aria-label="Close upload"
        >
          <CloseIcon fontSize="small" />
        </button>
        <p className="text-xs font-bold uppercase tracking-[.18em] text-lilac">Add to your story</p>
        <h2 className="mt-1 text-2xl font-semibold">Save a new memory</h2>
        <div
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event: DragEvent) => {
            event.preventDefault();
            pick(event.dataTransfer.files[0]);
          }}
          className="mt-5 border-2 border-dashed border-lilac bg-sky/30 p-7 text-center"
        >
          <input
            id="media"
            className="hidden"
            type="file"
            accept="image/*,video/*"
            capture="environment"
            onChange={(event: ChangeEvent<HTMLInputElement>) => pick(event.target.files?.[0])}
          />
          <label htmlFor="media" className="cursor-pointer">
            <span className="inline-grid h-10 w-10 place-items-center border border-black bg-sunshine">
              <AddPhotoAlternateOutlinedIcon />
            </span>
            <p className="mt-2 font-semibold">{file ? file.name : 'Choose a photo or video'}</p>
            <p className="mt-1 text-sm text-stone-500">Drop it here, or tap to browse</p>
          </label>
        </div>
        <div className="mt-4 grid gap-3">
          <input
            className="field"
            placeholder="Write a caption…"
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              className="field"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
            <select
              className="field"
              value={albumId}
              onChange={(event) => setAlbumId(event.target.value)}
            >
              <option value="">No album</option>
              {albums.map((album) => (
                <option key={album._id} value={album._id}>
                  {album.name}
                </option>
              ))}
            </select>
          </div>
          <Button
            onClick={upload}
            disabled={busy || !file}
            variant="contained"
            color="secondary"
            fullWidth
            startIcon={
              busy ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <AddPhotoAlternateOutlinedIcon />
              )
            }
          >
            {busy ? 'Saving…' : 'Save memory'}
          </Button>
        </div>
      </section>
    </div>
  );
}
function Stat({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: number;
  detail: string;
  tone: string;
}) {
  return (
    <div className={`rounded-2xl border border-black/10 p-4 shadow-sm ${tone}`}>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-sm font-semibold">{label}</p>
      <p className="mt-0.5 text-xs text-black/60">{detail}</p>
    </div>
  );
}
function Media({ m }: { m: Memory }) {
  return m.resourceType === 'video' ? (
    <video className="h-48 w-full bg-black object-cover sm:h-56" muted playsInline src={m.url} />
  ) : (
    <img className="h-48 w-full object-cover sm:h-56" src={m.url} alt={m.caption || 'Memory'} />
  );
}

function PreviewDialog({ memory, close }: { memory: Memory | null; close: () => void }) {
  return (
    <Dialog
      open={Boolean(memory)}
      onClose={close}
      maxWidth="lg"
      fullWidth
      slotProps={{ paper: { sx: { bgcolor: '#111111', borderRadius: 4, overflow: 'hidden' } } }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#FFFFFF',
          pr: 1,
        }}
      >
        {memory?.caption || 'Memory preview'}
        <IconButton onClick={close} aria-label="Close preview" sx={{ color: '#FFFFFF' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0, display: 'grid', placeItems: 'center', bgcolor: '#111111' }}>
        {memory?.resourceType === 'video' ? (
          <video className="max-h-[75vh] w-full" controls autoPlay src={memory.url} />
        ) : (
          memory && (
            <img
              className="max-h-[75vh] max-w-full object-contain"
              src={memory.url}
              alt={memory.caption || 'Memory preview'}
            />
          )
        )}
      </DialogContent>
    </Dialog>
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

function Butterfly({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`butterfly ${className}`}>
      <span />
    </div>
  );
}

function Welcome({ message }: { message: string }) {
  return (
    <div className="welcome-screen fixed inset-0 z-[60] grid place-items-center bg-sky/90 p-5">
      <Flower className="flower-top flower-float" />
      <Flower className="flower-bottom flower-sky flower-float" />
      <Butterfly className="butterfly-top butterfly-yellow" />
      <section className="welcome-card relative max-w-md p-8 text-center">
        <span className="text-4xl">✿</span>
        <p className="mt-4 text-xs font-bold uppercase tracking-[.2em] text-black/70">
          Welcome to your vault
        </p>
        <h2 className="mt-3 text-3xl font-semibold leading-snug text-black">{message}</h2>
        <p className="mt-3 text-sm text-black/70">Let’s hold on to something beautiful today.</p>
      </section>
    </div>
  );
}
