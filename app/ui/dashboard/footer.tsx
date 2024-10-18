// components/Footer.jsx

'use client';

import React from 'react';
import { EnvelopeIcon } from '@heroicons/react/24/outline'; // Import the EnvelopeIcon

const Footer = () => {
  const EMAIL_ADDRESS = 'support@microapplab.com'; // Replace with your actual email

  return (
    <footer className="fixed bottom-0 left-0 flex w-full items-center justify-center bg-gray-800 p-2 text-sm text-white">
      <EnvelopeIcon className="mr-2 h-5 w-5" aria-hidden="true" />
      <a href={`mailto:${EMAIL_ADDRESS}`} className="underline">
        {EMAIL_ADDRESS}
      </a>
    </footer>
  );
};

export default Footer;
