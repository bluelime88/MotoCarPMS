// Export all maintenance records to a CSV file and open the share sheet.
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { getRecords, getVehicles } from './storage';

const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

export async function exportCsv(): Promise<number> {
  const [vehicles, records] = await Promise.all([getVehicles(), getRecords()]);
  const vName = (id: string) => {
    const v = vehicles.find((x) => x.id === id);
    return v ? `${v.brand} ${v.model}` : '';
  };

  const header = [
    'Date', 'Vehicle', 'Type', 'Odometer (km)', 'Parts', 'Labor', 'Total',
    'Workshop', 'Description', 'Next Due Date', 'Next Due Mileage',
  ];
  const rows = [...records]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((r) =>
      [
        r.date, vName(r.vehicleId), r.type, r.odometer, r.partsCost, r.laborCost,
        r.partsCost + r.laborCost, r.workshop, r.description, r.nextDueDate ?? '', r.nextDueMileage ?? '',
      ]
        .map(esc)
        .join(',')
    );
  const csv = [header.map(esc).join(','), ...rows].join('\n');

  const uri = FileSystem.cacheDirectory + 'motocar-records.csv';
  await FileSystem.writeAsStringAsync(uri, csv);
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: 'text/csv', dialogTitle: 'Export maintenance records' });
  }
  return records.length;
}
