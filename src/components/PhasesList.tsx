import { useEffect, useState } from "react";
import type { CampaignClientPhase, Client } from "../types/types";
import { campaignsApi } from "../services/campaignsApi";
import Panel from "./Panel";
import PhaseItem from "./phases/PhaseItem";

export default function PhasesList({
  clientId,
  client,
  campaignId,
  selectedPhaseId,
  onSelectedPhase,
  onClosePanel,
  refreshKey,
  onCampaignStateChange,
}: {
  clientId: number | null;
  client: Client | null;
  campaignId: number | null;
  selectedPhaseId: number | null;
  onSelectedPhase: (phaseId: number) => void;
  onClosePanel: () => void;
  refreshKey?: number;
  onCampaignStateChange?: () => void;
}) {
  const [phases, setPhases] = useState<CampaignClientPhase[]>([]);
  const selectedPhase =
    phases.find((phase) => phase.client_phase_id === selectedPhaseId) ?? null;

  const fetchPhases = async () => {
    if (clientId === null || campaignId === null) {
      setPhases([]);
      return;
    }

    try {
      const data = await campaignsApi<CampaignClientPhase[]>(
        "getCampaignClientPhases",
        {
          client_id: clientId,
          campaign_id: campaignId,
        },
      );

      // console.log("Phases data:", data);
      setPhases(data);
    } catch (error) {
      console.error(
        "Error fetching phases for campaign",
        campaignId,
        "and client",
        clientId,
        ":",
        error,
      );

      setPhases([]);
    }
  };

  useEffect(() => {
    fetchPhases();
  }, [clientId, campaignId, refreshKey]);

  if (campaignId === null) {
    return <div>Seleziona una campagna.</div>;
  }

  if (clientId === null) {
    return <div>Seleziona un cliente per visualizzare le fasi.</div>;
  }

  return (
    <>
      <div className="phases-list flex flex-col gap-4">
        {phases.map((phase) => {
          const canOpenDetail = Boolean(phase.permissions?.can_open_detail);

          return (
            <div
              key={phase.client_phase_id}
              className={
                canOpenDetail
                  ? "cursor-pointer hover:shadow-md rounded-lg"
                  : "cursor-not-allowed opacity-60"
              }
              onClick={() => {
                if (!canOpenDetail) return;
                onSelectedPhase(phase.client_phase_id);
              }}
            >
              <PhaseItem phase={phase} canOpenDetail={canOpenDetail} />
            </div>
          );
        })}
      </div>

      <Panel
        selectedPhaseId={selectedPhaseId}
        phase={selectedPhase}
        client={client}
        onClosePanel={onClosePanel}
        onPhaseChanged={fetchPhases}
        onCampaignStateChange={onCampaignStateChange}
      />
    </>
  );
}
