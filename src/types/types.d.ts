export type Campaign = {
    id: number;
    title: string;
    start_date: string;
    end_date: string;
    max_date: string;
    active: number;
    can_attach_clients?: boolean;
    completed_clients_count: number;
    cancelled_clients_count: number;
    approving_iter_information?: string | null;
    [key: string]: any; // For any additional properties
}

export type Client = {
    id: number;
    client_id: number;
    
    company: string;
    accountnumber: string;
    city: string;
    prov: string;
    vatnumber: string;
    
    campaign_status: string | null;
    campaign_status_label: string;
    
    completed_phases: number;
    total_phases: number;
    active_campaigns_count?: number;
    
    current_phase_position?: number | null;
    current_phase_title?: string | null;
    current_phase_state?: string | null;
    current_phase_label?: string | null;
    
    seller_name: string;
    polo: string;
    area: string;
    filiale: string;

    is_rebiz?: number | boolean;
    is_itse?: number | boolean;
    has_clickcard?: number | boolean;

    is_todo?: boolean;
    
    [key: string]: any; // For any additional properties
}

export type CampaignPhaseFlags = {
  enable_notify_pdv: number;
  enable_process_outcome: number;
  enable_process_post_sign_editing: number;
  enable_master_reloading: number;
  enable_segreteria_vendite: number;
  enable_hierarchy_off: number;
  enable_max_date_block: number;
  enable_rpv: number;
};

export type CampaignClientPhase = {
  client_phase_id: number;
  campaign_id: number;
  client_id: number;
  phase_id: number;
  position: number | null;
  title: string;
  descr: string;
  phase_state: 'PENDING' | 'PENDING_APPROVAL' | 'OK' | 'KO' | string | null;
  campaign_status: 'COMPLETED' | 'CANCELLED' | string | null;
  main_document_id: number | null;
  main_document_file_name: string | null;
  main_document_download_url: string | null;
  has_new_back_docs: number;
  flags: CampaignPhaseFlags;
  permissions?: {
    current_user_id?: number;
    current_user_image?: string | null;
    is_super_user?: boolean;
    is_admitted?: boolean;
    is_owner?: boolean;
    is_reviewer?: boolean;
    has_later_phase_access?: boolean;

    can_view?: boolean;
    can_open_detail?: boolean;

    can_upload_main_document?: boolean;
    can_delete_main_document?: boolean;

    can_upload_phase_files?: boolean;
    can_delete_phase_files?: boolean;
    can_delete_own_phase_files?: boolean;

    can_submit_for_approval?: boolean;
    can_approve?: boolean;
    can_reject?: boolean;

    can_send_back_documents?: boolean;
    can_view_back_documents?: boolean;

    can_complete_campaign?: boolean;
    can_cancel_campaign?: boolean;

    can_view_comments?: boolean;
    can_add_comment?: boolean;
  };
};

export type PhaseFile = {
  id: number;
  client_phase_id: number;
  phase_client_id?: number;

  campaign_id?: number | null;
  client_id?: number | null;
  phase_id?: number | null;

  phase_position?: number | null;
  phase_title?: string | null;

  stored_name?: string | null;
  file_name: string;
  original_name?: string | null;
  name: string;
  display_name: string;

  mime_type?: string | null;
  size_bytes?: number | null;
  size_human?: string | null;

  download_url?: string | null;

  uploaded_at?: string | null;
  uploaded_at_it?: string | null;

  uploaded_by?: string | null;
  uploader_full_name?: string | null;
  uploader_email?: string | null;
  uploaded_by_intranet_user_id?: number | null;

  phase_position?: number | null;
  phase_title?: string | null;
  client_phase_id?: number | null;
  fk_phase_client_id?: number | null;
  can_delete?: boolean;
};

export type PhaseComment = {
  id: number;
  text?: string;
  comment?: string;
  author?: string;
  author_email?: string | null;
  author_image?: string | null;
  created_at?: string | null;
  phase_position?: number | null;
  phase_title?: string | null;
  fk_user_id?: number | null;
};

export type CampaignAvailableClient = {
  client_id: number;
  company: string;
  accountnumber?: string | null;
  vatnumber?: string | null;
  fiscalcode?: string | null;
  city?: string | null;
  prov?: string | null;
  fk_filiale_id?: string | null;
  fk_agente_id?: string | null;
};

export type MainDocumentVersion = {
  id: number;
  file_name: string;
  display_name: string;
  download_url?: string | null;
  uploaded_at?: string | null;
  uploaded_by?: string | null;
  uploaded_by_intranet_user_id?: number | null;
  client_phase_id?: number | null;
  fk_phase_client_id?: number | null;
  phase_position?: number | null;
  phase_title?: string | null;
  is_current: boolean;
};

export type MainDocumentUploadResponse = {
  uploaded: boolean;
  version_id?: number;
  client_phase_id?: number;
  file_name?: string;
  original_name?: string | null;
  download_url?: string | null;
  message?: string;
};

export type MainDocumentDeleteResponse = {
  deleted: boolean;
  version_id?: number;
  current_main_document?: number | null;
  message?: string;
};