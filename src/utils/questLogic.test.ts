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
  triggerScanHapticFeedback,
  shouldShowOnboarding,
  markOnboardingSeen,
} from './questLogic';

test('QUEST_LOCATIONS has 20 unique points with valid lat/lng park coordinates', () => {
  assert.equal(QUEST_LOCATIONS.length, 20);
  assert.equal(TOTAL_LOCATIONS, 20);

  const ids = new Set(QUEST_LOCATIONS.map((l) => l.id));
  assert.equal(ids.size, 20);

  for (const loc of QUEST_LOCATIONS) {
    assert.ok(loc.lat > 60.37 && loc.lat < 60.39);
    assert.ok(loc.lng > 30.26 && loc.lng < 30.28);
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

test('triggerScanHapticFeedback invokes navigator.vibrate with pattern and handles unsupported environments', () => {
  const vibratedPatterns: Array<number | number[]> = [];
  const mockNavigator = {
    vibrate: (pattern: number | number[]) => {
      vibratedPatterns.push(pattern);
      return true;
    },
  };

  const result = triggerScanHapticFeedback([80, 40, 120], mockNavigator);
  assert.equal(result, true);
  assert.deepEqual(vibratedPatterns, [[80, 40, 120]]);

  // Gracefully returns false when vibrate is missing
  assert.equal(triggerScanHapticFeedback(100, {}), false);
});

test('shouldShowOnboarding returns true only on first open when 0 locations are found', () => {
  const mem: Record<string, string> = {};
  const storage = {
    getItem: (k: string) => mem[k] ?? null,
    setItem: (k: string, v: string) => {
      mem[k] = v;
    },
  };

  // First open with 0 found locations -> show onboarding
  assert.equal(shouldShowOnboarding([], storage), true);

  // First open but user already has >= 1 found location -> do NOT show onboarding
  assert.equal(shouldShowOnboarding(['point_01'], storage), false);

  // After marking onboarding as seen -> do NOT show onboarding even with 0 locations
  markOnboardingSeen(storage);
  assert.equal(shouldShowOnboarding([], storage), false);
});


