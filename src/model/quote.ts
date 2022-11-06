import {Topic} from "./topic";

export interface Quote {
  quoteId: number;
  quoteTx: string;
  approved: string;
  fromUser: string;
  sourceId: number;
  tags: Topic[];
  tagIds: number[];
}
