import '@/tests/__mocks__/@capacitor/capacitor.mock';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppInfo } from '@/AppInfo';

describe('AppInfo', () => {
  beforeEach(() => {
    // Reset Singleton-State
    // @ts-expect-error: reset private singleton instance for test
    AppInfo.instance = null;
    // @ts-expect-error: reset pending promise for test
    AppInfo.pending = null;

    vi.clearAllMocks();
  });

  it('should initialize and generate appInstanceId correctly', async () => {
    const instance = await AppInfo.initialize();
    expect(instance).toBeInstanceOf(AppInfo);
    expect(AppInfo.getAppInstanceId()).toBe('1.0.0-100-ios-device-1234');
  });

  it('should return the same instance when initialized twice', async () => {
    const first = await AppInfo.initialize();
    const second = await AppInfo.initialize();
    expect(first).toBe(second);
  });

  it('should throw if getAppInstanceId is called before initialization', () => {
    // @ts-expect-error: force uninitialized state to test error case
    AppInfo.instance = null;
    expect(() => AppInfo.getAppInstanceId()).toThrow('AppInfo not initialized');
  });

  it('should initialize in non-native environment', async () => {
    const capacitorModule = await import('@capacitor/core');
    vi.spyOn(capacitorModule.Capacitor, 'isNativePlatform').mockReturnValue(
      false,
    );

    const instance = await AppInfo.initialize();
    expect(instance).toBeInstanceOf(AppInfo);
    expect(AppInfo.getAppInstanceId()).toBe('dev');
  });

  it('should throw if App.getInfo fails', async () => {
    const { App } = await import('@capacitor/app');
    vi.spyOn(App, 'getInfo').mockRejectedValue(new Error('App error'));

    const { Device } = await import('@capacitor/device');
    vi.spyOn(Device, 'getInfo').mockResolvedValue({
      platform: 'ios',
      model: 'iPhone 13',
      operatingSystem: 'ios',
      osVersion: '16.4',
      manufacturer: 'Apple',
      webViewVersion: '16.4 Safari',
      isVirtual: false,
    });
    vi.spyOn(Device, 'getId').mockResolvedValue({ identifier: 'device-1234' });

    const { Capacitor } = await import('@capacitor/core');
    vi.spyOn(Capacitor, 'isNativePlatform').mockReturnValue(true);

    await expect(AppInfo.initialize()).rejects.toThrow('App error');
  });

  it('should throw if Device.getId fails', async () => {
    const { App } = await import('@capacitor/app');
    vi.spyOn(App, 'getInfo').mockResolvedValue({
      version: '1.0.0',
      build: '100',
      name: 'TestApp',
      id: 'com.example.testapp',
    });

    const { Device } = await import('@capacitor/device');
    vi.spyOn(Device, 'getInfo').mockResolvedValue({
      platform: 'ios',
      model: 'iPhone 13',
      operatingSystem: 'ios',
      osVersion: '16.4',
      manufacturer: 'Apple',
      webViewVersion: '16.4 Safari',
      isVirtual: false,
    });

    vi.spyOn(Device, 'getId').mockRejectedValue(new Error('Device ID error'));

    const { Capacitor } = await import('@capacitor/core');
    vi.spyOn(Capacitor, 'isNativePlatform').mockReturnValue(true);

    await expect(AppInfo.initialize()).rejects.toThrow('Device ID error');
  });
});
