// ✅ COMPONENTE LAYOUT GLOBAL TIPO NOTION

import React from 'react';

const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans px-4 py-6">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6 pb-3 border-b border-slate-700">
          <h1 className="text-3xl font-bold tracking-tight">Quickflow</h1>
          <p className="text-sm text-slate-400">Tu espacio de productividad</p>
        </header>
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
