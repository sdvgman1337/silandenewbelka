import test from 'node:test';
import assert from 'node:assert/strict';
import {
  QUEST_LOCATIONS,
  TOTAL_LOCATIONS,
  processQrScan,
  getFoundLocations,
  calculateProgress,
  loadFoundIdsFromStorage,
  saveFoundIdsToStorage,
} from './questLogic';

test('QUEST_LOCATIONS has 20 unique points with valid lat/lng park coordinates', () => {
  assert.equal(QUEST_LOCATIONS.length, 20);
  assert.equal(TOTAL_LOCATIONS, 20);

  const ids = new Set(QUEST_LOCATIONS.map((l) => l.id));
  assert.equal(ids.size, 20);

  for (const loc of QUEST_LOCATIONS) {
    assert.ok(loc.lat > 55.7 && loc.lat < 55.8);
    assert.ok(loc.lng > 37.58 && loc.lng < 37.62);
    assert.ok(loc.title.length > 0);
  }
});

test('getFoundLocations returns ONLY found locations and hides unfound ones completely', () => {
  assert.deepEqual(getFoundLocations([]), []);

  const found = getFoundLocations(['point_01', 'point_05']);
  assert.equal(found.length, 2);
  // Latest found location appears first
  assert.equal(found[0].id, 'point_05');
  assert.equal(found[1].id, 'point_01');
});

test('processQrScan handles new, duplicate, and invalid QR codes', () => {
  const res1 = processQrScan('point_03', []);
  assert.equal(res1.status, 'found_new');
  assert.deepEqual(res1.updatedFoundIds, ['point_03']);
  assert.equal(res1.isCompletedNow, false);

  const res2 = processQrScan('point_03', res1.updatedFoundIds);
  assert.equal(res2.status, 'already_found');
  assert.deepEqual(res2.updatedFoundIds, ['point_03']);

  const res3 = processQrScan('unknown_qr', res1.updatedFoundIds);
  assert.equal(res3.status, 'invalid_code');
  assert.deepEqual(res3.updatedFoundIds, ['point_03']);
});

test('scanning the 20th location triggers completion', () => {
  const first19 = QUEST_LOCATIONS.slice(0, 19).map((l) => l.id);
  const res = processQrScan('point_20', first19);
  assert.equal(res.status, 'found_new');
  assert.equal(res.isCompletedNow, true);

  const progress = calculateProgress(res.updatedFoundIds);
  assert.equal(progress.foundCount, 20);
  assert.equal(progress.isComplete, true);
});

test('localStorage persistence saves and restores found IDs accurately', () => {
  const mem: Record<string, string> = {};
  const storage = {
    getItem: (k: string) => mem[k] ?? null,
    setItem: (k: string, v: string) => {
      mem[k] = v;
    },
  };

  saveFoundIdsToStorage(['point_02', 'point_10', 'fake_id'], storage);
  const restored = loadFoundIdsFromStorage(storage);
  assert.deepEqual(restored, ['point_02', 'point_10']);
});
