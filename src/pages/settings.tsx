import { useCallback, useEffect, useState } from 'react';
import Router from 'next/router';
import PageShell from '../components/layout/PageShell';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  Input,
  Badge,
  Alert,
  SkeletonCard,
  Tabs,
  TabPanel,
  Toggle,
  RadioOption,
  Modal,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
} from '../components/ui';
import {
  getPasswordStrength,
  isValidEmailFormat,
  isValidUsername,
  type PasswordStrength,
} from '../lib/password-strength';
import { applyTheme, applyCompactUi } from '../lib/theme';
import type { ProfileVisibility, ThemePreference, UserSettingsData } from '../lib/user-settings';
import { cn } from '../lib/cn';

type User = {
  id: string;
  username: string;
  name: string | null;
  email: string;
  verified: boolean;
  role: string;
  createdAt?: string;
  twoFAEnabled?: boolean;
};

type SecurityLog = {
  id: string;
  action: string;
  ipAddress: string | null;
  createdAt: string;
  label: string;
};

type CurrentSession = {
  active: boolean;
  ipAddress: string | null;
  lastLogin: string | null;
};

type SettingsResponse = {
  user: User;
  settings: UserSettingsData;
};

const TABS = [
  { id: 'account', label: 'Account' },
  { id: 'security', label: 'Security' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'privacy', label: 'Privacy' },
  { id: 'appearance', label: 'Appearance' },
];

const STRENGTH_COLORS: Record<PasswordStrength, string> = {
  weak: 'bg-red-500',
  fair: 'bg-amber-500',
  good: 'bg-primary',
  strong: 'bg-emerald-500',
};

async function patchSettings(body: Record<string, unknown>): Promise<SettingsResponse & { ok?: boolean }> {
  const res = await fetch('/api/settings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.error === 'string' ? data.error : 'Failed to save settings.');
  }
  return data;
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="M1 1l22 22" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
    </svg>
  );
}

function PasswordStrengthBar({ password }: { password: string }) {
  const { score, label, percent } = getPasswordStrength(password);

  if (!password) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">Password strength</span>
        <span
          className={cn(
            'font-medium',
            score === 'weak' && 'text-red-300',
            score === 'fair' && 'text-amber-300',
            score === 'good' && 'text-primary',
            score === 'strong' && 'text-emerald-300'
          )}
        >
          {label}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-300', STRENGTH_COLORS[score])}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function PasswordInput({
  label,
  value,
  onChange,
  disabled,
  id,
  error,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  id: string;
  error?: string;
  autoComplete?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-200">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className={cn('app-input pr-11', error && 'border-red-500/50 focus:border-red-400 focus:ring-red-500/20')}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          autoComplete={autoComplete}
          aria-invalid={!!error}
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition-colors"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {visible ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-300" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/3 border border-white/8 px-4 py-3">
      <dt className="text-xs text-slate-500 uppercase tracking-wide">{label}</dt>
      <dd className="mt-1 text-white font-medium truncate">{value}</dd>
    </div>
  );
}

