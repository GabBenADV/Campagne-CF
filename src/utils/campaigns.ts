export function getCampaignClients(campaignId: string): Record<string, any>[] {
    // Mock data for demonstration purposes
    const clients = [
        { id: '1', fk_account_number: '000001', fk_campaign_id: '1' },
        { id: '2', fk_account_number: '000002', fk_campaign_id: '1' },
        { id: '3', fk_account_number: '000003', fk_campaign_id: '2' },
    ];
    return clients.filter(client => client.fk_campaign_id === campaignId);
}