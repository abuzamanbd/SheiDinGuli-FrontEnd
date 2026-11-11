/** What the ASP.NET API returns for register / login / refresh (camelCase JSON). */
export interface AuthResult {
  userId: string;
  username: string;
  displayName: string;
  email: string | null;
  onboardingCompleted: boolean;
  usernameConfirmed: boolean;
  accessToken: string;
  accessTokenExpiresAtUtc: string;
  refreshToken: string;
  refreshTokenExpiresAtUtc: string;
  roles: string[];
}

/** What the browser is allowed to know about the signed-in user. Contains no tokens. */
export interface SessionUser {
  id: string;
  username: string;
  displayName: string;
  onboardingCompleted: boolean;
  roles: string[];
}

export interface AuthFormError {
  message: string;
  fields?: Record<string, string>;
}
