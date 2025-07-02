import dayjs from 'dayjs';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';

export interface ExcelColumnConfig {
  key: string;
  width: number;
  header: string;
  numFmt?: string;
}

export interface ExcelStyleConfig {
  titleColor?: string;
  headerColor?: string;
  paidRowColor?: string;
  totalRowColor?: string;
}

export class ExcelHelper {
  private static readonly DEFAULT_STYLES: ExcelStyleConfig = {
    titleColor: 'FFFF00',
    headerColor: 'CCCCCC',
    paidRowColor: 'CCFFCC',
    totalRowColor: 'FFFFE0',
  };

  static createWorkbook(sheetName: string): { workbook: ExcelJS.Workbook; sheet: ExcelJS.Worksheet } {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(sheetName);
    return { workbook, sheet };
  }

  static addTitle(
    sheet: ExcelJS.Worksheet,
    title: string,
    colSpan: number,
    styles: ExcelStyleConfig = this.DEFAULT_STYLES
  ): void {
    sheet.mergeCells(`A1:${String.fromCharCode(64 + colSpan)}1`);
    const titleRow = sheet.getRow(1);
    titleRow.getCell(1).value = title;
    titleRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
    titleRow.getCell(1).font = { bold: true, size: 14 };
    titleRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: styles.titleColor },
    };
  }

  static addHeaders(
    sheet: ExcelJS.Worksheet,
    columns: ExcelColumnConfig[],
    styles: ExcelStyleConfig = this.DEFAULT_STYLES
  ): void {
    const headerRow = sheet.getRow(2);
    headerRow.values = columns.map((col) => col.header);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: styles.headerColor },
    };

    sheet.columns = columns.map((col) => ({
      key: col.key,
      width: col.width,
    }));

    columns.forEach((col, index) => {
      if (col.numFmt) {
        sheet.getColumn(index + 1).numFmt = col.numFmt;
      }
    });
  }

  static addDataRows<T extends Record<string, any>>(
    sheet: ExcelJS.Worksheet,
    data: T[],
    rowStyler?: (row: ExcelJS.Row, item: T) => void
  ): void {
    data.forEach((item) => {
      const row = sheet.addRow(item);
      row.alignment = { vertical: 'middle' };

      if (rowStyler) {
        rowStyler(row, item);
      }
    });
  }

  static addTotalRow<T extends Record<string, any>>(
    sheet: ExcelJS.Worksheet,
    totals: T,
    styles: ExcelStyleConfig = this.DEFAULT_STYLES
  ): void {
    const totalRow = sheet.addRow(totals);
    totalRow.font = { bold: true };
    totalRow.alignment = { vertical: 'middle', horizontal: 'right' };
    totalRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: styles.totalRowColor },
    };
  }

  static async sendAsResponse(workbook: ExcelJS.Workbook, res: Response, filename: string): Promise<void> {
    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.end(buffer);
  }

  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  }

  static formatDate(date: Date | string, format = 'DD.MM.YYYY'): string {
    return dayjs(date).tz('Europe/Istanbul').format(format);
  }
}
