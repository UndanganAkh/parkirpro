import { ParkingRates, ParkingRecord } from '../types';

const RATES_KEY = 'parking_rates';
const RECORDS_KEY = 'parking_records';

export const defaultRates: ParkingRates = {
  motor: 2000,
  mobil: 5000,
  truk: 10000,
};

export const getRates = (): ParkingRates => {
  const stored = localStorage.getItem(RATES_KEY);
  return stored ? JSON.parse(stored) : defaultRates;
};

export const saveRates = (rates: ParkingRates): void => {
  localStorage.setItem(RATES_KEY, JSON.stringify(rates));
};

export const getRecords = (): ParkingRecord[] => {
  const stored = localStorage.getItem(RECORDS_KEY);
  if (!stored) return [];
  return JSON.parse(stored, (key, value) => {
    if (key === 'checkInTime' || key === 'checkOutTime') {
      return value ? new Date(value) : null;
    }
    return value;
  });
};

export const saveRecords = (records: ParkingRecord[]): void => {
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
};

export const addRecord = (record: ParkingRecord): void => {
  const records = getRecords();
  records.push(record);
  saveRecords(records);
};

export const updateRecord = (updatedRecord: ParkingRecord): void => {
  const records = getRecords();
  const index = records.findIndex(r => r.id === updatedRecord.id);
  if (index !== -1) {
    records[index] = updatedRecord;
    saveRecords(records);
  }
};

export const getActiveRecords = (): ParkingRecord[] => {
  return getRecords().filter(r => r.status === 'active');
};

export const getCompletedRecords = (): ParkingRecord[] => {
  return getRecords().filter(r => r.status === 'completed');
};