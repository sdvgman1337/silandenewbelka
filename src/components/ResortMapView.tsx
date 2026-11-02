import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  MapPin,
  QrCode,
  CheckCircle2,
  Compass,
  Gift,
  Navigation,
} from 'lucide-react';
import {
  MAP_DEFAULT_CENTER,
  MAP_DEFAULT_ZOOM,
  QuestLocation,
  TOTAL_LOCATIONS,
} from '../utils/questLogic';

interface ResortMapViewProps {
  foundLocations: QuestLocation[];
  focusedLocationId: string | null;
  onFocusLocation: (location: QuestLocation) => void;
  onOpenScanner: () => void;
  onOpenRewardModal: () => void;
}

/**
 * Создает красивый кастомный SVG-маркер для найденной локации на карте Leaflet
 */
function createPinIcon(number: number, isFocused: boolean): L.DivIcon {
  const bg = isFocused ? '#F97316' : '#10B981';
  const ring = isFocused ? 'rgba(249, 115, 22, 0.32)' : 'rgba(16, 185, 129, 0.28)';

  return L.divIcon({
    className: 'quest-pin-marker',
    iconSize: [40, 48],
    iconAnchor: [20, 44],
    popupAnchor: [0, -40],
    html: `
      <div style="
        position: relative;
        width: 40px;
        height: 48px;
        display: flex;
        align-items: flex-start;
        justify-content: center;
      ">
        <div style="
          width: 36px;
          height: 36px;
          border-radius: 9999px;
          background: ${bg};
          border: 3px solid #ffffff;
          box-shadow: 0 6px 14px ${ring}, 0 2px 6px rgba(15, 23, 42, 0.18);
          color: #ffffff;
          font-weight: 800;
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          ${number}
        </div>
        <div style="
          position: absolute;
          bottom: 4px;
          width: 10px;
          height: 10px;
          background: ${bg};
          transform: rotate(45deg);
          border-right: 2px solid #ffffff;
          border-bottom: 2px solid #ffffff;
        "></div>
      </div>
    `,
  });
}

