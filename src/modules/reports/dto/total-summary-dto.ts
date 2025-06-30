import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class MonthlyReportItemDto {
  @ApiProperty({ example: 'Ocak', description: 'Ay adı' })
  @Expose()
  monthName: string;

  @ApiProperty({ example: 14500.75, description: 'Bu ayki toplam gelir (₺)', required: false })
  @Expose()
  totalIncome?: number;

  @ApiProperty({ example: 9800.25, description: 'Bu ayki toplam gider (₺)', required: false })
  @Expose()
  totalExpense?: number;

  @ApiProperty({ example: 4500.5, description: 'Bu ayki toplam yakıt (₺)', required: false })
  @Expose()
  totalFuel?: number;

  @ApiProperty({ example: 8, description: 'Bu ay yapılan işlem sayısı (isteğe bağlı)', required: false })
  @Expose()
  count?: number;
}

@Exclude()
export class DashboardStatsDto {
  @ApiProperty({ example: 125000.75, description: 'Toplam gelir (₺)' })
  @Expose()
  totalIncome: number;

  @ApiProperty({ example: 45000.25, description: 'Toplam gider (₺)' })
  @Expose()
  totalExpense: number;

  @ApiProperty({ example: 15000.5, description: 'Toplam yakıt gideri (₺)' })
  @Expose()
  totalFuel: number;

  @ApiProperty({ example: 80000.0, description: 'Net kâr (₺)' })
  @Expose()
  netProfit: number;

  @ApiProperty({ example: 25, description: 'Toplam müşteri sayısı' })
  @Expose()
  totalCustomers: number;

  @ApiProperty({ example: 15, description: 'Toplam araç sayısı' })
  @Expose()
  totalVehicles: number;

  @ApiProperty({ example: 8, description: 'Toplam çalışan sayısı' })
  @Expose()
  totalEmployees: number;

  @ApiProperty({ example: 120, description: 'Bu ay toplam işlem sayısı' })
  @Expose()
  monthlyTransactions: number;

  @ApiProperty({ example: 85000.5, description: 'Bu ay toplam gelir (₺)' })
  @Expose()
  monthlyIncome: number;

  @ApiProperty({ example: 25000.25, description: 'Bu ay toplam gider (₺)' })
  @Expose()
  monthlyExpense: number;
}

@Exclude()
export class DetailedReportDto {
  @ApiProperty({ example: '2024-01-01', description: 'Rapor başlangıç tarihi' })
  @Expose()
  startDate: string;

  @ApiProperty({ example: '2024-12-31', description: 'Rapor bitiş tarihi' })
  @Expose()
  endDate: string;

  @ApiProperty({ example: 125000.75, description: 'Toplam gelir (₺)' })
  @Expose()
  totalIncome: number;

  @ApiProperty({ example: 45000.25, description: 'Toplam gider (₺)' })
  @Expose()
  totalExpense: number;

  @ApiProperty({ example: 15000.5, description: 'Toplam yakıt gideri (₺)' })
  @Expose()
  totalFuel: number;

  @ApiProperty({ example: 80000.0, description: 'Net kâr (₺)' })
  @Expose()
  netProfit: number;

  @ApiProperty({ example: 64.0, description: 'Kâr marjı (%)' })
  @Expose()
  profitMargin: number;

  @ApiProperty({ example: 150, description: 'Toplam işlem sayısı' })
  @Expose()
  totalTransactions: number;

  @ApiProperty({
    example: [
      { category: 'Yakıt', amount: 15000, percentage: 33.3 },
      { category: 'Bakım', amount: 20000, percentage: 44.4 },
      { category: 'Diğer', amount: 10000, percentage: 22.2 },
    ],
    description: 'Kategorilere göre gider dağılımı',
  })
  @Expose()
  expenseBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;

  @ApiPropertyOptional({
    example: [
      { month: 'Ocak', income: 10000, expense: 3000, profit: 7000 },
      { month: 'Şubat', income: 12000, expense: 4000, profit: 8000 },
    ],
    description: 'Aylık trend analizi',
  })
  @Expose()
  monthlyTrends?: Array<{
    month: string;
    income: number;
    expense: number;
    profit: number;
  }>;
}
