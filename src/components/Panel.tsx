import type { CampaignClientPhase } from "../types/types";
import { XMarkIcon } from "@heroicons/react/24/outline";
import PhaseDetail from "./phases/PhaseDetail";

export default function Panel({
  selectedPhaseId,
  phase,
  onClosePanel,
  onPhaseChanged,
  onCampaignStateChange,
}: {
  selectedPhaseId: number | null;
  phase: CampaignClientPhase | null;
  onClosePanel: () => void;
  onPhaseChanged: () => void;
  onCampaignStateChange?: () => void;
}) {
  const isOpen = selectedPhaseId === phase?.client_phase_id;

  return (
    <div
      className={`panel fixed right-0 top-0 h-screen w-screen min-w-180 bg-black/10 transition-transform duration-300 flex justify-center items-center ${
        isOpen ? "opacity-100 z-999" : "opacity-0 -z-1"
      }`}

      onClick={(event) => {
        if (event.target === document.querySelector(".panel")) {
          event.stopPropagation();
          onClosePanel();
        }
      }}
    >
      <div className="panel-content relative h-[90vh] w-[48vw] overflow-y-auto border border-gray-300 rounded-2xl p-12 bg-white">
        <div
          className="close absolute right-3 top-3 h-5 w-5"
          onClick={(event) => {
            event.stopPropagation();
            onClosePanel();
          }}
        >
          <XMarkIcon className="h-full w-full cursor-pointer" />
        </div>

        {phase && (
          <PhaseDetail phase={phase} onPhaseChanged={onPhaseChanged} onCampaignStateChange={onCampaignStateChange} closePanel={onClosePanel} />
        )}
      </div>
    </div>
  );
}