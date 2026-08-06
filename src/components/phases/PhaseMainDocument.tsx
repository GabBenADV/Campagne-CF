import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import {
  ArrowPathIcon,
  ClockIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";
import { campaignsApi } from "../../services/campaignsApi";
import type {
  MainDocumentDeleteResponse,
  MainDocumentUploadResponse,
  MainDocumentVersion,
} from "../../types/types";
import PhaseMainDocumentVersionRow from "./PhaseMainDocumentVersionRow";
import Accordion from "../tools/Accordion";

type PhaseMainDocumentProps = {
  clientPhaseId: number;
  campaignId: number;
  clientId: number;
  canUpload?: boolean;
  canDelete?: boolean;
  mainDocumentId?: number | null;
  mainDocumentFileName?: string | null;
};

export default function PhaseMainDocument({
  clientPhaseId,
  campaignId,
  clientId,
  canUpload = false,
  canDelete = false,
  mainDocumentId = null,
  mainDocumentFileName = null,
}: PhaseMainDocumentProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [versions, setVersions] = useState<MainDocumentVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingVersionId, setDeletingVersionId] = useState<number | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const fallbackMainDocument: MainDocumentVersion | null =
    mainDocumentId && mainDocumentFileName
      ? {
          id: mainDocumentId,
          file_name: mainDocumentFileName,
          display_name: mainDocumentFileName,
          download_url: `/uploads/campaigns/${encodeURIComponent(
            mainDocumentFileName,
          )}`,
          is_current: true,
          client_phase_id: clientPhaseId,
        }
      : null;

  const currentVersion = useMemo(() => {
    return (
      versions.find((version) => version.is_current) ?? fallbackMainDocument
    );
  }, [versions, fallbackMainDocument]);

  const previousVersions = useMemo(() => {
    return versions.filter((version) => !version.is_current);
  }, [versions]);

  const fetchVersions = async () => {
    if (!campaignId || !clientId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await campaignsApi<MainDocumentVersion[]>(
        "getMainDocumentVersions",
        {
          campaign_id: campaignId,
          client_id: clientId,
        },
      );

      setVersions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Errore caricamento documento principale:", error);
      setError("Non è stato possibile caricare il documento principale.");
      setVersions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadMainDocument = async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0 || isUploading) return;

    const file = selectedFiles[0];

    setIsUploading(true);
    setError(null);

    const formData = new FormData();

    formData.append("req", "CampaignsApi");
    formData.append("action", "uploadMainDocument");
    formData.append("client_phase_id", String(clientPhaseId));
    formData.append("main_document", file, file.name);

    try {
      await campaignsApi<MainDocumentUploadResponse>(
        "uploadMainDocument",
        formData,
      );

      await fetchVersions();
    } catch (error) {
      console.error("Errore upload documento principale:", error);
      setError("Non è stato possibile caricare il documento principale.");
    } finally {
      setIsUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const deleteVersion = async (versionId: number) => {
    if (deletingVersionId !== null) return;

    const confirmed = window.confirm(
      "Vuoi eliminare questa versione del documento principale?",
    );

    if (!confirmed) return;

    setDeletingVersionId(versionId);
    setError(null);

    try {
      await campaignsApi<MainDocumentDeleteResponse>("deleteMainDocument", {
        client_phase_id: clientPhaseId,
        version_id: versionId,
      });

      await fetchVersions();
    } catch (error) {
      console.error("Errore eliminazione documento principale:", error);
      setError("Non è stato possibile eliminare il documento principale.");
    } finally {
      setDeletingVersionId(null);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    uploadMainDocument(event.target.files);
  };

  useEffect(() => {
    fetchVersions();
  }, [campaignId, clientId, clientPhaseId]);

  // console.log("[DEBUG main document][PhaseDocuments props]", {
  //   clientPhaseId,
  //   campaignId,
  //   clientId,
  //   mainDocumentId,
  //   mainDocumentFileName
  // });

  return (
    <section className="rounded-lg border border-gray-300 bg-white p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <DocumentIcon className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-bold uppercase">Documento principale</h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchVersions}
            disabled={isLoading || isUploading}
            className="inline-flex items-center gap-2 rounded-lg! border border-gray-300 px-3 py-2 text-sm! font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Aggiorna
          </button>

          {canUpload && (
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-gray-500 px-3 py-2 text-sm! font-semibold text-white capitalize! transition hover:bg-gray-700 mb-0!">
              {isUploading ? "Caricamento..." : "Carica documento"}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </label>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {isLoading && (
        <p className="text-sm text-gray-500">
          Caricamento documento principale...
        </p>
      )}

      {!isLoading && !currentVersion && (
        <p className="text-sm text-gray-500">
          Nessun documento principale caricato per questa fase.
        </p>
      )}

      {!isLoading && currentVersion && (
        <PhaseMainDocumentVersionRow
          version={currentVersion}
          isCurrent
          canDelete={canDelete}
          isDeleting={deletingVersionId === currentVersion.id}
          onDelete={() => deleteVersion(currentVersion.id)}
        />
      )}

      {!isLoading && previousVersions.length > 0 && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
          

          
          <Accordion
            head={
              <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                <ClockIcon className="h-4 w-4" />
                Storico versioni
              </div>
            }
            details={
              <div className="space-y-2">
                {previousVersions.map((version) => (
                  <PhaseMainDocumentVersionRow
                    key={version.id}
                    version={version}
                    canDelete={canDelete}
                    isDeleting={deletingVersionId === version.id}
                    onDelete={() => deleteVersion(version.id)}
                  />
                ))}
              </div>
            } 
            />
        </div>
      )}
    </section>
  );
}
