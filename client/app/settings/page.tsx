'use client';

import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://tessasvaultbackend.vercel.app/api';

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('mv-token')) window.location.href = '/';
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setMessage('');
    if (newPassword !== confirmation) {
      setMessage('New passwords do not match.');
      return;
    }

    const response = await fetch(`${API}/auth/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('mv-token')}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!response.ok) {
      const body = await response.json();
      setMessage(body.message || 'Unable to change password.');
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmation('');
    setMessage('Password updated successfully.');
  }

  return (
    <main className="page-enter relative mx-auto min-h-screen max-w-xl overflow-hidden p-5 sm:p-8">
      <div aria-hidden="true" className="flower flower-top flower-sky flower-float">
        <span />
        <i className="flower-center" />
      </div>
      <a
        className="text-sm text-black underline decoration-lilac decoration-2 underline-offset-4"
        href="/"
      >
        ← Back to vault
      </a>
      <section className="card relative mt-6 p-6">
        <div aria-hidden="true" className="flower flower-bottom">
          <span />
          <i className="flower-center" />
        </div>
        <p className="text-xs font-bold uppercase tracking-[.2em] text-lilac">Account</p>
        <h1 className="mt-2 text-3xl font-semibold">Change password</h1>
        <p className="mt-2 text-stone-500">Use at least 8 characters and keep it somewhere safe.</p>
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <PasswordInput
            placeholder="Current password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={setCurrentPassword}
            show={showPasswords}
          />
          <PasswordInput
            placeholder="New password"
            autoComplete="new-password"
            value={newPassword}
            onChange={setNewPassword}
            show={showPasswords}
          />
          <PasswordInput
            placeholder="Confirm new password"
            autoComplete="new-password"
            value={confirmation}
            onChange={setConfirmation}
            show={showPasswords}
          />
          <button
            type="button"
            onClick={() => setShowPasswords(!showPasswords)}
            className="text-xs font-bold uppercase tracking-wide text-black underline decoration-lilac decoration-2 underline-offset-4"
          >
            {showPasswords ? 'Hide passwords' : 'Show passwords'}
          </button>
          {message && (
            <p
              className={
                message.includes('success') ? 'text-sm text-black' : 'text-sm text-red-600'
              }
            >
              {message}
            </p>
          )}
          <button className="w-full rounded-xl bg-sunshine py-3 font-semibold text-black hover:bg-lilac">
            Update password
          </button>
        </form>
      </section>
    </main>
  );
}

function PasswordInput({
  placeholder,
  autoComplete,
  value,
  onChange,
  show,
}: {
  placeholder: string;
  autoComplete: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
}) {
  return (
    <input
      className="field"
      type={show ? 'text' : 'password'}
      autoComplete={autoComplete}
      placeholder={placeholder}
      minLength={placeholder === 'Current password' ? undefined : 8}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      required
    />
  );
}
