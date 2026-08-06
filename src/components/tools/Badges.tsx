import type { CampaignClientPhase } from "../../types/types";

export default function ClientsExcelExportButton({ phase }: { phase: CampaignClientPhase }) {
    
    const isAccepted = phase.phase_state === 'ACCEPTED' || phase.phase_state === 'OK';
    const isRejected = phase.phase_state === 'REJECTED' || phase.phase_state === 'KO';
    const isPendingApproval = phase.phase_state === 'PENDING_APPROVAL';
    const isAbletoReload = phase.flags?.enable_master_reloading || false;
    const isAbleToComplete = phase.flags?.enable_process_outcome || false;
    const isSegreteria = phase.flags?.enable_segreteria_vendite || false;

    return(
        <div className="flex flex-col gap-2">  
            <div className="flex flex-wrap gap-2">
                {isAccepted && <span className="rounded-lg bg-green-400 px-2 py-1 text-xs text-white font-semibold uppercase">Esito positivo in attesa di approvazione</span>}
                {isRejected && <span className="rounded-lg bg-red-400 px-2 py-1 text-xs text-white font-semibold uppercase">Esito negativo</span>}
                {isPendingApproval && <span className="rounded-lg bg-yellow-400 px-2 py-1 text-xs text-white font-semibold uppercase">In attesa</span>}
            </div>
            <div className="flex flex-wrap gap-2">
                {isAbletoReload && <span className="rounded-lg border border-gray-600 bg-gray-300 px-2 py-1 text-xs">Abilitato upload modulo iscrizione</span>}
                {isAbleToComplete && <span className="rounded-lg border border-green-400 bg-green-200 px-2 py-1 text-xs text-green-400">Fase con permesso esito iter</span>}
                {isSegreteria && <span className="rounded-lg border border-violet-500 bg-violet-200 px-2 py-1 text-xs text-violet-500">Segreteria vendite</span>}
            </div>
        </div>
    )
}