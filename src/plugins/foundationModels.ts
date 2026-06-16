import { registerPlugin } from '@capacitor/core';

export interface FoundationModelsPlugin {
  /**
   * Generates text with Apple's on-device Foundation Models.
   * Rejects if the device/OS does not support it or the model is not ready.
   */
  generate(options: {
    prompt: string;
    instructions?: string;
  }): Promise<{ text: string }>;
}

export const FoundationModels =
  registerPlugin<FoundationModelsPlugin>('FoundationModels');
