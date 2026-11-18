import type { Document } from "../markdown/types";

export type Section = {
  readonly id: string;
  readonly title: string;
  readonly level: number;
};

export type Stack = {
  readonly id: string;
  readonly title: string;
  readonly source: string;
  readonly doc: Document;
  readonly tools: readonly string[];
  readonly sections: readonly Section[];
  readonly samples: number;
  readonly lines: number;
};
