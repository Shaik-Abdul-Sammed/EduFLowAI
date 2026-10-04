import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import jwt from 'jsonwebtoken';
import { createApp } from '../../src/app.js';
import { seedNaacData } from '../../scripts/seed-naac-data.js';
import { predictNaacGrade } from '../../src/services/naac/gradePredictor.js';
import { buildInstitutionalDataContext } from '../../src/controllers/OfficerController.js';

describe('Integration: NAAC SSR Data Flow & Grade Intelligence', () => {
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

  it('Seed data runs without errors', async () => {
    const counts = await seedNaacData();
    assert.ok(counts, 'Seed should return counts object');
    assert.equal(counts.faculty, 85);
    assert.equal(counts.students, 1250);
    assert.equal(counts.courses, 45);
    assert.equal(counts.placements, 780);
    assert.equal(counts.research, 450);
    assert.equal(counts.infrastructure, 25);
  });

  it('Grade prediction queries all 6 tables and outputs 7 criteria', async () => {
    const prediction = await predictNaacGrade(1);
    assert.ok(prediction.success);
    assert.equal(prediction.criteriaScores.length, 7);
    assert.ok(typeof prediction.cgpa === 'number');
    assert.ok(typeof prediction.grade === 'string');
    assert.equal(prediction.strengths.length, 3);
    assert.equal(prediction.weaknesses.length, 3);
  });

  it('Generate NAAC report injects data context with institution details', async () => {
    const context = await buildInstitutionalDataContext(1);
    assert.ok(context.includes('INSTITUTIONAL DATA'));
    assert.ok(context.includes('Sri Sudha Institute of Technology'));
    assert.ok(context.includes('Total Students: 1250'));
    assert.ok(context.includes('Total Faculty: 85'));
    assert.ok(context.includes('PhD Faculty: 40'));
    assert.ok(context.includes('Research Publications: 450'));
    assert.ok(context.includes('PROGRAMS'));
    assert.ok(context.includes('INFRASTRUCTURE'));
  });

  it('PDF export produces valid PDF header and 5 pages for naac-grade-report', async () => {
    const token = makeToken('admin');
    const res = await fetch(`${baseUrl}/api/v1/officers/naac-grade-report/export-pdf`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        institutionName: 'Sri Sudha Institute of Technology',
      }),
    });

    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'application/pdf');

    const buffer = Buffer.from(await res.arrayBuffer());
    const pdfText = buffer.toString('utf-8');
    assert.ok(pdfText.startsWith('%PDF-1.4'));
    assert.ok(pdfText.includes('Sri Sudha Institute of Technology'));
    assert.ok(pdfText.includes('/Count 5'));
  });

  it('Report includes institution name and criterion number', async () => {
    const token = makeToken('admin');
    const res = await fetch(`${baseUrl}/api/v1/officers/accreditation/generate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reportType: 'NAAC Criterion 2 Teaching-Learning Analysis for SSIT',
      }),
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.success);
    assert.ok(body.message.includes('Criterion 2'));
    assert.ok(body.reply);
  });
});
