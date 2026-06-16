import { useEffect, useState } from 'react';
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
} from '../components/ui';

type User = {
  id: string;
  username: string;
  email: string;
  verified: boolean;
  role: string;
  createdAt?: string;
  twoFAEnabled?: boolean;
};

const TABS = [
  { id: 'account', label: 'Account' },
  { id: 'security', label: 'Security' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'privacy', label: 'Privacy' },
  { id: 'appearance', label: 'Appearance' },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('account');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'same-origin' });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user ?? null);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
      ) : !user ? (
        <TabPanel>
          <Alert variant="warning" title="Not signed in">
            Please <a href="/login" className="underline hover:text-white">log in</a> to manage your settings.
          </Alert>
        </TabPanel>
      ) : (
        <>
          {activeTab === 'account' && (
            <TabPanel>
              <AccountTab user={user} />
            </TabPanel>
          )}
          {activeTab === 'security' && (
            <TabPanel>
              <SecurityTab user={user} />
            </TabPanel>
          )}
          {activeTab === 'notifications' && (
            <TabPanel>
              <NotificationsTab />
            </TabPanel>
          )}
          {activeTab === 'privacy' && (
            <TabPanel>
              <PrivacyTab />
            </TabPanel>
          )}
          {activeTab === 'appearance' && (
            <TabPanel>
              <AppearanceTab />
            </TabPanel>
          )}
        </>
      )}
    </PageShell>
  );
}

function AccountTab({ user }: { user: User }) {
  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : '—';

  return (
    <div className="space-y-6">
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Profile information</CardTitle>
          <CardDescription>Your public account details on the platform.</CardDescription>
        </CardHeader>
        <div className="flex items-start gap-4 mb-6">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/30 to-primary/20 border border-white/10 text-2xl font-bold">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-xl font-semibold text-white">{user.username}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant={user.verified ? 'success' : 'warning'}>
                {user.verified ? 'Verified' : 'Unverified'}
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
          <CardDescription>Profile editing will be available in a future update.</CardDescription>
        </CardHeader>
        <div className="space-y-4 opacity-60 pointer-events-none">
          <Input label="Display name" defaultValue={user.username} disabled />
          <Input label="Email address" type="email" defaultValue={user.email} disabled />
        </div>
        <Button className="mt-4" disabled>
          Save changes
        </Button>
      </Card>
    </div>
  );
}

