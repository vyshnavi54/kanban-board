export type Status = 'pending' | 'in-progress' | 'completed';
export type Priority = 'high' | 'medium' | 'low';

export interface Card {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  deadline: string | null; // 'YYYY-MM-DD' or null
  createdAt: number;
}

export interface ColumnDef {
  id: Status;
  label: string;
  dot: string;
  icon: string;
}
