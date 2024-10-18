import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import Image from 'next/image';

export default function AcmeLogo() {
  return (
    <div
      className={`${lusitana.className} flex flex-row items-center leading-none text-white`}
    >
      <Image
        src="/envelope.svg"
        className="h-8 w-8"
        width={8}
        height={8}
        alt="envelope"
      />
    </div>
  );
}
