import React from 'react'

export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = 'touch-target inline-flex items-center gap-2';
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
  };

  const cls = `${base} ${variants[variant] || variants.primary} ${className}`.trim();

  return (
    <button className={cls} {...props}>
      {children}
    </button>
  );
}
