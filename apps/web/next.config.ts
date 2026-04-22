import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@ustaca/ai", "@ustaca/config", "@ustaca/email", "@ustaca/ui"]
};

export default nextConfig;

