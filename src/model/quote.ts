export interface Quote {
  quoteId: number;
  quoteTx: string;
  approved: string;
  fromUser: string;
  sourceId: number;
  tags: {id: number; name: string}[];
  tagIds: number[];
}
