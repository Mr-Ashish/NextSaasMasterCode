'use client';

import {
  UserGroupIcon,
  HomeIcon,
  DocumentDuplicateIcon,
  EnvelopeIcon, // Import the EnvelopeIcon for the email button
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useSubscription } from '@/app/lib/subscriptionContext';

// Define the type for links to include optional external property
interface NavLink {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  isValid: boolean;
  external?: boolean; // Indicates if the link is external
}

// Define the email address to be used in the mailto link
const EMAIL_ADDRESS = 'support@microapplab.com'; // Replace with your actual email

export default function NavLinks() {
  const pathname = usePathname();
  const subscription = useSubscription();

  const links: NavLink[] = [
    { name: 'Home', href: '/dashboard', icon: HomeIcon, isValid: true },
    {
      name: 'Invoices',
      href: '/dashboard/invoices',
      icon: DocumentDuplicateIcon,
      isValid: true, // Update condition as necessary
    },
    {
      name: 'Customers',
      href: '/dashboard/customers',
      icon: UserGroupIcon,
      isValid: true,
    },
  ];

  // Define the external "Contact Us" link separately
  const contactLink: NavLink = {
    name: 'Contact Us',
    href: `mailto:${EMAIL_ADDRESS}`,
    icon: EnvelopeIcon,
    isValid: true, // Always valid or add conditions if necessary
    external: true, // Mark as external to handle differently
  };

  return (
    <>
      {/* Render internal navigation links */}
      {links.map((link) => {
        const LinkIcon = link.icon;
        if (!link.isValid) return null;
        return (
          <TooltipProvider key={link.name} delayDuration={100}>
            <Tooltip>
              <TooltipTrigger>
                <Link
                  href={link.href}
                  className={clsx(
                    'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',
                    {
                      'bg-sky-100 text-blue-600': pathname === link.href,
                    }
                  )}
                  prefetch={true}
                >
                  <LinkIcon className="w-6 md:px-0" />
                  {/* Optionally display the name on larger screens */}
                  {/* <p className="hidden md:block">{link.name}</p> */}
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{link.name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}

      {/* Render the external "Contact Us" link */}
      {contactLink.isValid && (
        <TooltipProvider key={contactLink.name} delayDuration={100}>
          <Tooltip>
            <TooltipTrigger>
              <a
                href={contactLink.href}
                target="_blank"
                rel="noopener noreferrer"
                className={clsx(
                  'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',
                  {
                    // Optionally highlight if the current path is the contact page, though typically mailto links don't have a path
                  }
                )}
              >
                <EnvelopeIcon className="w-6 md:px-0" />
                {/* Optionally display the name on larger screens */}
                {/* <p className="hidden md:block">{contactLink.name}</p> */}
              </a>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{contactLink.name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </>
  );
}
