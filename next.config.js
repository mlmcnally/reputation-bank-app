/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // IMPORTANT:
      // This rewrites only "clean" routes (no file extension) to "/"
      // while allowing real files (like /page-29.html and /page-28.jpg)
      // and Next internals to pass through untouched.
      {
        source: "/:path((?!api|_next|.*\\..*).*)",
        destination: "/",
      },
    ];
  },
};

module.exports = nextConfig;

