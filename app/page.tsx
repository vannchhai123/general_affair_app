'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowRight, Eye, EyeOff, Shield, Star } from 'lucide-react';

import { loginAction } from '@/lib/actions/auth';
import { setTokens } from '@/lib/client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const KHMER_ERROR_MESSAGE = 'សូមបំពេញព័ត៌មានឲ្យបានត្រឹមត្រូវ';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordStrength = useMemo(() => {
    if (!password) {
      return { score: 0, label: '' };
    }

    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const labels = ['', 'ខ្សោយ', 'ល្មម', 'ល្អ', 'ខ្លាំង'];
    return { score, label: labels[score] };
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError(KHMER_ERROR_MESSAGE);
      return;
    }

    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('username', username.trim());
      formData.append('password', password);

      const result = await loginAction(formData);

      if (result.error) {
        setError(KHMER_ERROR_MESSAGE);
        return;
      }

      if (result.success) {
        setTokens(result.accessToken, result.refreshToken);
        router.push('/dashboard');
        return;
      }

      setError(KHMER_ERROR_MESSAGE);
    } catch {
      setError(KHMER_ERROR_MESSAGE);
    } finally {
      setLoading(false);
    }
  };

  const strengthClasses = (index: number) => {
    const active = passwordStrength.score > index && password.length > 0;

    if (!active) return 'bg-muted';
    if (passwordStrength.score === 1) return 'bg-amber-500';
    if (passwordStrength.score === 2 || passwordStrength.score === 3) {
      return 'bg-primary';
    }
    return 'bg-emerald-500';
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl overflow-hidden rounded-3xl border bg-white shadow-2xl md:grid-cols-2">
        <section className="flex items-center justify-center px-6 py-10 md:px-10 lg:px-14">
          <div className="w-full max-w-[380px]">
            <div className="mb-8">
              <h2 className="page-title text-2xl tracking-tight text-foreground">ចូលគណនី</h2>
            </div>

            {error ? (
              <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username">
                  ឈ្មោះអ្នកប្រើប្រាស់ <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-11 rounded-xl"
                  autoComplete="username"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  ពាក្យសម្ងាត់ <span className="text-red-500">*</span>
                </Label>

                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 rounded-xl pr-11"
                    autoComplete="current-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'លាក់ពាក្យសម្ងាត់' : 'បង្ហាញពាក្យសម្ងាត់'}
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                <div className="mt-2 flex gap-1">
                  {[0, 1, 2, 3].map((index) => (
                    <div
                      key={index}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${strengthClasses(
                        index,
                      )}`}
                    />
                  ))}
                </div>

                <p className="min-h-[1rem] text-xs text-muted-foreground">
                  {passwordStrength.label}
                </p>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={remember}
                    onCheckedChange={(checked) => setRemember(Boolean(checked))}
                    disabled={loading}
                  />
                  <Label htmlFor="remember" className="cursor-pointer font-normal">
                    ចងចាំខ្ញុំ
                  </Label>
                </div>

                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-primary transition hover:underline"
                >
                  ភ្លេចពាក្យសម្ងាត់?
                </Link>
              </div>

              <Button
                type="submit"
                className="h-11 w-full rounded-xl text-sm font-semibold shadow-lg"
                disabled={loading}
              >
                {loading ? 'កំពុងដំណើរការ...' : 'ចូលប្រើ'}
                {!loading ? <ArrowRight className="ml-2 h-4 w-4" /> : null}
              </Button>
            </form>
          </div>
        </section>

        <section className="relative hidden overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-700 to-green-500 p-8 text-white md:flex md:flex-col md:justify-between lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.12),_transparent_32%)]" />
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-emerald-200/10 blur-3xl" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-white/90 backdrop-blur-sm">
              <Star className="h-4 w-4" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">Welcome</span>
            </div>
          </div>

          <div className="relative z-10 max-w-sm">
            <div className="inline-flex rounded-3xl bg-white/12 p-4 backdrop-blur-sm">
              <Image
                src="/icon.svg"
                alt="General Affairs Management System logo"
                width={56}
                height={56}
                className="h-14 w-14"
                priority
              />
            </div>

            <p className="mt-5 text-xs font-medium uppercase tracking-[0.18em] text-emerald-50/70">
              General Affairs Management System
            </p>
            <h3 className="mt-3 font-khmer-moul-light text-xl leading-[1.55] text-white lg:text-[1.2rem]">
              ប្រព័ន្ធគ្រប់គ្រងរដ្ឋបាល និងការប្រើប្រាស់ក្នុងអង្គភាព
            </h3>
            <p className="mt-4 text-sm leading-7 text-emerald-50/80">
              ចូលប្រើបានងាយ សាមញ្ញ និងស្រួលប្រើសម្រាប់ការងារប្រចាំថ្ងៃ។
            </p>
          </div>

          <div className="relative z-10">
            <div className="inline-flex rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white/85 backdrop-blur-sm">
              គ្រប់គ្រងព័ត៌មាន និងប្រតិបត្តិការនៅកន្លែងតែមួយ
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
