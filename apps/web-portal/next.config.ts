import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack có thể gây treo máy trên Windows nếu nhận diện sai root.
  // Chúng ta sẽ giới hạn phạm vi quét của nó.
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