function formatDateTime(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState('account');
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<UserSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const refreshSettings = useCallback(async () => {
    const res = await fetch('/api/settings', { credentials: 'same-origin' });
    if (!res.ok) {
      if (res.status === 401) {
        setUser(null);
        setSettings(null);
        return;
      }
      const data = await res.json().catch(() => ({}));
      const message =
        typeof data.error === 'string'
          ? typeof data.details === 'string' && data.details !== data.error
            ? `${data.error} — ${data.details}`
            : data.error
          : `Failed to load settings (HTTP ${res.status}).`;
      throw new Error(message);
    }
    const data: SettingsResponse = await res.json();
    setUser(data.user);
    setSettings(data.settings);
    applyTheme(data.settings.theme);
    applyCompactUi(data.settings.compactUi);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await refreshSettings();
      } catch (e) {
        setLoadError(e instanceof Error ? e.message : 'Failed to load settings.');
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshSettings]);

  const handleSettingsPatch = useCallback(
    async (body: Record<string, unknown>) => {
      const data = await patchSettings(body);
      if (data.user) setUser(data.user);
      if (data.settings) {
        setSettings(data.settings);
        if (typeof body.theme === 'string') {
          applyTheme(data.settings.theme);
        }
        if (typeof body.compactUi === 'boolean') {
          applyCompactUi(data.settings.compactUi);
        }
      }
      return data;
    },
    []
  );

  return (
    <PageShell
      title="Settings"
      description="Manage your account, security preferences, and platform experience."
      maxWidth="lg"
    >
      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {loading ? (
        <TabPanel>
          <SkeletonCard />
        </TabPanel>
      ) : loadError ? (
        <TabPanel>
          <Alert variant="error" title="Could not load settings">
            {loadError}
          </Alert>
        </TabPanel>
      ) : !user || !settings ? (
        <TabPanel>
          <Alert variant="warning" title="Not signed in">
            Please{' '}
            <a href="/login" className="underline hover:text-white">
              log in
            </a>{' '}
            to manage your settings.
          </Alert>
        </TabPanel>
      ) : (
        <>
          {activeTab === 'account' && (
            <TabPanel>
              <AccountTab
                user={user}
                onUserUpdate={setUser}
                onPatch={handleSettingsPatch}
              />
            </TabPanel>
          )}
          {activeTab === 'security' && (
            <TabPanel>
              <SecurityTab user={user} onUserUpdate={setUser} />
            </TabPanel>
          )}
          {activeTab === 'notifications' && (
            <TabPanel>
              <NotificationsTab settings={settings} onPatch={handleSettingsPatch} />
            </TabPanel>
          )}
          {activeTab === 'privacy' && (
            <TabPanel>
              <PrivacyTab
                settings={settings}
                onPatch={handleSettingsPatch}
                onGoToDelete={() => setActiveTab('account')}
              />
            </TabPanel>
          )}
          {activeTab === 'appearance' && (
            <TabPanel>
              <AppearanceTab settings={settings} onPatch={handleSettingsPatch} />
            </TabPanel>
          )}
        </>
      )}
    </PageShell>
  );
}

