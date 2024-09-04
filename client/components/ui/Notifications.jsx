import { useMantineTheme } from '@mantine/core';
import { useState, useEffect } from 'react';
import { Popover, Indicator, Table } from '@mantine/core';
import { IconBell } from '@tabler/icons-react';
import { useRouteContext } from '/:core.jsx';

export function Notifications() {
  const theme = useMantineTheme();
  const { state, snapshot, actions } = useRouteContext();
  const [opened, setOpened] = useState(false);
  const disabled = snapshot.notifications.length === 0;

  useEffect(() => {
    async function fetchNotifications() {
      await actions.getNotifications(state);
    }
    fetchNotifications();
  }, []);

  return (
    <Popover opened={opened} onChange={setOpened}>
      <Popover.Target>
        <Indicator
          color="red"
          label={snapshot.notifications.length}
          position="bottom-end"
          radius="xl"
          size="lg"
          disabled={disabled}
          withBorder
        >
          <IconBell
            size={32}
            color={theme.colors.gray[5]}
            onClick={() => setOpened((o) => !o)}
          />
        </Indicator>
      </Popover.Target>
      <Popover.Dropdown>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>System</Table.Th>
              <Table.Th>Produced</Table.Th>
              <Table.Th>Consumed</Table.Th>
              <Table.Th>Remaining</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {snapshot.notifications.map((notification) => (
              <Table.Tr key={notification.system_id}>
                <Table.Td>{notification.system_id}</Table.Td>
                <Table.Td>{notification.total_produced_energy}</Table.Td>
                <Table.Td>{notification.total_consumed_energy}</Table.Td>
                <Table.Td>{notification.remaining_energy}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Popover.Dropdown>
    </Popover>
  );
}
