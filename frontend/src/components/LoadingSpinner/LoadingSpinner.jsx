import React from 'react';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
      <div className={`animate-spin rounded-full border-t-transparent border-primary ${sizeClasses[size] || sizeClasses.md}`}></div>
    </div>
  );
};

export default LoadingSpinner;
