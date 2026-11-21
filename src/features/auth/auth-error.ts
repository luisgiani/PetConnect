export function getAuthErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof Error)) return fallback;

  const message = error.message.trim().toLowerCase();
  if (message === "invalid login credentials" || message === "invalid_credentials") {
    return "E-mail ou senha incorretos. Confira seus dados e tente novamente.";
  }
  if (message === "email not confirmed") {
    return "Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.";
  }

  return error.message || fallback;
}
