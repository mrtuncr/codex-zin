import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function withSecurityHeaders(response: NextResponse) {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "same-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  return response;
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // minimal request tracing for logs/platform edge debugging
  const traceId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  response.headers.set("x-request-id", traceId);

  return withSecurityHeaders(response);
}

export const config = {
  matcher: ["/:path*"]
};
