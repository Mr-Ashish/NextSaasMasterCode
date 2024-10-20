'use server';

import { z } from 'zod';
import {
  createUser,
  getUser,
  getUserForVerificationToken,
  getUserSubscriptions,
  setResetTokenForUser,
  updateEmailVerificationStatus,
  updateUserVerificationToken,
  getUserForResetToken,
  resetNewPasswordForUser,
} from './data';
import { redirect } from 'next/navigation';
import { signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';
import bcrypt from 'bcrypt';
import { sendEmail } from './emailActions';
import { v4 as uuidv4 } from 'uuid';

const isVerificationEmailDisabled =
  process.env.DISABLE_EMAIL_VERIFICATION === 'true';

export async function authenticateAction(email: string, password: string) {
  try {
    const response = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });
    return { success: true, response };
  } catch (error) {
    console.error('Authentication error:', JSON.stringify(error));
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { success: false, error: 'Invalid credentials.' };
        case 'CallbackRouteError': {
          const user = await getUser(email);
          if (user && !user.isVerified && !isVerificationEmailDisabled) {
            return { success: false, error: 'EmailVerificationPending' };
          }
          return { success: false, error: 'Callback route error.' };
        }
        default:
          return { success: false, error: error.message };
      }
    }
  }
}

export async function signUpAction(
  name: string,
  email: string,
  password: string
) {
  try {
    const schema = z.object({
      name: z.string().min(6),
      email: z.string().email(),
      password: z.string().min(6),
    });
    const result = schema.safeParse({ name, email, password });

    if (result.success) {
      const { email, password } = result.data;
      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationToken = isVerificationEmailDisabled ? null : uuidv4();
      // check is user already exixts
      const userExists = await getUser(email);
      if (userExists) {
        return {
          success: false,
          error: 'User already exists. Signin to continue',
        };
      }
      const user = await createUser(
        name,
        email,
        hashedPassword,
        verificationToken
      );
      if (!isVerificationEmailDisabled) {
        const response = await sendVerificationEmail(
          user.email,
          verificationToken
        );
      } else {
        const signInResult = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });
        if (!signInResult?.error) {
          return { success: true, nextRoute: '/dashboard' };
        } else {
          throw new Error(`Sign-in failed.${signInResult?.error}`);
        }
      }
      return { success: true, nextRoute: '/verify' };
    }
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        console.log(`Path: ${issue.path.join('.')}, Issue: ${issue.message}`);
      });
      return { success: false, error: result.error.issues };
    }
  } catch (error) {
    console.error('Signup error:', error);
    return { success: false };
  }
}

export async function getUserSubscriptionsAction() {
  try {
    const subscriptions = await getUserSubscriptions();
    return { success: true, subscription: subscriptions };
  } catch (error) {
    console.error('Failed to fetch subscriptions:', error);
    return { success: false, error: 'No subscripts available' };
  }
}

export async function signOutAction() {
  await signOut({ redirectTo: '/login' });
  redirect('/login');
}

export async function sendResetPasswordMailAction(email: string) {
  try {
    const user = await getUser(email);
    if (!user) throw new Error('No user found with that email address');

    // Generate reset token and send email here
    // For example, you can generate a reset token and store it in the database.
    // After that, you'd send an email to the user with a reset link containing the token.
    const resetToken = bcrypt.hashSync(user.email + Date.now(), 10);
    await setResetTokenForUser({
      email: user.email,
      resetToken,
      resetTokenExpiry: new Date(Date.now() + 3600000),
    });

    // Send email with the reset token
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
    const subject = 'Launchpad Password Reset Request';
    const htmlContent = `<p>Click the link below to reset your password:</p>
                       <a href="${resetLink}">${resetLink}</a>`;

    // await sendEmail(user.email, subject, htmlContent);
    return { success: true };
  } catch (error) {
    console.error('Failed to reset password:', error);
    return { success: false };
  }
}

async function sendVerificationEmail(toEmail, token) {
  // Define the verification URL
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  // Define email options
  const mailOptions = {
    from: process.env.EMAIL_FROM, // e.g., '"EzeMaLaunchpadiler" <no-reply@Launchpad.com>'
    to: toEmail,
    subject: 'Verify Your Email for Launchpad',
    html: `
      <p>Hi,</p>
      <p>Thank you for signing up for Launchpad. Please verify your email by clicking the link below:</p>
      <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #1D4ED8; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
      <p>If you did not sign up for this account, you can ignore this email.</p>
      <p>Thanks,<br/>The Launchpad Team</p>
    `,
  };

  // Send the email
  const sendEmailResponse = await sendEmail(
    toEmail,
    mailOptions.subject,
    mailOptions.html
  );
  return sendEmailResponse;
}

export async function checkVerificationTokenAndUpdate(
  verificationToken: string,
  email: string
) {
  const user = await getUserForVerificationToken(verificationToken, email);
  if (!user) {
    return { success: false, error: 'Invalid email or token' };
  }
  // if (user.verificationTokenExpiry < new Date()) {
  //   return { success: false, error: 'Verification token has expired.' };
  // }

  // Update the user's emailVerified field
  await updateEmailVerificationStatus(user.id, true);
  return { success: true };
}

export async function resetPasswordAction(token: string, newPassword: string) {
  // Step 1: Find user by token and check if token is still valid
  const user = await getUserForResetToken(token);
  // Step 2: Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Step 3: Update the user's password and clear the reset token and expiry
  const updatedUser = await resetNewPasswordForUser({
    userId: user.id,
    hashedPassword,
  });
  return { success: true };
}

export async function resendVerificationTokenAction(email: string) {
  const user = await getUser(email);
  if (!user) {
    return { success: false, error: 'No user found with that email address' };
  }

  if (user.isVerified) {
    return { success: false, error: 'User is already verified' };
  }

  const verificationToken = uuidv4();
  await updateUserVerificationToken(user.email, verificationToken);
  const response = await sendVerificationEmail(user.email, verificationToken);
  if (!response.success) {
    return { success: false, error: 'Failed to resend verification email' };
  }
  return { success: true };
}
