import BaseModal, { type BaseModalProps } from "@/components/Modals/BaseModal";
import { type RouterOutputs, api } from "@/utils/api";
import { handleTRPCError } from "@/utils/errors";
import { XCircleIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { toast } from "react-hot-toast";

const DeleteApplicationModal = (
  props: Omit<BaseModalProps, "children" | "disableClickOutside"> & {
    application?: RouterOutputs["application"]["listUserApplications"][number];
  }
) => {
  const { onClose, open, application } = props;

  const ctx = api.useContext();

  const { mutate, isLoading } = api.application.delete.useMutation({
    onSuccess: () => {
      void ctx.application.listUserApplications.invalidate();
      toast.success("Inscrição removida");
      handleCloseModal();
    },
    onError: (e) => {
      handleTRPCError(
        e,
        "Falha ao remover inscrição! Tente novamente mais tarde."
      );
    },
  });

  const handleClickDeleteButton = () => {
    return (
      application?.id &&
      mutate({
        applicationId: application.id,
      })
    );
  };

  const handleCloseModal = () => {
    onClose();
  };

  return (
    <BaseModal onClose={handleCloseModal} open={open} disableClickOutside>
      <h3 className="text-3xl font-bold">Remover inscrição</h3>
      <button
        className="btn-ghost btn-sm btn-circle btn absolute right-2 top-2"
        onClick={handleCloseModal}
      >
        <XCircleIcon />
      </button>

      <p className="mt-3 text-lg">
        Tem certeza que deseja remover sua inscrição no processo{" "}
        <span className="font-medium">{application?.process.name}?</span>
      </p>

      <div className="modal-action">
        <button
          className={clsx("btn-primary btn", isLoading && "loading")}
          disabled={isLoading}
          onClick={handleClickDeleteButton}
        >
          Remover
        </button>
      </div>
    </BaseModal>
  );
};

export default DeleteApplicationModal;
