import React from 'react'

export default function Card({ title, children, imageAlt = '', imageSrc = null, className = '' }) {
  return (
    <article className={`card ${className}`} role="article" aria-label={title}>
      {imageSrc && <img src={imageSrc} alt={imageAlt} className="card-media" />}
      {title && <header className="card-header">{title}</header>}
      <div className="card-body">{children}</div>
    </article>
  );
}
