export interface LoginRequest {
  email: string;
  password: string;
  recaptcha_token: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  new_password: string;
}
