export interface ActivityItem {
  id: string;
  timestamp: string;
  actorName: string;
  actorEmail: string;
  actorId?: string;
  department?: string;
  action: string;
  module: string;
  entityType: string;
  entityId?: string;
  severity?: string;
  source: 'audit' | 'security' | 'workflow' | 'document';
  description: string;
  route: string;
}

export interface ActivityStreamResponse {
  view: 'my' | 'team' | 'system';
  count: number;
  activities: ActivityItem[];
}
