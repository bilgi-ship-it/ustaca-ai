import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@ustaca/auth", "@ustaca/config", "@ustaca/domain", "@ustaca/types", "@ustaca/ui"]
};

export default nextConfig;

