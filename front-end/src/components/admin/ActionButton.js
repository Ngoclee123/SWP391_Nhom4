import React from 'react';

const ActionButton = React.memo(({ icon: Icon, onClick, color = 'blue', tooltip }) => (
  <button
    onClick={onClick}
    className={`p-2 text-${color}-600 hover:text-${color}-800 hover:bg-${color}-50 rounded-lg transition-colors`}
    title={tooltip}
  >
    <Icon className="w-4 h-4" />
  </button>
));

export default ActionButton;