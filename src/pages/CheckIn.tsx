import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Truck, Bike, Plus, AlertCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { addRecord, getRates } from '../lib/storage';
import { VehicleType, ParkingRecord } from '../types';

export default function CheckIn() {
  const navigate = useNavigate();
  const [plateNumber, setPlateNumber] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('motor');
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastRecord, setLastRecord] = useState<ParkingRecord | null>(null);
  const rates = getRates();

  const vehicleOptions = [
    { type: 'motor' as VehicleType, label: 'Motor', icon: Bike, rate: rates.motor },
    { type: 'mobil' as VehicleType, label: 'Mobil', icon: Car, rate: rates.mobil },
    { type: 'truk' as VehicleType, label: 'Truk', icon: Truck, rate: rates.truk },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!plateNumber.trim()) {
      alert('Nomor plat harus diisi!');
      return;
    }

    const record: ParkingRecord = {
      id: uuidv4(),
      plateNumber: plateNumber.toUpperCase(),
      vehicleType,
      checkInTime: new Date(),
      status: 'active',
    };

    addRecord(record);
    setLastRecord(record);
    setShowSuccess(true);
    setPlateNumber('');
  };

  const printTicket = () => {
    if (!lastRecord) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const vehicleLabels = {
      motor: 'Motor',
      mobil: 'Mobil',
      truk: 'Truk',
    };

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Tiket Parkir</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Courier New', monospace;
            padding: 20px;
            background: #fff;
          }
          .ticket {
            width: 300px;
            margin: 0 auto;
            border: 2px dashed #333;
            padding: 20px;
            text-align: center;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .divider {
            border-top: 1px dashed #333;
            margin: 10px 0;
          }
          .info {
            text-align: left;
            margin: 10px 0;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
          }
          .plate {
            font-size: 28px;
            font-weight: bold;
            background: #000;
            color: #fff;
            padding: 10px 20px;
            margin: 15px 0;
            letter-spacing: 3px;
          }
          .footer {
            font-size: 12px;
            color: #666;
            margin-top: 15px;
          }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="ticket">
          <div class="logo">🅿️ PARKIRPRO</div>
          <div class="divider"></div>
          <p style="font-size: 14px;">TIKET PARKIR MASUK</p>
          <div class="divider"></div>
          <div class="plate">${lastRecord.plateNumber}</div>
          <div class="info">
            <div class="info-row">
              <span>Jenis:</span>
              <span>${vehicleLabels[lastRecord.vehicleType]}</span>
            </div>
            <div class="info-row">
              <span>Tarif:</span>
              <span>Rp ${rates[lastRecord.vehicleType].toLocaleString('id-ID')}/jam</span>
            </div>
            <div class="info-row">
              <span>Tanggal:</span>
              <span>${new Date(lastRecord.checkInTime).toLocaleDateString('id-ID')}</span>
            </div>
            <div class="info-row">
              <span>Waktu:</span>
              <span>${new Date(lastRecord.checkInTime).toLocaleTimeString('id-ID')}</span>
            </div>
          </div>
          <div class="divider"></div>
          <p style="font-size: 12px;">Simpan tiket ini sampai keluar</p>
          <div class="footer">
            <p>ID: ${lastRecord.id.substring(0, 8).toUpperCase()}</p>
            <p>Terima kasih</p>
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Check-In Kendaraan</h1>
        <p className="text-slate-400 mt-1">Daftarkan kendaraan masuk parkir</p>
      </div>

      {/* Form */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Plate Number */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Nomor Plat Kendaraan
            </label>
            <input
              type="text"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
              placeholder="Contoh: B 1234 ABC"
              className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-white text-lg font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Vehicle Type */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Jenis Kendaraan
            </label>
            <div className="grid grid-cols-3 gap-4">
              {vehicleOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = vehicleType === option.type;
                return (
                  <button
                    key={option.type}
                    type="button"
                    onClick={() => setVehicleType(option.type)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                        : 'bg-slate-900/50 border-slate-600 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    <Icon className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-medium">{option.label}</p>
                    <p className="text-sm mt-1">Rp {option.rate.toLocaleString('id-ID')}/jam</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-[1.02]"
          >
            <Plus className="w-5 h-5" />
            Check-In Kendaraan
          </button>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccess && lastRecord && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full mx-4 border border-amber-500/30 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Check-In Berhasil!</h3>
              <p className="text-slate-400 mb-6">Kendaraan telah terdaftar masuk</p>
              
              <div className="bg-slate-900/50 rounded-xl p-4 mb-6 text-left">
                <div className="flex justify-between mb-2">
                  <span className="text-slate-400">No. Plat:</span>
                  <span className="text-amber-400 font-mono font-bold">{lastRecord.plateNumber}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-400">Jenis:</span>
                  <span className="text-white">{vehicleOptions.find(o => o.type === lastRecord.vehicleType)?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Waktu:</span>
                  <span className="text-white">{new Date(lastRecord.checkInTime).toLocaleTimeString('id-ID')}</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowSuccess(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 rounded-xl transition-all"
                >
                  Tutup
                </button>
                <button
                  onClick={printTicket}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-bold py-3 rounded-xl transition-all"
                >
                  Cetak Tiket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}