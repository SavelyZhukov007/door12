import React, { useState, useRef, useEffect } from 'react';
import { AppProps } from '../../../types';
import { getChildren, getNodeById, generateId, addNode } from '../../../store/fileSystem';
import { FileSystemNode } from '../../../types';
import './Terminal.css';

interface TerminalLine {
  type: 'input' | 'output' | 'error';
  text: string;
}

const Terminal: React.FC<AppProps> = ({ fileSystem, onFileSystemChange }) => {
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'output', text: 'Door 12 Terminal [Version 1.0.0]' },
    { type: 'output', text: 'Введите "help" для списка команд.' },
    { type: 'output', text: '' },
  ]);
  const [input, setInput] = useState('');
  const [cwd, setCwd] = useState('root');
  const [history, setHistory] = useState<string[]>([]);
  const [histIndex, setHistIndex] = useState(-1);
  const termRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    termRef.current?.scrollTo(0, termRef.current.scrollHeight);
  }, [lines]);

  const getPrompt = () => {
    const node = getNodeById(fileSystem, cwd);
    let path = '';
    let cur = node;
    const parts: string[] = [];
    while (cur) {
      parts.unshift(cur.name);
      cur = cur.parentId ? getNodeById(fileSystem, cur.parentId) : undefined;
    }
    path = parts.join('\\');
    return `${path}>`;
  };

  const print = (text: string, type: 'output' | 'error' = 'output') => {
    setLines(prev => [...prev, { type, text }]);
  };

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    setLines(prev => [...prev, { type: 'input', text: `${getPrompt()} ${trimmed}` }]);
    if (!trimmed) return;

    const parts = trimmed.split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (command) {
      case 'help':
        print('Доступные команды:');
        print('  dir           - список файлов в текущей папке');
        print('  cd <папка>    - сменить директорию');
        print('  cd ..         - перейти вверх');
        print('  mkdir <имя>   - создать папку');
        print('  echo <текст>  - вывести текст');
        print('  cls / clear   - очистить экран');
        print('  type <файл>   - показать содержимое файла');
        print('  del <файл>    - удалить файл');
        print('  date          - текущая дата');
        print('  ver           - версия системы');
        break;
      case 'dir':
      case 'ls': {
        const children = getChildren(fileSystem, cwd);
        if (children.length === 0) { print('Папка пуста.'); break; }
        print('Содержимое папки:');
        print('');
        children.forEach(c => {
          const flag = c.type === 'folder' ? '<DIR>' : '     ';
          const date = new Date(c.modifiedAt).toLocaleDateString('ru-RU');
          print(`  ${date}  ${flag}  ${c.name}`);
        });
        print('');
        break;
      }
      case 'cd': {
        if (!args[0]) { print(getPrompt()); break; }
        if (args[0] === '..') {
          const cur = getNodeById(fileSystem, cwd);
          if (cur?.parentId) setCwd(cur.parentId);
          else print('Уже в корне.', 'error');
          break;
        }
        const target = getChildren(fileSystem, cwd).find(n => n.name.toLowerCase() === args[0].toLowerCase() && n.type === 'folder');
        if (target) setCwd(target.id);
        else print(`Папка не найдена: ${args[0]}`, 'error');
        break;
      }
      case 'mkdir': {
        if (!args[0]) { print('Укажите имя папки.', 'error'); break; }
        const newNode: FileSystemNode = {
          id: generateId(),
          name: args[0],
          type: 'folder',
          parentId: cwd,
          createdAt: Date.now(),
          modifiedAt: Date.now(),
          children: [],
        };
        onFileSystemChange(addNode(fileSystem, newNode));
        print(`Папка создана: ${args[0]}`);
        break;
      }
      case 'echo':
        print(args.join(' '));
        break;
      case 'cls':
      case 'clear':
        setLines([]);
        break;
      case 'type':
      case 'cat': {
        if (!args[0]) { print('Укажите имя файла.', 'error'); break; }
        const file = getChildren(fileSystem, cwd).find(n => n.name.toLowerCase() === args[0].toLowerCase() && n.type === 'file');
        if (!file) { print(`Файл не найден: ${args[0]}`, 'error'); break; }
        print(file.content || '(пусто)');
        break;
      }
      case 'del':
      case 'rm': {
        if (!args[0]) { print('Укажите имя файла.', 'error'); break; }
        const target = getChildren(fileSystem, cwd).find(n => n.name.toLowerCase() === args[0].toLowerCase());
        if (!target) { print(`Не найдено: ${args[0]}`, 'error'); break; }
        onFileSystemChange(fileSystem.filter(n => n.id !== target.id));
        print(`Удалено: ${args[0]}`);
        break;
      }
      case 'date':
        print(new Date().toLocaleString('ru-RU'));
        break;
      case 'ver':
        print('Door 12 [Version 1.0.0.0]');
        break;
      default:
        print(`"${command}" не является внутренней командой.`, 'error');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(input);
      setHistory(prev => input.trim() ? [input, ...prev.slice(0, 49)] : prev);
      setHistIndex(-1);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newIdx = Math.min(histIndex + 1, history.length - 1);
      setHistIndex(newIdx);
      setInput(history[newIdx] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newIdx = Math.max(histIndex - 1, -1);
      setHistIndex(newIdx);
      setInput(newIdx === -1 ? '' : history[newIdx]);
    }
  };

  return (
    <div className="terminal" onClick={() => inputRef.current?.focus()}>
      <div className="terminal-body" ref={termRef}>
        {lines.map((line, i) => (
          <div key={i} className={`terminal-line ${line.type}`}>{line.text}</div>
        ))}
        <div className="terminal-input-row">
          <span className="terminal-prompt">{getPrompt()}&nbsp;</span>
          <input
            ref={inputRef}
            className="terminal-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
};

export default Terminal;
