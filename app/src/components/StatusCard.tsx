import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/tokens';

interface BarProps {
  label: string;
  value: number; // 0-100
  suffix?: string;
}

function UsageBar({ label, value, suffix }: BarProps) {
  const barColor =
    value > 90 ? colors.error : value > 70 ? colors.warning : colors.success;

  return (
    <View style={barStyles.container}>
      <View style={barStyles.labelRow}>
        <Text style={barStyles.label}>{label}</Text>
        <Text style={barStyles.label}>
          {value.toFixed(1)}%{suffix ? ` ${suffix}` : ''}
        </Text>
      </View>
      <View style={barStyles.track}>
        <View
          style={[
            barStyles.fill,
            { width: `${Math.min(value, 100)}%`, backgroundColor: barColor },
          ]}
        />
      </View>
    </View>
  );
}

const barStyles = StyleSheet.create({
  container: {
    gap: 4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  track: {
    height: 6,
    backgroundColor: colors.bgHover,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: 6,
    borderRadius: 3,
  },
});

function formatBytes(bytes: number): string {
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

interface StatusCardProps {
  status: {
    version: string;
    uptime: number;
    cpu: { model: string; usage: number; cores: number; temperature: number | null };
    memory: { total: number; used: number; usage: number };
    disk: { total: number; used: number; usage: number };
    network: { ip: string; hostname: string };
    ai: { connected_clients: number };
  };
}

export default function StatusCard({ status }: StatusCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>System Status</Text>
        <Text style={styles.subtitle}>
          v{status.version} | up {formatUptime(status.uptime)}
        </Text>
      </View>

      <UsageBar label="CPU" value={status.cpu.usage} />
      <UsageBar
        label={`RAM (${formatBytes(status.memory.used)} / ${formatBytes(status.memory.total)})`}
        value={status.memory.usage}
      />
      <UsageBar
        label={`Disk (${formatBytes(status.disk.used)} / ${formatBytes(status.disk.total)})`}
        value={status.disk.usage}
      />

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>
          {status.network.hostname} ({status.network.ip})
        </Text>
        <Text style={styles.footerText}>
          {status.ai.connected_clients} client{status.ai.connected_clients !== 1 ? 's' : ''}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgSurface,
    borderRadius: 12,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 12,
  },
});
