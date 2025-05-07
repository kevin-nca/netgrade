import { App, AppInfo } from '@capacitor/app';
import { Device } from '@capacitor/device';
import type { DeviceInfo, DeviceId } from '@capacitor/device';
import { Capacitor } from '@capacitor/core';

export class AppInfoService {
  private static instance: AppInfoService;

  private appInfo: AppInfo | null = null;
  private deviceInfo: DeviceInfo | null = null;
  private deviceId: DeviceId | null = null;

  private generatedAppInstanceId: string | null = null;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  private constructor() {}

  public static getInstance(): AppInfoService {
    if (!AppInfoService.instance) {
      AppInfoService.instance = new AppInfoService();
    }
    return AppInfoService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initializationPromise) return this.initializationPromise;

    this.initializationPromise = this.initializeAsync();
    return this.initializationPromise;
  }

  private async initializeAsync(): Promise<void> {
    this.appInfo = await App.getInfo();
    this.deviceInfo = await Device.getInfo();
    this.deviceId = await Device.getId();

    this.generatedAppInstanceId = this.buildAppInstanceId();
    this.isInitialized = true;
  }

  public getAppInstanceId(): string {
    if (!this.isInitialized || !this.generatedAppInstanceId) {
      throw new Error('AppInfoService not initialized');
    }
    return this.generatedAppInstanceId;
  }

  private buildAppInstanceId(): string {
    if (!this.deviceId || !this.deviceInfo || !this.appInfo) {
      throw new Error('Missing required info to build app instance ID');
    }

    const isNative = Capacitor.isNativePlatform();

    const deviceId = this.deviceId.identifier;
    const platform = this.deviceInfo.platform;
    const version = this.appInfo.version;
    const build = this.appInfo.build;

    if (isNative && deviceId && platform && version && build) {
      return `${deviceId}-${platform}-${version}-${build}`;
    }
    return `web-${Date.now()}`;
  }
}
