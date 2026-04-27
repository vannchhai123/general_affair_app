import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Officer } from '@/lib/schemas';

type OfficersDeleteDialogProps = {
  officer: Officer | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function OfficersDeleteDialog({
  officer,
  onOpenChange,
  onConfirm,
}: OfficersDeleteDialogProps) {
  return (
    <AlertDialog open={!!officer} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>លុបមន្ត្រី</AlertDialogTitle>
          <AlertDialogDescription>
            តើអ្នកពិតជាចង់លុប{' '}
            <strong>
              {officer?.first_name} {officer?.last_name}
            </strong>
            មែនទេ?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>បោះបង់</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>លុប</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
