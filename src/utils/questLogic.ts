/**
 * Логика семейного QR-квеста на территории парка / базы отдыха.
 */

export const REWARD_PROMO_CODE = 'FAMILY2026';
export const STORAGE_KEY = 'park_quest_found_ids_v2';

// Центр карты по умолчанию — крупный парк (Парк Горького и Нескучный сад)
export const MAP_DEFAULT_CENTER: [number, number] = [55.7285, 37.6015];
export const MAP_DEFAULT_ZOOM = 15;

export interface QuestLocation {
  id: string; // Уникальное значение, зашитое в QR-коде
  number: number; // Порядковый номер локации (1..20)
  title: string; // Название локации
  zone: string; // Территориальная зона парка/базы
  lat: number; // Широта
  lng: number; // Долгота
}

// Массив из 20 объектов локаций с реальными координатами на территории парка
export const QUEST_LOCATIONS: QuestLocation[] = [
  {
    id: 'point_01',
    number: 1,
    title: 'Главный фонтан на центральной аллее',
    zone: 'Центральный партер',
    lat: 55.7312,
    lng: 37.6034,
  },
  {
    id: 'point_02',
    number: 2,
    title: 'Лодочная пристань у Голицынского пруда',
    zone: 'Набережная и пруды',
    lat: 55.7294,
    lng: 37.5998,
  },
  {
    id: 'point_03',
    number: 3,
    title: 'Ажурная беседка у розария',
    zone: 'Цветочный сад',
    lat: 55.7301,
    lng: 37.6012,
  },
  {
    id: 'point_04',
    number: 4,
    title: 'Детская площадка «Морской корабль»',
    zone: 'Семейная зона',
    lat: 55.7282,
    lng: 37.6025,
  },
  {
    id: 'point_05',
    number: 5,
    title: 'Смотровая терраса у Андреевского моста',
    zone: 'Набережная и пруды',
    lat: 55.7265,
    lng: 37.5968,
  },
  {
    id: 'point_06',
    number: 6,
    title: 'Летний кинотеатр на газоне',
    zone: 'Центральный партер',
    lat: 55.7306,
    lng: 37.6052,
  },
  {
    id: 'point_07',
    number: 7,
    title: 'Павильон проката веломобилей',
    zone: 'Активный отдых',
    lat: 55.7321,
    lng: 37.6048,
  },
  {
    id: 'point_08',
    number: 8,
    title: 'Каменный гротик у малого пруда',
    zone: 'Нескучный лес',
    lat: 55.7273,
    lng: 37.5985,
  },
  {
    id: 'point_09',
    number: 9,
    title: 'Оранжерея с тропическими растениями',
    zone: 'Цветочный сад',
    lat: 55.7261,
    lng: 37.5999,
  },
  {
    id: 'point_10',
    number: 10,
    title: 'Деревянный мостик над лесным оврагом',
    zone: 'Нескучный лес',
    lat: 55.7239,
    lng: 37.5962,
  },
  {
    id: 'point_11',
    number: 11,
    title: 'Беседка «Ротонда 800-летия»',
    zone: 'Набережная и пруды',
    lat: 55.7248,
    lng: 37.5924,
  },
  {
    id: 'point_12',
    number: 12,
    title: 'Лесной чайный домик',
    zone: 'Семейная зона',
    lat: 55.7232,
    lng: 37.5947,
  },
  {
    id: 'point_13',
    number: 13,
    title: 'Веревочный городок среди сосен',
    zone: 'Активный отдых',
    lat: 55.7254,
    lng: 37.5978,
  },
  {
    id: 'point_14',
    number: 14,
    title: 'Домик с кормушками для белок и фазанов',
    zone: 'Живой уголок',
    lat: 55.7224,
    lng: 37.5931,
  },
  {
    id: 'point_15',
    number: 15,
    title: 'Шахматный павильон под липами',
    zone: 'Нескучный лес',
    lat: 55.7241,
    lng: 37.5989,
  },
  {
    id: 'point_16',
    number: 16,
    title: 'Солнечные часы на южной поляне',
    zone: 'Цветочный сад',
    lat: 55.7289,
    lng: 37.6041,
  },
  {
    id: 'point_17',
    number: 17,
    title: 'Зеленый амфитеатр у воды',
    zone: 'Набережная и пруды',
    lat: 55.7278,
    lng: 37.5951,
  },
  {
    id: 'point_18',
    number: 18,
    title: 'Аллея вековых дубов',
    zone: 'Нескучный лес',
    lat: 55.7218,
    lng: 37.5958,
  },
  {
    id: 'point_19',
    number: 19,
    title: 'Семейное кафе «Лесная поляна»',
    zone: 'Семейная зона',
    lat: 55.7269,
    lng: 37.6019,
  },
  {
    id: 'point_20',
    number: 20,
    title: 'Главные арки у центрального входа',
    zone: 'Центральный партер',
    lat: 55.7328,
    lng: 37.6039,
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
