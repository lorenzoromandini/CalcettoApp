import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';
import NextLink from 'next/link';

export const { Link: IntlLink, redirect, usePathname, useRouter } = createNavigation(routing);

// Esporta Link normale di Next.js per evitare prefisso locale
export const Link = NextLink;
