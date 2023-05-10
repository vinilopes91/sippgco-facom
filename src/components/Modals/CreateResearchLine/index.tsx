import BaseModal, { type BaseModalProps } from "@/components/Modals/BaseModal";
import { api } from "@/utils/api";
import { XCircleIcon } from "@heroicons/react/24/outline";

const CreateResearchLineModal = (props: Omit<BaseModalProps, "children">) => {
  const { mutateAsync, isLoading } = api.researchLine.create.useMutation();

  return (
    <BaseModal {...props}>
      <h3 className="text-lg font-bold">Adicionar linha de pesquisa</h3>
      <button
        className="btn-ghost btn-sm btn-circle btn absolute right-2 top-2"
        onClick={props.onClose}
      >
        <XCircleIcon />
      </button>

      <div>form...</div>

      <div className="modal-action">
        <button className="btn-primary btn-sm btn" onClick={props.onClose}>
          Adicionar
        </button>
      </div>
    </BaseModal>
  );
};

export default CreateResearchLineModal;
