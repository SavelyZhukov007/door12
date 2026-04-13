import { FileSystemNode } from '../types';

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const initialFileSystem: FileSystemNode[] = [
  {
    id: 'root',
    name: 'C:',
    type: 'folder',
    parentId: null,
    createdAt: Date.now(),
    modifiedAt: Date.now(),
    children: [],
  },
  {
    id: 'desktop',
    name: 'Desktop',
    type: 'folder',
    parentId: 'root',
    createdAt: Date.now(),
    modifiedAt: Date.now(),
    children: [],
  },
  {
    id: 'documents',
    name: 'Documents',
    type: 'folder',
    parentId: 'root',
    createdAt: Date.now(),
    modifiedAt: Date.now(),
    children: [],
  },
  {
    id: 'downloads',
    name: 'Downloads',
    type: 'folder',
    parentId: 'root',
    createdAt: Date.now(),
    modifiedAt: Date.now(),
    children: [],
  },
  {
    id: 'pictures',
    name: 'Pictures',
    type: 'folder',
    parentId: 'root',
    createdAt: Date.now(),
    modifiedAt: Date.now(),
    children: [],
  },
  {
    id: 'welcome-txt',
    name: 'Welcome.txt',
    type: 'file',
    extension: 'txt',
    parentId: 'desktop',
    content: 'Добро пожаловать в Door 12!\n\nЭто симулятор операционной системы.\nВы можете:\n- Создавать файлы и папки\n- Открывать приложения\n- Работать с файловой системой\n\nРазработано с использованием React + TypeScript.',
    createdAt: Date.now(),
    modifiedAt: Date.now(),
    size: 256,
  },
  {
    id: 'readme',
    name: 'Readme.txt',
    type: 'file',
    extension: 'txt',
    parentId: 'documents',
    content: 'Door 12 — операционная система нового поколения.\n\nВерсия: 1.0.0\nСборка: 2024',
    createdAt: Date.now(),
    modifiedAt: Date.now(),
    size: 128,
  },
];

export const getChildren = (nodes: FileSystemNode[], parentId: string): FileSystemNode[] => {
  return nodes.filter(n => n.parentId === parentId);
};

export const getNodeById = (nodes: FileSystemNode[], id: string): FileSystemNode | undefined => {
  return nodes.find(n => n.id === id);
};

export const addNode = (nodes: FileSystemNode[], node: FileSystemNode): FileSystemNode[] => {
  return [...nodes, node];
};

export const updateNode = (nodes: FileSystemNode[], id: string, updates: Partial<FileSystemNode>): FileSystemNode[] => {
  return nodes.map(n => n.id === id ? { ...n, ...updates, modifiedAt: Date.now() } : n);
};

export const deleteNode = (nodes: FileSystemNode[], id: string): FileSystemNode[] => {
  const toDelete = new Set<string>([id]);
  const queue = [id];
  while (queue.length > 0) {
    const currentId = queue.shift();
    if (!currentId) continue;
    for (const n of nodes) {
      if (n.parentId === currentId) {
        toDelete.add(n.id);
        queue.push(n.id);
      }
    }
  }
  return nodes.filter(n => !toDelete.has(n.id));
};

export const getPath = (nodes: FileSystemNode[], id: string): string => {
  const parts: string[] = [];
  let current = nodes.find(n => n.id === id);
  while (current) {
    parts.unshift(current.name);
    const parentId = current.parentId;
    if (!parentId) break;
    let next: FileSystemNode | undefined;
    for (const node of nodes) {
      if (node.id === parentId) {
        next = node;
        break;
      }
    }
    current = next;
  }
  return parts.join('\\');
};
