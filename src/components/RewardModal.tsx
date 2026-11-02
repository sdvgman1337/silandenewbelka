import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Copy, Check, X } from 'lucide-react';
import { REWARD_PROMO_CODE, TOTAL_LOCATIONS } from '../utils/questLogic';

interface RewardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RewardModal: React.FC<RewardModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#10B981', '#F97316', '#0EA5E9', '#FACC15'],
      });
    } catch {
      // Игнорируем ошибку в headless-окружении
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(REWARD_PROMO_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const input = document.createElement('textarea');
      input.value = REWARD_PROMO_CODE;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="victory-modal-title"
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/55 backdrop-blur-sm animate-fadeIn"
    >
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl border border-emerald-100">
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть окно поздравления"
          className="absolute top-4 right-4 min-h-[44px] min-w-[44px] rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 mb-4">
          <Trophy className="w-10 h-10" />
        </div>

        <span className="inline-block text-xs font-extrabold uppercase tracking-wider text-emerald-700 mb-1">
          Все {TOTAL_LOCATIONS} из {TOTAL_LOCATIONS} локаций открыты!
        </span>

        <h2
          id="victory-modal-title"
          className="text-2xl font-extrabold text-slate-900 mb-2"
        >
          Поздравляем с победой!
        </h2>

        <p className="text-sm text-slate-600 leading-relaxed mb-5">
          Вы успешно прошли весь семейный квест на территории базы отдыха! Покажите этот промокод администратору или укажите при следующем бронировании:
        </p>

        <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-dashed border-emerald-400 mb-5">
          <span className="block text-xs font-bold text-emerald-800 mb-1">
            ВАШ ПРИЗОВОЙ ПРОМОКОД
          </span>
          <strong
            data-testid="reward-promo-code"
            className="text-3xl font-extrabold tracking-widest text-emerald-700 select-all"
          >
            {REWARD_PROMO_CODE}
          </strong>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handleCopy}
            className="w-full min-h-[54px] px-5 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 active:scale-[0.99] transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5" />
                <span>Промокод скопирован!</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                <span>Скопировать промокод</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[48px] px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors cursor-pointer"
          >
            Вернуться к карте
          </button>
        </div>
      </div>
    </div>
  );
};
