import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import {
  ArrowDownTrayIcon,
  DocumentIcon,
  TrashIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { campaignsApi } from "../../services/campaignsApi";
import type { PhaseFile } from "../../types/types";

type PhaseAttachmentsProps = {
  clientPhaseId: number;
  canUpload?: boolean;
  canDelete?: boolean;
};

export default function PhaseAttachments({
  clientPhaseId,
  canUpload = false,
}: PhaseAttachmentsProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [files, setFiles] = useState<PhaseFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingFileId, setDeletingFileId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = async () => {
    if (!clientPhaseId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await campaignsApi<PhaseFile[]>("getPhaseFiles", {
        client_phase_id: clientPhaseId,
        include_previous: 1,
      });

      setFiles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Errore caricamento allegati fase:", error);
      setError("Non è stato possibile caricare gli allegati.");
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFiles = async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0 || isUploading) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();

    formData.append("req", "CampaignsApi");
    formData.append("action", "uploadPhaseFiles");
    formData.append("client_phase_id", String(clientPhaseId));

    Array.from(selectedFiles).forEach((file) => {
      formData.append("phase_files[]", file, file.name);
    });

    try {
      const data = await campaignsApi<{
        files?: PhaseFile[];
        errors?: string[];
      }>("uploadPhaseFiles", formData);

      if (Array.isArray(data?.files)) {
        setFiles(data.files);
      } else {
        await fetchFiles();
      }

      if (data?.errors?.length) {
        setError(data.errors.join(" "));
      }
    } catch (error) {
      console.error("Errore upload allegati fase:", error);
      setError("Non è stato possibile caricare gli allegati.");
    } finally {
      setIsUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    uploadFiles(event.target.files);
  };

  const deleteFile = async (fileId: number) => {
    if (deletingFileId !== null) return;

    const confirmed = window.confirm("Vuoi eliminare questo allegato?");
    if (!confirmed) return;

    setDeletingFileId(fileId);
    setError(null);

    try {
      await campaignsApi("deletePhaseFile", {
        file_id: fileId,
      });

      setFiles((currentFiles) =>
        currentFiles.filter((file) => file.id !== fileId)
      );
    } catch (error) {
      console.error("Errore eliminazione allegato fase:", error);
      setError("Non è stato possibile eliminare l’allegato.");
    } finally {
      setDeletingFileId(null);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [clientPhaseId]);

  return (
    <section className="rounded-lg border border-gray-300 bg-white p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <DocumentIcon className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-bold uppercase">Allegati</h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchFiles}
            disabled={isLoading || isUploading}
            className="inline-flex items-center gap-2 rounded-lg! border border-gray-300 px-3 py-2 text-sm! font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Aggiorna
          </button>

          {canUpload && (
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-gray-500 px-3 py-2 text-sm! font-semibold text-white transition capitalize! hover:bg-gray-700 mb-0!">
              {isUploading ? "Caricamento..." : "Carica allegati"}
              <input
                ref={fileInputRef}
                type="file"
                multiple
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
        <p className="text-sm text-gray-500">Caricamento allegati...</p>
      )}

      {!isLoading && files.length === 0 && (
        <p className="text-sm text-gray-500">
          Nessun allegato visibile per questa fase.
        </p>
      )}

      {!isLoading && files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3"
            >
              <div className="flex min-w-0 items-start gap-3">
                <DocumentIcon className="mt-0.5 h-5 w-5 shrink-0 text-gray-500" />

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-700">
                    {file.original_name || file.display_name || file.file_name}
                  </p>

                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                    {file.phase_position && (
                      <span>
                        Fase {file.phase_position}
                        {file.phase_title ? ` · ${file.phase_title}` : ""}
                      </span>
                    )}

                    {file.size_human && (
                      <>
                        <span>·</span>
                        <span>{file.size_human}</span>
                      </>
                    )}

                    {file.uploaded_by && (
                      <>
                        <span>·</span>
                        <span>{file.uploaded_by}</span>
                      </>
                    )}

                    {file.uploaded_at_it && (
                      <>
                        <span>·</span>
                        <span>{file.uploaded_at_it}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {file.download_url && (
                  <a
                    href={file.download_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-white"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    Scarica
                  </a>
                )}

                {file.can_delete && (
                  <button
                    type="button"
                    onClick={() => deleteFile(file.id)}
                    disabled={deletingFileId === file.id}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-sm! font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <TrashIcon className="h-4 w-4" />
                    {deletingFileId === file.id ? "Elimino..." : "Elimina"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}