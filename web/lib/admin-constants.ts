export interface AdminLogAction {
  label: string;
  colorClass: string;
}

export const ADMIN_LOG_ACTIONS: Record<string, AdminLogAction> = {
  create_post: { label: 'İçerik Oluşturma', colorClass: 'createColor' },
  edit_post: { label: 'İçerik Düzenleme', colorClass: 'updateColor' },
  delete_post: { label: 'İçerik Silme', colorClass: 'deleteColor' },
  create_user: { label: 'Yeni Üye Kaydı', colorClass: 'createColor' },
  update_user: { label: 'Üye Güncelleme', colorClass: 'updateColor' },
  delete_user: { label: 'Üye Silme', colorClass: 'deleteColor' },
  login: { label: 'Giriş Yapıldı', colorClass: 'defaultColor' },
  create_carousel_item: { label: 'Manşet Ekleme', colorClass: 'createColor' },
  update_carousel_item: { label: 'Manşet Güncelleme', colorClass: 'updateColor' },
  delete_carousel_item: { label: 'Manşet Silme', colorClass: 'deleteColor' },
  create_ad_campaign: { label: 'Kampanya Ekleme', colorClass: 'createColor' },
  update_ad_campaign: { label: 'Kampanya Güncelleme', colorClass: 'updateColor' },
  delete_ad_campaign: { label: 'Kampanya Silme', colorClass: 'deleteColor' },
  create_quiz: { label: 'Test Ekleme', colorClass: 'createColor' },
  edit_quiz: { label: 'Test Güncelleme', colorClass: 'updateColor' },
  delete_quiz: { label: 'Test Silme', colorClass: 'deleteColor' },
  create_comment: { label: 'Yorum Ekleme', colorClass: 'createColor' },
  update_comment_admin: { label: 'Yorum Güncelleme (Admin)', colorClass: 'updateColor' },
  delete_comment_admin: { label: 'Yorum Silme (Admin)', colorClass: 'deleteColor' },
};

export const LOG_ACTION_OPTIONS = Object.entries(ADMIN_LOG_ACTIONS).map(([value, action]) => ({
  value,
  label: action.label,
}));
