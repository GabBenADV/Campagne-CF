import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
import type { Client } from "../../types/types";

export function ClientListItem({
  client,
  isSelected,
  canDeleteFromCampaign = false,
  isDeleting = false,
  onDeleteFromCampaign,
}: {
  client: Client;
  isSelected?: boolean;
  canDeleteFromCampaign?: boolean;
  isDeleting?: boolean;
  onDeleteFromCampaign?: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  const [selected, setSelected] = useState(isSelected);

  useEffect(() => {
    setSelected(isSelected);

    // console.log(
    //   "ClientListItem isSelected changed and client ID:",
    //   client.id,
    //   "isSelected:",
    //   isSelected,
    // );
  }, [isSelected, client.id]);

  const borderColor = selected
    ? "!border-custom-blue shadow-md"
    : "!border-gray-300 shadow-sm";
  
  const isTodoColor = 'bg-orange-50'
  const isCompletedColor = 'bg-green-50'
  const isCancelledColor = 'bg-red-50'

  const bgStatusColor = client.is_todo
    ? isTodoColor
    : client.campaign_status === 'COMPLETED'
    ? isCompletedColor
    : client.campaign_status === 'CANCELLED'
    ? isCancelledColor
    : 'bg-yellow-50';

  const bgColor = selected ? "bg-blue-50" : bgStatusColor;

  const isRebiz = Boolean(client.is_rebiz);
  const isItse = Boolean(client.is_itse);
  const hasClickcard = Boolean(client.has_clickcard);

  return (
    <div
      className={`relative rounded-lg border p-4 ${borderColor} ${bgColor} cursor-pointer transition-shadow duration-200 hover:shadow-md`}
    >
      {canDeleteFromCampaign && (
        <button
          type="button"
          onClick={onDeleteFromCampaign}
          disabled={isDeleting}
          className="absolute right-3 top-3 rounded-full border border-red-200 bg-white p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          title="Rimuovi cliente dalla campagna"
          aria-label="Rimuovi cliente dalla campagna"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      )}

      <div className="bg-custom-blue rounded-lg w-fit px-1 mb-2">
        <h2 className="text-white">{client.accountnumber}</h2>
      </div>

      <h1 className="pr-10 font-bold uppercase">{client.company}</h1>

      <div className="flex flex-wrap items-center gap-2">
        {/* <h2>Cod. Cliente: {client.accountnumber}</h2> */}
        Area:<h2> {client.area}</h2>
        Polo:<h2> {client.polo}</h2>
        Filiale:<h2> {client.city}</h2>
      </div>

      <div>
        Venditore: <b>{client.seller_name}</b>
      </div>

      <div>Altre campagne attive: {client.active_campaigns_count ?? 0}</div>


      <div className="mt-2 flex flex-wrap gap-2">
        {isRebiz && 
          <span className="rounded-full border border-blue-200 bg-green-200 px-2 py-1 text-xs font-semibold">
            REBIZ SI
          </span>
        }
        {!isRebiz && 
          <span className="rounded-full border border-blue-200 bg-red-200 px-2 py-1 text-xs font-semibold">
            REBIZ NO
          </span>
        }
        {isItse && 
          <span className="rounded-full border border-blue-200 bg-green-200 px-2 py-1 text-xs font-semibold">
            CF SI
          </span>
        }
        {!isItse && 
          <span className="rounded-full border border-blue-200 bg-red-200 px-2 py-1 text-xs font-semibold">
            CF NO
          </span>
        }
        {hasClickcard &&
          <span className="rounded-full border border-blue-200 bg-green-200 px-2 py-1 text-xs font-semibold">
            CLICK CARD SI
          </span>
        }
        {!hasClickcard &&
          <span className="rounded-full border border-blue-200 bg-red-200 px-2 py-1 text-xs font-semibold">
            CLICK CARD NO
          </span>
        }
      </div>

      <div className="text-gray-500 flex items-center justify-between mt-4">
        <span className="font-semibold text-gray-700">
          {client.current_phase_label || "-"}
        </span>
        {!client.is_todo && <h2 className="ms-auto w-fit">{client.campaign_status_label}</h2>}
        {client.is_todo && <h2 className="ms-auto w-fit">TODO</h2>}
      </div>
    </div>
  );
}
