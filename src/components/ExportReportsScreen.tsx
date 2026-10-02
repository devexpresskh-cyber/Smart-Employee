import React, { useState } from 'react';
import {
  Calendar,
  Activity,
  Clock,
  ClockAlert,
  WalletCards,
  FileText,
  FileSpreadsheet,
  Download,
  Printer,
  X,
  CheckCircle2
} from 'lucide-react';
import { fetchReportDataAPI } from '../api/client';
import { Language, translations } from '../i18n/translations';

interface ExportReportsScreenProps {
  lang?: Language;
}

export const ExportReportsScreen: React.FC<ExportReportsScreenProps> = ({ lang = 'en' }) => {
  const t = translations[lang];
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [pdfPreviewData, setPdfPreviewData] = useState<{
    title: string;
    headers: string[];
    rows: Array<Record<string, string | number>>;
    generatedAt: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  // Trigger real CSV download
  const handleDownloadCSV = async (reportType: string, reportName: string) => {
    try {
      setLoading(true);
      window.open(`/api/reports/export/${reportType}?format=csv`, '_blank');
      setDownloadSuccess(`Downloaded ${reportName} (CSV)`);
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Trigger Excel format download (.xls XML formatted)
  const handleDownloadExcel = async (reportType: string, reportName: string) => {
    try {
      setLoading(true);
      const data = await fetchReportDataAPI(reportType);
      
      let tableHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>${reportName}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>
      <body>
      <h2>Marketing Landmark - ${data.title}</h2>
      <p>Export Date: ${new Date().toLocaleDateString()}</p>
      <table border="1">
      <thead><tr>${data.headers.map((h: string) => `<th style="background-color:#2563EB;color:#ffffff;">${h}</th>`).join('')}</tr></thead>
      <tbody>
      ${data.rows.map((row: any) => `<tr>${data.headers.map((h: string) => `<td>${row[h] ?? ''}</td>`).join('')}</tr>`).join('')}
      </tbody>
      </table>
      </body></html>`;

      const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportType}_report_${Date.now()}.xls`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloadSuccess(`Downloaded ${reportName} (Excel)`);
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPDF = async (reportType: string) => {
    try {
      setLoading(true);
      const data = await fetchReportDataAPI(reportType);
      setPdfPreviewData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const reportsList = [
    {
      id: 'attendance',
      title: t.attendanceReport,
      subtitle: t.attendanceSub,
      icon: Calendar,
      color: 'blue'
    },
    {
      id: 'productivity',
      title: t.productivityReport,
      subtitle: t.productivitySub,
      icon: Activity,
      color: 'purple'
    },
    {
      id: 'late',
      title: t.lateReport,
      subtitle: t.lateSub,
      icon: ClockAlert,
      color: 'amber'
    },
    {
      id: 'overtime',
      title: t.overtimeReport,
      subtitle: t.overtimeSub,
      icon: Clock,
      color: 'rose'
    },
    {
      id: 'payroll',
      title: t.payrollReport,
      subtitle: t.payrollSub,
      icon: WalletCards,
      color: 'emerald'
    }
  ];

  return (
    <div className="flex flex-col min-h-full px-4 sm:px-8 py-5 pb-24 max-w-6xl mx-auto w-full">
      {/* Title & Subtitle */}
      <div className="mb-5">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {t.exportReports}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {t.downloadAnyReport}
        </p>
      </div>

      {downloadSuccess && (
        <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* 5 Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportsList.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 shadow-xs hover:border-blue-200 transition-colors"
            >
              {/* Report Header */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                    item.color === 'blue'
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                      : item.color === 'purple'
                      ? 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400'
                      : item.color === 'amber'
                      ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                      : item.color === 'rose'
                      ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                      : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {item.subtitle}
                  </p>
                </div>
              </div>

              {/* 3 Action Buttons [PDF] [Excel] [CSV] */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleOpenPDF(item.id)}
                  disabled={loading}
                  className="py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-700/60 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200/80 dark:border-slate-600 flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>{t.pdf}</span>
                </button>

                <button
                  onClick={() => handleDownloadExcel(item.id, item.title)}
                  disabled={loading}
                  className="py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-700/60 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200/80 dark:border-slate-600 flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t.excel}</span>
                </button>

                <button
                  onClick={() => handleDownloadCSV(item.id, item.title)}
                  disabled={loading}
                  className="py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-700/60 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200/80 dark:border-slate-600 flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                >
                  <Download className="w-3.5 h-3.5 text-purple-600" />
                  <span>{t.csv}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* PDF Print Preview Modal */}
      {pdfPreviewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t.pdfPrintPreview}
                </h3>
              </div>
              <button
                onClick={() => setPdfPreviewData(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document sheet body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1 font-sans bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
              <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <h4 className="text-base font-extrabold text-blue-600">{t.companyName}</h4>
                  <p className="text-xs text-slate-500">Employee Tracking & Operations</p>
                  <p className="text-[11px] text-slate-400">admin@marketinglandmark.com</p>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  <div>Date: {new Date().toLocaleDateString()}</div>
                  <div>Status: Official Record</div>
                </div>
              </div>

              <div>
                <h5 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {pdfPreviewData.title}
                </h5>
                <p className="text-xs text-slate-500">Generated on {new Date().toLocaleTimeString()}</p>
              </div>

              {/* Data Table */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                    <tr>
                      {pdfPreviewData.headers.map((h, i) => (
                        <th key={i} className="px-3 py-2 font-bold whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {pdfPreviewData.rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                        {pdfPreviewData.headers.map((h, i) => (
                          <td key={i} className="px-3 py-2 whitespace-nowrap text-slate-600 dark:text-slate-400 font-mono">
                            {row[h] ?? '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Verified by Marketing Landmark System</span>
                <span>Page 1 of 1</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-2">
              <button
                onClick={() => setPdfPreviewData(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500"
              >
                {t.close}
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white flex items-center gap-1.5 shadow-md shadow-blue-500/20"
              >
                <Printer className="w-4 h-4" />
                <span>{t.printDocument}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