function AccountTab({
  user,
  onUserUpdate,
  onPatch,
}: {
  user: User;
  onUserUpdate: (user: User) => void;
  onPatch: (body: Record<string, unknown>) => Promise<SettingsResponse & { ok?: boolean }>;
}) {
  const [username, setUsername] = useState(user.username);
  const [displayName, setDisplayName] = useState(user.name ?? '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    setUsername(user.username);
    setDisplayName(user.name ?? '');
  }, [user.username, user.name]);

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : '—';

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!isValidUsername(username)) {
      setProfileError('Username must be 3–24 characters and contain only letters, numbers, and underscores.');
      return;
    }

    setProfileSaving(true);
    try {
      const data = await onPatch({
        username,
        name: displayName.trim(),
      });
      if (data.user) onUserUpdate(data.user);
      setProfileSuccess('Profile updated successfully.');
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  }

  async function changeEmail(e: React.FormEvent) {
    e.preventDefault();
    setEmailError('');
    setEmailSuccess('');

    if (!isValidEmailFormat(newEmail)) {
      setEmailError('Enter a valid email address.');
      return;
    }
    if (!emailPassword) {
      setEmailError('Enter your current password to confirm this change.');
      return;
    }

    setEmailSaving(true);
    try {
      const res = await fetch('/api/settings/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ email: newEmail.trim(), password: emailPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : 'Failed to change email.');
      }
      setEmailSuccess(
        typeof data.message === 'string'
          ? data.message
          : 'Verification email sent to your new address.'
      );
      setNewEmail('');
      setEmailPassword('');
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : 'Failed to change email.');
    } finally {
      setEmailSaving(false);
    }
  }

  async function deleteAccount() {
    setDeleteError('');
    if (!deletePassword) {
      setDeleteError('Enter your password to confirm account deletion.');
      return;
    }

    setDeleteLoading(true);
    try {
      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ password: deletePassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : 'Failed to delete account.');
      }
      await Router.push('/login');
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete account.');
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Profile information</CardTitle>
          <CardDescription>Your public account details on the platform.</CardDescription>
        </CardHeader>
        <div className="flex items-start gap-4 mb-6">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/30 to-primary/20 border border-white/10 text-2xl font-bold">
            {(user.name || user.username).charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-xl font-semibold text-white">{user.name || user.username}</p>
            <p className="text-sm text-slate-400">@{user.username}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant={user.verified ? 'success' : 'warning'}>
                {user.verified ? 'Email verified' : 'Email unverified'}
              </Badge>
              <Badge variant={user.role === 'ADMIN' ? 'purple' : 'default'}>{user.role}</Badge>
            </div>
          </div>
        </div>
        <dl className="grid sm:grid-cols-2 gap-4 text-sm">
          <InfoField label="Username" value={user.username} />
          <InfoField label="Email" value={user.email} />
          <InfoField label="Member since" value={memberSince} />
          <InfoField label="Account ID" value={user.id.slice(0, 8) + '…'} />
        </dl>
      </Card>

      <Card padding="lg">
        <CardHeader>
          <CardTitle>Edit profile</CardTitle>
          <CardDescription>Update your username and display name.</CardDescription>
        </CardHeader>
        <form onSubmit={saveProfile} className="space-y-4">
          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={profileSaving}
            hint="3–24 characters; letters, numbers, and underscores only."
          />
          <Input
            label="Display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={profileSaving}
            hint="Shown on your profile. Leave blank to use your username."
          />
          {profileError && <Alert variant="error">{profileError}</Alert>}
          {profileSuccess && <Alert variant="success">{profileSuccess}</Alert>}
          <Button type="submit" loading={profileSaving}>
            Save changes
          </Button>
        </form>
      </Card>

      <Card padding="lg">
        <CardHeader>
          <CardTitle>Change email</CardTitle>
          <CardDescription>
            Update your sign-in email. You will need to verify the new address.
          </CardDescription>
        </CardHeader>
        <form onSubmit={changeEmail} className="space-y-4">
          <Input label="Current email" type="email" value={user.email} disabled />
          <Input
            label="New email address"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            disabled={emailSaving}
            placeholder="you@example.com"
          />
          <PasswordInput
            id="email-change-password"
            label="Current password"
            value={emailPassword}
            onChange={setEmailPassword}
            disabled={emailSaving}
            autoComplete="current-password"
          />
          {emailError && <Alert variant="error">{emailError}</Alert>}
          {emailSuccess && <Alert variant="success">{emailSuccess}</Alert>}
          <Button type="submit" loading={emailSaving}>
            Update email
          </Button>
        </form>
      </Card>

      <Card padding="lg" className="border-red-500/20">
        <CardHeader>
          <CardTitle>Danger zone</CardTitle>
          <CardDescription>
            Permanently delete your account and anonymize your data. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <Button variant="danger" onClick={() => setDeleteOpen(true)}>
          Delete account
        </Button>
      </Card>

      <Modal
        open={deleteOpen}
        onClose={() => {
          if (deleteLoading) return;
          setDeleteOpen(false);
          setDeletePassword('');
          setDeleteError('');
        }}
        title="Delete your account?"
        footer={
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setDeleteOpen(false);
                setDeletePassword('');
                setDeleteError('');
              }}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button variant="danger" loading={deleteLoading} onClick={deleteAccount}>
              Delete my account
            </Button>
          </div>
        }
      >
        <p className="text-sm text-slate-300 mb-4">
          This will permanently remove access to your account and anonymize your profile. Enter your
          password to confirm.
        </p>
        <PasswordInput
          id="delete-account-password"
          label="Password"
          value={deletePassword}
          onChange={setDeletePassword}
          disabled={deleteLoading}
          autoComplete="current-password"
        />
        {deleteError && (
          <Alert variant="error" className="mt-4">
            {deleteError}
          </Alert>
        )}
      </Modal>
    </div>
  );
}

