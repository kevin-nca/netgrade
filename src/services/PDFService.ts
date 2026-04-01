import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { getRepositories } from '@/db/data-source';
import { School } from '@/db/entities';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

export interface PdfExportResult {
  success: boolean;
  message: string;
  filename?: string;
}

export class ExportErrorPDF extends Error {
  constructor(
    message: string,
    public code:
      | 'INVALID_DATA'
      | 'SAVE_FAILED'
      | 'SHARE_FAILED'
      | 'PARSE_FAILED'
      | 'UNKNOWN',
  ) {
    super(message);
    this.name = 'ExportError';
  }
}
export class PDFService {
  static async exportSchoolReport(
    schoolId: string | 'all',
    filename: string,
  ): Promise<PdfExportResult> {
    const pdfFilename = filename.endsWith('.pdf')
      ? filename
      : `${filename}.pdf`;
    const { school: schoolRepo } = getRepositories();
    const relations = { semesters: { subjects: { exams: { grade: true } } } };

    const schools: School[] =
      schoolId === 'all'
        ? await schoolRepo.find({ relations, order: { name: 'ASC' } })
        : await (async () => {
            const found = await schoolRepo.findOne({
              where: { id: schoolId },
              relations,
            });
            if (!found)
              throw new ExportErrorPDF(
                'Schule nicht gefunden.',
                'INVALID_DATA',
              );
            return [found];
          })();

    if (schools.length === 0)
      throw new ExportErrorPDF('Keine Daten vorhanden.', 'INVALID_DATA');

    const pdfBytes = await PDFService.build(schools);
    return Capacitor.isNativePlatform()
      ? PDFService.saveNative(pdfBytes, pdfFilename)
      : PDFService.saveWeb(pdfBytes, pdfFilename);
  }

  private static async build(schools: School[]): Promise<Uint8Array> {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);

    let page = doc.addPage();
    const { height, width } = page.getSize();
    let y = height - 40;

    page.drawText('NetGrade', {
      x: 40,
      y,
      size: 22,
      font: boldFont,
      color: rgb(0.15, 0.15, 0.15),
    });
    y -= 10;
    page.drawLine({
      start: { x: 40, y },
      end: { x: width - 40, y },
      thickness: 4,
      color: rgb(0.85, 0.85, 0.85),
    });
    y -= 35;

    for (const school of schools) {
      if (y < 80) {
        page = doc.addPage();
        y = page.getSize().height - 50;
      }

      page.drawText(school.name, {
        x: 40,
        y,
        size: 16,
        font: boldFont,
        color: rgb(0.1, 0.1, 0.1),
      });
      y -= 8;
      page.drawLine({
        start: { x: 40, y },
        end: { x: width - 40, y },
        thickness: 1.5,
        color: rgb(0.059, 0.427, 0.949),
      });
      y -= 25;

      for (const sem of school.semesters) {
        if (y < 80) {
          page = doc.addPage();
          y = page.getSize().height - 50;
        }

        page.drawRectangle({
          x: 40,
          y: y - 4,
          width: width - 80,
          height: 18,
          color: rgb(0.95, 0.95, 0.95),
        });
        page.drawText(sem.name, {
          x: 48,
          y,
          size: 10,
          font: boldFont,
          color: rgb(0.3, 0.3, 0.3),
        });
        y -= 28;

        for (const sub of sem.subjects) {
          if (y < 60) {
            page = doc.addPage();
            y = page.getSize().height - 50;
          }

          page.drawText(sub.name, {
            x: 50,
            y,
            size: 11,
            font: boldFont,
            color: rgb(0.2, 0.2, 0.2),
          });
          y -= 18;
          page.drawText('Prüfung', {
            x: 60,
            y,
            size: 8,
            font,
            color: rgb(0.5, 0.5, 0.5),
          });
          page.drawText('Datum', {
            x: 200,
            y,
            size: 8,
            font,
            color: rgb(0.5, 0.5, 0.5),
          });
          page.drawText('Note', {
            x: 300,
            y,
            size: 8,
            font,
            color: rgb(0.5, 0.5, 0.5),
          });
          page.drawText('Gew.', {
            x: 370,
            y,
            size: 8,
            font,
            color: rgb(0.5, 0.5, 0.5),
          });
          y -= 14;

          for (const exam of sub.exams) {
            if (y < 40) {
              page = doc.addPage();
              y = page.getSize().height - 50;
            }

            const date = exam.date
              ? new Date(exam.date).toLocaleDateString('de-DE')
              : '–';
            const note = exam.grade ? String(exam.grade.score) : '–';
            const w = exam.grade
              ? String(exam.grade.weight)
              : (exam.weight ?? '–');

            page.drawText(exam.name, {
              x: 60,
              y,
              size: 9,
              font,
              color: rgb(0.25, 0.25, 0.25),
            });
            page.drawText(date, {
              x: 200,
              y,
              size: 9,
              font,
              color: rgb(0.4, 0.4, 0.4),
            });
            page.drawText(note, {
              x: 300,
              y,
              size: 9,
              font: boldFont,
              color: rgb(0.1, 0.1, 0.1),
            });
            page.drawText(`${w}x`, {
              x: 370,
              y,
              size: 9,
              font,
              color: rgb(0.4, 0.4, 0.4),
            });
            y -= 14;
          }
          y -= 10;
        }
        y -= 8;
      }
      y -= 20;
    }

    return doc.save();
  }
  private static saveWeb(
    pdfBytes: Uint8Array,
    filename: string,
  ): PdfExportResult {
    try {
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], {
        type: 'application/pdf',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      return {
        success: true,
        message: 'PDF erfolgreich heruntergeladen.',
        filename,
      };
    } catch (error) {
      console.error('PDF web export failed:', error);
      return { success: false, message: 'PDF-Download fehlgeschlagen.' };
    }
  }

  private static async saveNative(
    pdfBytes: Uint8Array,
    filename: string,
  ): Promise<PdfExportResult> {
    try {
      const base64 = btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));
      await Filesystem.writeFile({
        path: filename,
        data: base64,
        directory: Directory.Documents,
      });
      const { uri } = await Filesystem.getUri({
        path: filename,
        directory: Directory.Documents,
      });
      try {
        await Share.share({
          title: 'NetGrade PDF',
          url: uri,
          dialogTitle: 'PDF teilen',
        });
      } catch (e) {
        if (
          !(
            e instanceof Error &&
            (e.message.includes('cancelled') || e.message.includes('canceled'))
          )
        )
          throw e;
      }
      return {
        success: true,
        message: 'PDF erfolgreich gespeichert.',
        filename,
      };
    } catch (error) {
      console.error('PDF native export failed:', error);
      return {
        success: false,
        message: 'PDF konnte nicht gespeichert werden.',
      };
    }
  }
}
