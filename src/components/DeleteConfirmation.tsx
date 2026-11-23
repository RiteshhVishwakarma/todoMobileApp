import { Trash2 } from 'lucide-react-native';

import { ConfirmDialog } from './ConfirmDialog';

type Props = {
  visible: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

/** Destructive confirmation (delete task, clear data, …). */
export function DeleteConfirmation({
  visible,
  title = 'Delete task?',
  message = "This can't be undone.",
  confirmLabel = 'Delete',
  onCancel,
  onConfirm,
}: Props) {
  return (
    <ConfirmDialog
      visible={visible}
      icon={Trash2}
      tone="danger"
      title={title}
      message={message}
      onDismiss={onCancel}
      actions={[
        { label: 'Cancel', onPress: onCancel },
        { label: confirmLabel, onPress: onConfirm, variant: 'danger' },
      ]}
    />
  );
}
