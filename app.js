(() => {
  'use strict';

  const form = document.getElementById('reg-form');
  if (!form) return;

  const fields = {
    email:    { el: document.getElementById('f-email'),    err: document.getElementById('err-email') },
    login:    { el: document.getElementById('f-login'),    err: document.getElementById('err-login') },
    password: { el: document.getElementById('f-password'), err: document.getElementById('err-password') },
  };
  const submitBtn = document.getElementById('f-submit');
  const toastEl = document.getElementById('toast');

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const LOGIN_RE = /^[A-Za-z0-9_\-]{3,32}$/;

  const validators = {
    email: (v) => {
      if (!v) return 'Введите e-mail';
      if (v.length > 120) return 'Слишком длинный e-mail';
      if (!EMAIL_RE.test(v)) return 'Некорректный e-mail';
      return '';
    },
    login: (v) => {
      if (!v) return 'Введите логин';
      if (!LOGIN_RE.test(v)) return '3–32 символа: A–Z, 0–9, _ -';
      return '';
    },
    password: (v) => {
      if (!v) return 'Введите пароль';
      if (v.length < 8) return 'Минимум 8 символов';
      if (v.length > 128) return 'Слишком длинный пароль';
      return '';
    },
  };

  function setError(key, msg) {
    const { el, err } = fields[key];
    err.textContent = msg;
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }

  function clearErrors() {
    Object.keys(fields).forEach(k => setError(k, ''));
  }

  function readForm() {
    return {
      email:    fields.email.el.value.trim(),
      login:    fields.login.el.value.trim(),
      password: fields.password.el.value,
    };
  }

  function validate(data) {
    let ok = true;
    for (const k of Object.keys(validators)) {
      const msg = validators[k](data[k]);
      setError(k, msg);
      if (msg) ok = false;
    }
    return ok;
  }

  let toastTimer = null;
  function showToast(title, body, isError) {
    toastEl.textContent = '';
    const t = document.createElement('div');
    t.className = 'toast__title';
    t.textContent = title;
    const b = document.createElement('div');
    b.className = 'toast__body';
    b.textContent = body;
    toastEl.appendChild(t);
    toastEl.appendChild(b);
    toastEl.classList.toggle('is-error', !!isError);
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 4500);
  }

  function registerApi(payload) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ok: true, id: Math.floor(Math.random() * 1e9).toString(36) });
      }, 700);
    });
  }

  let inFlight = false;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (inFlight) return;

    clearErrors();
    const data = readForm();
    if (!validate(data)) return;

    inFlight = true;
    submitBtn.disabled = true;
    submitBtn.classList.add('is-loading');

    try {
      const res = await registerApi(data);
      if (res && res.ok) {
        form.reset();
        showToast('Регистрация прошла успешно', 'Проверьте почту — мы пришлём дальнейшие инструкции.', false);
      } else {
        showToast('Не удалось зарегистрироваться', 'Попробуйте ещё раз чуть позже.', true);
      }
    } catch (_) {
      showToast('Ошибка сети', 'Проверьте подключение и повторите попытку.', true);
    } finally {
      inFlight = false;
      submitBtn.disabled = false;
      submitBtn.classList.remove('is-loading');
    }
  });

  Object.keys(fields).forEach(k => {
    fields[k].el.addEventListener('input', () => {
      if (fields[k].err.textContent) setError(k, '');
    });
  });
})();
