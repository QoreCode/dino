export class Pool<T> {
  readonly items: T[];
  readonly capacity: number;
  activeCount = 0;

  constructor(capacity: number, create: () => T) {
    this.capacity = capacity;
    this.items = [];
    for (let i = 0; i < capacity; i += 1) {
      this.items.push(create());
    }
  }

  acquire(): T | undefined {
    if (this.activeCount >= this.capacity) {
      return undefined;
    }
    const item = this.items[this.activeCount];
    this.activeCount += 1;
    return item;
  }

  releaseAt(index: number): void {
    if (index < 0 || index >= this.activeCount) {
      return;
    }
    const last = this.activeCount - 1;
    const current = this.items[index];
    const tail = this.items[last];
    if (current === undefined || tail === undefined) {
      return;
    }
    this.items[index] = tail;
    this.items[last] = current;
    this.activeCount = last;
  }

  release(item: T): boolean {
    for (let i = 0; i < this.activeCount; i += 1) {
      if (this.items[i] === item) {
        this.releaseAt(i);
        return true;
      }
    }
    return false;
  }

  clear(): void {
    this.activeCount = 0;
  }
}
