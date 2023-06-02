import BaseModal, { type BaseModalProps } from "@/components/Modals/BaseModal";
import { api } from "@/utils/api";
import { handleTRPCError } from "@/utils/errors";
import { XCircleIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { toast } from "react-hot-toast";

const AcceptApplication = (
  props: Omit<BaseModalProps, "children" | "disableClickOutside"> & {
    applicationId: string;
    applicantName: string;
  }
) => {
  const { onClose, open, applicationId, applicantName } = props;

  const ctx = api.useContext();

  const { mutate, isLoading } = api.application.review.useMutation({
    onSuccess: () => {
      void ctx.application.get.invalidate({
        applicationId,
      });
      toast.success("Inscrição deferida");
      handleCloseModal();
    },
    onError: (e) => {
      handleTRPCError(
        e,
        "Falha ao deferir inscrição! Tente novamente mais tarde."
      );
    },
  });

  const handleClickConfirmButton = () => {
    mutate({
      id: applicationId,
      status: "APPROVED",
    });
  };

  const handleCloseModal = () => {
    onClose();
  };

  return (
    <BaseModal onClose={handleCloseModal} open={open} disableClickOutside>
      <h3 className="text-3xl font-bold">Deferir candidatura</h3>
      <button
        className="btn-ghost btn-sm btn-circle btn absolute right-2 top-2"
        onClick={handleCloseModal}
      >
        <XCircleIcon />
      </button>

      <p className="mt-3 text-lg">
        Tem certeza que deseja deferir a candidatura do candidato{" "}
        <span className="font-bold text-primary-400">{applicantName}</span>?
      </p>

      <div className="modal-action">
        <button
          className={clsx("btn-primary btn", isLoading && "loading")}
          disabled={isLoading}
          onClick={handleClickConfirmButton}
        >
          Confirmar
        </button>
      </div>
    </BaseModal>
  );
};

export default AcceptApplication;
