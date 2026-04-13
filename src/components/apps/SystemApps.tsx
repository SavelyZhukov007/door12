import React from 'react';
import { AppProps } from '../../types';
import { Button, Card, Col, Progress, Row, Space, Table, Typography, List } from 'antd';

const SystemMonitorApp: React.FC<AppProps> = ({ extraProps }) => {
  const systemInfo = extraProps?.systemInfo ?? {}; 
  return (
    <div style={{ padding: 16 }}>
      <Typography.Title level={4}>Системный монитор</Typography.Title>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="Загрузка CPU">
            <Progress percent={Math.round(systemInfo.cpuUsage ?? 0)} status="active" />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Использование памяти">
            <Progress percent={Math.round(systemInfo.memoryUsage ?? 0)} status="active" />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Процессы">
            <Typography.Title level={2} style={{ margin: 0 }}>
              {systemInfo.processCount ?? 0}
            </Typography.Title>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="USB устройства">
            <Typography.Title level={2} style={{ margin: 0 }}>
              {systemInfo.usbCount ?? 0}
            </Typography.Title>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

const ResourceMonitorApp: React.FC<AppProps> = ({ extraProps }) => {
  const processes = extraProps?.processes ?? [];
  const columns = [
    { title: 'PID', dataIndex: 'pid', key: 'pid', width: 80 },
    { title: 'Имя', dataIndex: 'name', key: 'name', render: (text: string, record: any) => <Space><span>{record.icon}</span>{text}</Space> },
    { title: 'CPU %', dataIndex: 'cpu', key: 'cpu', width: 90 },
    { title: 'RAM MB', dataIndex: 'memory', key: 'memory', width: 100 },
    { title: 'Состояние', dataIndex: 'status', key: 'status' },
  ];

  return (
    <div style={{ padding: 16 }}>
      <Typography.Title level={4}>Монитор ресурсов</Typography.Title>
      <Typography.Text type="secondary">Динамическое распределение загрузки памяти и CPU.</Typography.Text>
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

const CameraApp: React.FC<AppProps> = ({ extraProps }) => {
  const onOpenApp = extraProps?.onOpenApp as ((appId: string) => void) | undefined;

  return (
    <div style={{ padding: 16 }}>
      <Typography.Title level={4}>Камера</Typography.Title>
      <Typography.Paragraph>
        Виртуальная камера. Здесь может быть отображён поток с устройства.
      </Typography.Paragraph>
      <Card style={{ textAlign: 'center', minHeight: 240 }}>
        <Typography.Text type="secondary">Нет активного потока.</Typography.Text>
      </Card>
      <Space style={{ marginTop: 16 }}>
        <Button onClick={() => onOpenApp?.('settings')}>Открыть параметры</Button>
      </Space>
    </div>
  );
};

const UsbManagerApp: React.FC<AppProps> = ({ extraProps }) => {
  const usbDevices = extraProps?.usbDevices ?? [];
  const onEjectUsb = extraProps?.onEjectUsb as ((id: string) => void) | undefined;
  const onMountUsb = extraProps?.onMountUsb as (() => void) | undefined;

  return (
    <div style={{ padding: 16 }}>
      <Typography.Title level={4}>USB Менеджер</Typography.Title>
      <Typography.Paragraph>
        Управление подключёнными виртуальными USB-устройствами.
      </Typography.Paragraph>
      <Button type="primary" onClick={onMountUsb} disabled={usbDevices.length > 0}>
        Подключить USB
      </Button>
      <List
        style={{ marginTop: 16 }}
        bordered
        dataSource={usbDevices}
        locale={{ emptyText: 'Нет подключенных USB-устройств.' }}
        renderItem={(item: any) => (
          <List.Item actions={[
            <Button key="eject" danger size="small" onClick={() => onEjectUsb?.(item.id)}>
              Извлечь
            </Button>,
          ]}>
            <List.Item.Meta
              title={item.name}
              description={item.label}
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export { SystemMonitorApp, ResourceMonitorApp, CameraApp, UsbManagerApp };
