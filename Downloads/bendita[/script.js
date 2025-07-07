// Login
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const senha = document.getElementById('senha').value;

      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });

      const data = await response.json();
      if (data.success) {
        localStorage.setItem('usuario', data.nome);
        window.location.href = 'dashboard.html';
      } else {
        document.getElementById('loginMsg').innerText = 'Login inválido';
      }
    });
  }

  // Dashboard
  const usuarioNome = document.getElementById('usuarioNome');
  if (usuarioNome) {
    const nome = localStorage.getItem('usuario');
    usuarioNome.textContent = `Olá, ${nome}`;
  }
});

function logout() {
  localStorage.removeItem('usuario');
  window.location.href = 'index.html';
}
