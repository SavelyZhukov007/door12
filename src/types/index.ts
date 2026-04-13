export interface FileSystemNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileSystemNode[];
  parentId: string | null;
  createdAt: number;
  modifiedAt: number;
  size?: number;
  extension?: string;
  icon?: string;
}

export interface AppWindow {
  id: string;
  appId: string;
  title: string;
  icon: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  isFocused: boolean;
  zIndex: number;
  extraProps?: Record<string, any>;
}

export interface AppDefinition {
  id: string;
  name: string;
  icon: string;
  component: React.ComponentType<AppProps>;
  defaultWidth: number;
  defaultHeight: number;
  minWidth?: number;
  minHeight?: number;
  singleInstance?: boolean;
}

export interface AppProps {
  windowId: string;
  fileSystem: FileSystemNode[];
  onFileSystemChange: (nodes: FileSystemNode[] | ((prev: FileSystemNode[]) => FileSystemNode[])) => void;
  onOpenFile?: (node: FileSystemNode) => void;
  extraProps?: Record<string, any>;
}

export interface DesktopIcon {
  id: string;
  name: string;
  icon: string;
  appId?: string;
  fileNodeId?: string;
  x: number;
  y: number;
}

export interface Process {
  id: string;
  pid: number;
  appId: string;
  name: string;
  icon: string;
  windowId?: string;
  status: 'Running' | 'Suspended' | 'Background' | 'Stopped';
  cpu: number;
  memory: number;
  priority: 'Low' | 'Normal' | 'High';
  description: string;
  startTime: number;
}

export interface UsbDevice {
  id: string;
  name: string;
  label: string;
  mounted: boolean;
  rootId: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}
