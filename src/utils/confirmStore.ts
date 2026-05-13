import * as readline from "node:readline/promises";

// 確認リクエストの型定義
type ConfirmRequest = {
  message: string;
  resolve: (value: boolean) => void;
};

// 確認リクエスト管理クラス
class ConfirmStore {
  private currentRequest: ConfirmRequest | null = null;
  private listeners: Set<() => void> = new Set();
  private isHeadless: boolean = false;
  private isYolo: boolean = false;

  setHeadlessMode(value: boolean) {
    this.isHeadless = value;
  }

  setYoloMode(value: boolean) {
    this.isYolo = value;
  }

  /**
   * ストアの変更内容を通知する
   */
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * 現在の確認リクエストを返す
   */
  getSnapshot() {
    return this.currentRequest;
  }

  /**
   * 確認内容をユーザーに提示する
   * ユーザーの入力を待つ
   * 既存のリクエストがある場合は新しいリクエストを拒否する
   */
  async ask(message: string): Promise<boolean> {
    if (this.isYolo) {
      return Promise.resolve(true);
    }

    if (this.isHeadless) {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      try {
        const answer = await rl.question(`${message} (y/N): `);
        return answer.toLowerCase() === "y";
      } finally {
        rl.close();
      }
    }

    // 既存のリクエストがある場合は新しいリクエストを拒否する
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

  // ストアの変更内容を通知する
  private notify() {
    for (const listener of this.listeners) {
      listener();
    }
  }
}

export const confirmStore = new ConfirmStore();
