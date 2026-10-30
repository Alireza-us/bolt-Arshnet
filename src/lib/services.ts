import {
  Video,
  Phone,
  Network,
  Cable,
  Headphones,
  HardDriveDownload,
} from 'lucide-react';

export type ServiceSlug = 'cameras' | 'voip' | 'network';

export type ServiceMeta = {
  slug: ServiceSlug;
  route: `/${ServiceSlug}`;
  title: string;
  short: string;
  icon: typeof Video;
  color: string;
};

export const SERVICES: ServiceMeta[] = [
  {
    slug: 'cameras',
    route: '/cameras',
    title: 'CCTV & IP Cameras',
    short: 'See your premises from anywhere — clear footage, remote access, day and night.',
    icon: Video,
    color: '#2F6BFF',
  },
  {
    slug: 'voip',
    route: '/voip',
    title: 'VoIP Phone Systems',
    short: 'Professional phones, auto-attendant and call routing over your internet line.',
    icon: Phone,
    color: '#5C8CFF',
  },
  {
    slug: 'network',
    route: '/network',
    title: 'Network & Helpdesk Support',
    short: 'Reliable Wi-Fi, secure firewalls and a friendly helpdesk you can actually reach.',
    icon: Network,
    color: '#3B82F6',
  },
];

export const TRUST_BRANDS = [
  'Hikvision',
  'Ubiquiti',
  'MikroTik',
  '3CX',
  'FreePBX',
  'Grandstream',
];

export const STEPS = [
  {
    icon: Phone,
    title: 'Free consultation',
    desc: 'A short call to understand what you need — no obligation, no jargon.',
  },
  {
    icon: Cable,
    title: 'Site survey',
    desc: 'I visit your premises, check cabling and coverage, and give you a clear quote.',
  },
  {
    icon: HardDriveDownload,
    title: 'Installation',
    desc: 'Clean, tidy setup and configuration, fully tested before handover.',
  },
  {
    icon: Headphones,
    title: 'Support',
    desc: 'Ongoing help and a monthly plan option so problems get fixed fast.',
  },
];