export const ResortMapView: React.FC<ResortMapViewProps> = ({
  foundLocations,
  focusedLocationId,
  onFocusLocation,
  onOpenScanner,
  onOpenRewardModal,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const markerMapRef = useRef<Map<string, L.Marker>>(new Map());

  const foundCount = foundLocations.length;
  const progressPercent = Math.round((foundCount / TOTAL_LOCATIONS) * 100);
  const isAllComplete = foundCount >= TOTAL_LOCATIONS;

  // Инициализация карты Leaflet с тайлами OpenStreetMap
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: MAP_DEFAULT_CENTER,
      zoom: MAP_DEFAULT_ZOOM,
      zoomControl: false,
      attributionControl: true,
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    markersLayerRef.current = markersLayer;

    // Корректировка размеров контейнера после рендера
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 120);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
      markerMapRef.current.clear();
    };
  }, []);

  // Отрисовка ТОЛЬКО найденных меток на карте
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    markerMapRef.current.clear();

    foundLocations.forEach((loc) => {
      const isFocused = loc.id === focusedLocationId;
      const marker = L.marker([loc.lat, loc.lng], {
        icon: createPinIcon(loc.number, isFocused),
      });

      marker.bindPopup(`
        <div style="min-width: 170px;">
          <div style="font-size: 11px; font-weight: 700; color: #059669; margin-bottom: 2px;">
            Локация №${loc.number} · Открыта
          </div>
          <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 2px;">
            ${loc.title}
          </div>
          <div style="font-size: 12px; color: #64748b;">
            ${loc.zone}
          </div>
        </div>
      `);

      marker.on('click', () => {
        onFocusLocation(loc);
      });

      marker.addTo(layer);
      markerMapRef.current.set(loc.id, marker);
    });
  }, [foundLocations, focusedLocationId, onFocusLocation]);

  // Плавное перемещение карты к выбранной найденной локации
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !focusedLocationId) return;

    const targetLoc = foundLocations.find((l) => l.id === focusedLocationId);
    const marker = markerMapRef.current.get(focusedLocationId);

    if (targetLoc && marker) {
      map.flyTo([targetLoc.lat, targetLoc.lng], 16, {
        duration: 0.6,
      });
      marker.openPopup();
    }
  }, [focusedLocationId, foundLocations]);

  const handleResetView = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo(MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM, {
      duration: 0.6,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Карточка с интерактивной картой Leaflet */}
      <section
        aria-label="Интерактивная карта территории"
        className="bg-white rounded-3xl p-3 shadow-sm border border-slate-200/80"
      >
        <div className="relative isolate w-full h-[310px] rounded-2xl overflow-hidden border border-slate-200/70 bg-emerald-50/40">
          <div
            ref={mapContainerRef}
            data-testid="leaflet-map-container"
            className="w-full h-full z-10"
          />

          {/* Кнопка возврата к центру парка */}
          <button
            type="button"
            onClick={handleResetView}
            aria-label="Показать весь парк"
            className="absolute bottom-3 left-3 z-20 min-h-[42px] px-3.5 py-2 rounded-xl bg-white/95 backdrop-blur-sm border border-slate-200 shadow-md text-slate-700 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-transform cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5 text-emerald-600" />
            <span>Весь парк</span>
          </button>
        </div>
      </section>

      {/* Блок прогресса (крупный счетчик под картой) */}
      <section
        aria-label="Прогресс квеста и найденные локации"
        className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80"
      >
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <span className="block text-xs font-semibold text-emerald-700 mb-0.5">
              Ваш маршрут приключений
            </span>
            <h2
              data-testid="progress-counter-heading"
              className="text-2xl font-extrabold text-slate-900 tracking-tight tabular-nums"
            >
              Найдено: {foundCount} из {TOTAL_LOCATIONS}
            </h2>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex flex-col items-center justify-center shrink-0">
            <span className="text-base font-extrabold text-emerald-700 tabular-nums leading-none">
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* Полоса прогресса */}
        <div
          role="progressbar"
          aria-label="Прогресс прохождения квеста"
          aria-valuemin={0}
          aria-valuemax={TOTAL_LOCATIONS}
          aria-valuenow={foundCount}
          className="w-full h-3.5 rounded-full bg-slate-100 overflow-hidden mb-5"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Кнопка открытия награды, если собраны все 20 из 20 */}
        {isAllComplete && (
          <button
            type="button"
            onClick={onOpenRewardModal}
            className="w-full min-h-[54px] mb-5 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-base flex items-center justify-center gap-2.5 shadow-lg shadow-orange-500/25 active:scale-[0.99] transition-transform cursor-pointer"
          >
            <Gift className="w-5 h-5" />
            <span>Посмотреть призовой промокод</span>
          </button>
        )}

        {/* Список ТОЛЬКО уже найденных локаций */}
        {foundCount === 0 ? (
          <div className="rounded-2xl bg-emerald-50/60 border border-emerald-100 p-5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto mb-3">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Пока не открыто ни одной метки
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Гуляйте по парку, находите таблички с QR-кодами и сканируйте их камерой — каждая найденная точка сразу появится на карте и в этом списке!
            </p>
            <button
              type="button"
              onClick={onOpenScanner}
              className="w-full min-h-[52px] px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-[0.99] transition-all cursor-pointer"
            >
              <QrCode className="w-5 h-5" />
              <span>Сканировать первый QR-код</span>
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-700">
                Открытые локации ({foundCount})
              </h3>
              <span className="text-xs text-slate-500">
                Нажмите, чтобы показать на карте
              </span>
            </div>

            <ul
              data-testid="found-locations-list"
              className="flex flex-col gap-2.5"
            >
              {foundLocations.map((loc) => {
                const isSelected = loc.id === focusedLocationId;
                return (
                  <li key={loc.id}>
                    <button
                      type="button"
                      onClick={() => onFocusLocation(loc)}
                      className={`w-full min-h-[68px] p-3.5 rounded-2xl border text-left flex items-center gap-3.5 transition-all cursor-pointer active:scale-[0.99] ${
                        isSelected
                          ? 'bg-orange-50/70 border-orange-300 shadow-sm'
                          : 'bg-slate-50/70 hover:bg-slate-50 border-slate-200/80'
                      }`}
                    >
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center font-extrabold text-sm shrink-0 ${
                          isSelected
                            ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/25'
                            : 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                        }`}
                      >
                        #{loc.number}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="text-base font-bold text-slate-900 truncate">
                          {loc.title}
                        </div>
                        <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{loc.zone}</span>
                        </div>
                      </div>

                      <div className="shrink-0 text-emerald-600">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
};
