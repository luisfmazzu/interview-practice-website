import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
  return (
    <div className={`card ${className}`}>
      {title && (
        <h2 className="text-2xl font-bold mb-6 text-gray-900">{title}</h2>
      )}
      {children}
    </div>
  );
};

export default Card;