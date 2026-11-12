import { useMemo, useState } from "react";
import type { Campaign } from "../types/types";
import { decodeHtmlEntities } from "../utils/decodeHtmlEntities";
import CampaignsListItem from "./campaigns-list/CampaignsListItem";

// Confronta date di calendario evitando differenze dovute ai fusi orari.
function campaignEndDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})(?:$|[T\s])/);
  if (!match) return null;
  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (date.getFullYear() !== Number(year) || date.getMonth() !== Number(month) - 1 || date.getDate() !== Number(day)) return null;
  return `${year}-${month}-${day}`;
}

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
  const [expandedYears, setExpandedYears] = useState<number[]>([]);
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const filteredCampaigns = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return campaigns ?? [];
    }

    return (campaigns ?? []).filter((campaign) => {
      const title = decodeHtmlEntities(campaign.title).toLowerCase();
      const code = String(campaign.code ?? "").toLowerCase();
      const type = String(campaign.campaign_type ?? "").toLowerCase();

      return (
        title.includes(normalizedSearch) ||
        code.includes(normalizedSearch) ||
        type.includes(normalizedSearch)
      );
    });
  }, [campaigns, search]);

  const visibleCampaigns = filteredCampaigns.filter((campaign) => Boolean(campaign.active));
  const currentCampaigns = visibleCampaigns.filter((campaign) => {
    const endDate = campaignEndDate(campaign.end_date);
    return !endDate || endDate >= todayKey;
  });
  const expiredByYear = visibleCampaigns.reduce<Record<number, Campaign[]>>((groups, campaign) => {
    const endDate = campaignEndDate(campaign.end_date);
    if (endDate && endDate < todayKey) {
      const year = Number(endDate.slice(0, 4));
      (groups[year] ??= []).push(campaign);
    }
    return groups;
  }, {});
  const years = Object.keys(expiredByYear).map(Number).sort((a, b) => b - a);

  const renderCampaign = (campaign: Campaign) => (
    <div key={campaign.id} onClick={() => onCampaignSelect?.(campaign.id)}>
      <CampaignsListItem campaign={campaign} isSelected={selectedCampaignId === campaign.id} isExpired={Boolean(campaignEndDate(campaign.end_date) && campaignEndDate(campaign.end_date)! < todayKey)} />
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-lg hidden">
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

      {currentCampaigns.map(renderCampaign)}

      {years.map((year) => {
        const expanded = expandedYears.includes(year) || search.trim().length > 0;
        return (
          <section key={year} className="overflow-hidden rounded-lg border border-gray-300 bg-white">
            <button
              type="button"
              className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left font-semibold text-gray-800 hover:bg-gray-50"
              aria-expanded={expanded}
              onClick={() => setExpandedYears((previous) => previous.includes(year) ? previous.filter((item) => item !== year) : [...previous, year])}
            >
              <span>Campagne scadute {year} ({expiredByYear[year].length})</span>
              <span aria-hidden="true">{expanded ? "−" : "+"}</span>
            </button>
            {expanded && <div className="flex flex-col gap-3 border-t border-gray-200 p-3">{expiredByYear[year].map(renderCampaign)}</div>}
          </section>
        );
      })}
    </div>
  );
}
