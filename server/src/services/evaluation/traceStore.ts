export interface TraceRecord {
  id: string;
  dimension: string;
  prompt: string;
  raw_response: string;
  created_at: string;
}

const traceStore = new Map<string, TraceRecord>();

export function saveTrace(record: Omit<TraceRecord, 'id' | 'created_at'>) {
  const id = crypto.randomUUID();
  const saved: TraceRecord = {
    id,
    created_at: new Date().toISOString(),
    ...record,
  };
  traceStore.set(id, saved);
  return saved;
}

export function getTrace(traceId: string) {
  return traceStore.get(traceId) ?? null;
}
