import type { ChangeEventHandler, ReactNode } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

type FileUploadButtonProps = {
  label: string;
  accept: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  disabled?: boolean;
  icon?: ReactNode;
};

export default function FileUploadButton({
  label,
  accept,
  onChange,
  disabled = false,
  icon
}: FileUploadButtonProps) {
  return (
    <label className="inline-flex">
      <input className="sr-only" type="file" accept={accept} onChange={onChange} disabled={disabled} />
      <Button asChild variant="default" size="lg">
        <span>
          {icon ?? <Upload className="size-4" />}
          {label}
        </span>
      </Button>
    </label>
  );
}
