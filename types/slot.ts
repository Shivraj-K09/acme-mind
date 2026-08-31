export type SlotStatus = "AVAILABLE" | "BOOKED";

export type SlotRow = {
  id: string;
  start_time: string;
  end_time: string;
  status: SlotStatus;
};

export type SlotOption = {
  id: string;
  label: string;
  start_time?: string;
  end_time?: string;
};
