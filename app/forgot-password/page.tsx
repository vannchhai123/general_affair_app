'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { ArrowLeft, Mail, Send, Shield, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const DEFAULT_ERROR_MESSAGE = 'អ៊ីមែលត្រូវតែបំពេញ';
const DEFAULT_SUCCESS_MESSAGE =
  'ប្រសិនបើមានគណនីដែលប្រើអ៊ីមែលនេះ សេចក្តីណែនាំសម្រាប់កំណត់ពាក្យសម្ងាត់ឡើងវិញត្រូវបានផ្ញើរួចហើយ។';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setSuccess('');
      setError(DEFAULT_ERROR_MESSAGE);
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify email');
      }

      setSuccess(data.message || DEFAULT_SUCCESS_MESSAGE);
      router.push(`/forgot-password/reset?email=${encodeURIComponent(trimmedEmail)}`);
    } catch (error) {
      setSuccess('');
      setError(error instanceof Error ? error.message : 'Failed to verify email');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl overflow-hidden rounded-3xl border bg-white shadow-2xl md:grid-cols-2">
        <section className="flex items-center justify-center px-6 py-10 md:px-10 lg:px-14">
          <div className="w-full max-w-[380px]">
            <div className="mb-10 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                <Shield className="h-5 w-5" />
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                  GAMS
                </p>
                <h1 className="mt-1 text-sm font-medium text-foreground">
                  ប្រព័ន្ធគ្រប់គ្រងកិច្ចការទូទៅ
                </h1>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                ភ្លេចពាក្យសម្ងាត់
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                សូមបញ្ចូលអ៊ីមែលរបស់អ្នក ដើម្បីស្នើសុំសេចក្តីណែនាំសម្រាប់កំណត់ពាក្យសម្ងាត់ឡើងវិញ។
              </p>
            </div>

            {error ? (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {success}
              </div>
            ) : null}

            <Card className="rounded-3xl border shadow-sm">
              <CardContent className="p-5">
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      អ៊ីមែល <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="សូមបញ្ចូលអ៊ីមែល"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="h-11 rounded-xl pl-10"
                        autoComplete="email"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="h-11 w-full rounded-xl text-sm font-semibold shadow-lg"
                    disabled={loading}
                  >
                    {loading ? 'កំពុងដំណើរការ...' : 'ផ្ញើសំណើកំណត់ពាក្យសម្ងាត់ឡើងវិញ'}
                    {!loading ? <Send className="ml-2 h-4 w-4" /> : null}
                  </Button>

                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary transition hover:underline"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    ត្រឡប់ទៅទំព័រចូលប្រើ
                  </Link>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="relative hidden overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-700 to-green-500 p-8 text-white md:flex md:flex-col md:justify-between lg:p-10">
          <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full border border-white/10" />
          <div className="absolute right-8 top-8 h-44 w-44 rounded-full border border-white/10" />
          <div className="absolute -bottom-28 -left-20 h-[26rem] w-[26rem] rounded-full border border-white/10" />

          <div className="relative z-10 flex items-center gap-2 text-white/70">
            <Sparkles className="h-4 w-4" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em]">
              ការស្ដារគណនី
            </span>
          </div>

          <div className="relative z-10 my-10">
            <Card className="mx-auto w-full max-w-xs rounded-3xl border-0 bg-white/95 text-slate-900 shadow-2xl">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground">ការស្ដារគណនីដោយសុវត្ថិភាព</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  បញ្ចូលអ៊ីមែលរបស់អ្នក
                  ហើយប្រព័ន្ធនឹងផ្ញើសេចក្តីណែនាំបន្ទាប់សម្រាប់កំណត់ពាក្យសម្ងាត់ឡើងវិញ
                  ប្រសិនបើមានគណនីនោះ។
                </p>

                <div className="mt-6 space-y-3 text-sm text-muted-foreground">
                  <div className="rounded-2xl bg-slate-100 px-4 py-3">1. ផ្ទៀងផ្ទាត់អ៊ីមែល</div>
                  <div className="rounded-2xl bg-slate-100 px-4 py-3">
                    2. ទទួលសេចក្តីណែនាំស្ដារគណនី
                  </div>
                  <div className="rounded-2xl bg-slate-100 px-4 py-3">3. កំណត់ពាក្យសម្ងាត់ថ្មី</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="relative z-10 max-w-sm">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
              ប្រព័ន្ធគ្រប់គ្រងកិច្ចការទូទៅ
            </p>
            <h3 className="text-2xl font-semibold leading-9">សេវាកំណត់ពាក្យសម្ងាត់ឡើងវិញ</h3>
            <p className="mt-3 text-sm leading-7 text-white/75">
              ដំណើរការស្ដារគណនីឥឡូវនេះប្រើ endpoint ផ្ទៀងផ្ទាត់អ៊ីមែល
              មុនពេលផ្ញើសេចក្តីណែនាំទៅអ្នកប្រើប្រាស់។
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
