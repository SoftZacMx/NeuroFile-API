import 'dotenv/config';
import { EmailService } from '../src/infrastructure/services/EmailServiceImpl';

const required = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'EMAIL_FROM', 'FRONTEND_URL'] as const;

function checkEnv(): boolean {
  let ok = true;
  console.log('\n📋 Variables de entorno (correo / reset de contraseña)\n');

  for (const key of required) {
    const value = process.env[key];
    const missing = !value || value.includes('your_') || value.includes('TU_SMTP');
    const status = missing ? '❌' : '✅';
    const display =
      key === 'SMTP_PASS' ? (value ? '***' : '(vacío)') : (value ?? '(vacío)');
    console.log(`  ${status} ${key}=${display}`);
    if (missing) ok = false;
  }

  console.log(`\n  ℹ️  VITE_API_BASE_URL (frontend): ${process.env.VITE_API_BASE_URL ?? 'definir en NeuroFile-Frontend/.env'}`);
  console.log(`  ℹ️  Enlace de reset esperado: ${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/reset-password?token=...\n`);

  return ok;
}

async function main() {
  if (!checkEnv()) {
    console.error('⚠️  Completa las variables faltantes en NeuroFile-API/.env\n');
    process.exit(1);
  }

  const emailService = new EmailService();
  console.log('🔌 Probando conexión SMTP...\n');

  const connected = await emailService.verifyConnection();
  if (connected) {
    console.log('✅ Conexión SMTP OK (credenciales y host válidos)\n');
    process.exit(0);
  }

  console.error('❌ No se pudo conectar al servidor SMTP. Revisa SMTP_HOST, SMTP_USER y SMTP_PASS.\n');
  process.exit(1);
}

main();
