/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { api, type RouterOutputs } from "@/utils/api";
import { AnalysisStatus, type Document } from "@prisma/client";
import FileInput from "../FileInput";
import { useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { handleTRPCError } from "@/utils/errors";
import ControlledInput from "../ControlledInput";
import { NumberFormatBase } from "react-number-format";
import clsx from "clsx";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  PlusCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { isValidPeriod } from "@/utils/application";
import { documentAnalysisStatusMapper } from "@/utils/mapper";

const CurriculumFileInput = ({
  document,
  documentId,
  applicationData,
}: {
  document: Document;
  documentId: string;
  applicationData: RouterOutputs["application"]["getUserApplication"];
}) => {
  const userDocument = applicationData.UserDocumentApplication.find(
    (userDocument) => userDocument.documentId === documentId
  );

  const [isUploading, setIsUploading] = useState(false);
  const [quantity, setQuantity] = useState(userDocument?.quantity);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isUploaded = !!userDocument?.id;

  const ctx = api.useContext();

  const { mutateAsync: createPreSignedUrl } =
    api.userDocument.createPresignedPdfUrl.useMutation();
  const { mutate: deleteUserDocument, isLoading: isDeleting } =
    api.userDocument.delete.useMutation({
      onSuccess: () => {
        void ctx.application.getUserApplication.invalidate({
          applicationId: applicationData.id,
        });
        setQuantity(undefined);
      },
      onError: (e) => {
        handleTRPCError(
          e,
          "Falha ao deletar documento! Tente novamente mais tarde."
        );
      },
    });
  const { mutateAsync: createUserDocumentApplication } =
    api.userDocument.create.useMutation();
  const {
    mutateAsync: updateUserDocumentApplication,
    isLoading: isUpdatingUserDocument,
  } = api.userDocument.update.useMutation();
  const { data, isLoading } =
    api.userDocument.getUserDocumentPreSignedUrl.useQuery(
      {
        id: userDocument?.id as string,
      },
      {
        enabled: isUploaded,
      }
    );

  const isValidApplicationPeriod = isValidPeriod({
    applicationStartDate: applicationData.process.applicationStartDate,
    applicationEndDate: applicationData.process.applicationEndDate,
  });

  const handleClickSaveButton = async () => {
    if (!userDocument?.id) return;
    try {
      await updateUserDocumentApplication({
        id: userDocument.id,
        quantity: quantity && !isNaN(quantity) ? quantity : undefined,
      });
      toast.success("Documento atualizado");
    } catch (error) {
      toast.error("Erro ao atualizar documento");
    }
    await ctx.application.getUserApplication.invalidate({
      applicationId: applicationData.id,
    });
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length === 0) {
      return;
    }

    if (e.target.files && e.target.files[0]?.type !== "application/pdf") {
      toast.error("O arquivo deve ser um PDF");
      return;
    }

    const data = {
      "Content-Type": e.target.files![0]!.type,
      file: e.target.files![0]!,
    };
    const formData = new FormData();
    for (const name in data) {
      formData.append(name, data[name as keyof typeof data]);
    }

    const { key, uploadUrl } = await createPreSignedUrl();

    setIsUploading(true);
    try {
      await fetch(uploadUrl, {
        method: "PUT",
        body: formData,
      });
    } catch (error) {
      setIsUploading(false);
      toast.error("Erro ao enviar arquivo");
      return;
    }

    try {
      if (isUploaded) {
        await updateUserDocumentApplication({
          id: userDocument.id,
          key,
          filename: e.target.files![0]!.name,
          quantity: quantity && !isNaN(quantity) ? quantity : undefined,
        });
        await ctx.application.getUserApplication.invalidate({
          applicationId: applicationData.id,
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        await createUserDocumentApplication({
          step: document.step,
          applicationId: applicationData.id,
          documentId,
          key,
          filename: e.target.files![0]!.name,
          quantity: quantity && !isNaN(quantity) ? quantity : undefined,
        });
        await ctx.application.getUserApplication.invalidate({
          applicationId: applicationData.id,
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch (error) {
      handleTRPCError(error);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
    setIsUploading(false);
  };

  const getScore = () => {
    if (quantity && document.score && document.maximumScore) {
      return document.maximumScore < quantity * document.score
        ? document.maximumScore
        : quantity * document.score;
    }
    return 0;
  };

  const handleClickDeleteButton = async () => {
    if (!userDocument?.id) return;
    deleteUserDocument({
      id: userDocument.id,
    });
    await ctx.application.getUserApplication.invalidate({
      applicationId: applicationData.id,
    });
  };

  const getDocumentStatusIcon = (status?: AnalysisStatus) => {
    if (!status) {
      return (
        <ExclamationCircleIcon
          width={20}
          className="stroke-warning"
          title="Pendente"
        />
      );
    }
    const statusIcon = {
      [AnalysisStatus.APPROVED]: (
        <CheckCircleIcon
          width={20}
          className="stroke-success"
          title="Aprovado"
        />
      ),
      [AnalysisStatus.REJECTED]: (
        <PlusCircleIcon
          width={20}
          className="rotate-45 stroke-error"
          title="Rejeitado"
        />
      ),
    };
    return statusIcon[status];
  };

  const disableSaveButton =
    isUpdatingUserDocument || !quantity || !userDocument?.key;

  return (
    <div className="flex flex-col gap-2" key={documentId}>
      <div className="grid grid-cols-4 items-end gap-2">
        <FileInput
          showRequiredMessage={document.required}
          label={document.name}
          accept="application/pdf"
          disabled={!isValidApplicationPeriod || isUploading}
          onChange={onFileChange}
          required={!isUploaded && document.required}
          ref={fileInputRef}
        />
        <NumberFormatBase
          name={document.name}
          label={`Quantidade X ${document.score!}`}
          placeholder={`Quantidade X ${document.score!}`}
          onValueChange={(values) => {
            setQuantity(parseInt(values.value));
          }}
          customInput={ControlledInput}
          value={quantity || ""}
          disabled={!isValidApplicationPeriod}
        />
        <ControlledInput
          name="documentScore"
          label={`Pontuação possível (Máx: ${document.maximumScore!})`}
          placeholder="Pontuação possível"
          disabled
          readOnly
          value={getScore()}
        />
        <button
          className={clsx(
            "btn-primary btn",
            isUpdatingUserDocument && "loading"
          )}
          disabled={!isValidApplicationPeriod || disableSaveButton}
          onClick={handleClickSaveButton}
        >
          Salvar
        </button>
      </div>
      {document.description && (
        <p>
          <span className="font-medium">Descrição</span>: {document.description}
        </p>
      )}
      {isUploaded && (
        <>
          {isLoading ? (
            <div className="h-6 w-full animate-pulse" />
          ) : (
            <div className="flex w-full flex-col">
              <div>
                <a
                  className="link w-fit"
                  download={`${userDocument.filename}`}
                  href={data}
                >
                  {`${userDocument.filename}`}
                </a>
                {userDocument.key && (
                  <button
                    className={clsx(
                      "btn-ghost btn h-auto min-h-fit p-1",
                      isDeleting && "loading",
                      !isValidApplicationPeriod && "btn-disabled",
                      "ml-2"
                    )}
                    disabled={!isValidApplicationPeriod || isDeleting}
                    onClick={handleClickDeleteButton}
                  >
                    <TrashIcon
                      width={20}
                      className={clsx(
                        isValidApplicationPeriod
                          ? "stroke-error"
                          : "stroke-gray-600"
                      )}
                    />
                  </button>
                )}
              </div>
              {userDocument.status && (
                <div className="flex items-center gap-1">
                  {getDocumentStatusIcon(userDocument.status)}
                  <p className="text-sm">
                    {documentAnalysisStatusMapper[userDocument.status]}.{" "}
                    {userDocument.reasonForRejection &&
                      `Motivo: ${userDocument.reasonForRejection}`}
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CurriculumFileInput;
