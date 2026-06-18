import path from 'path';
import { IStorageProvider } from '../types';
import { LocalStorageProvider } from './local-provider';

export type StorageProviderName = 'local' | 'r2';

function getConfiguredProvider(): StorageProviderName {
  const provider = process.env.STORAGE_PROVIDER?.toLowerCase();

  if (provider === 'r2') {
    // R2 can be reintroduced later by adding an R2 provider implementation
    // without changing the rest of the app.
    return 'r2';
  }

  return 'local';
}

export function createStorageProvider(): IStorageProvider {
  const provider = getConfiguredProvider();

  if (provider === 'r2') {
    throw new Error(
      'STORAGE_PROVIDER=r2 is configured, but the R2 storage provider is not implemented in this project yet.'
    );
  }

  return new LocalStorageProvider(path.join(process.cwd(), 'uploads'));
}
