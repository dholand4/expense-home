import nodemailer from 'nodemailer';

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendResetPasswordEmail(to, token) {
  if (!process.env.SMTP_HOST) {
    console.log(`[MAILER] Reset token para ${to}: ${token}`);
    return;
  }

  const transporter = createTransport();

  try {
    await transporter.verify();
  } catch (err) {
    console.error('[MAILER] Falha na conexão SMTP:', err.message);
    throw new Error('Serviço de e-mail indisponível. Tente novamente mais tarde.');
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? 'DQ Financas <noreply@dqfinancas.app>',
    to,
    subject: 'Seu codigo de recuperacao - DQ Financas',
    headers: {
      'X-Priority': '1',
      'X-Mailer': 'DQ-Financas-Mailer',
    },
    text: `Seu codigo de recuperacao de senha e: ${token}\n\nEle expira em 1 hora e pode ser usado apenas uma vez.\n\nSe nao foi voce, ignore este e-mail.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:0;background:#0e110f;border-radius:16px;overflow:hidden">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#1a2e24,#0e110f);padding:32px 32px 24px;border-bottom:1px solid #2b312e">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">
            <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#25a77c,#43d5a5);display:inline-block;vertical-align:middle"></div>
            <span style="font-size:20px;font-weight:800;color:#e8ece9;vertical-align:middle;margin-left:10px">DQ Finanças</span>
          </div>
          <p style="color:#798680;font-size:13px;margin:8px 0 0">Recuperação de senha</p>
        </div>
        <!-- Body -->
        <div style="padding:32px">
          <p style="color:#e8ece9;font-size:15px;margin:0 0 24px;line-height:1.6">
            Use o código abaixo para redefinir sua senha. Ele é válido por <strong style="color:#43d5a5">1 hora</strong> e pode ser usado apenas uma vez.
          </p>
          <!-- Código -->
          <div style="background:#151917;border:1px solid #2b312e;border-radius:12px;padding:28px 16px;text-align:center;margin:0 0 24px">
            <p style="color:#798680;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 12px">Seu código</p>
            <span style="font-family:monospace;font-size:38px;font-weight:700;letter-spacing:10px;color:#43d5a5">${token}</span>
          </div>
          <p style="color:#798680;font-size:13px;line-height:1.6;margin:0">
            Cole esse código na tela de recuperação de senha do app ou do site.<br/>
            Se não foi você, ignore este e-mail — sua conta está segura.
          </p>
        </div>
        <!-- Footer -->
        <div style="padding:16px 32px;border-top:1px solid #2b312e">
          <p style="color:#4a5450;font-size:11px;margin:0;text-align:center">DQ Finanças · Controle financeiro inteligente</p>
        </div>
      </div>
    `,
  });
}
