import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CameraOff, QrCode, AlertCircle } from 'lucide-react';

interface QrScannerViewProps {
  onCodeScanned: (code: string) => void;
}

export const QrScannerView: React.FC<QrScannerViewProps> = ({
  onCodeScanned,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScanRef = useRef<{ text: string; time: number }>({
    text: '',
    time: 0,
  });

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === 2 || state === 3) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch {
        // Игнорируем ошибку остановки при размонтировании
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      await stopCamera();
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;
      setIsScanning(true);

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 12,
          qrbox: { width: 230, height: 230 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          const now = Date.now();
          if (
            decodedText === lastScanRef.current.text &&
            now - lastScanRef.current.time < 2500
          ) {
            return;
          }
          lastScanRef.current = { text: decodedText, time: now };
          onCodeScanned(decodedText);
        },
        () => {
          // Игнорируем пустые кадры видеопотока
        }
      );
    } catch {
      setIsScanning(false);
      setCameraError(
        'Для сканирования QR-кодов необходим доступ к камере смартфона. Разрешите использование камеры в настройках браузера и нажмите «Включить камеру».'
      );
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <section
      aria-label="Сканирование QR-кода камерой"
      className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80"
    >
      <div className="text-center mb-4">
        <span className="inline-block text-xs font-bold text-emerald-700 mb-1">
          Поиск локаций
        </span>
        <h2 className="text-xl font-extrabold text-slate-900">
          Наведите камеру на QR-код
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Поместите табличку с кодом в центр рамки — метка откроется автоматически
        </p>
      </div>

      {/* Область live-камеры html5-qrcode */}
      <div className="relative w-full aspect-square max-h-[360px] mx-auto rounded-3xl overflow-hidden bg-slate-900 border-2 border-emerald-500/30 shadow-inner mb-4 flex items-center justify-center">
        <div id="qr-reader" className="w-full h-full" />

        {!isScanning && (
          <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-6 text-center z-10">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 mb-4">
              <QrCode className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1.5">
              Камера ожидает включения
            </h3>
            <p className="text-sm text-slate-300 max-w-xs mb-5 leading-relaxed">
              Нажмите кнопку ниже и подтвердите разрешение на доступ к камере вашего телефона.
            </p>
            <button
              type="button"
              onClick={startCamera}
              className="min-h-[54px] px-7 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-base flex items-center gap-2.5 shadow-lg shadow-emerald-500/30 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Camera className="w-5 h-5" />
              <span>Включить камеру</span>
            </button>
          </div>
        )}

        {/* Рамка видоискателя */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-6 flex items-center justify-center z-20"
        >
          <div className="relative w-56 h-56">
            <span className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-2xl" />
            <span className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-2xl" />
            <span className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-2xl" />
            <span className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-2xl" />
            {isScanning && (
              <div className="w-full h-1 rounded-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-scan-beam" />
            )}
          </div>
        </div>
      </div>

      {/* Сообщение, если доступ к камере отклонен */}
      {cameraError && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-orange-50 border border-orange-200 text-orange-900 text-sm flex items-start gap-3 mb-4"
        >
          <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{cameraError}</span>
        </div>
      )}

      {/* Крупная кнопка приостановки активной камеры */}
      {isScanning && (
        <button
          type="button"
          onClick={stopCamera}
          className="w-full min-h-[54px] px-5 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-base flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <CameraOff className="w-5 h-5 text-slate-500" />
          <span>Приостановить камеру</span>
        </button>
      )}
    </section>
  );
};
