import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { predictNaacGrade, mapCgpaToGrade, NAAC_CRITERIA_CONFIG } from '../../src/services/naac/gradePredictor.js';

describe('Unit: NAAC Grade Prediction Engine', () => {
  it('Maps CGPA to grade correctly for all 8 grade bands', () => {
    assert.equal(mapCgpaToGrade(3.85), 'A++'); // 3.51 - 4.00
    assert.equal(mapCgpaToGrade(3.51), 'A++');
    assert.equal(mapCgpaToGrade(3.42), 'A+');  // 3.26 - 3.50
    assert.equal(mapCgpaToGrade(3.26), 'A+');
    assert.equal(mapCgpaToGrade(3.15), 'A');   // 3.01 - 3.25
    assert.equal(mapCgpaToGrade(3.01), 'A');
    assert.equal(mapCgpaToGrade(2.88), 'B++'); // 2.76 - 3.00
    assert.equal(mapCgpaToGrade(2.76), 'B++');
    assert.equal(mapCgpaToGrade(2.65), 'B+');  // 2.51 - 2.75
    assert.equal(mapCgpaToGrade(2.51), 'B+');
    assert.equal(mapCgpaToGrade(2.35), 'B');   // 2.01 - 2.50
    assert.equal(mapCgpaToGrade(2.01), 'B');
    assert.equal(mapCgpaToGrade(1.85), 'C');   // 1.51 - 2.00
    assert.equal(mapCgpaToGrade(1.51), 'C');
    assert.equal(mapCgpaToGrade(1.20), 'D');   // <= 1.50
    assert.equal(mapCgpaToGrade(0.0), 'D');
  });

  it('Correctly calculates CGPA and 7 criteria scores for demo institution', async () => {
    const res = await predictNaacGrade(1);
    assert.ok(res.success);
    assert.ok(typeof res.cgpa === 'number');
    assert.ok(res.cgpa >= 2.5 && res.cgpa <= 4.0);
    assert.ok(typeof res.grade === 'string');
    assert.equal(res.criteriaScores.length, 7);

    // Verify total weightage sums to 1000
    const totalWeight = res.criteriaScores.reduce((acc, c) => acc + c.weightage, 0);
    assert.equal(totalWeight, 1000);

    // Each criterion score should be calculated
    for (const c of res.criteriaScores) {
      assert.ok(c.criterion >= 1 && c.criterion <= 7);
      assert.ok(c.rawScore > 0 && c.rawScore <= c.maxScore);
      assert.ok(c.percentage >= 0 && c.percentage <= 100);
      assert.ok(c.score >= 0 && c.score <= 4.0);
    }
  });

  it('Returns strengths from top 3 criteria', async () => {
    const res = await predictNaacGrade(1);
    assert.ok(Array.isArray(res.strengths));
    assert.equal(res.strengths.length, 3);
    for (const st of res.strengths) {
      assert.ok(typeof st === 'string');
      assert.ok(st.length > 0);
    }
  });

  it('Returns weaknesses from bottom 3 criteria', async () => {
    const res = await predictNaacGrade(1);
    assert.ok(Array.isArray(res.weaknesses));
    assert.equal(res.weaknesses.length, 3);
    for (const wk of res.weaknesses) {
      assert.ok(typeof wk === 'string');
      assert.ok(wk.length > 0);
    }
  });

  it('Handles missing data gracefully', async () => {
    // Calling with non-existent institution id should fallback gracefully
    const res = await predictNaacGrade(9999);
    assert.ok(res.success);
    assert.ok(typeof res.grade === 'string');
    assert.ok(typeof res.cgpa === 'number');
    assert.equal(res.criteriaScores.length, 7);
  });

  it('Handles zero students edge case', async () => {
    // If studentCount is 0, should assign fallback grade D with 1.0 CGPA
    const res = await predictNaacGrade(0);
    assert.ok(res.success);
    assert.equal(res.grade, 'D');
    assert.equal(res.cgpa, 1.0);
    assert.equal(res.criteriaScores.length, 7);
    assert.ok(res.weaknesses.length >= 3);
  });
});
