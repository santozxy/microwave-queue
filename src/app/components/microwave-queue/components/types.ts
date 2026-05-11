export interface QueueItem {
  name: string;
  previousPosition: number | null;
}

export interface SwapConfirm {
  fromIndex: number;
  toIndex: number;
}
