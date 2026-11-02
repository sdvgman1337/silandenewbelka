/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import {
  Map,
  QrCode,
  Trees,
  CheckCircle2,
  Info,
  AlertCircle,
  Gift,
} from 'lucide-react';
import {
  QuestLocation,
  calculateProgress,
  getFoundLocations,
  loadFoundIdsFromStorage,
  processQrScan,
  saveFoundIdsToStorage,
} from './utils/questLogic';
import { ResortMapView } from './components/ResortMapView';
import { QrScannerView } from './components/QrScannerView';
import { RewardModal } from './components/RewardModal';

type TabType = 'map' | 'scanner';

interface ToastBanner {
  status: 'found_new' | 'already_found' | 'invalid_code';
  message: string;
}

export default function App() {
  const [foundIds, setFoundIds] = useState<string[]>(() =>
    loadFoundIdsFromStorage()
  );
  const [activeTab, setActiveTab] = useState<TabType>('map');
  const [focusedLocationId, setFocusedLocationId] = useState<string | null>(
    null
  );
  const [isRewardOpen, setIsRewardOpen] = useState(false);
  const [toast, setToast] = useState<ToastBanner | null>(null);

  useEffect(() => {
    saveFoundIdsToStorage(foundIds);
  }, [foundIds]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const foundLocations = getFoundLocations(foundIds);
  const progress = calculateProgress(foundIds);

  const handleQrCodeScanned = (rawText: string) => {
    const outcome = processQrScan(rawText, foundIds);
    setToast({
      status: outcome.status,
      message: outcome.message,
    });

    if (outcome.status === 'found_new' && outcome.location) {
      setFoundIds(outcome.updatedFoundIds);
      setFocusedLocationId(outcome.location.id);
      setActiveTab('map');

      if (outcome.isCompletedNow) {
        setIsRewardOpen(true);
      }
    } else if (outcome.status === 'already_found' && outcome.location) {
      setFocusedLocationId(outcome.location.id);
      setActiveTab('map');
    }
  };

  const handleFocusLocation = (location: QuestLocation) => {
    setFocusedLocationId(location.id);
  };

  return (
    <div className="min-h-dvh bg-[#F6F9F7] text-slate-800 pb-28">
      {/* Мобильный контейнер приложения */}
      <div className="max-w-md mx-auto">
        {/* Светлая дружелюбная шапка */}
        <header className="sticky top-0 z-[500] bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shadow-emerald-600/25 shrink-0">
                <Trees className="w-5 h-5" />
              </div>
              <div className="truncate">
                <h1 className="text-base font-extrabold text-slate-900 leading-tight truncate">
                  Семейный Эко-Квест
                </h1>
                <p className="text-xs font-medium text-slate-500 truncate">
                  Найдите 20 секретных мест парка
                </p>
              </div>
            </div>

            {progress.isComplete ? (
              <button
                type="button"
                onClick={() => setIsRewardOpen(true)}
                className="min-h-[42px] px-3.5 py-2 rounded-2xl bg-orange-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-orange-500/25 shrink-0 cursor-pointer"
              >
                <Gift className="w-4 h-4" />
                <span>Приз</span>
              </button>
            ) : (
              <div className="px-3.5 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-200/70 text-emerald-800 font-extrabold text-sm tabular-nums shrink-0">
                {progress.foundCount} / {progress.totalCount}
              </div>
            )}
          </div>
        </header>

        {/* Основная область контента */}
        <main className="px-4 pt-4">
          {/* Всплывающее уведомление о результате сканирования */}
          {toast && (
            <div
              role="status"
              aria-live="polite"
              className={`mb-4 p-4 rounded-2xl border text-sm font-semibold flex items-start gap-3 shadow-sm ${
                toast.status === 'found_new'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : toast.status === 'already_found'
                  ? 'bg-sky-50 border-sky-200 text-sky-950'
                  : 'bg-orange-50 border-orange-200 text-orange-950'
              }`}
            >
              {toast.status === 'found_new' && (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              )}
              {toast.status === 'already_found' && (
                <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
              )}
              {toast.status === 'invalid_code' && (
                <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
              )}
              <span className="flex-1 leading-snug">{toast.message}</span>
            </div>
          )}

          {activeTab === 'map' ? (
            <ResortMapView
              foundLocations={foundLocations}
              focusedLocationId={focusedLocationId}
              onFocusLocation={handleFocusLocation}
              onOpenScanner={() => setActiveTab('scanner')}
              onOpenRewardModal={() => setIsRewardOpen(true)}
            />
          ) : (
            <QrScannerView onCodeScanned={handleQrCodeScanned} />
          )}
        </main>
      </div>

      {/* Фиксированное нижнее меню (Bottom Tab Bar) с 2 крупными кнопками */}
      <nav
        aria-label="Нижнее меню навигации"
        className="fixed bottom-0 left-0 right-0 z-[500] bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-8px_24px_rgba(15,23,42,0.06)]"
      >
        <div className="max-w-md mx-auto px-4 py-2.5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('map')}
            aria-current={activeTab === 'map' ? 'page' : undefined}
            className={`min-h-[54px] rounded-2xl px-4 py-2.5 flex items-center justify-center gap-2.5 text-base font-extrabold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'map'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <Map className="w-5 h-5" />
            <span>Карта</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('scanner')}
            aria-current={activeTab === 'scanner' ? 'page' : undefined}
            className={`min-h-[54px] rounded-2xl px-4 py-2.5 flex items-center justify-center gap-2.5 text-base font-extrabold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'scanner'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <QrCode className="w-5 h-5" />
            <span>Сканировать</span>
          </button>
        </div>
      </nav>

      {/* Финальное поздравительное окно при сборе 20 из 20 */}
      <RewardModal
        isOpen={isRewardOpen}
        onClose={() => setIsRewardOpen(false)}
      />
    </div>
  );
}
