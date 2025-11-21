import { useState, useCallback } from "react";

/**
 * useCopyToClipboard Hook
 * 
 * Copies text to clipboard and returns success/error state
 * 
 * @example
 * const { copy, copied, error } = useCopyToClipboard();
 * 
 * <button onClick={() => copy("Text to copy")}>
 *   {copied ? "Copied!" : "Copy"}
 * </button>
 */
export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const copy = useCallback(async (text: string) => {
    if (!navigator?.clipboard) {
      const err = new Error("Clipboard not supported");
      setError(err);
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setError(null);

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);

      return true;
    } catch (err) {
      const error = err as Error;
      setError(error);
      setCopied(false);
      return false;
    }
  }, []);

  return { copy, copied, error };
}

/**
 * useToggle Hook
 * 
 * Boolean toggle hook with optional callbacks
 * 
 * @example
 * const [isOpen, toggle, setIsOpen] = useToggle(false);
 * 
 * <button onClick={toggle}>Toggle</button>
 * <button onClick={() => setIsOpen(true)}>Open</button>
 */
export function useToggle(
  initialValue: boolean = false
): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue((prev) => !prev);
  }, []);

  const set = useCallback((newValue: boolean) => {
    setValue(newValue);
  }, []);

  return [value, toggle, set];
}

/**
 * useModal Hook
 * 
 * Modal state management hook
 * 
 * @example
 * const modal = useModal();
 * 
 * <button onClick={modal.open}>Open Modal</button>
 * <Modal isOpen={modal.isOpen} onClose={modal.close}>
 *   Content
 * </Modal>
 */
export interface UseModalReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export function useModal(initialState: boolean = false): UseModalReturn {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return { isOpen, open, close, toggle };
}
