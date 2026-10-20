import React from 'react';
import { BarChart3, Download, FileSpreadsheet } from 'lucide-react';

export default function ReportsPlaceholder() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Reportes & Estadísticas</h1>
          <p className="text-sm text-slate-500">Métricas consolidadas de rotación, entregas a tiempo y auditoría de stock.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center mx-auto">
          <BarChart3 className="w-8 h-8" />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h2 className="text-lg font-bold text-slate-800">Centro de Reportes NexusLogix</h2>
          <p className="text-sm text-slate-500">
            Descarga de reportes operativos en PDF y Excel integrados con los datos del almacén.
          </p>
        </div>

        <div className="pt-4 flex justify-center gap-3">
          <button disabled className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-400 rounded-xl text-sm font-medium cursor-not-allowed">
            <FileSpreadsheet className="w-4 h-4" />
            Exportar XLSX (Próximamente)
          </button>
        </div>
      </div>
    </div>
  );
}
