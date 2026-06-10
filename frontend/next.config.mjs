/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Workaround for Next.js 14 Windows race condition in build trace collection
    // for the _not-found page. All pages generate correctly; this only affects
    // the post-build trace step.
    outputFileTracingExcludes: {
      "*": ["**/_not-found/**"],
    },
  },
};

export default nextConfig;
