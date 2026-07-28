import * as authService from '../services/auth.service.js';

export async function login(req, res) {
  const data = await authService.login(req.body.email, req.body.password);
  res.json(data);
}

export async function register(req, res) {
  const data = await authService.register(req.body.email, req.body.password, req.body.full_name);
  res.status(201).json(data);
}

export async function getMe(req, res) {
  const user = await authService.getMe(req.user.id);
  res.json({ user });
}

export async function logout(_req, res) {
  res.json({ message: 'Logged out — discard your token client-side' });
}

export async function invite(req, res) {
  const data = await authService.invite(req.body.email, req.body.full_name, req.body.role);
  res.status(201).json(data);
}

export async function acceptInvite(req, res) {
  const data = await authService.acceptInvite(req.body.token, req.body.password);
  res.json(data);
}

export async function forgotPassword(req, res) {
  await authService.forgotPassword(req.body.email);
  res.json({ message: 'E-mail enviado' });
}

export async function resetPassword(req, res) {
  await authService.resetPassword(req.body.token, req.body.password);
  res.json({ message: 'Senha redefinida com sucesso' });
}

export async function resetRedirect(req, res) {
  const token = req.query.token ?? '';

  res.setHeader('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Redefinir senha — DQ Finanças</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0e110f; color: #e8ece9;
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; min-height: 100vh; padding: 24px;
    }
    .card {
      background: #151917; border: 1px solid #2b312e;
      border-radius: 16px; padding: 32px 24px;
      width: 100%; max-width: 420px; text-align: center;
    }
    .logo { color: #25a77c; font-size: 22px; font-weight: 800; margin-bottom: 8px; }
    .subtitle { color: #798680; font-size: 14px; margin-bottom: 28px; }
    .label { color: #798680; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px; }
    .token-box {
      background: #0e110f; border: 1px solid #2b312e; border-radius: 10px;
      padding: 14px; font-family: monospace; font-size: 11px;
      color: #43d5a5; word-break: break-all; line-height: 1.6;
      margin-bottom: 20px; text-align: left;
    }
    .btn {
      display: block; width: 100%;
      background: #25a77c; color: #fff;
      border: none; border-radius: 12px;
      padding: 16px; font-size: 16px; font-weight: 700;
      cursor: pointer; margin-bottom: 12px;
      transition: background 0.2s;
    }
    .btn:active { background: #1d8a65; }
    .btn.copied { background: #16a34a; }
    .hint { color: #798680; font-size: 12px; margin-top: 16px; line-height: 1.5; }
    .hint strong { color: #e8ece9; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">💳 DQ Finanças</div>
    <div class="subtitle">Redefinição de senha</div>
    <div class="label">Seu código de recuperação</div>
    <div class="token-box" id="token">${token}</div>
    <button class="btn" id="copyBtn" onclick="copyToken()">Copiar código</button>
    <div class="hint">
      Após copiar, volte ao app em<br/>
      <strong>Login → Esqueci minha senha → Já recebi o código</strong><br/>
      e cole o código no campo indicado.
    </div>
  </div>
  <script>
    function copyToken() {
      var token = document.getElementById('token').innerText;
      var btn = document.getElementById('copyBtn');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(token).then(function() {
          btn.textContent = '✓ Copiado!';
          btn.classList.add('copied');
          setTimeout(function() {
            btn.textContent = 'Copiar código';
            btn.classList.remove('copied');
          }, 3000);
        });
      } else {
        // Fallback para Android mais antigo
        var el = document.createElement('textarea');
        el.value = token;
        el.style.position = 'fixed';
        el.style.opacity = '0';
        document.body.appendChild(el);
        el.focus(); el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        btn.textContent = '✓ Copiado!';
        btn.classList.add('copied');
        setTimeout(function() {
          btn.textContent = 'Copiar código';
          btn.classList.remove('copied');
        }, 3000);
      }
    }
  </script>
</body>
</html>`);
}
