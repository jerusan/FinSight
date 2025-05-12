import React, { ReactNode } from 'react';
interface CardProps {
  title: string;
  children: ReactNode;
  className?: string;
}
export const Card = ({
  title,
  children,
  className = ''
}: CardProps) => {
  return <div className={`bg-white rounded-xl shadow-sm p-5 h-full ${className}`}>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>
      {children}
    </div>;
};