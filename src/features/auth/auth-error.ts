export function getAuthErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof Error)) return fallback;

  const message = error.message.trim().toLowerCase();
  if (message === "invalid login credentials" || message === "invalid_credentials") {
    return "E-mail ou senha incorretos. Confira seus dados e tente novamente.";
  }
  if (message === "email not confirmed") {
    return "Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.";
  }
  if (message.includes("already registered") || message.includes("already been registered") || message.includes("email address has already")) {
    return "Este e-mail já está cadastrado. Entre na sua conta ou use a opção de recuperar senha.";
  }
  if (message.includes("rate limit") || message.includes("too many requests")) {
    return "Muitas tentativas recentes. Aguarde alguns minutos antes de tentar novamente.";
  }

  return error.message || fallback;
}
