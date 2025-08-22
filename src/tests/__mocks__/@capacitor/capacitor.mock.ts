import { vi } from 'vitest';
vi.mock('@capacitor/app', () => ({
  App: {
    getInfo: vi.fn().mockResolvedValue({ version: '1.0.0', build: '100' }),
  },
}));

vi.mock('@capacitor/device', () => ({
  Device: {
    getInfo: vi.fn().mockResolvedValue({ platform: 'ios' }),
    getId: vi.fn().mockResolvedValue({ identifier: 'device-1234' }),
  },
}));

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: vi.fn().mockReturnValue(true),
  },
}));
