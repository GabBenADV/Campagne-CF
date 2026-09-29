import type { CampaignClientPhase, Client } from "../types/types";
import { XMarkIcon } from "@heroicons/react/24/outline";
import PhaseDetail from "./phases/PhaseDetail";

export default function Panel({
  selectedPhaseId,
  phase,
  client,
  onClosePanel,
  onPhaseChanged,
  onCampaignStateChange,
}: {
  selectedPhaseId: number | null;
  phase: CampaignClientPhase | null;
  client: Client | null;
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

        {client && (
          <div className="sticky top-0 z-10 mb-6 border-b border-gray-200 bg-white pb-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Cliente
            </div>

            <div className="mt-1 text-lg font-bold text-gray-900">
              {client.accountnumber} · {client.company}
            </div>
          </div>
        )}

        {phase && (
          <PhaseDetail phase={phase} onPhaseChanged={onPhaseChanged} onCampaignStateChange={onCampaignStateChange} closePanel={onClosePanel} />
        )}
      </div>
    </div>
  );
}