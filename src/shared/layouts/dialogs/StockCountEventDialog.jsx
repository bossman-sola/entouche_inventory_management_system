import { ClipboardList } from "lucide-react";
import DialogShell from "./DialogShell";
import { DialogButton } from "./primitives";

const StockCountEventDialog = ({
  isOpen,
  onClose,
  title,
  description,
  timeAgo,
  stockCountId,
  onViewFull,
}) => {
  if (!isOpen) return null;

  return (
    <DialogShell
      isOpen={isOpen}
      onClose={onClose}
      icon={ClipboardList}
      iconBg="bg-indigo-100"
      iconFg="text-indigo-600"
      titleColor="text-indigo-600"
      title={title}
      subtitle={timeAgo}
      maxWidth="max-w-[520px]"
      footerLeft={<DialogButton onClick={onClose}>Close</DialogButton>}
      footerRight={
        stockCountId && (
          <DialogButton variant="primary" onClick={onViewFull}>
            View Stock Count
          </DialogButton>
        )
      }
    >
      <p className="text-[13.5px] text-gray-600 leading-relaxed">
        {description}
      </p>
    </DialogShell>
  );
};

export default StockCountEventDialog;