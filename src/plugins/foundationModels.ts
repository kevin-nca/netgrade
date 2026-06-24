import { registerPlugin } from '@capacitor/core';

/** Structured exam data returned by guided generation. All fields optional —
 * the model omits values it cannot read from the text. */
export interface ExamScanData {
  subjectName?: string;
  date?: string;
  examName?: string;
  score?: number;
  pointsAchieved?: number;
  pointsMax?: number;
}

export interface FoundationModelsPlugin {
  /**
   * Returns structured exam data via guided generation — no text parsing
   * needed. Rejects if the device/OS does not support it.
   */
  generateExamData(options: { prompt: string }): Promise<ExamScanData>;
}

export const FoundationModels =
  registerPlugin<FoundationModelsPlugin>('FoundationModels');
