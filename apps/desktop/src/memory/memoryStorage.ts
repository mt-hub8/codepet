import { invoke } from "@tauri-apps/api/core";
import type { BasicMemory, BasicMemoryType } from "./memoryTypes";

type BasicMemoryDto = {
  id: string;
  memoryType: string;
  key: string;
  value: string;
  source: string;
  updatedAt: string;
};

function mapRecord(record: BasicMemoryDto): BasicMemory {
  return {
    id: record.id,
    type: record.memoryType as BasicMemory["type"],
    key: record.key,
    value: record.value,
    source: record.source,
    updatedAt: record.updatedAt,
  };
}

export const memoryStorage = {
  list: () => invoke<BasicMemoryDto[]>("list_basic_memory").then((rows) => rows.map(mapRecord)),

  save: (input: {
    type: BasicMemoryType;
    key: string;
    value: string;
    source: string;
  }) =>
    invoke<BasicMemoryDto>("save_basic_memory", {
      memoryType: input.type,
      key: input.key,
      value: input.value,
      source: input.source,
    }).then(mapRecord),

  delete: (id: string) => invoke<void>("delete_basic_memory", { id }),
};
