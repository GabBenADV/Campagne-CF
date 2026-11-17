import { useMemo, useState } from "react";
import type { Campaign } from "../types/types";
import { decodeHtmlEntities } from "../utils/decodeHtmlEntities";
import CampaignsListItem from "./campaigns-list/CampaignsListItem";

// Confronta le date di calendario senza dipendere dal fuso orario.
function calendarDate(value: string | null | undefined): string | null {
  const match = String(value ?? "").match(/^(\d{4})-(\d{2})-(\d{2})(?:$|[T\s])/);
  if (!match) return null;
  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (date.getFullYear() !== Number(year) || date.getMonth() !== Number(month) - 1 || date.getDate() !== Number(day)) return null;
  return `${year}-${month}-${day}`;
}

function isActive(campaign: Campaign): boolean {
  return campaign.active === true || campaign.active === 1 || String(campaign.active) === "1";
}

const titleCollator = new Intl.Collator("it", { sensitivity: "base", numeric: true });

// Come nell'admincp: anno di inizio decrescente, poi titolo A-Z.
function compareCampaigns(a: Campaign, b: Campaign): number {
  const yearA = Number(calendarDate(a.start_date)?.slice(0, 4) ?? 0);
  const yearB = Number(calendarDate(b.start_date)?.slice(0, 4) ?? 0);
  if (yearA !== yearB) return yearB - yearA;

  const titleOrder = titleCollator.compare(
    decodeHtmlEntities(String(a.title ?? "")),
    decodeHtmlEntities(String(b.title ?? "")),
  );
  return titleOrder || Number(a.id) - Number(b.id);
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
  const [expandedYears, setExpandedYears] = useState<string[]>([]);
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const filteredCampaigns = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("it");
    return (campaigns ?? [])
      .filter((campaign) => {
        if (!normalizedSearch) return true;
        return [decodeHtmlEntities(String(campaign.title ?? "")), campaign.code, campaign.campaign_type]
          .some((value) => String(value ?? "").toLocaleLowerCase("it").includes(normalizedSearch));
      })
      .sort(compareCampaigns);
  }, [campaigns, search]);

  const renderCampaign = (campaign: Campaign) => {
    const endDate = calendarDate(campaign.end_date);
    return (
      <div key={campaign.id} onClick={() => onCampaignSelect?.(campaign.id)}>
        <CampaignsListItem
          campaign={campaign}
          isSelected={selectedCampaignId === campaign.id}
          isExpired={Boolean(endDate && endDate < todayKey)}
        />
      </div>
    );
  };

  const renderStatusGroup = (group: Campaign[], status: "active" | "inactive") => {
    if (!group.length) return null;
    const current = group.filter((campaign) => {
      const endDate = calendarDate(campaign.end_date);
      return !endDate || endDate >= todayKey;
    });
    const expiredByYear = group.reduce<Record<number, Campaign[]>>((acc, campaign) => {
      const endDate = calendarDate(campaign.end_date);
      if (endDate && endDate < todayKey) {
        const year = Number(endDate.slice(0, 4));
        (acc[year] ??= []).push(campaign);
      }
      return acc;
    }, {});
    const years = Object.keys(expiredByYear).map(Number).sort((a, b) => b - a);

    return (
      <section key={status} className="flex flex-col gap-3">
        {status === "inactive" && (
          <h2 className="border-b border-gray-300 pb-2 font-semibold text-gray-700">Campagne disattive</h2>
        )}
        {current.map(renderCampaign)}
        {years.map((year) => {
          const key = `${status}-${year}`;
          const expanded = expandedYears.includes(key) || search.trim().length > 0;
          return (
            <section key={key} className="overflow-hidden rounded-lg border border-gray-300 bg-white">
              <button
                type="button"
                className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left font-semibold text-gray-800 hover:bg-gray-50"
                aria-expanded={expanded}
                onClick={() => setExpandedYears((previous) => previous.includes(key)
                  ? previous.filter((item) => item !== key)
                  : [...previous, key])}
              >
                <span>Campagne scadute {year} ({expiredByYear[year].length})</span>
                <span aria-hidden="true">{expanded ? "−" : "+"}</span>
              </button>
              {expanded && (
                <div className="flex flex-col gap-3 border-t border-gray-200 p-3">
                  {expiredByYear[year].map(renderCampaign)}
                </div>
              )}
            </section>
          );
        })}
      </section>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg bg-white">
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
      {renderStatusGroup(filteredCampaigns.filter(isActive), "active")}
      {renderStatusGroup(filteredCampaigns.filter((campaign) => !isActive(campaign)), "inactive")}
    </div>
  );
}
