import { useEffect, useRef, useState } from "react";
import { InformationCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import EditorContent from "../tools/EditorContent";
import Badges from "../tools/Badges";
import gsap from "gsap";
import type { CampaignClientPhase } from "../../types/types";

export default function PhaseItem({
  phase,
  canOpenDetail = true,
}: {
  phase: CampaignClientPhase;
  canOpenDetail?: boolean;
}) {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);

  const openInfoModal = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setIsInfoModalOpen(true);
  };

  const closeInfoModal = () => {
    if (!modalRef.current) {
      setIsInfoModalOpen(false);
      return;
    }

    gsap.to(modalRef.current, {
      opacity: 0,
      y: 50,
      duration: 0.2,
      ease: "power2.in",
      onComplete: () => setIsInfoModalOpen(false),
    });
  };

  useEffect(() => {
    if (!isInfoModalOpen || !modalRef.current) return;

    gsap.fromTo(
      modalRef.current,
      {
        opacity: 0,
        y: -50,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: "power3.out",
      }
    );
  }, [isInfoModalOpen]);

  return (
    <>
      <div
        className={`phase-item phase-state-${phase.phase_state?.toLowerCase()} ${
          canOpenDetail ? "cursor-pointer" : "cursor-not-allowed"
        }`}
      >
        <div
          className={`flex items-center justify-between gap-4 rounded-lg border border-gray-300 bg-white p-3 ${
            canOpenDetail ? "" : "bg-gray-50"
          }`}
        >
          <h1 className="uppercase font-bold">
            {phase.position}. {phase.title}
          </h1>

          <Badges phase={phase} />

          <button
            type="button"
            onClick={openInfoModal}
            className="shrink-0 rounded-full p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 cursor-pointer"
            aria-label="Mostra descrizione fase"
          >
            <InformationCircleIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      {isInfoModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={closeInfoModal}
        >
          <div
            ref={modalRef}
            className="relative w-full max-w-lg rounded-2xl bg-white p-7 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeInfoModal}
              className="absolute right-4 top-4 rounded-full p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 cursor-pointer"
              aria-label="Chiudi modale"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>

            <h2 className="mb-4 pr-8 text-lg font-bold uppercase">
              {phase.position}. {phase.title}
            </h2>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
              <EditorContent html={phase.descr} className="mt-2 text-sm text-gray-600" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}