function SecurityTab({ user }: { user: User }) {
  return (
    <div className="space-y-6">
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>Update your password to keep your account secure.</CardDescription>
        </CardHeader>
        <div className="space-y-4 opacity-60 pointer-events-none">
          <Input label="Current password" type="password" placeholder="••••••••" disabled />
          <Input label="New password" type="password" placeholder="••••••••" disabled />
          <Input label="Confirm new password" type="password" placeholder="••••••••" disabled />
        </div>
        <Button className="mt-4" disabled>
          Update password
        </Button>
      </Card>

      <Card padding="lg">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle>Two-factor authentication</CardTitle>
              <CardDescription>Add an extra layer of security to your account.</CardDescription>
            </div>
            <Badge variant={user.twoFAEnabled ? 'success' : 'default'}>
              {user.twoFAEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
        </CardHeader>
        <p className="text-sm text-slate-400 mb-4">
          Protect your account with an authenticator app. Setup will be available soon.
        </p>
        <Button variant="outline" disabled>
          Enable 2FA
        </Button>
      </Card>

      <Card padding="lg">
        <CardHeader>
          <CardTitle>Active sessions</CardTitle>
          <CardDescription>Devices currently signed in to your account.</CardDescription>
        </CardHeader>
        <div className="rounded-xl border border-white/8 bg-white/3 p-4 text-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Current session</p>
              <p className="text-slate-400 text-xs mt-0.5">This device · Active now</p>
            </div>
            <Badge variant="success">Active</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}

function NotificationsTab() {
  const toggles = [
    { id: 'trade', label: 'Trade updates', desc: 'Status changes, escrow events, and completions.' },
    { id: 'messages', label: 'New messages', desc: 'Messages in your trade rooms.' },
    { id: 'reviews', label: 'Reviews', desc: 'When someone leaves you a review.' },
    { id: 'marketing', label: 'Product updates', desc: 'Platform news and feature announcements.' },
  ];

  return (
    <Card padding="lg">
      <CardHeader>
        <CardTitle>Email notifications</CardTitle>
        <CardDescription>Choose what you want to be notified about.</CardDescription>
      </CardHeader>
      <ul className="divide-y divide-white/8">
        {toggles.map((t) => (
          <li key={t.id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
            <div>
              <p className="text-sm font-medium text-white">{t.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{t.desc}</p>
            </div>
            <TogglePlaceholder defaultOn={t.id !== 'marketing'} />
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-slate-500">Notification preferences are saved locally for preview.</p>
    </Card>
  );
}

function PrivacyTab() {
  return (
    <div className="space-y-6">
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Profile visibility</CardTitle>
          <CardDescription>Control who can see your profile information.</CardDescription>
        </CardHeader>
        <div className="space-y-3">
          <RadioPlaceholder label="Public" desc="Anyone can view your profile." selected />
          <RadioPlaceholder label="Trades only" desc="Only trade participants can view your profile." />
          <RadioPlaceholder label="Private" desc="Hide your profile from search." />
        </div>
      </Card>

      <Card padding="lg">
        <CardHeader>
          <CardTitle>Data & privacy</CardTitle>
          <CardDescription>Manage your personal data on the platform.</CardDescription>
        </CardHeader>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" disabled>
            Export my data
          </Button>
          <Button variant="ghost" className="text-slate-400" disabled>
            Request data deletion
          </Button>
        </div>
      </Card>
    </div>
  );
}

function AppearanceTab() {
  const themes = [
    { id: 'dark', label: 'Dark', desc: 'Premium dark fintech theme (current)' },
    { id: 'system', label: 'System', desc: 'Match your device settings' },
    { id: 'light', label: 'Light', desc: 'Coming soon' },
  ];

  return (
    <Card padding="lg">
      <CardHeader>
        <CardTitle>Theme</CardTitle>
        <CardDescription>Customize how the platform looks for you.</CardDescription>
      </CardHeader>
      <div className="grid sm:grid-cols-3 gap-3">
        {themes.map((theme) => (
          <button
            key={theme.id}
            type="button"
            disabled={theme.id === 'light'}
            className={`rounded-xl border p-4 text-left transition-all ${
              theme.id === 'dark'
                ? 'border-accent/40 bg-accent/10 ring-1 ring-accent/20'
                : 'border-white/10 bg-white/3 hover:border-white/20 disabled:opacity-40'
            }`}
          >
            <div
              className={`h-16 rounded-lg mb-3 border border-white/10 ${
                theme.id === 'dark'
                  ? 'bg-gradient-to-br from-[#081229] to-[#050b1a]'
                  : theme.id === 'system'
                    ? 'bg-gradient-to-br from-slate-700 to-slate-900'
                    : 'bg-gradient-to-br from-slate-100 to-slate-200'
              }`}
            />
            <p className="text-sm font-medium text-white">{theme.label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{theme.desc}</p>
          </button>
        ))}
      </div>
    </Card>
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

function TogglePlaceholder({ defaultOn }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn ?? false);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => setOn((v) => !v)}
      className={`relative h-6 w-11 rounded-full transition-colors ${
        on ? 'bg-accent' : 'bg-white/10'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          on ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

function RadioPlaceholder({
  label,
  desc,
  selected,
}: {
  label: string;
  desc: string;
  selected?: boolean;
}) {
  return (
    <label className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/3 p-4 cursor-default">
      <span
        className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center ${
          selected ? 'border-accent' : 'border-white/20'
        }`}
      >
        {selected && <span className="h-2 w-2 rounded-full bg-accent" />}
      </span>
      <span>
        <span className="text-sm font-medium text-white block">{label}</span>
        <span className="text-xs text-slate-400">{desc}</span>
      </span>
    </label>
  );
}
