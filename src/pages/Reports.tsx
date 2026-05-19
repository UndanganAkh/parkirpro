import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, TrendingUp, Car, Truck, Bike, Filter } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getCompletedRecords, getRates } from '../lib/storage';
import { ParkingRecord, DailyReport } from '../types';

export default function Reports() {
  const [records, setRecords] = useState<ParkingRecord[]>([]);
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([]);
  const [filterDate, setFilterDate] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const rates = getRates();

  useEffect(() => {
    const completedRecords = getCompletedRecords();
    setRecords(completedRecords);
    
    // Generate daily reports
    const reportMap = new Map<string, DailyReport>();
    
    completedRecords.forEach(record => {
      const date = new Date(record.checkOutTime!).toLocaleDateString('id-ID');
      
      if (!reportMap.has(date)) {
        reportMap.set(date, {
          date,
          totalVehicles: 0,
          totalRevenue: 0,
          byType: { motor: 0, mobil: 0, truk: 0 }
        });
      }
      
      const report = reportMap.get(date)!;
      report.totalVehicles++;
      report.totalRevenue += record.fee || 0;
      report.byType[record.vehicleType]++;
    });
    
    setDailyReports(Array.from(reportMap.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ));
  }, []);

  const vehicleLabels = {
    motor: 'Motor',
    mobil: 'Mobil',
    truk: 'Truk',
  };

  const filteredReports = dailyReports.filter(report => {
    if (filterDate) {
      return report.date === new Date(filterDate).toLocaleDateString('id-ID');
    }
    if (filterMonth) {
      const [year, month] = filterMonth.split('-');
      const reportDate = new Date(report.date.split('/').reverse().join('-'));
      return reportDate.getMonth() + 1 === parseInt(month) && reportDate.getFullYear() === parseInt(year);
    }
    return true;
  });

  const totalRevenue = filteredReports.reduce((sum, r) => sum + r.totalRevenue, 0);
  const totalVehicles = filteredReports.reduce((sum, r) => sum + r.totalVehicles, 0);

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0);
    doc.text('LAPORAN PENDAPATAN PARKIR', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text('ParkirPro Management System', 105, 28, { align: 'center' });
    
    // Date
    doc.setFontSize(10);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 40);
    if (filterDate) {
      doc.text(`Filter Tanggal: ${filterDate}`, 14, 46);
    } else if (filterMonth) {
      doc.text(`Filter Bulan: ${filterMonth}`, 14, 46);
    }
    
    // Summary
    doc.setFontSize(14);
    doc.text('Ringkasan', 14, 58);
    
    doc.setFontSize(11);
    doc.text(`Total Kendaraan: ${totalVehicles}`, 14, 66);
    doc.text(`Total Pendapatan: Rp ${totalRevenue.toLocaleString('id-ID')}`, 14, 73);
    
    // Table
    autoTable(doc, {
      startY: 85,
      head: [['Tanggal', 'Motor', 'Mobil', 'Truk', 'Total Kendaraan', 'Pendapatan']],
      body: filteredReports.map(report => [
        report.date,
        report.byType.motor.toString(),
        report.byType.mobil.toString(),
        report.byType.truk.toString(),
        report.totalVehicles.toString(),
        `Rp ${report.totalRevenue.toLocaleString('id-ID')}`
      ]),
      headStyles: {
        fillColor: [245, 158, 11],
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      styles: {
        fontSize: 10,
        cellPadding: 5
      }
    });
    
    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Halaman ${i} dari ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
    
    doc.save(`Laporan-Parkir-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const generateDetailPDF = () => {
    const doc = new jsPDF('landscape');
    
    // Title
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('LAPORAN DETAIL TRANSAKSI PARKIR', 148, 15, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 25);
    
    // Filter records
    let filteredRecords = records;
    if (filterDate) {
      const filterDateStr = new Date(filterDate).toLocaleDateString('id-ID');
      filteredRecords = records.filter(r => 
        new Date(r.checkOutTime!).toLocaleDateString('id-ID') === filterDateStr
      );
    } else if (filterMonth) {
      const [year, month] = filterMonth.split('-');
      filteredRecords = records.filter(r => {
        const date = new Date(r.checkOutTime!);
        return date.getMonth() + 1 === parseInt(month) && date.getFullYear() === parseInt(year);
      });
    }
    
    // Table
    autoTable(doc, {
      startY: 32,
      head: [['No. Plat', 'Jenis', 'Waktu Masuk', 'Waktu Keluar', 'Durasi', 'Tarif', 'Total Bayar']],
      body: filteredRecords.map(record => [
        record.plateNumber,
        vehicleLabels[record.vehicleType],
        new Date(record.checkInTime).toLocaleString('id-ID'),
        new Date(record.checkOutTime!).toLocaleString('id-ID'),
        `${record.duration} jam`,
        `Rp ${rates[record.vehicleType].toLocaleString('id-ID')}/jam`,
        `Rp ${record.fee?.toLocaleString('id-ID')}`
      ]),
      headStyles: {
        fillColor: [245, 158, 11],
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      styles: {
        fontSize: 9,
        cellPadding: 4
      }
    });
    
    // Summary at bottom
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(11);
    doc.text(`Total Transaksi: ${filteredRecords.length}`, 14, finalY);
    doc.text(`Total Pendapatan: Rp ${filteredRecords.reduce((sum, r) => sum + (r.fee || 0), 0).toLocaleString('id-ID')}`, 14, finalY + 7);
    
    doc.save(`Detail-Transaksi-Parkir-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Laporan Pendapatan</h1>
          <p className="text-slate-400 mt-1">Lihat dan unduh laporan transaksi parkir</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={generatePDF}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-bold px-6 py-3 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-amber-500/30"
          >
            <Download className="w-5 h-5" />
            Download PDF
          </button>
          <button
            onClick={generateDetailPDF}
            className="bg-slate-700 hover:bg-slate-600 text-white font-medium px-6 py-3 rounded-xl transition-all flex items-center gap-2"
          >
            <FileText className="w-5 h-5" />
            Detail PDF
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold text-white">Filter Laporan</h3>
        </div>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Filter Tanggal</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => {
                setFilterDate(e.target.value);
                setFilterMonth('');
              }}
              className="bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Filter Bulan</label>
            <input
              type="month"
              value={filterMonth}
              onChange={(e) => {
                setFilterMonth(e.target.value);
                setFilterDate('');
              }}
              className="bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterDate('');
                setFilterMonth('');
              }}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-all"
            >
              Reset Filter
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 backdrop-blur-xl rounded-2xl p-6 border border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Pendapatan</p>
              <p className="text-xl font-bold text-white">Rp {totalRevenue.toLocaleString('id-ID')}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Kendaraan</p>
              <p className="text-xl font-bold text-white">{totalVehicles}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 backdrop-blur-xl rounded-2xl p-6 border border-emerald-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <Bike className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Motor</p>
              <p className="text-xl font-bold text-white">
                {filteredReports.reduce((sum, r) => sum + r.byType.motor, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Mobil + Truk</p>
              <p className="text-xl font-bold text-white">
                {filteredReports.reduce((sum, r) => sum + r.byType.mobil + r.byType.truk, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Report Table */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-5 h-5 text-amber-400" />
          <h3 className="text-xl font-bold text-white">Laporan Harian</h3>
        </div>
        
        {filteredReports.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Tidak ada data laporan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Tanggal</th>
                  <th className="text-center py-3 px-4 text-slate-400 font-medium">Motor</th>
                  <th className="text-center py-3 px-4 text-slate-400 font-medium">Mobil</th>
                  <th className="text-center py-3 px-4 text-slate-400 font-medium">Truk</th>
                  <th className="text-center py-3 px-4 text-slate-400 font-medium">Total Kendaraan</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Pendapatan</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report, index) => (
                  <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-3 px-4">
                      <span className="text-white font-medium">{report.date}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-lg">
                        {report.byType.motor}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-lg">
                        {report.byType.mobil}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-lg">
                        {report.byType.truk}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-white font-bold">{report.totalVehicles}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-amber-400 font-bold">Rp {report.totalRevenue.toLocaleString('id-ID')}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-900/50">
                  <td className="py-3 px-4 text-white font-bold">Total</td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-emerald-400 font-bold">
                      {filteredReports.reduce((sum, r) => sum + r.byType.motor, 0)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-blue-400 font-bold">
                      {filteredReports.reduce((sum, r) => sum + r.byType.mobil, 0)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-purple-400 font-bold">
                      {filteredReports.reduce((sum, r) => sum + r.byType.truk, 0)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-white font-bold">{totalVehicles}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-amber-400 font-bold text-lg">Rp {totalRevenue.toLocaleString('id-ID')}</span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}