function SecurityTab({
  user,
  onUserUpdate,
}: {
  user: User;
  onUserUpdate: (user: User) => void;
}) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const [twoFAEnabled, setTwoFAEnabled] = useState(!!user.twoFAEnabled);
  const [twoFASetup, setTwoFASetup] = useState<{ base32: string; otpauth_url: string } | null>(null);
  const [twoFAToken, setTwoFAToken] = useState('');
  const [twoFALoading, setTwoFALoading] = useState(false);
  const [twoFAError, setTwoFAError] = useState('');
  const [twoFASuccess, setTwoFASuccess] = useState('');
  const [disablePassword, setDisablePassword] = useState('');

  const [securityLog, setSecurityLog] = useState<SecurityLog[]>([]);
  const [currentSession, setCurrentSession] = useState<CurrentSession | null>(null);
  const [logLoading, setLogLoading] = useState(true);
  const [logError, setLogError] = useState('');
  const [revokeLoading, setRevokeLoading] = useState(false);
  const [revokeError, setRevokeError] = useState('');

  useEffect(() => {
    setTwoFAEnabled(!!user.twoFAEnabled);
  }, [user.twoFAEnabled]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/settings/security-log', { credentials: 'same-origin' });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(typeof data.error === 'string' ? data.error : 'Failed to load security log.');
        }
        setSecurityLog(Array.isArray(data.logs) ? data.logs : []);
        setCurrentSession(data.currentSession ?? null);
      } catch (e) {
        setLogError(e instanceof Error ? e.message : 'Failed to load security log.');
      } finally {
        setLogLoading(false);
      }
    })();
  }, []);

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword || !newPassword) {
      setPasswordError('Current and new password are required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (getPasswordStrength(newPassword).score === 'weak') {
      setPasswordError('Choose a stronger password with mixed characters.');
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await fetch('/api/settings/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : 'Failed to update password.');
      }
      setPasswordSuccess(typeof data.message === 'string' ? data.message : 'Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to update password.');
    } finally {
      setPasswordSaving(false);
    }
  }

  async function start2FASetup() {
    setTwoFAError('');
    setTwoFASuccess('');
    setTwoFALoading(true);
    try {
      const res = await fetch('/api/auth/2fa-setup', {
        method: 'POST',
        credentials: 'same-origin',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : 'Failed to start 2FA setup.');
      }
      setTwoFASetup({ base32: data.base32, otpauth_url: data.otpauth_url });
      setTwoFAToken('');
    } catch (err) {
      setTwoFAError(err instanceof Error ? err.message : 'Failed to start 2FA setup.');
    } finally {
      setTwoFALoading(false);
    }
  }

  async function verify2FA(e: React.FormEvent) {
    e.preventDefault();
    if (!twoFASetup) return;
    setTwoFAError('');
    setTwoFASuccess('');

    if (!twoFAToken.trim()) {
      setTwoFAError('Enter the 6-digit code from your authenticator app.');
      return;
    }

    setTwoFALoading(true);
    try {
      const res = await fetch('/api/auth/2fa-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ token: twoFAToken.trim(), secret: twoFASetup.base32 }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : 'Invalid verification code.');
      }
      setTwoFAEnabled(true);
      setTwoFASetup(null);
      setTwoFAToken('');
      setTwoFASuccess('Two-factor authentication has been enabled.');
      onUserUpdate({ ...user, twoFAEnabled: true });
    } catch (err) {
      setTwoFAError(err instanceof Error ? err.message : 'Failed to verify 2FA code.');
    } finally {
      setTwoFALoading(false);
    }
  }

  async function disable2FA(e: React.FormEvent) {
    e.preventDefault();
    setTwoFAError('');
    setTwoFASuccess('');

    if (!disablePassword) {
      setTwoFAError('Enter your password to disable 2FA.');
      return;
    }

    setTwoFALoading(true);
    try {
      const res = await fetch('/api/settings/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ password: disablePassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : 'Failed to disable 2FA.');
      }
      setTwoFAEnabled(false);
      setTwoFASetup(null);
      setDisablePassword('');
      setTwoFASuccess(typeof data.message === 'string' ? data.message : 'Two-factor authentication disabled.');
      onUserUpdate({ ...user, twoFAEnabled: false });
    } catch (err) {
      setTwoFAError(err instanceof Error ? err.message : 'Failed to disable 2FA.');
    } finally {
      setTwoFALoading(false);
    }
  }

  async function revokeAllSessions() {
    setRevokeError('');
    setRevokeLoading(true);
    try {
      const res = await fetch('/api/settings/revoke-sessions', {
        method: 'POST',
        credentials: 'same-origin',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : 'Failed to revoke sessions.');
      }
      await Router.push('/login');
    } catch (err) {
      setRevokeError(err instanceof Error ? err.message : 'Failed to revoke sessions.');
    } finally {
      setRevokeLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>Update your password to keep your account secure.</CardDescription>
        </CardHeader>
        <form onSubmit={changePassword} className="space-y-4">
          <PasswordInput
            id="current-password"
            label="Current password"
            value={currentPassword}
            onChange={setCurrentPassword}
            disabled={passwordSaving}
            autoComplete="current-password"
          />
          <div className="space-y-1.5">
            <PasswordInput
              id="new-password"
              label="New password"
              value={newPassword}
              onChange={setNewPassword}
              disabled={passwordSaving}
              autoComplete="new-password"
            />
            <PasswordStrengthBar password={newPassword} />
          </div>
          <PasswordInput
            id="confirm-password"
            label="Confirm new password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            disabled={passwordSaving}
            autoComplete="new-password"
            error={
              confirmPassword && newPassword !== confirmPassword ? 'Passwords do not match.' : undefined
            }
          />
          {passwordError && <Alert variant="error">{passwordError}</Alert>}
          {passwordSuccess && <Alert variant="success">{passwordSuccess}</Alert>}
          <Button type="submit" loading={passwordSaving}>
            Update password
          </Button>
        </form>
      </Card>

      <Card padding="lg">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle>Two-factor authentication</CardTitle>
              <CardDescription>Add an extra layer of security to your account.</CardDescription>
            </div>
            <Badge variant={twoFAEnabled ? 'success' : 'default'}>
              {twoFAEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
        </CardHeader>

        {twoFAError && (
          <Alert variant="error" className="mb-4">
            {twoFAError}
          </Alert>
        )}
        {twoFASuccess && (
          <Alert variant="success" className="mb-4">
            {twoFASuccess}
          </Alert>
        )}

        {!twoFAEnabled && !twoFASetup && (
          <Button variant="outline" loading={twoFALoading} onClick={start2FASetup}>
            Enable 2FA
          </Button>
        )}

        {!twoFAEnabled && twoFASetup && (
          <form onSubmit={verify2FA} className="space-y-4">
            <p className="text-sm text-slate-400">
              Scan this QR code with your authenticator app, or enter the secret manually.
            </p>
            <div className="flex flex-wrap gap-6 items-start">
              <div className="rounded-xl border border-white/10 bg-white p-3">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(twoFASetup.otpauth_url)}`}
                  alt="2FA QR code"
                  width={180}
                  height={180}
                  className="block"
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Manual entry key</p>
                <code className="block rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-accent break-all select-all">
                  {twoFASetup.base32}
                </code>
              </div>
            </div>
            <Input
              label="Verification code"
              value={twoFAToken}
              onChange={(e) => setTwoFAToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              inputMode="numeric"
              autoComplete="one-time-code"
              disabled={twoFALoading}
            />
            <div className="flex flex-wrap gap-3">
              <Button type="submit" loading={twoFALoading}>
                Verify and enable
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={twoFALoading}
                onClick={() => {
                  setTwoFASetup(null);
                  setTwoFAToken('');
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {twoFAEnabled && (
          <form onSubmit={disable2FA} className="space-y-4">
            <p className="text-sm text-slate-400">
              Disabling 2FA will remove the extra protection on your account.
            </p>
            <PasswordInput
              id="disable-2fa-password"
              label="Password"
              value={disablePassword}
              onChange={setDisablePassword}
              disabled={twoFALoading}
              autoComplete="current-password"
            />
            <Button type="submit" variant="outline" loading={twoFALoading}>
              Disable 2FA
            </Button>
          </form>
        )}
      </Card>

      <Card padding="lg">
        <CardHeader>
          <CardTitle>Active sessions</CardTitle>
          <CardDescription>Devices currently signed in to your account.</CardDescription>
        </CardHeader>
        {logLoading ? (
          <SkeletonCard />
        ) : (
          <>
            <div className="rounded-xl border border-white/8 bg-white/3 p-4 text-sm mb-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-white">Current session</p>
                  <p className="text-slate-400 text-xs mt-0.5">
                    This device
                    {currentSession?.ipAddress ? ` · ${currentSession.ipAddress}` : ''}
                    {currentSession?.lastLogin
                      ? ` · Last login ${formatDateTime(currentSession.lastLogin)}`
                      : ' · Active now'}
                  </p>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
            </div>
            {revokeError && (
              <Alert variant="error" className="mb-4">
                {revokeError}
              </Alert>
            )}
            <Button variant="outline" loading={revokeLoading} onClick={revokeAllSessions}>
              Revoke all sessions
            </Button>
          </>
        )}
      </Card>

      <Card padding="lg">
        <CardHeader>
          <CardTitle>Security activity</CardTitle>
          <CardDescription>Recent login and security events on your account.</CardDescription>
        </CardHeader>
        {logLoading ? (
          <SkeletonCard />
        ) : logError ? (
          <Alert variant="error">{logError}</Alert>
        ) : securityLog.length === 0 ? (
          <p className="text-sm text-slate-400">No security events recorded yet.</p>
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Event</TH>
                <TH>IP address</TH>
                <TH>Date</TH>
              </TR>
            </THead>
            <TBody>
              {securityLog.map((log) => (
                <TR key={log.id}>
                  <TD>{log.label}</TD>
                  <TD>{log.ipAddress ?? '—'}</TD>
                  <TD>{formatDateTime(log.createdAt)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Card>
    </div>
  );
}

function NotificationsTab({
  settings,
  onPatch,
}: {
  settings: UserSettingsData;
  onPatch: (body: Record<string, unknown>) => Promise<SettingsResponse & { ok?: boolean }>;
}) {
  const [draft, setDraft] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  const toggles: Array<{
    key: keyof Pick<
      UserSettingsData,
      | 'notifyTradeUpdates'
      | 'notifyDisputeUpdates'
      | 'notifyMessages'
      | 'notifySecurityAlerts'
      | 'notifyMarketing'
    >;
    label: string;
    description: string;
  }> = [
    {
      key: 'notifyTradeUpdates',
      label: 'Trade updates',
      description: 'Status changes, escrow events, and completions.',
    },
    {
      key: 'notifyDisputeUpdates',
      label: 'Dispute updates',
      description: 'Alerts when a trade dispute is opened or resolved.',
    },
    {
      key: 'notifyMessages',
      label: 'New messages',
      description: 'Messages in your trade rooms.',
    },
    {
      key: 'notifySecurityAlerts',
      label: 'Security alerts',
      description: 'Password changes, new sign-ins, and account activity.',
    },
    {
      key: 'notifyMarketing',
      label: 'Product updates',
      description: 'Platform news and feature announcements.',
    },
  ];

  async function saveNotifications(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await onPatch({
        notifyTradeUpdates: draft.notifyTradeUpdates,
        notifyDisputeUpdates: draft.notifyDisputeUpdates,
        notifyMessages: draft.notifyMessages,
        notifySecurityAlerts: draft.notifySecurityAlerts,
        notifyMarketing: draft.notifyMarketing,
      });
      setSuccess('Notification preferences saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preferences.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card padding="lg">
      <CardHeader>
        <CardTitle>Email notifications</CardTitle>
        <CardDescription>Choose what you want to be notified about.</CardDescription>
      </CardHeader>
      <form onSubmit={saveNotifications}>
        <div className="divide-y divide-white/8">
          {toggles.map((t) => (
            <Toggle
              key={t.key}
              label={t.label}
              description={t.description}
              checked={draft[t.key]}
              onChange={(value) => setDraft((prev) => ({ ...prev, [t.key]: value }))}
              disabled={saving}
            />
          ))}
        </div>
        {error && (
          <Alert variant="error" className="mt-4">
            {error}
          </Alert>
        )}
        {success && (
          <Alert variant="success" className="mt-4">
            {success}
          </Alert>
        )}
        <Button type="submit" className="mt-4" loading={saving}>
          Save preferences
        </Button>
      </form>
    </Card>
  );
}

function PrivacyTab({
  settings,
  onPatch,
  onGoToDelete,
}: {
  settings: UserSettingsData;
  onPatch: (body: Record<string, unknown>) => Promise<SettingsResponse & { ok?: boolean }>;
  onGoToDelete: () => void;
}) {
  const [visibility, setVisibility] = useState<ProfileVisibility>(settings.profileVisibility);
  const [visibilitySaving, setVisibilitySaving] = useState(false);
  const [visibilityError, setVisibilityError] = useState('');
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState('');

  useEffect(() => {
    setVisibility(settings.profileVisibility);
  }, [settings.profileVisibility]);

  async function changeVisibility(value: ProfileVisibility) {
    setVisibility(value);
    setVisibilityError('');
    setVisibilitySaving(true);
    try {
      await onPatch({ profileVisibility: value });
    } catch (err) {
      setVisibility(settings.profileVisibility);
      setVisibilityError(err instanceof Error ? err.message : 'Failed to update visibility.');
    } finally {
      setVisibilitySaving(false);
    }
  }

  async function exportData() {
    setExportError('');
    setExportLoading(true);
    try {
      const res = await fetch('/api/settings/export', { credentials: 'same-origin' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(typeof data.error === 'string' ? data.error : 'Failed to export data.');
      }
      const blob = await res.blob();
      const disposition = res.headers.get('Content-Disposition');
      const match = disposition?.match(/filename="([^"]+)"/);
      const filename = match?.[1] ?? 'trustedmm-data-export.json';
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Failed to export data.');
    } finally {
      setExportLoading(false);
    }
  }

  const visibilityOptions: Array<{ value: ProfileVisibility; label: string; description: string }> = [
    { value: 'PUBLIC', label: 'Public', description: 'Anyone can view your profile.' },
    {
      value: 'TRADES_ONLY',
      label: 'Trades only',
      description: 'Only trade participants can view your profile.',
    },
    { value: 'PRIVATE', label: 'Private', description: 'Hide your profile from search.' },
  ];

  return (
    <div className="space-y-6">
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Profile visibility</CardTitle>
          <CardDescription>Control who can see your profile information.</CardDescription>
        </CardHeader>
        <div className="space-y-3">
          {visibilityOptions.map((option) => (
            <RadioOption
              key={option.value}
              name="profileVisibility"
              value={option.value}
              checked={visibility === option.value}
              onChange={(value) => changeVisibility(value as ProfileVisibility)}
              label={option.label}
              description={option.description}
            />
          ))}
        </div>
        {visibilitySaving && <p className="mt-3 text-xs text-slate-400">Saving…</p>}
        {visibilityError && (
          <Alert variant="error" className="mt-4">
            {visibilityError}
          </Alert>
        )}
      </Card>

      <Card padding="lg">
        <CardHeader>
          <CardTitle>Data & privacy</CardTitle>
          <CardDescription>Manage your personal data on the platform.</CardDescription>
        </CardHeader>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" loading={exportLoading} onClick={exportData}>
            Export my data
          </Button>
          <Button variant="ghost" className="text-slate-400" onClick={onGoToDelete}>
            Delete account
          </Button>
        </div>
        {exportError && (
          <Alert variant="error" className="mt-4">
            {exportError}
          </Alert>
        )}
      </Card>
    </div>
  );
}

function AppearanceTab({
  settings,
  onPatch,
}: {
  settings: UserSettingsData;
  onPatch: (body: Record<string, unknown>) => Promise<SettingsResponse & { ok?: boolean }>;
}) {
  const [theme, setTheme] = useState<ThemePreference>(settings.theme);
  const [compactUi, setCompactUi] = useState(settings.compactUi);
  const [themeSaving, setThemeSaving] = useState(false);
  const [compactSaving, setCompactSaving] = useState(false);
  const [error, setError] = useState('');
  const [themeSuccess, setThemeSuccess] = useState('');
  const [compactSuccess, setCompactSuccess] = useState('');

  useEffect(() => {
    setTheme(settings.theme);
    setCompactUi(settings.compactUi);
  }, [settings.theme, settings.compactUi]);

  const themes: Array<{ id: ThemePreference; label: string; desc: string }> = [
    { id: 'dark', label: 'Dark', desc: 'Premium dark fintech theme' },
    { id: 'light', label: 'Light', desc: 'Clean light interface for daytime use' },
    { id: 'system', label: 'System', desc: 'Match your device settings' },
  ];

  async function selectTheme(next: ThemePreference) {
    setTheme(next);
    applyTheme(next);
    setError('');
    setThemeSuccess('');
    setThemeSaving(true);
    try {
      await onPatch({ theme: next });
      setThemeSuccess('Theme saved.');
    } catch (err) {
      setTheme(settings.theme);
      applyTheme(settings.theme);
      setError(err instanceof Error ? err.message : 'Failed to save theme.');
    } finally {
      setThemeSaving(false);
    }
  }

  async function toggleCompact(next: boolean) {
    setCompactUi(next);
    applyCompactUi(next);
    setError('');
    setCompactSuccess('');
    setCompactSaving(true);
    try {
      await onPatch({ compactUi: next });
      setCompactSuccess('Display preference saved.');
    } catch (err) {
      setCompactUi(settings.compactUi);
      applyCompactUi(settings.compactUi);
      setError(err instanceof Error ? err.message : 'Failed to save display preference.');
    } finally {
      setCompactSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>Customize how the platform looks for you.</CardDescription>
        </CardHeader>
        <div className="grid sm:grid-cols-3 gap-3">
          {themes.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={themeSaving}
              onClick={() => selectTheme(item.id)}
              className={cn(
                'rounded-xl border p-4 text-left transition-all',
                theme === item.id
                  ? 'border-accent/40 bg-accent/10 ring-1 ring-accent/20'
                  : 'border-white/10 bg-white/3 hover:border-white/20'
              )}
            >
              <div
                className={cn(
                  'h-16 rounded-lg mb-3 border border-white/10',
                  item.id === 'dark' && 'bg-gradient-to-br from-[#081229] to-[#050b1a]',
                  item.id === 'light' && 'bg-gradient-to-br from-slate-100 to-slate-200',
                  item.id === 'system' && 'bg-gradient-to-br from-slate-700 to-slate-200'
                )}
              />
              <p className="text-sm font-medium text-white">{item.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
            </button>
          ))}
        </div>
        {themeSaving && <p className="mt-3 text-xs text-slate-400">Saving theme…</p>}
        {themeSuccess && (
          <Alert variant="success" className="mt-4">
            {themeSuccess}
          </Alert>
        )}
      </Card>

      <Card padding="lg">
        <CardHeader>
          <CardTitle>Display</CardTitle>
          <CardDescription>Adjust layout density across the platform.</CardDescription>
        </CardHeader>
        <Toggle
          label="Compact UI"
          description="Use tighter spacing and smaller cards throughout the app."
          checked={compactUi}
          onChange={toggleCompact}
          disabled={compactSaving}
        />
        {compactSaving && <p className="mt-3 text-xs text-slate-400">Saving…</p>}
        {compactSuccess && (
          <Alert variant="success" className="mt-4">
            {compactSuccess}
          </Alert>
        )}
        {error && (
          <Alert variant="error" className="mt-4">
            {error}
          </Alert>
        )}
      </Card>
    </div>
  );
}
