import PhaseAttachments from "./PhaseAttachments";
import PhaseMainDocument from "./PhaseMainDocument";

type PhaseDocumentsProps = {
  clientPhaseId: number;
  campaignId: number;
  clientId: number;
  mainDocumentId?: number | null;
  mainDocumentFileName?: string | null;
  canUploadMainDocument?: boolean;
  canDeleteMainDocument?: boolean;
  canUploadPhaseFiles?: boolean;
  canDeletePhaseFiles?: boolean;
};

export default function PhaseDocuments({
  clientPhaseId,
  campaignId,
  clientId,
  mainDocumentId = null,
  mainDocumentFileName = null,
  canUploadMainDocument = false,
  canDeleteMainDocument = false,
  canUploadPhaseFiles = false,
  canDeletePhaseFiles = false,
}: PhaseDocumentsProps) {
  return (
    <section className="space-y-4">
      <PhaseMainDocument
        clientPhaseId={clientPhaseId}
        campaignId={campaignId}
        clientId={clientId}
        mainDocumentId={mainDocumentId}
        mainDocumentFileName={mainDocumentFileName}
        canUpload={canUploadMainDocument}
        canDelete={canDeleteMainDocument}
      />

      <PhaseAttachments
        clientPhaseId={clientPhaseId}
        canUpload={canUploadPhaseFiles}
        canDelete={canDeletePhaseFiles}
      />
    </section>
  );
}