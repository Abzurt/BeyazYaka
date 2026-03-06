import { describe, it, expect } from 'vitest';
import { ADMIN_LOG_ACTIONS, LOG_ACTION_OPTIONS } from './admin-constants';

describe('Admin Constants', () => {
  it('should have correct labels for common actions', () => {
    expect(ADMIN_LOG_ACTIONS.create_post.label).toBe('İçerik Oluşturma');
    expect(ADMIN_LOG_ACTIONS.delete_user.label).toBe('Üye Silme');
  });

  it('should have correct color classes', () => {
    expect(ADMIN_LOG_ACTIONS.delete_post.colorClass).toBe('deleteColor');
    expect(ADMIN_LOG_ACTIONS.edit_post.colorClass).toBe('updateColor');
  });

  it('should generate valid options for select inputs', () => {
    expect(LOG_ACTION_OPTIONS.length).toBeGreaterThan(0);
    expect(LOG_ACTION_OPTIONS[0]).toHaveProperty('value');
    expect(LOG_ACTION_OPTIONS[0]).toHaveProperty('label');
  });
});
