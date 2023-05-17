import BaseModal, { type BaseModalProps } from "@/components/Modals/BaseModal";
import { api } from "@/utils/api";
import { XCircleIcon } from "@heroicons/react/24/outline";
import { type Process } from "@prisma/client";
import clsx from "clsx";
import { toast } from "react-hot-toast";

const DeleteProcessModal = (
  props: Omit<BaseModalProps, "children" | "disableClickOutside"> & {
    process?: Process;
  }
) => {
  const { onClose, open, process } = props;

  const ctx = api.useContext();

  const { mutateAsync, isLoading } = api.process.delete.useMutation({
    onSuccess: () => {
      void ctx.process.list.invalidate();
      toast.success("Processo removido com sucesso!");
      handleCloseModal();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Falha ao deletar processo! Tente novamente mais tarde.");
      }
    },
  });

  const handleClickDeleteButton = async () => {
    return (
      process?.id &&
      mutateAsync({
        id: process.id,
      })
    );
  };

  const handleCloseModal = () => {
    onClose();
  };

  return (
    <BaseModal onClose={handleCloseModal} open={open} disableClickOutside>
      <h3 className="text-3xl font-bold">Remover processo</h3>
      <button
        className="btn-ghost btn-sm btn-circle btn absolute right-2 top-2"
        onClick={handleCloseModal}
      >
        <XCircleIcon />
      </button>

      <p className="mt-3 text-lg">
        Tem certeza que deseja remover o processo de nome
        <br />
        <span className="font-bold text-primary-400">{process?.name}</span>?
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

export default DeleteProcessModal;
