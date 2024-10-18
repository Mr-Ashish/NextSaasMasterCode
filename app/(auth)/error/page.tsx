'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AuthError() {
  const router = useRouter();
  // const { error } = router.query;

  const getErrorMessage = (error: any) => {
    switch (error) {
      case 'CredentialsSignin':
        return 'Invalid email or password.';
      case 'Please verify your email before signing in':
        return 'Please verify your email before signing in.';
      default:
        return 'An unknown error occurred.';
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-4 text-2xl font-bold text-gray-800">
          Authentication Error
        </h1>
        <p className="mb-4 text-gray-600">{getErrorMessage('error')}</p>
        <Link href="/login">
          <a className="text-blue-600 hover:underline">Go back to login</a>
        </Link>
      </div>
    </div>
  );
}
