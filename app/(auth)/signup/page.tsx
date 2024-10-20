'use client';

import Link from 'next/link';
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
import { useState } from 'react';
import { signUpAction } from '@/app/lib/authActions';
import { useRouter } from 'next/navigation'; // Client-side navigation

export default function SignUpForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isPending, setIsPending] = useState(false);
  const router = useRouter(); // Next.js router for navigation

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // Basic validation for empty fields
    if (!name || !email || !password) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    setIsPending(true);
    setErrorMessage('');

    try {
      const result = await signUpAction(name, email, password);
      if (result?.success) {
        // Redirect to the dashboard after successful sign-up and sign-in
        router.push(result.nextRoute);
      } else {
        console.error(result);
        const error = result?.error
          ? result?.error.map((e) => `${e.path[0]}:${e.message}`).join('/n')
          : 'An error occurred during sign-up. Please try again.';
        setErrorMessage(error);
      }
    } catch (error) {
      setErrorMessage('An error occurred during sign-up. Please try again.');
      console.error(error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      {/* Launchpad Heading */}
      <h1 className="text-4xl font-bold">Launchpad</h1>

      {/* Sign Up Card */}
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Max"
                  required
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? 'Creating account...' : 'Create an account'}
              </Button>
              {errorMessage && (
                <p className="mt-2 text-sm text-red-500">{errorMessage}</p>
              )}
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
