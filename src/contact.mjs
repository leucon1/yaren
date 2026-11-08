export function validateContact({ name, email, message }) {
  const errors = {};
  if (!name.trim()) errors.name = 'Lütfen adınızı yazın.';
  if (!email.trim()) errors.email = 'Lütfen e-posta adresinizi yazın.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    errors.email = 'Geçerli bir e-posta adresi yazın.';
  if (!message.trim()) errors.message = 'Lütfen mesajınızı yazın.';
  return errors;
}
