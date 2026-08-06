import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import type { Client } from "../../types/types";

type ClientsExcelExportButtonProps = {
  clients: Client[];
  campaignId?: number;
};

export default function ClientsExcelExportButton({
  clients,
  campaignId,
}: ClientsExcelExportButtonProps) {
  const downloadClientsExcel = async () => {
    if (clients.length === 0) {
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Clienti campagna");

    worksheet.columns = [
      { header: "Ragione sociale", key: "company", width: 42 },
      { header: "Account number", key: "accountnumber", width: 16 },
      { header: "Città", key: "city", width: 24 },
      { header: "Provincia", key: "prov", width: 10 },
      { header: "P. IVA", key: "vatnumber", width: 18 },
      { header: "Codice fiscale", key: "fiscalcode", width: 20 },
      { header: "Filiale", key: "filiale", width: 18 },
      { header: "Agente", key: "seller_name", width: 26 },
      { header: "Email agente", key: "seller_email", width: 34 },
      { header: "Stato campagna", key: "campaign_status_label", width: 18 },
      { header: "Fase corrente", key: "current_phase_label", width: 36 },
      { header: "Fasi completate", key: "completed_phases", width: 16 },
      { header: "Totale fasi", key: "total_phases", width: 12 },
      { header: "TODO", key: "is_todo", width: 10 },
      { header: "Rebiz", key: "is_rebiz", width: 10 },
      { header: "CF", key: "is_itse", width: 10 },
      { header: "ClickCard", key: "has_clickcard", width: 12 },
    ];

    clients.forEach((client) => {
      worksheet.addRow({
        company: client.company ?? "",
        accountnumber: client.accountnumber ?? "",
        city: client.city ?? "",
        prov: client.prov ?? "",
        vatnumber: client.vatnumber ?? "",
        fiscalcode: client.fiscalcode ?? "",
        filiale: client.filiale ?? client.fk_filiale_id ?? "",
        seller_name: client.seller_name ?? client.fk_agente_id ?? "",
        seller_email: client.seller_email ?? "",
        campaign_status_label: client.campaign_status_label ?? "",
        current_phase_label: client.current_phase_label ?? "",
        completed_phases: client.completed_phases ?? 0,
        total_phases: client.total_phases ?? 0,
        is_todo: client.is_todo ? "Sì" : "No",
        is_rebiz: client.is_rebiz ? "Sì" : "No",
        is_itse: client.is_itse ? "Sì" : "No",
        has_clickcard: client.has_clickcard ? "Sì" : "No",
      });
    });

    worksheet.getRow(1).font = {
      bold: true,
    };

    worksheet.autoFilter = {
      from: "A1",
      to: "Q1",
    };

    const buffer = await workbook.xlsx.writeBuffer();

    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const date = new Date().toISOString().slice(0, 10);
    const fileCampaignId = campaignId ?? "export";

    saveAs(blob, `clienti-campagna-${fileCampaignId}-${date}.xlsx`);
  };

  return (
    <button
      type="button"
      onClick={downloadClientsExcel}
      disabled={clients.length === 0}
      className="w-fit px-2 py-1 text-sm font-medium text-white rounded-lg! bg-custom-blue disabled:cursor-not-allowed disabled:opacity-40"
    >
      Scarica Excel
    </button>
  );
}
