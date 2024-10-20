'use client';

import Link from 'next/link';
import { Suspense, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  sendResetPasswordMailAction,
  resetPasswordAction,
} from '@/app/lib/authActions';

function ForgotPasswordFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [token, setToken] = useState('');

  // Fetch the token from the search parameters
  useEffect(() => {
    const tokenFromQuery = searchParams.get('token');
    if (tokenFromQuery) {
      setToken(tokenFromQuery);
    }
  }, [searchParams]);

  const handleResetRequest = async (e: any) => {
    e.preventDefault();

    if (!email) {
      setErrorMessage('Please enter a valid email.');
      return;
    }

    setIsPending(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await sendResetPasswordMailAction(email);

      if (response.success) {
        setSuccessMessage('A password reset link has been sent to your email.');
      } else {
        setErrorMessage('Failed to send reset link.');
      }
    } catch (error) {
      setErrorMessage('An error occurred. Please try again later.');
    } finally {
      setIsPending(false);
    }
  };

  const handleResetPassword = async (e: any) => {
    e.preventDefault();

    if (!email || !newPassword) {
      setErrorMessage('Please fill in all the required fields.');
      return;
    }

    setIsPending(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await resetPasswordAction(token, newPassword);

      if (response.success) {
        setSuccessMessage('Your password has been successfully reset.');
        router.push('/login');
      } else {
        setErrorMessage('Failed to reset password.');
      }
    } catch (error) {
      setErrorMessage('An error occurred. Please try again later.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <h1 className="text-4xl font-bold">LaunchPad</h1>

      {token ? (
        <Card className="mx-auto max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Reset Password</CardTitle>
            <CardDescription>
              Please confirm your email and set a new password.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleResetPassword}>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="m@example.com"
                    required
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    name="newPassword"
                    placeholder="Enter new password"
                    required
                    onChange={(e) => setNewPassword(e.target.value)}
                    value={newPassword}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? 'Resetting...' : 'Reset Password'}
                </Button>
                {errorMessage && (
                  <p className="mt-2 text-sm text-red-500">{errorMessage}</p>
                )}
                {successMessage && (
                  <p className="mt-2 text-sm text-green-500">
                    {successMessage}
                  </p>
                )}
              </div>
              <div className="mt-4 text-center text-sm">
                Remember your password?{' '}
                <Link href="/login" className="text-blue-600 hover:underline">
                  Sign in
                </Link>
              </div>
            </CardContent>
          </form>
        </Card>
      ) : (
        <Card className="mx-auto max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Forgot Password</CardTitle>
            <CardDescription>
              Enter your email below and we&apos;ll send you a password reset
              link.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleResetRequest}>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="m@example.com"
                    required
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? 'Sending...' : 'Send Reset Link'}
                </Button>
                {errorMessage && (
                  <p className="mt-2 text-sm text-red-500">{errorMessage}</p>
                )}
                {successMessage && (
                  <p className="mt-2 text-sm text-green-500">
                    {successMessage}
                  </p>
                )}
              </div>
              <div className="mt-4 text-center text-sm">
                Remember your password?{' '}
                <Link href="/login" className="text-blue-600 hover:underline">
                  Sign in
                </Link>
              </div>
            </CardContent>
          </form>
        </Card>
      )}
    </div>
  );
}

export default function ForgotPasswordForm() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ForgotPasswordFormContent />
    </Suspense>
  );
}
