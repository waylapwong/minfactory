import * as admin from 'firebase-admin';
import { AuthenticationService } from './authentication.service';

jest.mock('firebase-admin', () => {
  const auth = {
    verifyIdToken: jest.fn(),
  };
  const app = {
    auth: jest.fn(() => auth),
  };

  return {
    __esModule: true,
    apps: [],
    app: jest.fn(() => app),
    credential: {
      cert: jest.fn((config) => config),
    },
    initializeApp: jest.fn(() => app),
  };
});

describe('AuthenticationService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      FIREBASE_PROJECT_ID: 'minfactory-test',
      FIREBASE_CLIENT_EMAIL: 'firebase-admin@example.com',
      FIREBASE_PRIVATE_KEY: String.raw`line-1\nline-2`,
    };
    (admin.apps as unknown as unknown[]).length = 0;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should initialize firebase app once when no app exists', () => {
    const service = new AuthenticationService();

    expect(service).toBeInstanceOf(AuthenticationService);
    expect(admin.initializeApp).toHaveBeenCalledTimes(1);
    expect(admin.credential.cert).toHaveBeenCalledWith({
      projectId: 'minfactory-test',
      clientEmail: 'firebase-admin@example.com',
      privateKey: 'line-1\nline-2',
    });
  });

  it('should reuse existing firebase app when one already exists', () => {
    (admin.apps as unknown as unknown[]).push({});

    const service = new AuthenticationService();

    expect(service).toBeInstanceOf(AuthenticationService);
    expect(admin.app).toHaveBeenCalledTimes(1);
    expect(admin.initializeApp).not.toHaveBeenCalled();
  });

  it('should throw when firebase project id is missing', () => {
    delete process.env.FIREBASE_PROJECT_ID;

    expect(() => new AuthenticationService()).toThrow('FIREBASE_PROJECT_ID is not configured');
  });
});
