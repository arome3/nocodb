import { UserType, NotificationType } from '~/lib/Api';

export enum EventType {
  HANDSHAKE = 'handshake',
  CONNECTION_WELCOME = 'connection-welcome',
  CONNECTION_ERROR = 'connection-error',
  NOTIFICATION = 'notification',
  NOTIFICATION_EVENT = 'event-notification',
  USER_EVENT = 'event-user',
  DATA_EVENT = 'event-data',
  META_EVENT = 'event-meta',
  COMMENT_EVENT = 'event-comment',
  DASHBOARD_EVENT = 'event-dashboard',
  WIDGET_EVENT = 'event-widget',
  SCRIPT_EVENT = 'event-script',
  TEAM_EVENT = 'event-team',
  WORKFLOW_EVENT = 'event-workflow',
  WORKFLOW_EXECUTION_EVENT = 'event-workflow-execution',
  PRESENCE_EVENT = 'event-presence',
}

// Base payload interface for all socket events
export interface BaseSocketPayload {
  timestamp: number;
  socketId?: string;
  event?: EventType;
}

// Connection event payloads
export interface ConnectionWelcomePayload extends BaseSocketPayload {
  message: string;
  serverInfo: {
    version: string;
    environment: string;
  };
  user?: UserType;
}

export interface ConnectionErrorPayload extends BaseSocketPayload {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface DataPayload extends BaseSocketPayload {
  id: string;
  action: 'add' | 'update' | 'delete' | 'reorder';
  payload: Record<string, any>;
  before?: string;
}

export interface CommentPayload extends BaseSocketPayload {
  id: string; // rowId
  action: 'add' | 'update' | 'delete';
  payload: Record<string, any>;
}

export interface MetaPayload<T = any> extends BaseSocketPayload {
  action:
    | 'source_create'
    | 'source_update'
    | 'source_delete'
    | 'source_meta_sync'
    | 'table_create'
    | 'table_update'
    | 'table_permission_update'
    | 'table_delete'
    | 'column_add'
    | 'column_update'
    | 'column_delete'
    | 'view_create'
    | 'view_update'
    | 'view_delete'
    | 'permission_update'
    | 'filter_create'
    | 'filter_update'
    | 'filter_delete'
    | 'sort_create'
    | 'sort_update'
    | 'sort_delete'
    | 'view_column_update'
    | 'view_column_refresh' // hide/show all
    | 'row_color_update'
    | 'extension_update'
    | 'extension_create'
    | 'extension_delete';
  payload: T;
  baseId?: string;
}

export interface UserEventPayload<T = any> extends BaseSocketPayload {
  action:
    | 'base_update'
    | 'base_user_add'
    | 'base_user_remove'
    | 'base_user_update'
    | 'workspace_update'
    | 'workspace_user_add'
    | 'workspace_user_remove'
    | 'workspace_user_update'
    | 'base_meta_reload';
  payload: T;
  baseId?: string;
  workspaceId?: string;
}

export interface NotificationPayload extends BaseSocketPayload {
  action: 'create';
  payload: Partial<NotificationType>;
}

// Presence event payloads — split for bandwidth efficiency:
// 'announce' (~200B, once on join) vs 'heartbeat' (~50B, every 30s)

// Sent once on room join — full user identity
export interface PresenceAnnouncePayload extends BaseSocketPayload {
  action: 'announce';
  userId: string;
  email: string;
  displayName: string;
  tableId: string;
  meta?: Record<string, any> | null; // User profile icon metadata (for avatar rendering)
}

// Sent every 30s — lightweight keepalive + optional cursor (Phase 2)
export interface PresenceHeartbeatPayload extends BaseSocketPayload {
  action: 'heartbeat';
  userId: string;
  tableId: string;
  // Cell-level presence (Phase 2 — nullable)
  viewId?: string | null;
  fieldId?: string | null;
  rowId?: string | null;
}

// Sent when user switches tables within the same base
export interface PresenceTableChangePayload extends BaseSocketPayload {
  action: 'table-change';
  userId: string;
  tableId: string;
}

// Sent on explicit departure or server disconnect cleanup
export interface PresenceLeavePayload extends BaseSocketPayload {
  action: 'leave';
  userId: string;
}

// Server-emitted batch snapshot for initial sync and large rooms
export interface PresenceBatchPayload extends BaseSocketPayload {
  action: 'batch';
  users: Array<{
    userId: string;
    email: string;
    displayName: string;
    tableId?: string;
    lastSeen: number;
    meta?: Record<string, any> | null;
  }>;
}

export type PresencePayload =
  | PresenceAnnouncePayload
  | PresenceHeartbeatPayload
  | PresenceTableChangePayload
  | PresenceLeavePayload
  | PresenceBatchPayload;

// Union type for all socket event payloads
export type SocketEventPayload =
  | ConnectionWelcomePayload
  | ConnectionErrorPayload
  | DataPayload
  | MetaPayload
  | CommentPayload
  | NotificationPayload
  | PresencePayload;

// Type mapping for event types to their corresponding payloads
export type SocketEventPayloadMap = {
  [EventType.NOTIFICATION_EVENT]: NotificationPayload;
  [EventType.CONNECTION_WELCOME]: ConnectionWelcomePayload;
  [EventType.CONNECTION_ERROR]: ConnectionErrorPayload;
  [EventType.DATA_EVENT]: DataPayload;
  [EventType.META_EVENT]: MetaPayload;
  [EventType.USER_EVENT]: UserEventPayload;
  [EventType.COMMENT_EVENT]: CommentPayload;
  [EventType.PRESENCE_EVENT]: PresencePayload;
  [key: string]: BaseSocketPayload;
};

// Helper type to get payload type for a specific event
export type PayloadForEvent<T extends EventType> = SocketEventPayloadMap[T];
