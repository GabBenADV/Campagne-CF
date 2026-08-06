import { useState } from "react";
import {
  CheckCircleIcon,
  PaperAirplaneIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { campaignsApi } from "../../services/campaignsApi";
import type { CampaignClientPhase } from "../../types/types";

type PhaseWorkflowActionsProps = {
  phase: CampaignClientPhase;
  onChanged: () => void;
  onCampaignStateChange?: () => void;
  closePanel?: () => void;
};

export default function PhaseWorkflowActions({
  phase,
  onChanged,
  onCampaignStateChange,
  closePanel,
}: PhaseWorkflowActionsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isCompletingCampaign, setIsCompletingCampaign] = useState(false);
  const [isCancellingCampaign, setIsCancellingCampaign] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = Boolean(phase.permissions?.can_submit_for_approval);
  const canApprove = Boolean(phase.permissions?.can_approve);
  const canReject = Boolean(phase.permissions?.can_reject);
  const canCompleteCampaign = Boolean(phase.permissions?.can_complete_campaign);
  const canCancelCampaign = Boolean(phase.permissions?.can_cancel_campaign);

  if (
    !canSubmit &&
    !canApprove &&
    !canReject &&
    !canCompleteCampaign &&
    !canCancelCampaign
  ) {
    return null;
  }

  const getErrorMessage = (error: unknown, fallback: string) => {
    return error instanceof Error && error.message ? error.message : fallback;
  };

  const submitPhase = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await campaignsApi("submitPhaseForApproval", {
        client_phase_id: phase.client_phase_id,
      });

      onChanged();
      if (onCampaignStateChange) {
        onCampaignStateChange();
        closePanel?.();
      }
    } catch (error) {
      console.error("Errore invio fase in approvazione:", error);
      setError(
        getErrorMessage(
          error,
          "Non è stato possibile inviare la fase in approvazione.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const approvePhase = async () => {
    if (isApproving) return;

    const confirmed = window.confirm("Vuoi approvare questa fase?");
    if (!confirmed) return;

    setIsApproving(true);
    setError(null);

    try {
      await campaignsApi("approvePhase", {
        client_phase_id: phase.client_phase_id,
      });

      onChanged();
      if (onCampaignStateChange) {
        onCampaignStateChange();
        closePanel?.();
      }
    } catch (error) {
      console.error("Errore approvazione fase:", error);
      setError(
        getErrorMessage(error, "Non è stato possibile approvare la fase."),
      );
    } finally {
      setIsApproving(false);
    }
  };

  const rejectPhase = async () => {
    if (isRejecting) return;

    setIsRejecting(true);
    setError(null);

    try {
      const comments = await campaignsApi<
        Array<{
          fk_user_id?: number | null;
        }>
      >("getPhaseComments", {
        client_phase_id: phase.client_phase_id,
      });

      const latestComment = Array.isArray(comments) ? comments[0] : null;
      const latestCommentUserId = Number(latestComment?.fk_user_id ?? 0);
      const currentUserId = Number(phase.permissions?.current_user_id ?? 0);

      if (latestCommentUserId <= 0 || latestCommentUserId !== currentUserId) {
        window.alert(
          "Per poter respingere una fase è obbligatorio spiegarne i motivi. Per favore scrivi un commento prima di respingere la fase.",
        );

        return;
      }

      const confirmed = window.confirm(
        "Assicurati di aver spiegato le motivazioni della respinta. Vuoi continuare?",
      );

      if (!confirmed) {
        return;
      }

      await campaignsApi("rejectPhase", {
        client_phase_id: phase.client_phase_id,
      });

      onChanged();
      onCampaignStateChange?.();
    } catch (error) {
      console.error("Errore respinta fase:", error);
      setError(
        getErrorMessage(error, "Non è stato possibile respingere la fase."),
      );
    } finally {
      setIsRejecting(false);
    }
  };

  const completeCampaign = async () => {
    if (isCompletingCampaign) return;

    const confirmed = window.confirm(
      "Vuoi completare la campagna per questo cliente?",
    );

    if (!confirmed) return;

    setIsCompletingCampaign(true);
    setError(null);

    try {
      await campaignsApi("completeCampaign", {
        client_phase_id: phase.client_phase_id,
      });

      onChanged();
      if (onCampaignStateChange) {
        onCampaignStateChange();
      }
    } catch (error) {
      console.error("Errore completamento campagna:", error);
      setError(
        getErrorMessage(error, "Non è stato possibile completare la campagna."),
      );
    } finally {
      setIsCompletingCampaign(false);
    }
  };

  const cancelCampaign = async () => {
    if (isCancellingCampaign) return;

    const confirmed = window.confirm(
      "Vuoi annullare la campagna per questo cliente?",
    );

    if (!confirmed) return;

    setIsCancellingCampaign(true);
    setError(null);

    try {
      await campaignsApi("cancelCampaign", {
        client_phase_id: phase.client_phase_id,
      });

      onChanged();
      if (onCampaignStateChange) {
        onCampaignStateChange();
        closePanel?.();
      }
    } catch (error) {
      console.error("Errore annullamento campagna:", error);
      setError(
        getErrorMessage(error, "Non è stato possibile annullare la campagna."),
      );
    } finally {
      setIsCancellingCampaign(false);
    }
  };

  return (
    <section className="rounded-lg border border-gray-300 bg-white p-4">
      <h3 className="mb-3 text-lg font-bold uppercase">Azioni fase</h3>

      {error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {canSubmit && (
          <button
            type="button"
            onClick={submitPhase}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg! bg-green-700! px-3 py-2 text-sm! font-semibold text-white transition hover:bg-green-900! disabled:cursor-not-allowed disabled:opacity-50"
          >
            <PaperAirplaneIcon className="h-4 w-4" />
            {isSubmitting ? "Invio..." : "Invia in approvazione"}
          </button>
        )}

        {canApprove && (
          <button
            type="button"
            onClick={approvePhase}
            disabled={isApproving}
            className="inline-flex items-center gap-2 rounded-lg border border-green-700 px-3 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCircleIcon className="h-4 w-4" />
            {isApproving ? "Approvo..." : "Approva"}
          </button>
        )}

        {canReject && (
          <button
            type="button"
            onClick={rejectPhase}
            disabled={isRejecting}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <XCircleIcon className="h-4 w-4" />
            {isRejecting ? "Respingo..." : "Respingi"}
          </button>
        )}

        {canCompleteCampaign && (
          <button
            type="button"
            onClick={completeCampaign}
            disabled={isCompletingCampaign}
            className="inline-flex items-center gap-2 rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCircleIcon className="h-4 w-4" />
            {isCompletingCampaign ? "Completo..." : "Completa campagna"}
          </button>
        )}

        {canCancelCampaign && (
          <button
            type="button"
            onClick={cancelCampaign}
            disabled={isCancellingCampaign}
            className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <XCircleIcon className="h-4 w-4" />
            {isCancellingCampaign ? "Annullamento..." : "Annulla campagna"}
          </button>
        )}
      </div>
    </section>
  );
}
