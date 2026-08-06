import {
  ArrowDownTrayIcon,
  DocumentIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import type { MainDocumentVersion } from "../../types/types";

type PhaseMainDocumentVersionRowProps = {
  version: MainDocumentVersion;
  isCurrent?: boolean;
  canDelete: boolean;
  isDeleting: boolean;
  onDelete: () => void;
};

export default function PhaseMainDocumentVersionRow({
  version,
  isCurrent = false,
  canDelete,
  isDeleting,
  onDelete,
}: PhaseMainDocumentVersionRowProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
      <div className="flex min-w-0 items-start gap-3">
        <DocumentIcon className="mt-0.5 h-5 w-5 shrink-0 text-gray-500" />

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-gray-700">
              {version.display_name || version.file_name}
            </p>

            {isCurrent && (
              <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                Corrente
              </span>
            )}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-400">
            {version.phase_position && (
              <span>Fase {version.phase_position}</span>
            )}

            {version.phase_title && (
              <>
                <span>·</span>
                <span>{version.phase_title}</span>
              </>
            )}

            {version.uploaded_by && (
              <>
                <span>·</span>
                <span>{version.uploaded_by}</span>
              </>
            )}

            {version.uploaded_at && (
              <>
                <span>·</span>
                <span>{version.uploaded_at}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {version.download_url && (
          <a
            href={version.download_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm! font-semibold text-gray-700 transition hover:bg-white"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            Scarica
          </a>
        )}

        {canDelete && (
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <TrashIcon className="h-4 w-4" />
            {isDeleting ? "Elimino..." : "Elimina"}
          </button>
        )}
      </div>
    </div>
  );
}