export type VehicleType = 'motor' | 'mobil' | 'truk';

export interface ParkingRates {
  motor: number;
  mobil: number;
  truk: number;
}

export interface ParkingRecord {
  id: string;
  plateNumber: string;
  vehicleType: VehicleType;
  checkInTime: Date;
  checkOutTime?: Date;
  duration?: number; // in hours
  fee?: number;
  status: 'active' | 'completed';
}

export interface DailyReport {
  date: string;
  totalVehicles: number;
  totalRevenue: number;
  byType: {
    motor: number;
    mobil: number;
    truk: number;
  };
}