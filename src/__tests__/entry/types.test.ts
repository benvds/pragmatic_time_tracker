import { describe, it, expect } from 'vitest';
import type {
  TimeEntry,
  TimeEntryFormData,
  CreateTimeEntryRequest,
  UpdateTimeEntryRequest,
  ValidationError,
  ServiceResponse
} from '@/features/entry/types';

describe('TimeEntry Types Contract Tests', () => {
  describe('TimeEntry interface', () => {
    it('should have all required fields with correct types', () => {
      const timeEntry: TimeEntry = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        date: '2025-09-14',
        description: 'Backend API development',
        project: 'Time Tracker',
        duration: 480, // 8 hours in minutes
        createdAt: '2025-09-14T10:00:00.000Z',
        updatedAt: '2025-09-14T10:00:00.000Z'
      };

      // Type assertions to verify interface contract
      expect(typeof timeEntry.id).toBe('string');
      expect(typeof timeEntry.date).toBe('string');
      expect(typeof timeEntry.description).toBe('string');
      expect(typeof timeEntry.project).toBe('string');
      expect(typeof timeEntry.duration).toBe('number');
      expect(typeof timeEntry.createdAt).toBe('string');
      expect(typeof timeEntry.updatedAt).toBe('string');

      // Validate UUID format
      expect(timeEntry.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

      // Validate ISO date format
      expect(timeEntry.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      // Validate ISO timestamp format
      expect(timeEntry.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
      expect(timeEntry.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
    });

    it('should enforce minimum requirements for description and project', () => {
      const timeEntry: TimeEntry = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        date: '2025-09-14',
        description: 'abc', // minimum 3 chars
        project: 'ab', // minimum 2 chars
        duration: 60,
        createdAt: '2025-09-14T10:00:00.000Z',
        updatedAt: '2025-09-14T10:00:00.000Z'
      };

      expect(timeEntry.description.length).toBeGreaterThanOrEqual(3);
      expect(timeEntry.project.length).toBeGreaterThanOrEqual(2);
    });

    it('should enforce valid duration range (0-1440 minutes)', () => {
      const timeEntry: TimeEntry = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        date: '2025-09-14',
        description: 'Test work',
        project: 'Test project',
        duration: 1440, // maximum 24 hours in minutes
        createdAt: '2025-09-14T10:00:00.000Z',
        updatedAt: '2025-09-14T10:00:00.000Z'
      };

      expect(timeEntry.duration).toBeGreaterThanOrEqual(0);
      expect(timeEntry.duration).toBeLessThanOrEqual(1440);
    });
  });

  describe('TimeEntryFormData interface', () => {
    it('should have all required form fields', () => {
      const formData: TimeEntryFormData = {
        date: '2025-09-14',
        description: 'Backend development',
        project: 'Time Tracker',
        hh: 8,
        mm: 30
      };

      expect(typeof formData.date).toBe('string');
      expect(typeof formData.description).toBe('string');
      expect(typeof formData.project).toBe('string');
      expect(typeof formData.hh).toBe('number');
      expect(typeof formData.mm).toBe('number');

      // Validate hh and mm ranges
      expect(formData.hh).toBeGreaterThanOrEqual(0);
      expect(formData.hh).toBeLessThanOrEqual(24);
      expect(formData.mm).toBeGreaterThanOrEqual(0);
      expect(formData.mm).toBeLessThanOrEqual(59);
    });
  });

  describe('CreateTimeEntryRequest interface', () => {
    it('should have required fields for creation', () => {
      const createRequest: CreateTimeEntryRequest = {
        date: '2025-09-14',
        description: 'New time entry',
        project: 'Test Project',
        duration: 480
      };

      expect(typeof createRequest.date).toBe('string');
      expect(typeof createRequest.description).toBe('string');
      expect(typeof createRequest.project).toBe('string');
      expect(typeof createRequest.duration).toBe('number');
    });
  });

  describe('UpdateTimeEntryRequest interface', () => {
    it('should have optional fields for updates', () => {
      const updateRequest: UpdateTimeEntryRequest = {
        description: 'Updated description',
        duration: 240
      };

      expect(typeof updateRequest.description).toBe('string');
      expect(typeof updateRequest.duration).toBe('number');
      expect(updateRequest.project).toBeUndefined();
    });

    it('should allow empty update request', () => {
      const updateRequest: UpdateTimeEntryRequest = {};

      expect(Object.keys(updateRequest)).toHaveLength(0);
    });
  });

  describe('ValidationError interface', () => {
    it('should have field and message properties', () => {
      const error: ValidationError = {
        field: 'description',
        message: 'Description is required'
      };

      expect(typeof error.field).toBe('string');
      expect(typeof error.message).toBe('string');
    });
  });

  describe('ServiceResponse interface', () => {
    it('should handle successful response with data', () => {
      const response: ServiceResponse<TimeEntry> = {
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          date: '2025-09-14',
          description: 'Test entry',
          project: 'Test project',
          duration: 480,
          createdAt: '2025-09-14T10:00:00.000Z',
          updatedAt: '2025-09-14T10:00:00.000Z'
        },
        success: true
      };

      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.errors).toBeUndefined();
    });

    it('should handle error response with validation errors', () => {
      const response: ServiceResponse<TimeEntry> = {
        errors: [
          { field: 'description', message: 'Description is required' },
          { field: 'date', message: 'Invalid date format' }
        ],
        success: false
      };

      expect(response.success).toBe(false);
      expect(response.errors).toBeDefined();
      expect(response.errors).toHaveLength(2);
      expect(response.data).toBeUndefined();
    });
  });
});
