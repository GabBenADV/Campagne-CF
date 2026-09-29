import { useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { campaignsApi } from "../../services/campaignsApi";

type ExportRow = {
  type: "CAMPAGNA" | "ATTIVITÀ";

  regione?: string;
  polo?: string;
  fk_filiale_id?: string;
  nome_filiale?: string;

  company?: string;
  accountnumber?: string;
  city?: string;
  prov?: string;

  seller_name?: string;

  title?: string;
  code?: string;
  start_date?: string;
  end_date?: string;
  max_date?: string;
  active?: number;

  status?: string;

  completed_phases?: number | string;
  total_phases?: number | string;

  master_code?: string;

  obiettivo_1?: string | number;
  fascia_premio_obiettivo_1?: string;
  premio_ob1_nome?: string;
  premio_ob1_data?: string;

  obiettivo_2?: string | number;
  fascia_premio_obiettivo_2?: string;
  premio_ob2_nome?: string;
  premio_ob2_data?: string;

  catalogo_titolo?: string;
  note?: string;

  is_rebiz?: number;
  is_itse?: number;
  has_clickcard?: number;
};

const formatDate = (value?: string) => {
  if (!value) return "";

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (!match) {
    return value;
  }

  return `${match[3]}/${match[2]}/${match[1]}`;
};

export default function ClientsExcelExportButton() {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadClientsExcel = async () => {
    if (isDownloading) return;

    setIsDownloading(true);

    try {
      const rows = await campaignsApi<ExportRow[]>("getCurrentUserExportRows");

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("EXPORT");

      worksheet.columns = [
        { header: "Tipo", key: "type", width: 14 },

        { header: "Regione", key: "regione", width: 18 },
        { header: "Polo", key: "polo", width: 10 },
        { header: "Sigla Filiale", key: "fk_filiale_id", width: 14 },
        { header: "Nome Filiale", key: "nome_filiale", width: 24 },

        { header: "Ragione Sociale", key: "company", width: 42 },
        { header: "Accountnumber", key: "accountnumber", width: 16 },
        { header: "Città", key: "city", width: 24 },
        { header: "Provincia", key: "prov", width: 10 },

        { header: "Agente associato", key: "seller_name", width: 28 },

        { header: "Titolo", key: "title", width: 42 },
        { header: "Codice", key: "code", width: 18 },
        { header: "Data Inizio", key: "start_date", width: 15 },
        { header: "Data Fine", key: "end_date", width: 15 },
        { header: "Data di termine massimo", key: "max_date", width: 22 },
        { header: "Attiva", key: "active", width: 10 },
        { header: "Stato", key: "status", width: 22 },

        { header: "Fasi completate", key: "completed_phases", width: 16 },
        { header: "Fasi totali", key: "total_phases", width: 12 },

        { header: "Master Code", key: "master_code", width: 18 },

        { header: "Obiettivo 1", key: "obiettivo_1", width: 16 },
        {
          header: "Fascia Obiettivo 1",
          key: "fascia_premio_obiettivo_1",
          width: 20,
        },
        { header: "Premio Obiettivo 1", key: "premio_ob1_nome", width: 28 },
        {
          header: "Data Premio Obiettivo 1",
          key: "premio_ob1_data",
          width: 22,
        },

        { header: "Obiettivo 2", key: "obiettivo_2", width: 16 },
        {
          header: "Fascia Obiettivo 2",
          key: "fascia_premio_obiettivo_2",
          width: 20,
        },
        { header: "Premio Obiettivo 2", key: "premio_ob2_nome", width: 28 },
        {
          header: "Data Premio Obiettivo 2",
          key: "premio_ob2_data",
          width: 22,
        },

        { header: "Catalogo", key: "catalogo_titolo", width: 28 },
        { header: "Note", key: "note", width: 36 },

        { header: "REBIZ", key: "is_rebiz", width: 10 },
        { header: "ITSE", key: "is_itse", width: 10 },
        { header: "CLICK CARD", key: "has_clickcard", width: 12 },
      ];

      rows.forEach((row) => {
        worksheet.addRow({
          ...row,

          start_date: formatDate(row.start_date),
          end_date: formatDate(row.end_date),
          max_date: formatDate(row.max_date),
          premio_ob1_data: formatDate(row.premio_ob1_data),
          premio_ob2_data: formatDate(row.premio_ob2_data),

          active: row.active ? "Sì" : "No",
          is_rebiz: row.is_rebiz ? "Sì" : "No",
          is_itse: row.is_itse ? "Sì" : "No",
          has_clickcard: row.has_clickcard ? "Sì" : "No",
        });
      });

      worksheet.getRow(1).font = {
        bold: true,
      };

      worksheet.autoFilter = {
        from: "A1",
        to: "AG1",
      };

      const buffer = await workbook.xlsx.writeBuffer();

      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const date = new Date().toISOString().slice(0, 10);

      saveAs(blob, `export-campagne-attivita-${date}.xlsx`);
    } catch (error) {
      console.error("Errore export Excel:", error);

      window.alert(
        error instanceof Error
          ? error.message
          : "Non è stato possibile generare l'Excel.",
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={downloadClientsExcel}
      disabled={isDownloading}
      className="w-fit px-2 py-1 text-sm font-medium text-white rounded-lg! bg-custom-blue disabled:cursor-not-allowed disabled:opacity-40"
    >
      {isDownloading ? "Generazione..." : "Scarica Excel"}
    </button>
  );
}