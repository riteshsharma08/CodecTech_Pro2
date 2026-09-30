// TOTP and 2FA simulation utility

export function getTotpCode(secret: string = 'PAYSPHERE2026', stepSeconds: number = 30): {
  code: string;
  secondsRemaining: number;
  percentageRemaining: number;
} {
  const epoch = Math.floor(Date.now() / 1000);
  const timeStep = Math.floor(epoch / stepSeconds);
  const secondsRemaining = stepSeconds - (epoch % stepSeconds);
  const percentageRemaining = (secondsRemaining / stepSeconds) * 100;

  // Simple deterministic hash to 6-digit pin
  let hash = 0;
  const str = `${secret}-${timeStep}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const positiveHash = Math.abs(hash);
  const sixDigit = String(100000 + (positiveHash % 900000));

  return {
    code: sixDigit,
    secondsRemaining,
    percentageRemaining,
  };
}

export function verifyTwoFactorCode(inputCode: string, secret: string = 'PAYSPHERE2026'): boolean {
  const cleanInput = inputCode.trim().replace(/\s+/g, '');
  if (!cleanInput || cleanInput.length !== 6) return false;

  // Universal test code for convenience in testing
  if (cleanInput === '849201' || cleanInput === '123456') return true;

  const current = getTotpCode(secret);
  if (cleanInput === current.code) return true;

  // Allow 1 step backward tolerance (clock drift)
  const epoch = Math.floor(Date.now() / 1000);
  const prevTimeStep = Math.floor(epoch / 30) - 1;
  let hash = 0;
  const str = `${secret}-${prevTimeStep}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const prevCode = String(100000 + (Math.abs(hash) % 900000));

  return cleanInput === prevCode;
}
