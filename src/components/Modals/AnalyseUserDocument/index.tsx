import {
  type AnalyseUserDocumentSchema,
  analyseUserDocumentSchema,
} from "@/common/validation/userDocumentApplication";
import Input from "@/components/Input";
import BaseModal, { type BaseModalProps } from "@/components/Modals/BaseModal";
import Select from "@/components/Select";
import { api } from "@/utils/api";
import { handleTRPCError } from "@/utils/errors";
import { analysisStatusMapper } from "@/utils/mapper";
import { XCircleIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AnalysisStatus,
  type Document,
  type UserDocumentApplication,
} from "@prisma/client";
import clsx from "clsx";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

const AnalyseUserDocument = (
  props: Omit<BaseModalProps, "children" | "disableClickOutside"> & {
    userDocument: UserDocumentApplication & { document: Document };
  }
) => {
  const { onClose, open, userDocument } = props;

  const { register, handleSubmit, formState, reset, watch, setValue } =
    useForm<AnalyseUserDocumentSchema>({
      resolver: zodResolver(analyseUserDocumentSchema),
    });
  const ctx = api.useContext();

  const analysisStatusWatcher = watch("status");
  const { errors } = formState;

  const { mutate, isLoading } =
    api.userDocument.analyseUserDocument.useMutation({
      onSuccess: () => {
        void ctx.application.get.invalidate({
          applicationId: userDocument.applicationId,
        });
        toast.success("Analise registrada");
        handleCloseModal();
      },
      onError: (e) => {
        handleTRPCError(
          e,
          "Falha ao analisar documento! Tente novamente mais tarde."
        );
      },
    });

  useEffect(() => {
    setValue("id", userDocument.id);
  }, [setValue, userDocument.id]);

  const handleCloseModal = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: AnalyseUserDocumentSchema) => {
    return mutate(data);
  };

  return (
    <BaseModal onClose={handleCloseModal} open={open} disableClickOutside>
      <h3 className="text-3xl font-bold">Análise de documento</h3>
      <button
        className="btn-ghost btn-sm btn-circle btn absolute right-2 top-2"
        onClick={handleCloseModal}
      >
        <XCircleIcon />
      </button>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-4 flex w-full flex-col justify-center"
      >
        <p className="mb-1 text-lg">
          Documento em análise: {userDocument.document.name}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-2">
          <Select
            name="status"
            label="Resultado da análise"
            placeholder="Resultado da análise"
            register={register}
            error={errors.status}
            required
          >
            <option value="">Selecione</option>
            {Object.keys(AnalysisStatus).map((status) => (
              <option key={status} value={status}>
                {analysisStatusMapper[status as keyof typeof AnalysisStatus]}
              </option>
            ))}
          </Select>
          {analysisStatusWatcher === "REJECTED" && (
            <Input
              name="reasonForRejection"
              label="Motivo"
              placeholder="Motivo"
              register={register}
              error={errors.reasonForRejection}
              maxLength={40}
              required={analysisStatusWatcher === "REJECTED"}
            />
          )}
        </div>

        <div className="modal-action">
          <button
            className={clsx("btn-primary btn", isLoading && "loading")}
            disabled={isLoading}
            type="submit"
          >
            Confirmar
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default AnalyseUserDocument;
