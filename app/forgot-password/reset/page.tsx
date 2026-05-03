'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useMemo, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';

export default function ResetForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-6">
          <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-5xl items-center justify-center">
            <Card className="w-full max-w-xl rounded-3xl border bg-white shadow-2xl">
              <CardContent className="p-6 text-sm text-muted-foreground md:p-8">
                កំពុងផ្ទុកទំព័រកំណត់ពាក្យសម្ងាត់ឡើងវិញ...
              </CardContent>
            </Card>
          </div>
        </main>
      }
    >
      <ResetForgotPasswordForm />
    </Suspense>
  );
}

function ResetForgotPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = useMemo(() => searchParams.get('email') || '', [searchParams]);

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleVerifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedOtp = otp.trim();

    if (!trimmedEmail || !trimmedOtp) {
      setSuccess('');
      setError('សូមបញ្ចូលអ៊ីមែល និងលេខកូដ OTP។');
      return;
    }

    if (!/^\d{6}$/.test(trimmedOtp)) {
      setSuccess('');
      setError('លេខកូដ OTP ត្រូវតែមាន ៦ ខ្ទង់។');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmedEmail,
          otp: trimmedOtp,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || 'ការផ្ទៀងផ្ទាត់លេខកូដ OTP មិនបានជោគជ័យ');
      }

      setOtpVerified(true);
      setSuccess(
        data.message ||
          'លេខកូដ OTP ត្រូវបានផ្ទៀងផ្ទាត់ដោយជោគជ័យ។ ឥឡូវនេះអ្នកអាចកំណត់ពាក្យសម្ងាត់ថ្មីបាន។',
      );
    } catch (error) {
      setSuccess('');
      setError(error instanceof Error ? error.message : 'ការផ្ទៀងផ្ទាត់លេខកូដ OTP មិនបានជោគជ័យ');
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setSuccess('');
      setError('សូមបញ្ចូល និងបញ្ជាក់ពាក្យសម្ងាត់ថ្មីរបស់អ្នក។');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim(),
          newPassword,
          confirmPassword,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || 'ការកំណត់ពាក្យសម្ងាត់ឡើងវិញមិនបានជោគជ័យ');
      }

      setSuccess(
        data.message || 'ពាក្យសម្ងាត់ត្រូវបានកំណត់ឡើងវិញដោយជោគជ័យ។ អ្នកអាចចូលប្រើឥឡូវនេះ។',
      );
      setTimeout(() => router.push('/'), 1200);
    } catch (error) {
      setSuccess('');
      setError(error instanceof Error ? error.message : 'ការកំណត់ពាក្យសម្ងាត់ឡើងវិញមិនបានជោគជ័យ');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-5xl items-center justify-center">
        <Card className="w-full max-w-xl rounded-3xl border bg-white shadow-2xl">
          <CardContent className="p-6 md:p-8">
            <div className="mb-8 flex items-center gap-3">
              <div>
                <h1 className="page-title mt-1 text-xl font-semibold tracking-tight text-foreground">
                  {otpVerified ? 'បង្កើតពាក្យសម្ងាត់ថ្មី' : 'បញ្ចូលលេខកូដ ៦ ខ្ទង់'}
                </h1>
              </div>
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

            <form
              onSubmit={otpVerified ? handleResetPassword : handleVerifyOtp}
              className="space-y-5"
              noValidate
            >
              <div className="space-y-2">
                <Label htmlFor="otp">លេខកូដ OTP</Label>
                <InputOTP
                  id="otp"
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                  disabled={loading || otpVerified}
                  containerClassName="justify-between"
                >
                  <InputOTPGroup className="gap-2">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <InputOTPSlot
                        key={index}
                        index={index}
                        className="h-12 w-12 rounded-xl border text-base font-semibold"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {otpVerified ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  <div className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="h-4 w-4" />
                    លេខកូដ OTP ត្រូវបានផ្ទៀងផ្ទាត់
                  </div>
                </div>
              ) : null}

              {otpVerified ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">ពាក្យសម្ងាត់ថ្មី</Label>
                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        className="h-11 rounded-xl px-10"
                        autoComplete="new-password"
                        disabled={loading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2 rounded-lg"
                        onClick={() => setShowNewPassword((value) => !value)}
                        aria-label={
                          showNewPassword ? 'លាក់ពាក្យសម្ងាត់ថ្មី' : 'បង្ហាញពាក្យសម្ងាត់ថ្មី'
                        }
                        disabled={loading}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">បញ្ជាក់ពាក្យសម្ងាត់</Label>
                    <div className="relative">
                      <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        className="h-11 rounded-xl px-10"
                        autoComplete="new-password"
                        disabled={loading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2 rounded-lg"
                        onClick={() => setShowConfirmPassword((value) => !value)}
                        aria-label={
                          showConfirmPassword
                            ? 'លាក់ការបញ្ជាក់ពាក្យសម្ងាត់'
                            : 'បង្ហាញការបញ្ជាក់ពាក្យសម្ងាត់'
                        }
                        disabled={loading}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              ) : null}

              {otpVerified ? (
                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <Button
                    type="submit"
                    className="h-11 rounded-xl text-sm font-semibold shadow-lg"
                    disabled={loading}
                  >
                    {loading ? 'កំពុងកំណត់ឡើងវិញ...' : 'កំណត់ពាក្យសម្ងាត់ឡើងវិញ'}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-xl"
                    disabled={loading}
                    onClick={() => {
                      setOtpVerified(false);
                      setSuccess('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                  >
                    ផ្លាស់ប្តូរ OTP
                  </Button>
                </div>
              ) : (
                <Button
                  type="submit"
                  className="h-11 w-full rounded-xl text-sm font-semibold shadow-lg"
                  disabled={loading}
                >
                  {loading ? 'កំពុងផ្ទៀងផ្ទាត់...' : 'ផ្ទៀងផ្ទាត់ OTP'}
                </Button>
              )}

              <Link
                href="/forgot-password"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary transition hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                ត្រឡប់ទៅជំហានអ៊ីមែល
              </Link>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
