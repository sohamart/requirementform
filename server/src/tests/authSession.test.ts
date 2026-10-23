import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { connectDB, disconnectDB } from '../config/db.js';
import { AuthService } from '../services/authService.js';
import { User } from '../models/User.js';
import { Session } from '../models/Session.js';

describe('Authentication & Session Management with Revocation', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  it('registers a new client account with encrypted password and session record', async () => {
    const testEmail = `client_${Date.now()}@test.com`;
    const { user, token, session } = await AuthService.register({
      fullName: 'Vikram Mehta',
      email: testEmail,
      password: 'SecurePassword123!',
      company: 'Mehta Logistics',
    });

    expect(user).toBeDefined();
    expect(user.email).toBe(testEmail);
    expect(user.role).toBe('client');
    expect(user.passwordHash).not.toBe('SecurePassword123!'); // Hashed

    expect(token).toBeDefined();
    expect(session).toBeDefined();
    expect(session.userId.toString()).toBe(user._id.toString());
    expect(session.isRevoked).toBe(false);
  });

  it('authenticates valid credentials and creates an active session', async () => {
    const testEmail = `login_${Date.now()}@test.com`;
    await AuthService.register({
      fullName: 'Anita Desai',
      email: testEmail,
      password: 'SecretPassword99!',
    });

    const { user, token, session } = await AuthService.login(
      testEmail,
      'SecretPassword99!',
      { userAgent: 'Vitest Automated Agent' }
    );

    expect(user).toBeDefined();
    expect(token).toBeDefined();
    expect(session.isRevoked).toBe(false);
  });

  it('rejects invalid password', async () => {
    const testEmail = `fail_${Date.now()}@test.com`;
    await AuthService.register({
      fullName: 'Suresh Patel',
      email: testEmail,
      password: 'RealPassword1!',
    });

    await expect(AuthService.login(testEmail, 'WrongPassword')).rejects.toThrow(
      'Invalid email or password.'
    );
  });

  it('revokes an individual session on logout', async () => {
    const testEmail = `logout_${Date.now()}@test.com`;
    const { session } = await AuthService.register({
      fullName: 'Pooja Verma',
      email: testEmail,
      password: 'Password12345!',
    });

    await AuthService.revokeSession(session._id.toString());
    const revoked = await Session.findById(session._id);
    expect(revoked?.isRevoked).toBe(true);
  });

  it('revokes all sessions on logout everywhere', async () => {
    const testEmail = `all_${Date.now()}@test.com`;
    const { user, session: s1 } = await AuthService.register({
      fullName: 'Devendra K',
      email: testEmail,
      password: 'Password99999!',
    });

    // Create second session
    const s2 = await AuthService.createSession(user._id.toString());

    await AuthService.revokeAllUserSessions(user._id.toString());

    const activeSessions = await Session.find({ userId: user._id, isRevoked: false });
    expect(activeSessions.length).toBe(0);
  });
});
