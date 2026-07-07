import { Capacitor } from '@capacitor/core';
import { WidgetBridgePlugin } from 'capacitor-widget-bridge';
import { ExamService } from './ExamService';

const APP_GROUP = 'group.netgrade.app';
const WIDGET_KIND = 'ExamsWidget';
const STORAGE_KEY = 'next_exams';
const MAX_EXAMS = 3;

interface WidgetExamEntry {
  id: string;
  name: string;
  subjectName: string;
  date: string;
}

interface WidgetPayload {
  exams: WidgetExamEntry[];
  totalCount: number;
}

export class WidgetService {
  static async sync(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    try {
      const upcoming = await ExamService.fetchUpcoming();
      const payload: WidgetPayload = {
        exams: upcoming.slice(0, MAX_EXAMS).map((exam) => ({
          id: exam.id,
          name: exam.name,
          subjectName: exam.subject?.name ?? '',
          date: new Date(exam.date).toISOString(),
        })),
        totalCount: upcoming.length,
      };

      await WidgetBridgePlugin.setItem({
        key: STORAGE_KEY,
        group: APP_GROUP,
        value: JSON.stringify(payload),
      });

      await WidgetBridgePlugin.reloadTimelines({ ofKind: WIDGET_KIND });
    } catch (error) {
      console.error('WidgetService.sync failed:', error);
    }
  }

  static async clear(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    try {
      const payload: WidgetPayload = { exams: [], totalCount: 0 };
      await WidgetBridgePlugin.setItem({
        key: STORAGE_KEY,
        group: APP_GROUP,
        value: JSON.stringify(payload),
      });
      await WidgetBridgePlugin.reloadTimelines({ ofKind: WIDGET_KIND });
    } catch (error) {
      console.error('WidgetService.clear failed:', error);
    }
  }
}
