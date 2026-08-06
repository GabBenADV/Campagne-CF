import { useEffect, useRef, useState } from "react";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { campaignsApi } from "../services/campaignsApi";
import type { CampaignAvailableClient } from "../types/types";

export default function CampaignClientAttach({
  campaignId,
  linkedClientsCount,
  onClientLinked,
}: {
  campaignId: number | null;
  linkedClientsCount: number;
  onClientLinked?: (clientId: number) => void;
}) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const [search, setSearch] = useState("");
  const [results, setResults] = useState<CampaignAvailableClient[]>([]);
  const [selectedClient, setSelectedClient] =
    useState<CampaignAvailableClient | null>(null);

  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canAttach, setCanAttach] = useState(false);
  const [permissionLoading, setPermissionLoading] = useState(false);
  const [availableClientsCount, setAvailableClientsCount] = useState(0);

  const canSearch = campaignId !== null && search.trim().length >= 2;

  useEffect(() => {
    if (!campaignId || !canSearch || selectedClient) {
      setResults([]);
      return;
    }

    const timeout = window.setTimeout(async () => {
      setIsSearching(true);
      setError(null);

      try {
        const data = await campaignsApi<CampaignAvailableClient[]>(
          "searchAvailableCampaignClients",
          {
            campaign_id: campaignId,
            search: search.trim(),
          },
        );

        setResults(Array.isArray(data) ? data : []);
        setIsOpen(true);
      } catch (error) {
        console.error("Errore ricerca clienti disponibili:", error);
        setError("Non è stato possibile cercare i clienti disponibili.");
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [campaignId, search, selectedClient, canSearch]);

  useEffect(() => {
    if (!campaignId) {
      setCanAttach(false);
      setAvailableClientsCount(0);
      setPermissionLoading(false);
      return;
    }

    let cancelled = false;

    setPermissionLoading(true);
    setError(null);

    campaignsApi<{
      can_attach_clients: boolean;
      available_clients_count: number;
      start_phase_position?: number | null;
    }>("getCampaignClientAttachStats", {
      campaign_id: campaignId,
    })
      .then((response) => {
        if (cancelled) return;

        setCanAttach(response.can_attach_clients === true);
        setAvailableClientsCount(response.available_clients_count ?? 0);
      })
      .catch((error) => {
        if (cancelled) return;

        console.error(
          "Errore caricamento statistiche aggancio clienti:",
          error,
        );
        setCanAttach(false);
        setAvailableClientsCount(0);
      })
      .finally(() => {
        if (cancelled) return;

        setPermissionLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [campaignId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current) return;

      if (!wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectClient = (client: CampaignAvailableClient) => {
    setSelectedClient(client);
    setSearch(formatClientLabel(client));
    setResults([]);
    setIsOpen(false);
    setError(null);
  };

  const clearSelection = () => {
    setSelectedClient(null);
    setSearch("");
    setResults([]);
    setIsOpen(false);
    setError(null);
  };

  const linkClientToCampaign = async () => {
    if (!campaignId || !selectedClient || isSaving) return;

    setIsSaving(true);
    setError(null);

    try {
      await campaignsApi("linkClientToCampaign", {
        campaign_id: campaignId,
        client_id: selectedClient.client_id,
      });

      clearSelection();
      setAvailableClientsCount((current) => Math.max(0, current - 1));
      onClientLinked?.(selectedClient.client_id);
    } catch (error) {
      console.error("Errore aggiunta cliente alla campagna:", error);
      setError("Non è stato possibile aggiungere il cliente alla campagna.");
    } finally {
      setIsSaving(false);
    }
  };

  if (campaignId === null) {
    return null;
  }

  if (!campaignId || permissionLoading || !canAttach) {
    return null;
  }

  return (
    <section className="rounded-lg border border-gray-300 bg-white p-4 mt-4">
      <div className="mb-3">
        <h3 className="text-lg font-bold uppercase">
          Aggiungi cliente alla campagna
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Cerca un cliente disponibile e associalo alla campagna selezionata.
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Disponibili: {availableClientsCount} clienti
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Aggiunti: {linkedClientsCount} clienti
        </p>
      </div>

      <div ref={wrapperRef} className="relative">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setSelectedClient(null);
                setIsOpen(true);
              }}
              onFocus={() => {
                if (search.trim().length >= 2) {
                  setIsOpen(true);
                }
              }}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-10 text-sm outline-none transition focus:border-gray-500"
              placeholder="Cerca cliente per ragione sociale, account, città..."
            />

            {search && (
              <button
                type="button"
                onClick={clearSelection}
                className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 transition hover:text-gray-700"
                aria-label="Pulisci ricerca"
              >
                <XMarkIcon className="h-full w-full" />
              </button>
            )}

            {isOpen && !selectedClient && (
              <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-72 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-xl">
                {isSearching && (
                  <div className="p-3 text-sm text-gray-500">
                    Ricerca clienti...
                  </div>
                )}

                {!isSearching && !canSearch && (
                  <div className="p-3 text-sm text-gray-500">
                    Scrivi almeno 2 caratteri per cercare.
                  </div>
                )}

                {!isSearching && canSearch && results.length === 0 && (
                  <div className="p-3 text-sm text-gray-500">
                    Nessun cliente disponibile trovato.
                  </div>
                )}

                {!isSearching &&
                  results.map((client) => (
                    <button
                      key={client.client_id}
                      type="button"
                      onClick={() => selectClient(client)}
                      className="block w-full border-b border-gray-100 p-3 text-left transition last:border-b-0 hover:bg-gray-50"
                    >
                      <p className="text-sm font-semibold text-gray-800">
                        {client.company || "Cliente senza nome"}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {[
                          client.accountnumber
                            ? `Account ${client.accountnumber}`
                            : null,
                          client.city,
                          client.prov,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </button>
                  ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={linkClientToCampaign}
            disabled={!selectedClient || isSaving}
            className="inline-flex items-center justify-center gap-2 rounded-lg! bg-gray-500 py-2 px-4 text-sm font-semibold text-white transition hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <PlusIcon className="h-5 w-5" />
            {isSaving ? "Aggiungo..." : "Aggiungi"}
          </button>
        </div>
      </div>

      {selectedClient && (
        <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
          Cliente selezionato:{" "}
          <span className="font-semibold">
            {selectedClient.company || selectedClient.accountnumber}
          </span>
        </div>
      )}

      {error && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </section>
  );
}

function formatClientLabel(client: CampaignAvailableClient): string {
  return [
    client.company,
    client.accountnumber ? `Account ${client.accountnumber}` : null,
    client.city,
    client.prov,
  ]
    .filter(Boolean)
    .join(" · ");
}
