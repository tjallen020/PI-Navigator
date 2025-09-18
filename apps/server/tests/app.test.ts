import request from 'supertest';
import app from '../src/app';
import { inMemoryStore } from '../src/services/inMemoryStore';

function getAuthToken() {
  const bcrypt = require('bcryptjs');
  const hashed = bcrypt.hashSync('secret123', 10);
  const user = inMemoryStore.createUser({
    name: 'Test User',
    email: 'test@example.com',
    password: hashed,
    role: 'FACILITATOR',
    unit: 'ED'
  });
  const jwt = require('jsonwebtoken');
  return jwt.sign({ sub: user.id, role: user.role }, 'supersecret');
}

describe('QI Tool Selector API', () => {
  it('returns tools', async () => {
    const response = await request(app).get('/tools');
    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('resolves decision node recommendation', async () => {
    const response = await request(app)
      .post('/nodes/E.type/resolve')
      .send({ option: 'nearmiss', resourceLevel: '<2h', mode: 'fast', complexity: 'low', dataAvailability: 'none', plainLanguage: true });
    expect(response.status).toBe(200);
    expect(response.body.tools.some((tool: any) => tool.key === 'GoodCatch')).toBe(true);
  });

  it('saves session and feedback', async () => {
    const token = getAuthToken();
    const sessionRes = await request(app)
      .post('/sessions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        answersJSON: { goal: 'E' },
        selectedMode: 'fast',
        recommendedToolsJSON: {
          tools: [{ key: 'GoodCatch', namePlain: 'Capture Near Miss', nameTech: 'Good Catch' }],
          rationales: [],
          sustainment: {
            controlPlan: { prompt: 'Create control', checklist: [] },
            huddle: { prompt: 'Daily', cadence: 'Daily' },
            followUps: []
          }
        },
        sustainmentPlanJSON: {
          controlPlan: { prompt: 'Create control', checklist: [] },
          huddle: { prompt: 'Daily', cadence: 'Daily' },
          followUps: []
        }
      });
    expect(sessionRes.status).toBe(201);

    const feedbackRes = await request(app)
      .post('/feedback')
      .set('Authorization', `Bearer ${token}`)
      .send({ sessionId: sessionRes.body.id, effectiveness1to5: 4, recommendYN: true });
    expect(feedbackRes.status).toBe(201);
  });
});
