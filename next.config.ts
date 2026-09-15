import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Das Dev-Overlay hält die Seite dauerhaft "busy" und blockiert
  // automatisierte Screenshots. Auf die Produktion hat das keinen Einfluss.
  devIndicators: false,
};

export default nextConfig;
