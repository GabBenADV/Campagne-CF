import { useMemo, useState } from "react";
import type { Campaign } from "../types/types";
import CampaignsListItem from "./campaigns-list/CampaignsListItem";

export default function CampaignsList({
  campaigns,
  onCampaignSelect,
  selectedCampaignId,
}: {
  campaigns?: Campaign[];
  onCampaignSelect?: (campaignId: number) => void;
  selectedCampaignId?: boolean | number | null;
}) {
  const [search, setSearch] = useState("");

  const filteredCampaigns = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return campaigns ?? [];
    }

    return (campaigns ?? []).filter((campaign) => {
      const title = String(campaign.title ?? "").toLowerCase();
      const code = String(campaign.code ?? "").toLowerCase();
      const type = String(campaign.campaign_type ?? "").toLowerCase();

      return (
        title.includes(normalizedSearch) ||
        code.includes(normalizedSearch) ||
        type.includes(normalizedSearch)
      );
    });
  }, [campaigns, search]);

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-lg">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cerca campagna..."
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none transition focus:border-custom-blue focus:ring-2 focus:ring-custom-blue/20"
        />
      </div>

      {filteredCampaigns.length === 0 && (
        <p className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
          Nessuna campagna trovata.
        </p>
      )}

      {filteredCampaigns.filter((campaign) => campaign.active).map((campaign) => (
        <div key={campaign.id} onClick={() => onCampaignSelect?.(campaign.id)}>
          <CampaignsListItem
            campaign={campaign}
            isSelected={selectedCampaignId === campaign.id}
          />
        </div>
      ))}
    </div>
  );
}
