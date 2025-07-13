import React from 'react';

const Toast = ({ message, onClose }) => (
  <div className="fixed top-5 right-5 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50">
    {message}
    <button className="ml-4" onClick={onClose}>✕</button>
  </div>
);

export default Toast;