import { useEffect, useState } from "react";
import type { Campaign } from "../../types/types";

export default function CampaignsListItem({campaign, isSelected, isExpired = false}: {campaign: Campaign, isSelected?: boolean, isExpired?: boolean}) {
    const [selected, setSelected] = useState(isSelected);
    useEffect(() => {
        setSelected(isSelected);
        // console.log('CampaignsListItem isSelected changed and campaign ID:', campaign.id, 'isSelected:', isSelected);
    }, [isSelected]);

    const borderColor = selected ? "!border-custom-blue shadow-md" : "!border-gray-300 shadow-sm";
    const bgColor = selected ? "bg-blue-50" : isExpired ? "bg-red-50" : "bg-white";
    // console.log('CampaignsListItem :', campaign);

    return (
        <div className={`p-3 border ${borderColor} ${bgColor} rounded-lg hover:shadow-md cursor-pointer transition-shadow duration-200 flex flex-col gap-2`}>
            <h1 className="uppercase font-bold">{campaign.title}</h1>
            <div className="flex flex-wrap items-center gap-2">
                { campaign.active ? <p className="bg-custom-blue px-2 py-1 rounded-full uppercase text-white text-sm">Attiva</p> : <p className="bg-red-500 px-2 py-1 rounded-full uppercase text-white text-sm">Disattiva</p> }
                <div className="flex"><p className="text-sm">{campaign.start_date} → {campaign.end_date}</p></div>
                <p className="bg-custom-blue px-2 py-1 rounded-full uppercase text-white text-sm">Fasi: {campaign.total_phases}</p>
            </div>
            <div className="flex flex-col flex-wrap lg:flex-row gap-2">
                <p className="text-sm">Clienti coinvolti: {campaign.clients_count}</p>
                <p className="text-sm text-green-700">Completati: {campaign.completed_clients_count}</p>
                <p className="text-sm text-red-400">Annulati: {campaign.cancelled_clients_count}</p>
            </div>
        </div>
    );
}