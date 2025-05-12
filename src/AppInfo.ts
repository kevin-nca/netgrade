import { App, AppInfo as CapAppInfo } from '@capacitor/app';
import { Device, DeviceId, DeviceInfo } from '@capacitor/device';
import { Capacitor } from '@capacitor/core';

export class AppInfo {
  private static instance: AppInfo;
  private static pending: Promise<AppInfo> | null = null;

  private constructor(private readonly generatedAppInstanceId: string) {}

  static getInstance(): AppInfo {
    if (!AppInfo.instance) {
      throw new Error('AppInfo not initialized');
    }
    return AppInfo.instance;
  }

  /**
   * Obtain the singleton instance.
   *
   * The first call performs the asynchronous initialization.
   * Concurrent callers will await the same promise,
   * and later calls return the already-created instance synchronously.
   */
  public static async initialize(): Promise<AppInfo> {
    if (this.instance) {
      return this.instance;
    }

    // Not Native
    if (!Capacitor.isNativePlatform()) {
      const appInfoService = new AppInfo('dev');
      this.instance = appInfoService;
      return appInfoService;
    }

    if (this.pending) {
      return this.pending;
    }

    this.pending = (async () => {
      const [appInfo, deviceInfo, deviceId] = await Promise.all([
        App.getInfo(),
        Device.getInfo(),
        Device.getId(),
      ]);

      const generatedAppInstanceId = AppInfo.buildAppInstanceId(
        appInfo,
        deviceInfo,
        deviceId,
      );
      this.pending = null;

      this.instance = new AppInfo(generatedAppInstanceId);

      return this.instance;
    })();

    return this.pending;
  }

  public static getAppInstanceId(): string {
    if (!AppInfo.instance) {
      throw new Error('AppInfo not initialized');
    }
    return this.getInstance().generatedAppInstanceId;
  }

  private static buildAppInstanceId(
    appInfo: CapAppInfo,
    deviceInfo: DeviceInfo,
    deviceId: DeviceId,
  ): string {
    return `${appInfo.version}-${appInfo.build}-${deviceInfo.platform}-${deviceId.identifier}`;
  }
}
