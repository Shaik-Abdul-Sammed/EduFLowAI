import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import jwt from 'jsonwebtoken';
import { createApp } from '../../src/app.js';

describe('Unit: Demo Data API Endpoints', () => {
  let server;
  let baseUrl;
  const secret = process.env.JWT_SECRET || 'eduflow-secure-secret-key-123';

  before(async () => {
    const app = createApp();
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  function makeToken(role = 'admin') {
    return jwt.sign({ id: 1, role, institutionId: 1, email: `${role}@demo.edu` }, secret, { expiresIn: '15m' });
  }

  it('GET /api/v1/demo/stats returns correct aggregate', async () => {
    const token = makeToken('admin');
    const res = await fetch(`${baseUrl}/api/v1/demo/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.success);
    assert.equal(body.totalStudents, 1250);
    assert.equal(body.totalFaculty, 85);
    assert.equal(body.phdFaculty, 40);
    assert.ok(body.averageCgpa > 0);
    assert.ok(body.placementPercentage > 0);
  });

  it('GET /api/v1/demo/students paginates correctly', async () => {
    const token = makeToken('admin');
    const res = await fetch(`${baseUrl}/api/v1/demo/students?limit=25&page=2`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.success);
    assert.equal(body.students.length, 25);
    assert.equal(body.total, 1250);
    assert.equal(body.page, 2);
    assert.equal(body.limit, 25);
  });

  it('GET /api/v1/demo/faculty filters by department', async () => {
    const token = makeToken('admin');
    const res = await fetch(`${baseUrl}/api/v1/demo/faculty?department=CSE`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.success);
    assert.ok(body.faculty.length > 0);
    for (const f of body.faculty) {
      assert.equal(f.department.toLowerCase(), 'cse');
    }
  });

  it('GET /api/v1/demo/research filters by Scopus', async () => {
    const token = makeToken('admin');
    const res = await fetch(`${baseUrl}/api/v1/demo/research?isScopus=true`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.success);
    assert.ok(body.research.length > 0);
    for (const r of body.research) {
      assert.equal(r.is_scopus, true);
    }
  });

  it('All endpoints require admin auth', async () => {
    const endpoints = [
      '/api/v1/demo/stats',
      '/api/v1/demo/students',
      '/api/v1/demo/faculty',
      '/api/v1/demo/courses',
      '/api/v1/demo/placements',
      '/api/v1/demo/research',
      '/api/v1/demo/infrastructure',
      '/api/v1/demo/naac-prediction',
    ];

    for (const ep of endpoints) {
      // 1. Unauthenticated request should return 401
      const unauthRes = await fetch(`${baseUrl}${ep}`);
      assert.equal(unauthRes.status, 401, `Expected 401 for unauth ${ep}`);

      // 2. Non-admin role (faculty) should return 403
      const facultyToken = makeToken('faculty');
      const forbiddenRes = await fetch(`${baseUrl}${ep}`, {
        headers: { Authorization: `Bearer ${facultyToken}` },
      });
      assert.equal(forbiddenRes.status, 403, `Expected 403 for non-admin on ${ep}`);
    }
  });
});
