import { SessionPayload, FeedbackPayload } from '../types';
import { randomUUID } from 'crypto';

interface StoredSession extends SessionPayload {
  id: string;
  userId?: string;
  createdAt: Date;
}

interface StoredFeedback extends FeedbackPayload {
  id: string;
  createdAt: Date;
}

interface StoredUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  unit?: string;
  preferences?: { plainLanguage?: boolean };
}

class InMemoryStore {
  users = new Map<string, StoredUser>();
  sessions = new Map<string, StoredSession>();
  feedback = new Map<string, StoredFeedback>();

  createUser(user: Omit<StoredUser, 'id'>): StoredUser {
    const exists = Array.from(this.users.values()).some((u) => u.email === user.email);
    if (exists) {
      throw new Error('User already exists');
    }
    const id = randomUUID();
    const saved = { ...user, id };
    this.users.set(id, saved);
    return saved;
  }

  findUserByEmail(email: string): StoredUser | undefined {
    return Array.from(this.users.values()).find((u) => u.email === email);
  }

  saveSession(payload: SessionPayload & { userId?: string }): StoredSession {
    const id = randomUUID();
    const stored: StoredSession = { ...payload, id, createdAt: new Date() };
    this.sessions.set(id, stored);
    return stored;
  }

  getSession(id: string): StoredSession | undefined {
    return this.sessions.get(id);
  }

  listSessions(): StoredSession[] {
    return Array.from(this.sessions.values());
  }

  saveFeedback(payload: FeedbackPayload): StoredFeedback {
    const id = randomUUID();
    const stored: StoredFeedback = { ...payload, id, createdAt: new Date() };
    this.feedback.set(id, stored);
    return stored;
  }

  getUsageMetrics() {
    const totalSessions = this.sessions.size;
    const modeCounts = Array.from(this.sessions.values()).reduce<Record<string, number>>((acc, session) => {
      acc[session.selectedMode] = (acc[session.selectedMode] || 0) + 1;
      return acc;
    }, {});
    const avgEffectiveness = (() => {
      const relevant = Array.from(this.feedback.values());
      if (relevant.length === 0) return null;
      const sum = relevant.reduce((acc, feedback) => acc + feedback.effectiveness1to5, 0);
      return sum / relevant.length;
    })();
    return { totalSessions, modeCounts, avgEffectiveness };
  }
}

export const inMemoryStore = new InMemoryStore();
export type { StoredUser, StoredSession, StoredFeedback };
