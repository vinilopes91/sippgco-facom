import { useRef } from "react";
import clsx from "clsx";
import { useOnClickOutside } from "usehooks-ts";

export type BaseModalProps = {
  children: React.ReactNode;
  open: boolean;
  disableClickOutside?: boolean;
  onClose(): void;
};

const Modal = ({
  children,
  open,
  disableClickOutside,
  onClose,
}: BaseModalProps) => {
  const ref = useRef(null);

  useOnClickOutside(ref, () => {
    if (!disableClickOutside && open) {
      onClose();
    }
  });

  return (
    <div
      className={clsx({
        "modal modal-bottom sm:modal-middle": true,
        "modal-open": open,
      })}
    >
      <div className="modal-box" ref={ref}>
        {children}
      </div>
    </div>
  );
};

export default Modal;
