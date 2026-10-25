/** @type {import('next').NextConfig} */
const nextConfig = {
  // 개발 서버(next dev)에 같은 네트워크의 휴대폰 등으로 접속해 테스트할 때 허용할 origin.
  // 배포(build/start)에는 영향이 없다.
  allowedDevOrigins: ["172.30.1.*"],
};

export default nextConfig;
