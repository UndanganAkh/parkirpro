import { useState, useEffect } from 'react';
import { Car, Truck, Bike, TrendingUp, Clock, DollarSign } from 'lucide-react';
import { getActiveRecords, getCompletedRecords, getRates } from '../lib/storage';
import { ParkingRecord } from '../types';

export default function Dashboard() {
  const [activeRecords, setActiveRecords] = useState<ParkingRecord[]>([]);
  const [completedRecords, setCompletedRecords] = useState<ParkingRecord[]>([]);
  const [rates, setRates] = useState(getRates());

  useEffect(() => {
    setActiveRecords(getActiveRecords());
    setCompletedRecords(getCompletedRecords());
  }, []);

  const todayRecords = completedRecords.filter(r => {
    const today = new Date();
    const recordDate = new Date(r.checkOutTime!);
    return recordDate.toDateString() === today.toDateString();
  });

  const todayRevenue = todayRecords.reduce((sum, r) => sum + (r.fee || 0), 0);

  const vehicleIcons = {
    motor: Bike,
    mobil: Car,
    truk: Truck,
  };

  const vehicleLabels = {
    motor: 'Motor',
    mobil: 'Mobil',
    truk: 'Truk',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">Selamat datang di sistem manajemen parkir</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 backdrop-blur-xl rounded-2xl p-6 border border-amber-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-400 text-sm font-medium">Kendaraan Aktif</p>
              <p className="text-3xl font-bold text-white mt-2">{activeRecords.length}</p>
            </div>
            <div className="w-14 h-14 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <Car className="w-7 h-7 text-amber-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 backdrop-blur-xl rounded-2xl p-6 border border-emerald-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-400 text-sm font-medium">Pendapatan Hari Ini</p>
              <p className="text-3xl font-bold text-white mt-2">Rp {todayRevenue.toLocaleString('id-ID')}</p>
            </div>
            <div className="w-14 h-14 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <DollarSign className="w-7 h-7 text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-400 text-sm font-medium">Transaksi Hari Ini</p>
              <p className="text-3xl font-bold text-white mt-2">{todayRecords.length}</p>
            </div>
            <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-400 text-sm font-medium">Total Transaksi</p>
              <p className="text-3xl font-bold text-white mt-2">{completedRecords.length}</p>
            </div>
            <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Clock className="w-7 h-7 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Tarif Info */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
        <h2 className="text-xl font-bold text-white mb-4">Tarif Parkir per Jam</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(rates).map(([type, rate]) => {
            const Icon = vehicleIcons[type as keyof typeof vehicleIcons];
            return (
              <div key={type} className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50 flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
                  <Icon className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">{vehicleLabels[type as keyof typeof vehicleLabels]}</p>
                  <p className="text-xl font-bold text-white">Rp {rate.toLocaleString('id-ID')}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Vehicles */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
        <h2 className="text-xl font-bold text-white mb-4">Kendaraan Sedang Parkir</h2>
        {activeRecords.length === 0 ? (
          <div className="text-center py-12">
            <Car className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Tidak ada kendaraan yang sedang parkir</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">No. Plat</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Jenis</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Waktu Masuk</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Durasi</th>
                </tr>
              </thead>
              <tbody>
                {activeRecords.map((record) => {
                  const Icon = vehicleIcons[record.vehicleType];
                  const duration = Math.ceil((Date.now() - new Date(record.checkInTime).getTime()) / (1000 * 60 * 60));
                  return (
                    <tr key={record.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td className="py-3 px-4">
                        <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-lg font-mono font-bold">
                          {record.plateNumber}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-slate-400" />
                          <span className="text-white">{vehicleLabels[record.vehicleType]}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {new Date(record.checkInTime).toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-amber-400 font-medium">{duration} jam</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}