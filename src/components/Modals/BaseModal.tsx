import { useRef } from "react";
import clsx from "clsx";
import { useOnClickOutside } from "usehooks-ts";

export type BaseModalProps = {
  children: React.ReactNode;
  open: boolean;
  disableClickOutside?: boolean;
  onClose(): void;
  smSize?:
    | "sm:max-w-sm"
    | "sm:max-w-md"
    | "sm:max-w-lg"
    | "sm:max-w-xl"
    | "sm:max-w-2xl"
    | "sm:max-w-3xl"
    | "sm:max-w-4xl"
    | "sm:max-w-5xl"
    | "sm:max-w-6xl"
    | "sm:max-w-7xl";
};

const Modal = ({
  children,
  open,
  disableClickOutside,
  onClose,
  smSize,
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
      <div className={clsx("modal-box", smSize && smSize)} ref={ref}>
        {children}
      </div>
    </div>
  );
};

export default Modal;
