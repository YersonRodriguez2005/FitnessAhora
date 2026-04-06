// src/utils/validations.ts

export const validateName = (name: string): string | null => {
  if (!name.trim()) return "El nombre es obligatorio.";
  if (name.length < 3) return "El nombre debe tener al menos 3 caracteres.";
  // Solo permite letras y espacios
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
  if (!nameRegex.test(name)) return "El nombre solo puede contener letras.";
  return null; // Null significa que no hay error
};

export const validateEmail = (email: string): string | null => {
  if (!email.trim()) return "El correo es obligatorio.";
  // Regex estándar y estricto para correos electrónicos
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Ingresa un correo electrónico válido.";
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return "La contraseña es obligatoria.";
  if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
  
  // Reglas estrictas: 1 Mayúscula, 1 Minúscula, 1 Número, 1 Carácter Especial
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!hasUpperCase) return "Debe contener al menos una letra mayúscula.";
  if (!hasLowerCase) return "Debe contener al menos una letra minúscula.";
  if (!hasNumbers) return "Debe contener al menos un número.";
  if (!hasSpecialChar) return "Debe contener al menos un carácter especial (!@#$...).";
  
  return null;
};