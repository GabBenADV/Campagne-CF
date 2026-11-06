import { ClientListItem } from "./clients-list/ClientListItem";
import { useEffect, useState } from "react";
import { campaignsApi } from "../services/campaignsApi";
import ClientsExcelExportButton from "./tools/ExcelExport";
import type { Client } from "../types/types";

export default function ClientsList({
  campaignId,
  selectedClientId,
  refreshKey = 0,
  onSelectedClient,
  onClientsChange,
}: {
  campaignId?: number;
  selectedClientId?: number | null;
  refreshKey?: number;
  onSelectedClient?: (clientId: number) => void;
  onClientsChange?: (clients: Client[]) => void;
}) {
  const [clients, setClients] = useState<Client[]>([]);
  const [deletingClientId, setDeletingClientId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchClients = async () => {
    if (campaignId === undefined || campaignId === null) {
      setClients([]);
      onClientsChange?.([]);
      return;
    }

    try {
      const data = await campaignsApi<Client[]>("getCampaignClients", {
        campaign_id: campaignId,
        search: search.trim(),
        campaign_status_filter: statusFilter,
      });

      const nextClients = Array.isArray(data) ? data : [];

      setClients(nextClients);
      onClientsChange?.(nextClients);
    } catch (error) {
      console.error(
        "Error fetching clients for campaign",
        campaignId,
        ":",
        error
      );

      setClients([]);
      onClientsChange?.([]);
    }
  };

  const deleteClientFromCampaign = async (client: Client) => {
    if (campaignId === undefined || campaignId === null) {
      return;
    }

    const confirmed = window.confirm(
      `Vuoi rimuovere "${client.company}" da questa campagna?`
    );

    if (!confirmed) {
      return;
    }

    setDeletingClientId(client.client_id);

    try {
      await campaignsApi("unlinkClientFromCampaign", {
        campaign_id: campaignId,
        client_id: client.client_id,
        accountnumber: client.accountnumber,
      });

      setClients((currentClients) => {
        const nextClients = currentClients.filter(
          (currentClient) => currentClient.client_id !== client.client_id
        );

        onClientsChange?.(nextClients);

        return nextClients;
      });
      
    } catch (error) {
      console.error("Errore rimozione cliente dalla campagna:", error);

      const message =
        error instanceof Error && error.message
          ? error.message
          : "Non è stato possibile rimuovere il cliente dalla campagna.";

      alert(message);
    } finally {
      setDeletingClientId(null);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchClients();
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [campaignId, refreshKey, search, statusFilter]);

  return (
    <div className="clients-list flex flex-col gap-4">
       <ClientsExcelExportButton />
      <div className="grid lg:grid-cols-[60%_auto] gap-8">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cerca cliente..."
          className="w-full rounded-lg border bg-white border-gray-300 px-4 py-2 text-sm outline-none transition focus:border-custom-blue focus:ring-2 focus:ring-custom-blue/20"
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="w-full rounded-lg border bg-white border-gray-300 px-1 py-2 text-sm outline-none transition focus:border-custom-blue focus:ring-2 focus:ring-custom-blue/20"
        >
          <option value="" disabled>Filtra per stato campagna</option>
          <option value="all">Tutti gli stati</option>
          <option value="todo">DA FARE</option>
          <option value="in_progress">In corso</option>
          <option value="completed">Completate</option>
          <option value="cancelled">Annullate</option>
        </select>
      </div>

      {clients.length === 0 && (
        <p className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
          Nessun cliente trovato.
        </p>
      )}

      {clients.map((client) => (
        <div
          key={client.client_id}
          onClick={() => onSelectedClient?.(client.client_id)}
        >
          <ClientListItem
            client={client}
            isSelected={selectedClientId === client.client_id}
            canDeleteFromCampaign={campaignId !== undefined && campaignId !== null}
            isDeleting={deletingClientId === client.client_id}
            onDeleteFromCampaign={(event) => {
              event.stopPropagation();
              deleteClientFromCampaign(client);
            }}
          />
        </div>
      ))}
    </div>
  );
}