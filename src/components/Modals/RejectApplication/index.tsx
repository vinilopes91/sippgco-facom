import ControlledInput from "@/components/ControlledInput";
import BaseModal, { type BaseModalProps } from "@/components/Modals/BaseModal";
import { api } from "@/utils/api";
import { handleTRPCError } from "@/utils/errors";
import { XCircleIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useState } from "react";
import { toast } from "react-hot-toast";

const RejectApplication = (
  props: Omit<BaseModalProps, "children" | "disableClickOutside"> & {
    applicationId: string;
    applicantName: string;
  }
) => {
  const { onClose, open, applicationId, applicantName } = props;

  const [reasonForRejection, setReasonForRejection] = useState("");

  const ctx = api.useContext();

  const { mutate, isLoading } = api.application.review.useMutation({
    onSuccess: () => {
      void ctx.application.get.invalidate({
        applicationId,
      });
      toast.success("Inscrição rejeitada");
      handleCloseModal();
    },
    onError: (e) => {
      handleTRPCError(
        e,
        "Falha ao rejeitar inscrição! Tente novamente mais tarde."
      );
    },
  });

  const handleClickConfirmButton = () => {
    if (reasonForRejection.trim().length === 0) {
      toast.error("Por favor, insira um motivo para rejeitar a inscrição");
      return;
    }
    mutate({
      id: applicationId,
      status: "REJECTED",
      reasonForRejection,
    });
  };

  const handleCloseModal = () => {
    onClose();
  };

  return (
    <BaseModal onClose={handleCloseModal} open={open} disableClickOutside>
      <h3 className="text-3xl font-bold">Rejeitar candidatura</h3>
      <button
        className="btn-ghost btn-sm btn-circle btn absolute right-2 top-2"
        onClick={handleCloseModal}
      >
        <XCircleIcon />
      </button>

      <p className="mb-2 mt-3 text-lg">
        Tem certeza que deseja rejeitar a candidatura do candidato{" "}
        <span className="font-bold text-primary-400">{applicantName}</span>?
      </p>

      <ControlledInput
        name="reasonForRejection"
        label="Motivo para rejeição"
        placeholder="Insira o motivo para rejeitar a inscrição"
        value={reasonForRejection}
        onChange={(e) => setReasonForRejection(e.target.value)}
        required
      />

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

export default RejectApplication;
