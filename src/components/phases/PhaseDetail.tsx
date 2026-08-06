import type { CampaignClientPhase } from "../../types/types";
import PhaseDocuments from "./PhaseDocuments";
import PhaseComments from "./PhaseComments";
import PhaseWorkflowActions from "./PhaseWorkflowActions";
import EditorContent from "../tools/EditorContent";
import {
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";

export default function PhaseDetail({
  phase,
  onPhaseChanged,
  onCampaignStateChange,
  closePanel
}: {
  phase: CampaignClientPhase;
  onPhaseChanged: () => void;
  onCampaignStateChange?: () => void;
  closePanel?: () => void;
}) {
  // console.log("PhaseDetail permissions:", phase.permissions);
  // console.log("[DEBUG main document][PhaseDetail]", {
  //   position: phase.position,
  //   client_phase_id: phase.client_phase_id,
  //   main_document: phase.main_document_id,
  //   permissions: phase.permissions,
  // });
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-300 bg-white p-4">
        <h2 className="text-xl font-bold uppercase">
          {phase.position}. {phase.title}
        </h2>

        {phase.descr && (
          // <p className="mt-2 text-sm text-gray-600" dangerouslySetInnerHTML={{ __html: phase.descr }}></p>
          <EditorContent html={phase.descr} className="mt-2 text-sm text-gray-600" />
        )}
      </div>

      <div className="rounded-lg border border-gray-300 bg-white p-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold uppercase">
          Scarica modulo proposta d'iscrizione
        </h2>
        <a
            href="https://www.comoliferrari.it/uploads/campaigns/master/20260427085226_5d00dc38_20260109101741_9c6e30c5_Proposta_Iscrizione_LETTERA_PREMIO_ANNUALE_STANDARD_-_2026.xlsx"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm! font-semibold text-gray-700 transition hover:bg-white"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            Scarica
          </a>
      </div>


      <PhaseDocuments
        clientPhaseId={phase.client_phase_id}
        campaignId={phase.campaign_id}
        clientId={phase.client_id}
        mainDocumentId={phase.main_document_id ?? null}
        mainDocumentFileName={phase.main_document_file_name ?? null}
        canUploadMainDocument={Boolean(phase.permissions?.can_upload_main_document)}
        canDeleteMainDocument={Boolean(phase.permissions?.can_delete_main_document)}
        canUploadPhaseFiles={Boolean(phase.permissions?.can_upload_phase_files)}
        canDeletePhaseFiles={Boolean(
          phase.permissions?.can_delete_phase_files ||
            phase.permissions?.can_delete_own_phase_files
        )}
      />

      <PhaseComments
        clientPhaseId={phase.client_phase_id}
        canViewComments={Boolean(phase.permissions?.can_view_comments)}
        canAddComment={Boolean(phase.permissions?.can_add_comment)}
      />

      <PhaseWorkflowActions phase={phase} onChanged={onPhaseChanged} onCampaignStateChange={onCampaignStateChange} closePanel={closePanel} />

    </div>
  );
}