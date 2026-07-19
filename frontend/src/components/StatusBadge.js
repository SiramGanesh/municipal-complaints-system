// ============================================
// Status Badge Component
// ============================================
// A small colored badge that shows complaint status.
// Each status gets a different color:
//   - Registered: blue
//   - In Progress: orange
//   - Resolved: green
//   - Escalated: red
// ============================================

import React from 'react';

const StatusBadge = ({ status }) => {
  // Determine the Tailwind classes based on status
  const getClassName = () => {
    switch (status) {
      case 'Registered':
        return 'inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase bg-blue-100 text-blue-800';
      case 'In Progress':
        return 'inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase bg-yellow-100 text-yellow-800';
      case 'Resolved':
        return 'inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase bg-green-100 text-green-800';
      case 'Escalated':
        return 'inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase bg-red-100 text-red-800';
      case 'Rejected':
        return 'inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase bg-gray-200 text-gray-800';
      default:
        return 'inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase bg-gray-100 text-gray-800';
    }
  };

  return <span className={getClassName()}>{status}</span>;
};

export default StatusBadge;
