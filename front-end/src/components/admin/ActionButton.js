import React from 'react';

const ActionButton = React.memo(({ icon: Icon, onClick, variant = 'primary', size = 'md', disabled = false, children }) => {
  const getVariantClasses = (variant) => {
    switch (variant) {
      case 'danger':
        return 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/25';
      case 'success':
        return 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/25';
      case 'warning':
        return 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-yellow-500/25';
      case 'secondary':
        return 'bg-gray-500 hover:bg-gray-600 text-white shadow-gray-500/25';
      case 'outline':
        return 'bg-transparent border-2 border-blue-500 text-blue-600 hover:bg-blue-50';
      default:
        return 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/25';
    }
  };

  const getSizeClasses = (size) => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2 text-sm';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2 text-sm';
    }
  };

  const baseClasses = `
    inline-flex items-center justify-center space-x-2
    font-semibold rounded-xl transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    shadow-lg hover:shadow-xl transform hover:scale-105
  `;

  const variantClasses = getVariantClasses(variant);
  const sizeClasses = getSizeClasses(size);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${sizeClasses}`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
});

export default ActionButton;