import React, { useState, useEffect } from 'react';
import { Button, Select, InputNumber, message } from 'antd';
import { AppProps, FileSystemNode } from '../../../types';
import { generateId, addNode } from '../../../store/fileSystem';
import './Notepad.css';

const { Option } = Select;

const Notepad: React.FC<AppProps> = ({ fileSystem, onFileSystemChange, extraProps }) => {
  const initialContent = extraProps?.fileContent || '';
  const initialFileName = extraProps?.fileName || '';

  const [text, setText] = useState(initialContent);
  const [fileName, setFileName] = useState(initialFileName);
  const [fontSize, setFontSize] = useState(14);
  const [fontFamily, setFontFamily] = useState('monospace');
  const [wordWrap, setWordWrap] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [lineCount, setLineCount] = useState(1);
  const [colCount, setColCount] = useState(1);

  useEffect(() => {
    const lines = text.split('\n').length;
    setLineCount(lines);
  }, [text]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setIsDirty(true);
    const pos = e.target.selectionStart;
    const textBeforeCursor = e.target.value.substring(0, pos);
    const linesBeforeCursor = textBeforeCursor.split('\n');
    setColCount(linesBeforeCursor[linesBeforeCursor.length - 1].length + 1);
  };

  const handleSave = () => {
    const name = fileName || 'Новый документ.txt';
    const existing = fileSystem.find(n => n.name === name && n.type === 'file');
    if (existing) {
      const updated = fileSystem.map(n =>
        n.id === existing.id ? { ...n, content: text, modifiedAt: Date.now(), size: text.length } : n
      );
      onFileSystemChange(updated);
    } else {
      const newFile: FileSystemNode = {
        id: generateId(),
        name,
        type: 'file',
        extension: 'txt',
        parentId: 'documents',
        content: text,
        createdAt: Date.now(),
        modifiedAt: Date.now(),
        size: text.length,
      };
      onFileSystemChange(addNode(fileSystem, newFile));
    }
    setIsDirty(false);
    message.success(`Файл "${name}" сохранён`);
  };

  const handleNew = () => {
    if (isDirty) {
      if (!window.confirm('Сохранить изменения?')) {
        setText('');
        setFileName('');
        setIsDirty(false);
      }
    } else {
      setText('');
      setFileName('');
    }
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="notepad">
      <div className="notepad-toolbar">
        <Button size="small" onClick={handleNew}>Новый</Button>
        <Button size="small" type="primary" onClick={handleSave}>Сохранить</Button>
        <div className="toolbar-divider" />
        <Select size="small" value={fontFamily} onChange={setFontFamily} style={{ width: 130 }}>
          <Option value="monospace">Monospace</Option>
          <Option value="'Courier New'">Courier New</Option>
          <Option value="'Segoe UI'">Segoe UI</Option>
          <Option value="'Arial'">Arial</Option>
          <Option value="'Times New Roman'">Times New Roman</Option>
        </Select>
        <InputNumber
          size="small"
          min={8}
          max={48}
          value={fontSize}
          onChange={v => setFontSize(v || 14)}
          style={{ width: 60 }}
        />
        <div className="toolbar-divider" />
        <Button
          size="small"
          type={wordWrap ? 'primary' : 'default'}
          onClick={() => setWordWrap(!wordWrap)}
        >
          Перенос
        </Button>
        {isDirty && <span className="dirty-indicator">●</span>}
      </div>
      <div className="notepad-filename">
        <input
          value={fileName}
          onChange={e => setFileName(e.target.value)}
          placeholder="Имя файла (напр. document.txt)"
          className="filename-input"
        />
      </div>
      <textarea
        className="notepad-textarea"
        value={text}
        onChange={handleChange}
        style={{
          fontSize: `${fontSize}px`,
          fontFamily,
          whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
        }}
        onKeyDown={e => {
          if (e.key === 'Tab') {
            e.preventDefault();
            const start = e.currentTarget.selectionStart;
            const end = e.currentTarget.selectionEnd;
            const newText = text.substring(0, start) + '    ' + text.substring(end);
            setText(newText);
            setTimeout(() => {
              e.currentTarget.selectionStart = start + 4;
              e.currentTarget.selectionEnd = start + 4;
            }, 0);
          }
          if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            handleSave();
          }
        }}
      />
      <div className="notepad-statusbar">
        <span>Строк: {lineCount}</span>
        <span>Столбец: {colCount}</span>
        <span>Слов: {wordCount}</span>
        <span>Символов: {text.length}</span>
        <span>{wordWrap ? 'Перенос: Вкл' : 'Перенос: Выкл'}</span>
        <span>{fontFamily} {fontSize}px</span>
      </div>
    </div>
  );
};

export default Notepad;
