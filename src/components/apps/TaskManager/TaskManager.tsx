import React from 'react';
import { Table, Button, Typography, Space, Tag } from 'antd';
import { AppProps } from '../../../types';

const TaskManager: React.FC<AppProps> = ({ extraProps }) => {
  const processes = extraProps?.processes ?? [];
  const onKillProcess = extraProps?.onKillProcess as ((id: string) => void) | undefined;
  const onSuspendProcess = extraProps?.onSuspendProcess as ((id: string) => void) | undefined;
  const onResumeProcess = extraProps?.onResumeProcess as ((id: string) => void) | undefined;
  const onSetPriority = extraProps?.onSetPriority as ((id: string, priority: 'Low' | 'Normal' | 'High') => void) | undefined;

  const columns = [
    {
      title: 'PID',
      dataIndex: 'pid',
      key: 'pid',
      width: 80,
    },
    {
      title: 'Имя',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <Space>
          <span>{record.icon}</span>
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Состояние',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color: 'success' | 'warning' | 'default' = status === 'Running' ? 'success' : status === 'Suspended' ? 'warning' : 'default';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'CPU %',
      dataIndex: 'cpu',
      key: 'cpu',
      width: 90,
    },
    {
      title: 'RAM MB',
      dataIndex: 'memory',
      key: 'memory',
      width: 100,
    },
    {
      title: 'Приоритет',
      dataIndex: 'priority',
      key: 'priority',
      width: 110,
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 240,
      render: (_: any, record: any) => (
        <Space>
          <Button size="small" onClick={() => onKillProcess?.(record.id)} danger>
            Завершить
          </Button>
          {record.status === 'Running' ? (
            <Button size="small" onClick={() => onSuspendProcess?.(record.id)}>
              Приостановить
            </Button>
          ) : (
            <Button size="small" onClick={() => onResumeProcess?.(record.id)}>
              Возобновить
            </Button>
          )}
          <Button
            size="small"
            onClick={() => onSetPriority?.(record.id, record.priority === 'High' ? 'Normal' : 'High')}
          >
            {record.priority === 'High' ? 'Снизить' : 'Увеличить'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      <Typography.Title level={4}>Диспетчер задач</Typography.Title>
      <Typography.Text type="secondary">
        Просмотр активных процессов и управление ресурсами.
      </Typography.Text>
      <Table
        style={{ marginTop: 16 }}
        dataSource={processes}
        columns={columns}
        rowKey="id"
        pagination={false}
        size="small"
      />
    </div>
  );
};

export default TaskManager;
