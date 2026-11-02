/**
 * Логика семейного QR-квеста на территории парка / базы отдыха.
 */

export const REWARD_PROMO_CODE = 'FAMILY2026';
export const STORAGE_KEY = 'park_quest_found_ids_v2';

// Центр карты по умолчанию — база отдыха «Силандэ»
export const MAP_DEFAULT_CENTER: [number, number] = [60.382477, 30.270825];
export const MAP_DEFAULT_ZOOM = 16;

export interface QuestLocation {
  id: string; // Уникальное значение, зашитое в QR-коде
  number: number; // Порядковый номер локации (1..20)
  title: string; // Название локации
  zone: string; // Территориальная зона парка/базы
  lat: number; // Широта
  lng: number; // Долгота
}

// Массив из 20 объектов локаций с координатами на территории базы отдыха «Силандэ»
export const QUEST_LOCATIONS: QuestLocation[] = [
  {
    id: 'point_01',
    number: 1,
    title: 'Административный корпус и ресепшен',
    zone: 'Центральная усадьба',
    lat: 60.382477,
    lng: 30.270825,
  },
  {
    id: 'point_02',
    number: 2,
    title: 'Пирс и лодочная станция на озере Силандэ',
    zone: 'Берег озера',
    lat: 60.38095,
    lng: 30.26642,
  },
  {
    id: 'point_03',
    number: 3,
    title: 'Панорамная беседка у воды',
    zone: 'Берег озера',
    lat: 60.38142,
    lng: 30.26668,
  },
  {
    id: 'point_04',
    number: 4,
    title: 'Детская игровая площадка у корпусов',
    zone: 'Семейная зона',
    lat: 60.38282,
    lng: 30.26985,
  },
  {
    id: 'point_05',
    number: 5,
    title: 'Смотровая терраса на берегу озера',
    zone: 'Берег озера',
    lat: 60.38048,
    lng: 30.26689,
  },
  {
    id: 'point_06',
    number: 6,
    title: 'Клуб-столовая и летняя веранда',
    zone: 'Центральная усадьба',
    lat: 60.38221,
    lng: 30.26974,
  },
  {
    id: 'point_07',
    number: 7,
    title: 'Пункт проката велосипедов и сапбордов',
    zone: 'Активный отдых',
    lat: 60.38236,
    lng: 30.27128,
  },
  {
    id: 'point_08',
    number: 8,
    title: 'Банный комплекс с купелью на дровах',
    zone: 'Банный дворик',
    lat: 60.38165,
    lng: 30.26845,
  },
  {
    id: 'point_09',
    number: 9,
    title: 'Лесная тропа к озеру через черничник',
    zone: 'Сосновый бор',
    lat: 60.38158,
    lng: 30.26752,
  },
  {
    id: 'point_10',
    number: 10,
    title: 'Северная аллея у спального корпуса №1',
    zone: 'Жилая зона',
    lat: 60.38348,
    lng: 30.27038,
  },
  {
    id: 'point_11',
    number: 11,
    title: 'Гриль-беседка у корпуса №6',
    zone: 'Зона барбекю',
    lat: 60.38326,
    lng: 30.26832,
  },
  {
    id: 'point_12',
    number: 12,
    title: 'Чайная терраса в сосновой роще',
    zone: 'Центральная усадьба',
    lat: 60.38264,
    lng: 30.26912,
  },
  {
    id: 'point_13',
    number: 13,
    title: 'Веревочный маршрут в кронах сосен',
    zone: 'Активный отдых',
    lat: 60.38192,
    lng: 30.27045,
  },
  {
    id: 'point_14',
    number: 14,
    title: 'Поляна с кормушками для лесных белок',
    zone: 'Сосновый бор',
    lat: 60.38295,
    lng: 30.26748,
  },
  {
    id: 'point_15',
    number: 15,
    title: 'Спортивная площадка для волейбола',
    zone: 'Активный отдых',
    lat: 60.38208,
    lng: 30.26885,
  },
  {
    id: 'point_16',
    number: 16,
    title: 'Солнечная поляна с гамаками',
    zone: 'Семейная зона',
    lat: 60.38245,
    lng: 30.26715,
  },
  {
    id: 'point_17',
    number: 17,
    title: 'Рыбацкий причал в тихой бухте',
    zone: 'Берег озера',
    lat: 60.38012,
    lng: 30.26745,
  },
  {
    id: 'point_18',
    number: 18,
    title: 'Аллея вековых карельских сосен',
    zone: 'Сосновый бор',
    lat: 60.38375,
    lng: 30.26895,
  },
  {
    id: 'point_19',
    number: 19,
    title: 'Костровая поляна с круговыми скамьями',
    zone: 'Семейная зона',
    lat: 60.38124,
    lng: 30.26952,
  },
  {
    id: 'point_20',
    number: 20,
    title: 'Главный въезд на территорию базы «Силандэ»',
    zone: 'Главный въезд',
    lat: 60.38252,
    lng: 30.27165,
  },
];

export const TOTAL_LOCATIONS = QUEST_LOCATIONS.length;

export type ScanOutcomeStatus = 'found_new' | 'already_found' | 'invalid_code';

export interface ScanOutcome {
  status: ScanOutcomeStatus;
  location?: QuestLocation;
  updatedFoundIds: string[];
  isCompletedNow: boolean;
  message: string;
}

/**
 * Извлекает ID локации из отсканированной строки QR-кода
 */
