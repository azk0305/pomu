type ConfirmRequest = {
  message: string;
  resolve: (value: boolean) => void;
};

class ConfirmStore {
  private currentRequest: ConfirmRequest | null = null;
  private listeners: Set<() => void> = new Set();

  /**
   * Subscribes to changes in the store.
   */
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Returns the current confirmation request, if any.
   */
  getSnapshot() {
    return this.currentRequest;
  }

  /**
   * Asks the user for confirmation.
   * Returns a promise that resolves to true (confirmed) or false (cancelled).
   */
  ask(message: string): Promise<boolean> {
    // If a request is already active, we reject the new one or queue it.
    // For simplicity, we just reject if another one is pending.
    if (this.currentRequest) {
      return Promise.resolve(false);
    }

    return new Promise((resolve) => {
      this.currentRequest = {
        message,
        resolve: (val) => {
          this.currentRequest = null;
          resolve(val);
          this.notify();
        },
      };
      this.notify();
    });
  }

  private notify() {
    for (const listener of this.listeners) {
      listener();
    }
  }
}

export const confirmStore = new ConfirmStore();
