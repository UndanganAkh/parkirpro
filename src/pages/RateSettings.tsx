import { useState, useEffect } from 'react';
import { Car, Truck, Bike, Save, RefreshCw } from 'lucide-react';
import { getRates, saveRates, defaultRates } from '../lib/storage';
import { ParkingRates } from '../types';

export default function RateSettings() {
  const [rates, setRatesState] = useState<ParkingRates>(getRates());
  const [showSuccess, setShowSuccess] = useState(false);

  const vehicleOptions = [
    { type: 'motor' as const, label: 'Motor', icon: Bike, color: 'blue' },
    { type: 'mobil' as const, label: 'Mobil', icon: Car, color: 'emerald' },
    { type: 'truk' as const, label: 'Truk', icon: Truck, color: 'purple' },
  ];

  const handleSave = () => {
    saveRates(rates);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleReset = () => {
    if (confirm('Apakah Anda yakin ingin mengembalikan tarif ke pengaturan default?')) {
      setRatesState(defaultRates);
      saveRates(defaultRates);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Pengaturan Tarif</h1>
        <p className="text-slate-400 mt-1">Atur tarif parkir per jam untuk setiap jenis kendaraan</p>
      </div>

      {/* Success Alert */}
      {showSuccess && (
        <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500/30 rounded-full flex items-center justify-center">
            <Save className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-emerald-400 font-medium">Tarif berhasil disimpan!</p>
        </div>
      )}

      {/* Rate Cards */}
      <div className="space-y-4">
        {vehicleOptions.map((option) => {
          const Icon = option.icon;
          return (
            <div
              key={option.type}
              className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-14 h-14 bg-${option.color}-500/20 rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-7 h-7 text-${option.color}-400`} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{option.label}</h3>
                  <p className="text-slate-400 text-sm">Tarif per jam</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-slate-400">Rp</span>
                <input
                  type="number"
                  value={rates[option.type]}
                  onChange={(e) =>
                    setRatesState({
                      ...rates,
                      [option.type]: Math.max(0, parseInt(e.target.value) || 0),
                    })
                  }
                  className="flex-1 bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-white text-xl font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <span className="text-slate-400">/jam</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleReset}
          className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-4 rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          Reset Default
        </button>
        <button
          onClick={handleSave}
          className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30"
        >
          <Save className="w-5 h-5" />
          Simpan Tarif
        </button>
      </div>

      {/* Info */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <p className="text-blue-400 text-sm">
          <strong>Catatan:</strong> Perubahan tarif akan berlaku untuk transaksi baru. 
          Transaksi yang sedang berlangsung akan menggunakan tarif saat check-in.
        </p>
      </div>
    </div>
  );
}