export function normalizeScannedId(rawText: string): string {
  const cleaned = (rawText || '').trim();
  if (!cleaned) return '';

  const exact = QUEST_LOCATIONS.find(
    (loc) => loc.id.toLowerCase() === cleaned.toLowerCase()
  );
  if (exact) return exact.id;

  for (const loc of QUEST_LOCATIONS) {
    if (cleaned.toLowerCase().includes(loc.id.toLowerCase())) {
      return loc.id;
    }
  }

  return cleaned;
}

/**
 * Вызывает тактильную отдачу (Haptic Feedback) через Web Vibration API при успешном сканировании
 */
export function triggerScanHapticFeedback(
  pattern: number | number[] = [80, 40, 120],
  nav?: { vibrate?: (pattern: number | number[]) => boolean }
): boolean {
  try {
    const targetNav =
      nav ?? (typeof navigator !== 'undefined' ? navigator : undefined);
    if (targetNav && typeof targetNav.vibrate === 'function') {
      return targetNav.vibrate(pattern);
    }
  } catch {
    // Игнорируем ошибки на устройствах без поддержки вибрации
  }
  return false;
}

/**
 * Обрабатывает сканирование QR-кода
 */
export function processQrScan(
  rawScannedText: string,
  currentFoundIds: string[]
): ScanOutcome {
  const normalizedId = normalizeScannedId(rawScannedText);
  const matched = QUEST_LOCATIONS.find((loc) => loc.id === normalizedId);

  if (!matched) {
    return {
      status: 'invalid_code',
      updatedFoundIds: currentFoundIds,
      isCompletedNow: false,
      message: 'Этот QR-код не относится к маршруту квеста. Ищите фирменные таблички на территории парка.',
    };
  }

  if (currentFoundIds.includes(matched.id)) {
    triggerScanHapticFeedback(70);
    return {
      status: 'already_found',
      location: matched,
      updatedFoundIds: currentFoundIds,
      isCompletedNow: false,
      message: `Локация «${matched.title}» уже есть в вашем списке находок!`,
    };
  }

  const updatedFoundIds = [...currentFoundIds, matched.id];
  const isCompletedNow =
    currentFoundIds.length < TOTAL_LOCATIONS &&
    updatedFoundIds.length === TOTAL_LOCATIONS;

  triggerScanHapticFeedback(
    isCompletedNow ? [100, 50, 100, 50, 200] : [80, 40, 120]
  );

  return {
    status: 'found_new',
    location: matched,
    updatedFoundIds,
    isCompletedNow,
    message: isCompletedNow
      ? `Ура! Вы нашли все 20 локаций! Последняя точка: «${matched.title}».`
      : `Новая находка! Открыта локация «${matched.title}».`,
  };
}

/**
 * Возвращает список ТОЛЬКО найденных локаций (в порядке от последней найденной к первой)
 */
export function getFoundLocations(foundIds: string[]): QuestLocation[] {
  const locationMap = new Map(QUEST_LOCATIONS.map((loc) => [loc.id, loc]));
  const result: QuestLocation[] = [];

  for (let i = foundIds.length - 1; i >= 0; i--) {
    const loc = locationMap.get(foundIds[i]);
    if (loc && !result.some((item) => item.id === loc.id)) {
      result.push(loc);
    }
  }

  return result;
}

/**
 * Вычисляет прогресс прохождения
 */
export function calculateProgress(foundIds: string[]): {
  foundCount: number;
  totalCount: number;
  percentage: number;
  isComplete: boolean;
} {
  const validIds = new Set(QUEST_LOCATIONS.map((l) => l.id));
  const uniqueValid = Array.from(new Set(foundIds)).filter((id) =>
    validIds.has(id)
  );
  const foundCount = uniqueValid.length;
  const percentage = Math.round((foundCount / TOTAL_LOCATIONS) * 100);

  return {
    foundCount,
    totalCount: TOTAL_LOCATIONS,
    percentage,
    isComplete: foundCount >= TOTAL_LOCATIONS,
  };
}

/**
 * Загружает сохраненные ID из localStorage
 */
export function loadFoundIdsFromStorage(
  storage?: Pick<Storage, 'getItem'>
): string[] {
  try {
    const target =
      storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined);
    if (!target) return [];
    const raw = target.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const validIds = new Set(QUEST_LOCATIONS.map((l) => l.id));
    return Array.from(
      new Set(
        parsed.filter(
          (id): id is string => typeof id === 'string' && validIds.has(id)
        )
      )
    );
  } catch {
    return [];
  }
}

export const ONBOARDING_STORAGE_KEY = 'park_quest_onboarding_seen_v1';

/**
 * Проверяет, нужно ли показать онбординг (только при первом открытии и при 0 открытых локаций)
 */
export function shouldShowOnboarding(
  foundIds: string[],
  storage?: Pick<Storage, 'getItem'>
): boolean {
  if (foundIds.length > 0) {
    return false;
  }
  try {
    const target =
      storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined);
    if (!target) return true;
    const seen = target.getItem(ONBOARDING_STORAGE_KEY);
    return seen !== '1';
  } catch {
    return false;
  }
}

/**
 * Отмечает онбординг как просмотренный в localStorage
 */
export function markOnboardingSeen(
  storage?: Pick<Storage, 'setItem'>
): void {
  try {
    const target =
      storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined);
    if (!target) return;
    target.setItem(ONBOARDING_STORAGE_KEY, '1');
  } catch {
    // Ignore storage write errors
  }
}

/**
 * Сохраняет массив найденных ID в localStorage
 */
export function saveFoundIdsToStorage(
  ids: string[],
  storage?: Pick<Storage, 'setItem'>
): void {
  try {
    const target =
      storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined);
    if (!target) return;
    target.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Ignore storage write errors
  }
}

