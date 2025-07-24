// src/components/DashboardLayout.jsx
import React from 'react';

const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white font-sans">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
