export type TCreateWorkAreaInput = {
  areaName: string;
  postcode?: string;
  date: string;
};

export type TUpdateWorkAreaInput = {
  areaName?: string;
  postcode?: string;
  date?: string;
};
