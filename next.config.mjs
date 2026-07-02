/** @type {import('next').NextConfig} */
const nextConfig = {
  // All pages use Supabase auth — disable static optimization
  experimental: {},
  // Make env vars available at runtime
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
};

export default nextConfig;
