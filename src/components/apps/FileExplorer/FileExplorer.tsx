import React, { useState } from 'react';
import { Button, Input, Modal, message, Breadcrumb, Tooltip } from 'antd';
import {
  FolderOutlined, FileTextOutlined, DeleteOutlined,
  PlusOutlined, EditOutlined, ArrowLeftOutlined, ArrowRightOutlined,
  ArrowUpOutlined, ReloadOutlined, AppstoreOutlined, UnorderedListOutlined,
} from '@ant-design/icons';
import { AppProps, FileSystemNode } from '../../../types';
import { generateId, addNode, deleteNode, updateNode, getChildren, getNodeById } from '../../../store/fileSystem';
import './FileExplorer.css';

type ViewMode = 'grid' | 'list';

const getFileIcon = (node: FileSystemNode) => {
  if (node.type === 'folder') return <FolderOutlined style={{ color: '#ffd04b', fontSize: 20 }} />;
  const ext = node.extension || node.name.split('.').pop() || '';
  if (['txt', 'md'].includes(ext)) return <FileTextOutlined style={{ color: '#88c0ff', fontSize: 20 }} />;
  return <FileTextOutlined style={{ color: '#aaa', fontSize: 20 }} />;
};

const FileExplorer: React.FC<AppProps> = ({ fileSystem, onFileSystemChange, onOpenFile }) => {
  const [currentFolderId, setCurrentFolderId] = useState('root');
  const [history, setHistory] = useState<string[]>(['root']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [newFolderModal, setNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFileModal, setNewFileModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  const navigate = (id: string) => {
    const newHistory = [...history.slice(0, historyIndex + 1), id];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentFolderId(id);
    setSelectedId(null);
  };

  const goBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentFolderId(history[newIndex]);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentFolderId(history[newIndex]);
    }
  };

  const goUp = () => {
    const current = getNodeById(fileSystem, currentFolderId);
    if (current?.parentId) navigate(current.parentId);
  };

  const handleDoubleClick = (node: FileSystemNode) => {
    if (node.type === 'folder') {
      navigate(node.id);
    } else {
      if (onOpenFile) onOpenFile(node);
    }
  };

  const handleDelete = () => {
    if (!selectedId) return;
    const node = getNodeById(fileSystem, selectedId);
    if (!node) return;
    Modal.confirm({
      title: `Удалить "${node.name}"?`,
      okText: 'Удалить',
      okType: 'danger',
      cancelText: 'Отмена',
      onOk: () => {
        onFileSystemChange(deleteNode(fileSystem, selectedId));
        setSelectedId(null);
        message.success('Удалено');
      },
    });
  };

  const handleRename = (node: FileSystemNode) => {
    setRenameId(node.id);
    setRenameValue(node.name);
  };

  const submitRename = () => {
    if (!renameId || !renameValue.trim()) return;
    onFileSystemChange(updateNode(fileSystem, renameId, { name: renameValue.trim() }));
    setRenameId(null);
  };

  const handleNewFolder = () => {
    if (!newFolderName.trim()) return;
    const node: FileSystemNode = {
      id: generateId(),
      name: newFolderName.trim(),
      type: 'folder',
      parentId: currentFolderId,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      children: [],
    };
    onFileSystemChange(addNode(fileSystem, node));
    setNewFolderName('');
    setNewFolderModal(false);
    message.success('Папка создана');
  };

  const handleNewFile = () => {
    if (!newFileName.trim()) return;
    const name = newFileName.trim();
    const ext = name.includes('.') ? name.split('.').pop() : 'txt';
    const node: FileSystemNode = {
      id: generateId(),
      name,
      type: 'file',
      extension: ext,
      parentId: currentFolderId,
      content: '',
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      size: 0,
    };
    onFileSystemChange(addNode(fileSystem, node));
    setNewFileName('');
    setNewFileModal(false);
    message.success('Файл создан');
  };

  const buildBreadcrumb = () => {
    const parts: { id: string; name: string }[] = [];
    let current = getNodeById(fileSystem, currentFolderId);
    while (current) {
      parts.unshift({ id: current.id, name: current.name });
      current = current.parentId ? getNodeById(fileSystem, current.parentId) : undefined;
    }
    return parts;
  };

  const items = getChildren(fileSystem, currentFolderId).sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  const breadcrumbs = buildBreadcrumb();

  return (
    <div className="file-explorer">
      <div className="fe-toolbar">
        <Tooltip title="Назад"><Button size="small" icon={<ArrowLeftOutlined />} disabled={historyIndex === 0} onClick={goBack} /></Tooltip>
        <Tooltip title="Вперёд"><Button size="small" icon={<ArrowRightOutlined />} disabled={historyIndex === history.length - 1} onClick={goForward} /></Tooltip>
        <Tooltip title="Вверх"><Button size="small" icon={<ArrowUpOutlined />} onClick={goUp} /></Tooltip>
        <Tooltip title="Обновить"><Button size="small" icon={<ReloadOutlined />} onClick={() => setSelectedId(null)} /></Tooltip>
        <div className="fe-divider" />
        <Tooltip title="Новая папка"><Button size="small" icon={<PlusOutlined />} onClick={() => setNewFolderModal(true)}>Папка</Button></Tooltip>
        <Tooltip title="Новый файл"><Button size="small" icon={<PlusOutlined />} onClick={() => setNewFileModal(true)}>Файл</Button></Tooltip>
        <div className="fe-divider" />
        <Tooltip title="Переименовать"><Button size="small" icon={<EditOutlined />} disabled={!selectedId} onClick={() => { const n = getNodeById(fileSystem, selectedId!); if (n) handleRename(n); }} /></Tooltip>
        <Tooltip title="Удалить"><Button size="small" icon={<DeleteOutlined />} danger disabled={!selectedId} onClick={handleDelete} /></Tooltip>
        <div style={{ flex: 1 }} />
        <Button.Group size="small">
          <Button icon={<AppstoreOutlined />} type={viewMode === 'grid' ? 'primary' : 'default'} onClick={() => setViewMode('grid')} />
          <Button icon={<UnorderedListOutlined />} type={viewMode === 'list' ? 'primary' : 'default'} onClick={() => setViewMode('list')} />
        </Button.Group>
      </div>

      <div className="fe-breadcrumb">
        <Breadcrumb>
          {breadcrumbs.map((b, i) => (
            <Breadcrumb.Item key={b.id}>
              {i < breadcrumbs.length - 1
                ? <span className="breadcrumb-link" onClick={() => navigate(b.id)}>{b.name}</span>
                : <span>{b.name}</span>}
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
      </div>

      <div className={`fe-content ${viewMode}`}>
        {items.length === 0 && (
          <div className="fe-empty">Папка пуста</div>
        )}
        {items.map(node => (
          <div
            key={node.id}
            className={`fe-item ${selectedId === node.id ? 'selected' : ''}`}
            onClick={() => setSelectedId(node.id)}
            onDoubleClick={() => handleDoubleClick(node)}
          >
            {renameId === node.id ? (
              <Input
                size="small"
                value={renameValue}
                autoFocus
                onChange={e => setRenameValue(e.target.value)}
                onPressEnter={submitRename}
                onBlur={submitRename}
                onClick={e => e.stopPropagation()}
                style={{ width: viewMode === 'grid' ? 80 : 200 }}
              />
            ) : (
              <>
                <div className="fe-icon">{getFileIcon(node)}</div>
                <div className="fe-name" title={node.name}>{node.name}</div>
                {viewMode === 'list' && (
                  <>
                    <div className="fe-type">{node.type === 'folder' ? 'Папка' : node.extension?.toUpperCase() || 'Файл'}</div>
                    <div className="fe-date">{new Date(node.modifiedAt).toLocaleDateString('ru-RU')}</div>
                    <div className="fe-size">{node.type === 'file' ? `${node.size || 0} байт` : ''}</div>
                  </>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      <div className="fe-statusbar">
        {selectedId
          ? `Выбран: ${getNodeById(fileSystem, selectedId)?.name}`
          : `Элементов: ${items.length}`}
      </div>

      <Modal
        title="Новая папка"
        open={newFolderModal}
        onOk={handleNewFolder}
        onCancel={() => { setNewFolderModal(false); setNewFolderName(''); }}
        okText="Создать"
        cancelText="Отмена"
      >
        <Input
          autoFocus
          placeholder="Название папки"
          value={newFolderName}
          onChange={e => setNewFolderName(e.target.value)}
          onPressEnter={handleNewFolder}
        />
      </Modal>

      <Modal
        title="Новый файл"
        open={newFileModal}
        onOk={handleNewFile}
        onCancel={() => { setNewFileModal(false); setNewFileName(''); }}
        okText="Создать"
        cancelText="Отмена"
      >
        <Input
          autoFocus
          placeholder="Имя файла (напр. document.txt)"
          value={newFileName}
          onChange={e => setNewFileName(e.target.value)}
          onPressEnter={handleNewFile}
        />
      </Modal>
    </div>
  );
};

export default FileExplorer;
