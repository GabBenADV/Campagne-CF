const APP_ENV = import.meta.env.VITE_APP_ENV ?? "local";
const USE_MOCKS = APP_ENV !== "production";

type ApiResponse<T> = {
  status: "success" | "error";
  message?: string | null;
  data: T;
};

type ApiPayload =
  | Record<string, string | number | boolean | null | undefined | unknown>
  | FormData;

function getDispatcherUrl(): string {
  return (
    document
      .getElementById("campaigns-root")
      ?.getAttribute("data-dispatcher-url") || "/frontend/dispatcher.php"
  );
}

async function fetchApiResponse<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(url, options);
  const text = await response.text();

  let json: ApiResponse<T>;

  try {
    json = JSON.parse(text) as ApiResponse<T>;
  } catch (error) {
    console.error("Risposta non JSON dal backend:", {
      url,
      status: response.status,
      text,
    });

    throw new Error("Risposta non JSON dal backend. Controlla la console.");
  }

  if (!response.ok || json.status !== "success") {
    throw new Error(json.message || "Errore API");
  }

  return json.data;
}

function buildUrlEncodedBody(
  action: string,
  payload: Exclude<ApiPayload, FormData>,
): URLSearchParams {
  const body = new URLSearchParams({
    req: "CampaignsApi",
    action,
  });

  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      body.append(key, String(value));
    }
  });

  return body;
}

function buildFormDataBody(action: string, payload: FormData): FormData {
  if (!payload.has("req")) {
    payload.append("req", "CampaignsApi");
  }

  if (!payload.has("action")) {
    payload.append("action", action);
  }

  return payload;
}

export async function campaignsApi<T = unknown>(
  action: string,
  payload: ApiPayload = {},
): Promise<T> {
  if (USE_MOCKS) {
    if (action === "getCampaigns") {
      return fetchApiResponse<T>("/mock/campaigns.json");
    }

    if (action === "getCampaignClients") {
      const campaignId =
        payload instanceof FormData
          ? String(payload.get("campaign_id") ?? "")
          : String(payload.campaign_id ?? "");

      if (!campaignId) {
        throw new Error("campaign_id mancante per getCampaignClients");
      }

      return fetchApiResponse<T>(`/mock/campaign-clients-${campaignId}.json`);
    }

    if (action === "getCampaignClientPhases") {
      const campaignId =
        payload instanceof FormData
          ? String(payload.get("campaign_id") ?? "")
          : String(payload.campaign_id ?? "");

      const clientId =
        payload instanceof FormData
          ? String(payload.get("client_id") ?? "")
          : String(payload.client_id ?? "");

      if (!campaignId || !clientId) {
        throw new Error(
          "campaign_id/client_id mancanti per getCampaignClientPhases",
        );
      }

      return fetchApiResponse<T>(
        `/mock/campaign-client-phases-${campaignId}-${clientId}.json`,
      );
    }

    throw new Error(`Mock non disponibile per action: ${action}`);
  }

  const isFormData = payload instanceof FormData;
  const body = isFormData
    ? buildFormDataBody(action, payload)
    : buildUrlEncodedBody(action, payload);

  return fetchApiResponse<T>(getDispatcherUrl(), {
    method: "POST",
    credentials: "include",
    headers: isFormData
      ? undefined
      : {
          "Content-Type": "application/x-www-form-urlencoded",
        },
    body,
  });
}
