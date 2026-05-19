import { useState, useEffect } from 'react';
import { Car, Truck, Bike, Search, Receipt, AlertCircle } from 'lucide-react';
import { getActiveRecords, getRates, updateRecord } from '../lib/storage';
import { ParkingRecord, VehicleType } from '../types';

export default function CheckOut() {
  const [activeRecords, setActiveRecords] = useState<ParkingRecord[]>([]);
  const [searchPlate, setSearchPlate] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<ParkingRecord | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [checkoutData, setCheckoutData] = useState<ParkingRecord | null>(null);
  const rates = getRates();

  useEffect(() => {
    setActiveRecords(getActiveRecords());
  }, []);

  const filteredRecords = searchPlate
    ? activeRecords.filter(r => 
        r.plateNumber.toLowerCase().includes(searchPlate.toLowerCase())
      )
    : activeRecords;

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

  const calculateDuration = (checkInTime: Date): number => {
    const diff = Date.now() - new Date(checkInTime).getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60)));
  };

  const handleCheckOut = (record: ParkingRecord) => {
    const duration = calculateDuration(record.checkInTime);
    const fee = duration * rates[record.vehicleType];
    
    const updatedRecord: ParkingRecord = {
      ...record,
      checkOutTime: new Date(),
      duration,
      fee,
      status: 'completed',
    };
    
    updateRecord(updatedRecord);
    setCheckoutData(updatedRecord);
    setShowReceipt(true);
    setActiveRecords(getActiveRecords());
    setSelectedRecord(null);
  };

  const printReceipt = () => {
    if (!checkoutData) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Karcis Parkir</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Courier New', monospace;
            padding: 20px;
            background: #fff;
          }
          .receipt {
            width: 300px;
            margin: 0 auto;
            border: 2px solid #333;
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
            font-size: 24px;
            font-weight: bold;
            background: #000;
            color: #fff;
            padding: 10px 20px;
            margin: 15px 0;
            letter-spacing: 3px;
          }
          .total {
            font-size: 28px;
            font-weight: bold;
            color: #000;
            margin: 15px 0;
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
        <div class="receipt">
          <div class="logo">🅿️ PARKIRPRO</div>
          <div class="divider"></div>
          <p style="font-size: 14px; font-weight: bold;">KARCIS PARKIR</p>
          <div class="divider"></div>
          <div class="plate">${checkoutData.plateNumber}</div>
          <div class="info">
            <div class="info-row">
              <span>Jenis:</span>
              <span>${vehicleLabels[checkoutData.vehicleType]}</span>
            </div>
            <div class="info-row">
              <span>Masuk:</span>
              <span>${new Date(checkoutData.checkInTime).toLocaleString('id-ID')}</span>
            </div>
            <div class="info-row">
              <span>Keluar:</span>
              <span>${new Date(checkoutData.checkOutTime!).toLocaleString('id-ID')}</span>
            </div>
            <div class="info-row">
              <span>Durasi:</span>
              <span>${checkoutData.duration} jam</span>
            </div>
            <div class="info-row">
              <span>Tarif:</span>
              <span>Rp ${rates[checkoutData.vehicleType].toLocaleString('id-ID')}/jam</span>
            </div>
          </div>
          <div class="divider"></div>
          <p style="font-size: 14px;">TOTAL BAYAR</p>
          <div class="total">Rp ${checkoutData.fee?.toLocaleString('id-ID')}</div>
          <div class="divider"></div>
          <div class="footer">
            <p>ID: ${checkoutData.id.substring(0, 8).toUpperCase()}</p>
            <p>Terima kasih telah menggunakan layanan kami</p>
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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Check-Out Kendaraan</h1>
        <p className="text-slate-400 mt-1">Proses keluar kendaraan dan pembayaran</p>
      </div>

      {/* Search */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchPlate}
            onChange={(e) => setSearchPlate(e.target.value.toUpperCase())}
            placeholder="Cari nomor plat..."
            className="w-full bg-slate-900/50 border border-slate-600 rounded-xl pl-12 pr-4 py-3 text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Active Vehicles List */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
        <h2 className="text-xl font-bold text-white mb-4">Kendaraan Aktif ({filteredRecords.length})</h2>
        
        {filteredRecords.length === 0 ? (
          <div className="text-center py-12">
            <Car className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Tidak ada kendaraan ditemukan</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecords.map((record) => {
              const Icon = vehicleIcons[record.vehicleType];
              const duration = calculateDuration(record.checkInTime);
              const estimatedFee = duration * rates[record.vehicleType];
              
              return (
                <div
                  key={record.id}
                  className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50 hover:border-amber-500/30 transition-all"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
                        <Icon className="w-6 h-6 text-amber-400" />
                      </div>
                      <div>
                        <p className="font-mono font-bold text-amber-400 text-lg">{record.plateNumber}</p>
                        <p className="text-slate-400 text-sm">
                          {vehicleLabels[record.vehicleType]} • {duration} jam
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-slate-400 text-sm">Estimasi Biaya</p>
                        <p className="text-xl font-bold text-white">Rp {estimatedFee.toLocaleString('id-ID')}</p>
                      </div>
                      <button
                        onClick={() => setSelectedRecord(record)}
                        className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-bold px-6 py-2 rounded-lg transition-all"
                      >
                        Check-Out
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full mx-4 border border-amber-500/30 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Receipt className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Konfirmasi Check-Out</h3>
              
              <div className="bg-slate-900/50 rounded-xl p-4 my-6 text-left">
                <div className="flex justify-between mb-2">
                  <span className="text-slate-400">No. Plat:</span>
                  <span className="text-amber-400 font-mono font-bold">{selectedRecord.plateNumber}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-400">Jenis:</span>
                  <span className="text-white">{vehicleLabels[selectedRecord.vehicleType]}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-400">Durasi:</span>
                  <span className="text-white">{calculateDuration(selectedRecord.checkInTime)} jam</span>
                </div>
                <div className="flex justify-between border-t border-slate-700 pt-2 mt-2">
                  <span className="text-slate-400">Total Bayar:</span>
                  <span className="text-2xl font-bold text-emerald-400">
                    Rp {(calculateDuration(selectedRecord.checkInTime) * rates[selectedRecord.vehicleType]).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 rounded-xl transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleCheckOut(selectedRecord)}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3 rounded-xl transition-all"
                >
                  Konfirmasi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && checkoutData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full mx-4 border border-emerald-500/30 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Check-Out Berhasil!</h3>
              <p className="text-slate-400 mb-6">Pembayaran telah diterima</p>
              
              <div className="bg-slate-900/50 rounded-xl p-4 mb-6 text-left">
                <div className="flex justify-between mb-2">
                  <span className="text-slate-400">No. Plat:</span>
                  <span className="text-amber-400 font-mono font-bold">{checkoutData.plateNumber}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-400">Durasi:</span>
                  <span className="text-white">{checkoutData.duration} jam</span>
                </div>
                <div className="flex justify-between border-t border-slate-700 pt-2 mt-2">
                  <span className="text-slate-400">Total Bayar:</span>
                  <span className="text-2xl font-bold text-emerald-400">
                    Rp {checkoutData.fee?.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowReceipt(false);
                    setCheckoutData(null);
                  }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 rounded-xl transition-all"
                >
                  Tutup
                </button>
                <button
                  onClick={printReceipt}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-bold py-3 rounded-xl transition-all"
                >
                  Cetak Karcis
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}