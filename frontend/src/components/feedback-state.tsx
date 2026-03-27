import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

type FeedbackStateProps = {
  isLoading?: boolean;
  error?: string | null;
  success?: string | null;
};

export default function FeedbackState({
  isLoading = false,
  error = null,
  success = null
}: FeedbackStateProps) {
  if (isLoading) {
    return (
      <div className="grid gap-3">
        <Skeleton className="h-24 w-full rounded-3xl" />
        <Skeleton className="h-14 w-full rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Xatolik</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (success) {
    return (
      <Alert variant="success">
        <AlertTitle>Muvaffaqiyatli</AlertTitle>
        <AlertDescription>{success}</AlertDescription>
      </Alert>
    );
  }

  return null;
}
