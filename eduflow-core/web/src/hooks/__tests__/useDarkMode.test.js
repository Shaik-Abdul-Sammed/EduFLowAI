import { renderHook, act } from '@testing-library/react';
import { useDarkMode } from '../useDarkMode';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe('useDarkMode Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('should initialize with light mode', () => {
    const { result } = renderHook(() => useDarkMode());
    
    expect(result.current.isDarkMode).toBe(false);
  });

  it('should provide toggle function', () => {
    const { result } = renderHook(() => useDarkMode());
    
    expect(typeof result.current.toggleDarkMode).toBe('function');
  });

  it('should toggle dark mode', () => {
    const { result } = renderHook(() => useDarkMode());
    
    expect(result.current.isDarkMode).toBe(false);
    
    act(() => {
      result.current.toggleDarkMode();
    });
    
    expect(result.current.isDarkMode).toBe(true);
  });

  it('should toggle back to light mode', () => {
    const { result } = renderHook(() => useDarkMode());
    
    act(() => {
      result.current.toggleDarkMode();
      result.current.toggleDarkMode();
    });
    
    expect(result.current.isDarkMode).toBe(false);
  });

  it('should persist dark mode preference', () => {
    const { result } = renderHook(() => useDarkMode());
    
    act(() => {
      result.current.toggleDarkMode();
    });
    
    const stored = localStorage.getItem('eduflow-ai-dark-mode');
    expect(stored).not.toBeNull();
  });

  it('should restore dark mode from storage', () => {
    localStorage.setItem('eduflow-ai-dark-mode', 'true');
    const { result } = renderHook(() => useDarkMode());
    
    expect(result.current.isDarkMode).toBe(true);
  });

  it('should apply dark attribute to document', () => {
    const { result } = renderHook(() => useDarkMode());
    
    act(() => {
      result.current.toggleDarkMode();
    });
    
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('should remove dark attribute from document', () => {
    localStorage.setItem('eduflow-ai-dark-mode', 'true');
    const { result } = renderHook(() => useDarkMode());
    
    act(() => {
      result.current.toggleDarkMode();
    });
    
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('should persist the exact boolean string value', () => {
    const { result } = renderHook(() => useDarkMode());

    act(() => {
      result.current.toggleDarkMode();
    });

    expect(localStorage.getItem('eduflow-ai-dark-mode')).toBe('true');
  });
});
