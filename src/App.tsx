import { useEffect, useState } from "react";
import ColumnLayout from "./layouts/ColumnLayout";
import CampaignsList from "./components/CampaignsList";
import ClientsList from "./components/ClientsList";
import PhasesList from "./components/PhasesList";
import CampaignClientAttach from "./components/CampaignClientAttach";
import "./index.css";
import { campaignsApi } from "./services/campaignsApi";
import type { Campaign, Client } from "./types/types";
import EditorContent from "./components/tools/EditorContent";

function App() {
  const tutorialPdfUrl = '/download/flipbook.php?id=120';
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(
    null,
  );
  const [clientId, setClientId] = useState<number | null>(null);
  const [phaseId, setPhaseId] = useState<number | null>(null);
  const [clientsRefreshKey, setClientsRefreshKey] = useState(0);
  const [phasesRefreshKey, setPhasesRefreshKey] = useState(0);
  const [campaignsRefreshKey, setCampaignsRefreshKey] = useState(0);
  const [selectedCampaignClients, setSelectedCampaignClients] = useState<
    Client[]
  >([]);

  const selectedCampaign =
    campaigns.find((campaign) => campaign.id === selectedCampaignId) ?? null;

  const selectedClient =
    selectedCampaignClients.find((client) => client.client_id === clientId) ??
    null;

  const selectedCampaignClientsCount = selectedCampaignClients.length;

  const selectedCampaignCompletedClientsCount = selectedCampaignClients.filter(
    (client) => client.campaign_status === "COMPLETED",
  ).length;

  const selectedCampaignCancelledClientsCount = selectedCampaignClients.filter(
    (client) => client.campaign_status === "CANCELLED",
  ).length;

  const campaignsWithLiveSelectedStats = campaigns.map((campaign) => {
    if (campaign.id !== selectedCampaignId) {
      return campaign;
    }

    return {
      ...campaign,
      clients_count: selectedCampaignClientsCount,
      completed_clients_count: selectedCampaignCompletedClientsCount,
      cancelled_clients_count: selectedCampaignCancelledClientsCount,
    };
  });

  const refreshCampaignState = () => {
    setClientsRefreshKey((current) => current + 1);
    setPhasesRefreshKey((current) => current + 1);
    setCampaignsRefreshKey((current) => current + 1);
  };

  const handleClientLinked = (linkedClientId?: number) => {
    refreshCampaignState();

    if (linkedClientId) {
      setClientId(linkedClientId);
      setPhaseId(null);
    }
  };

  function handleCampaignSelect(campaignId: number) {
    // console.log('Campagna selezionata:', campaignId);
    setSelectedCampaignId(campaignId);
    setSelectedCampaignClients([]);
    setClientId(null);
    setPhaseId(null);
  }

  function handleClientSelect(clientId: number) {
    // console.log('Cliente selezionato:', clientId);
    setClientId(clientId);
    setPhaseId(null);
  }

  function handlePhaseSelect(phaseId: number) {
    // console.log('Fase selezionata:', phaseId);
    setPhaseId(phaseId);
  }

  useEffect(() => {
    campaignsApi<Campaign[]>("getCampaigns")
      .then((data) => {
        setCampaigns(Array.isArray(data) ? data : []);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [campaignsRefreshKey]);

  if (loading) {
    return (
      <div className="w-screen h-[calc(100dvh-52px)] flex items-center justify-center">
        <svg
          aria-hidden="true"
          className="w-8 h-8 text-gray-200 animate-spin fill-custom-blue"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="currentColor"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentFill"
          />
        </svg>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-[25%_35%_auto] gap-8 w-full p-12 bg-gray-50 min-h-screen">
        {/* Campagne */}
        <ColumnLayout
          number={1}
          // title="Campagne"
          description="Seleziona una campagna per visualizzare i clienti e le fasi."
        >
          <div className="mb-4">
            {tutorialPdfUrl ? (
              <a
                href={tutorialPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-red-600 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                aria-label="Apri il tutorial PDF delle campagne"
              >
                <i className="icon-file-pdf text-xl text-red-600" aria-hidden="true" />
                Guarda il Tutorial
              </a>
            ) : (
              <span
                className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-500"
                aria-label="Tutorial PDF non ancora disponibile"
                title="Configura CAMPAIGNS_TUTORIAL_PDF_URL per abilitare il tutorial"
              >
                <i className="icon-file-pdf text-xl" aria-hidden="true" />
                Guarda il Tutorial
              </span>
            )}
          </div>
          <CampaignsList
            campaigns={campaignsWithLiveSelectedStats}
            onCampaignSelect={handleCampaignSelect}
            selectedCampaignId={selectedCampaignId}
          />
        </ColumnLayout>
        {/* Clienti */}
        <ColumnLayout
          number={2}
          // title="Clienti"
          description="Seleziona un cliente per visualizzare le fasi."
          secondaryChildren={
            <CampaignClientAttach
              key={`${selectedCampaignId ?? 0}-${clientsRefreshKey}`}
              campaignId={selectedCampaignId}
              linkedClientsCount={selectedCampaignClientsCount}
              onClientLinked={handleClientLinked}
            />
          }
        >
          <ClientsList
            campaignId={selectedCampaignId ?? undefined}
            refreshKey={clientsRefreshKey}
            onSelectedClient={handleClientSelect}
            selectedClientId={clientId ?? undefined}
            onClientsChange={setSelectedCampaignClients}
          />
        </ColumnLayout>
        {/* Fasi */}
        <ColumnLayout
          number={3}
          // title="Fasi"
          description="Gestisci le fasi e i documenti"
        >
          <div className="bg-white p-3 rounded-lg border border-gray-300 mb-4">
            <div className="text-xs uppercase mb-2">Iter approvativo</div>
            <EditorContent
              className="text-sm"
              html={selectedCampaign?.approving_iter_information ?? ""}
            />
          </div>
          <PhasesList
            clientId={clientId}
            client={selectedClient}
            campaignId={selectedCampaignId}
            refreshKey={phasesRefreshKey}
            onSelectedPhase={handlePhaseSelect}
            selectedPhaseId={phaseId}
            onCampaignStateChange={refreshCampaignState}
            onClosePanel={() => {
              setPhaseId(null);
              // console.log("Panel closed");
            }}
          />
        </ColumnLayout>
      </div>
    </>
  );
}

export default App;
