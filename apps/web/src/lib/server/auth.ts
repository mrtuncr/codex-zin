const ADMIN_TOKEN_HEADER = "x-admin-token";

export function isAdminProtectionEnabled(): boolean {
  return Boolean(process.env.ADMIN_API_TOKEN);
}

export function isAdminAuthorized(request: Request): boolean {
  const expectedToken = process.env.ADMIN_API_TOKEN;

  if (!expectedToken) {
    return true;
  }

  const incoming = request.headers.get(ADMIN_TOKEN_HEADER);
  return incoming === expectedToken;
}

export function adminHeaderName(): string {
  return ADMIN_TOKEN_HEADER;
}
