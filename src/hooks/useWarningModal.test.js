import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWarningModal } from '../hooks/useWarningModal';

describe('useWarningModal', () => {
  const mockWarning1 = {
    level: 'yellow',
    event: 'Snowfall Warning',
    description: 'Light snow expected',
  };

  const mockWarning2 = {
    level: 'orange',
    event: 'Heavy Snow Warning',
    description: 'Heavy snow expected',
  };

  const mockWarning3 = {
    level: 'red',
    event: 'Tornado Warning',
    description: 'Tornado occurring',
  };

  it('should initialize with closed state', () => {
    const { result } = renderHook(() => useWarningModal());

    expect(result.current.isOpen).toBe(false);
    expect(result.current.currentWarning).toBe(null);
    expect(result.current.warningQueue).toHaveLength(0);
    expect(result.current.getQueueLength()).toBe(0);
  });

  describe('openWarning', () => {
    it('should open warning modal and set current warning', () => {
      const { result } = renderHook(() => useWarningModal());

      act(() => {
        result.current.openWarning(mockWarning1);
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.currentWarning).toEqual(mockWarning1);
    });

    it('should add warning to queue when modal already open', () => {
      const { result } = renderHook(() => useWarningModal());

      act(() => {
        result.current.openWarning(mockWarning1);
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.getQueueLength()).toBe(1);

      act(() => {
        result.current.openWarning(mockWarning2);
      });

      expect(result.current.currentWarning).toEqual(mockWarning1);
      expect(result.current.warningQueue).toHaveLength(1);
      expect(result.current.getQueueLength()).toBe(2);
    });

    it('should prevent duplicate warnings in queue', () => {
      const { result } = renderHook(() => useWarningModal());

      act(() => {
        result.current.openWarning(mockWarning1);
      });

      act(() => {
        result.current.openWarning(mockWarning2);
      });

      act(() => {
        result.current.openWarning(mockWarning2);
      });

      expect(result.current.warningQueue).toHaveLength(1);
      expect(result.current.getQueueLength()).toBe(2);
    });

    it('should ignore null or undefined warning', () => {
      const { result } = renderHook(() => useWarningModal());

      act(() => {
        result.current.openWarning(null);
      });

      expect(result.current.isOpen).toBe(false);
      expect(result.current.getQueueLength()).toBe(0);
    });
  });

  describe('closeWarning', () => {
    it('should show next warning from queue', () => {
      const { result } = renderHook(() => useWarningModal());

      act(() => {
        result.current.openWarning(mockWarning1);
        result.current.openWarning(mockWarning2);
        result.current.openWarning(mockWarning3);
      });

      expect(result.current.currentWarning).toEqual(mockWarning1);
      expect(result.current.getQueueLength()).toBe(3);

      act(() => {
        result.current.closeWarning();
      });

      expect(result.current.currentWarning).toEqual(mockWarning2);
      expect(result.current.getQueueLength()).toBe(2);

      act(() => {
        result.current.closeWarning();
      });

      expect(result.current.currentWarning).toEqual(mockWarning3);
      expect(result.current.getQueueLength()).toBe(1);
    });

    it('should close modal when queue is empty', () => {
      const { result } = renderHook(() => useWarningModal());

      act(() => {
        result.current.openWarning(mockWarning1);
      });

      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.closeWarning();
      });

      expect(result.current.isOpen).toBe(false);
      expect(result.current.currentWarning).toBe(null);
      expect(result.current.warningQueue).toHaveLength(0);
    });
  });

  describe('clearQueue', () => {
    it('should clear all warnings and close modal', () => {
      const { result } = renderHook(() => useWarningModal());

      act(() => {
        result.current.openWarning(mockWarning1);
        result.current.openWarning(mockWarning2);
        result.current.openWarning(mockWarning3);
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.getQueueLength()).toBe(3);

      act(() => {
        result.current.clearQueue();
      });

      expect(result.current.isOpen).toBe(false);
      expect(result.current.currentWarning).toBe(null);
      expect(result.current.warningQueue).toHaveLength(0);
    });
  });

  describe('addWarnings', () => {
    it('should add multiple warnings at once', () => {
      const { result } = renderHook(() => useWarningModal());
      const warnings = [mockWarning1, mockWarning2, mockWarning3];

      act(() => {
        result.current.addWarnings(warnings);
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.getQueueLength()).toBe(3);
    });

    it('should ignore non-array input', () => {
      const { result } = renderHook(() => useWarningModal());

      act(() => {
        result.current.addWarnings(null);
      });

      expect(result.current.isOpen).toBe(false);
      expect(result.current.getQueueLength()).toBe(0);
    });
  });

  describe('getQueueLength', () => {
    it('should return correct queue length including current warning', () => {
      const { result } = renderHook(() => useWarningModal());

      expect(result.current.getQueueLength()).toBe(0);

      act(() => {
        result.current.openWarning(mockWarning1);
      });

      expect(result.current.getQueueLength()).toBe(1);

      act(() => {
        result.current.openWarning(mockWarning2);
      });

      expect(result.current.getQueueLength()).toBe(2);

      act(() => {
        result.current.closeWarning();
      });

      expect(result.current.getQueueLength()).toBe(1);
    });
  });
});
