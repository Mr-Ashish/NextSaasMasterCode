'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  checkVerificationTokenAndUpdate,
  resendVerificationTokenAction,
} from '@/app/lib/authActions';
import Link from 'next/link';

export default function VerifyEmail() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('Verification Pending.');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [resendStatus, setResendStatus] = useState('');

  useEffect(() => {
    // Extract token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, []);

  const verifyEmail = async (token: string, email: string) => {
    if (!token || !email) {
      setError('Please enter your email and verification code.');
      return;
    }
    try {
      const response = await checkVerificationTokenAndUpdate(token, email);
      if (response.success) {
        setStatus('Email verified successfully! Redirecting to login...');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setStatus('Verification failed.');
        setError(response.error || 'An error occurred during verification.');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setStatus('Verification failed.');
      setError('An unexpected error occurred.');
    }
  };

  const resendVerificationCode = async () => {
    if (!email) {
      setError('Please enter your email to resend the verification code.');
      return;
    }
    try {
      const response = await resendVerificationTokenAction(email);
      if (response.success) {
        setResendStatus('Verification code resent! Check your email.');
      } else {
        setResendStatus('Failed to resend verification code.');
      }
    } catch (err) {
      console.error('Resend verification error:', err);
      setResendStatus('An unexpected error occurred.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      {/* Ezemailer Heading */}
      <h1 className="text-4xl font-bold">EzeMailer</h1>

      {/* Verification Card */}
      <Card className="mx-auto w-96 max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Email Verification</CardTitle>
          <CardDescription>
            {error ? 'Please enter your email and verification code.' : status}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="token">Verification Code</Label>
                <Button
                  variant="link"
                  className="ml-auto text-sm"
                  onClick={resendVerificationCode}
                >
                  Resend Verification Code
                </Button>
              </div>
              <Input
                id="token"
                placeholder="Enter your verification code"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
              />
            </div>
            <Button
              type="button"
              className="w-full"
              onClick={() => verifyEmail(token, email)}
            >
              Verify Email
            </Button>
            {resendStatus && (
              <p className="mt-2 text-sm text-blue-500">{resendStatus}</p>
            )}
          </div>

          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </CardContent>
      </Card>
      <div className="mt-6 text-center">
        <p className="text-sm">
          Already have a verified account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            Sign In
          </Link>
        </p>
        <p className="text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
