/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { api, type RouterOutputs } from "@/utils/api";
import { type Document } from "@prisma/client";
import FileInput from "../FileInput";
import { useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { handleTRPCError } from "@/utils/errors";
import ControlledInput from "../ControlledInput";
import { NumberFormatBase } from "react-number-format";
import clsx from "clsx";
import { TrashIcon } from "@heroicons/react/24/outline";

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
        void ctx.application.invalidate();
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

  const handleClickSaveButton = async () => {
    if (!userDocument?.id) return;
    await updateUserDocumentApplication({
      id: userDocument.id,
      quantity: quantity && !isNaN(quantity) ? quantity : undefined,
    });
    await ctx.application.invalidate();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length === 0) {
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
        await ctx.application.invalidate();
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
        await ctx.application.invalidate();
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
    await ctx.application.invalidate();
  };

  const disableSaveButton =
    isUpdatingUserDocument ||
    !quantity ||
    !userDocument?.key ||
    userDocument?.quantity === quantity;

  return (
    <div className="flex flex-col gap-2" key={documentId}>
      <div className="grid grid-cols-4 items-end gap-2">
        <FileInput
          showRequiredMessage={document.required}
          label={`${document.name} (Máx: ${document.maximumScore!})`}
          accept="application/pdf"
          disabled={isUploading}
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
        />
        <ControlledInput
          name="documentScore"
          label="Pontuação possível"
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
          disabled={disableSaveButton}
          onClick={handleClickSaveButton}
        >
          Salvar
        </button>
      </div>
      {isUploaded && (
        <>
          {isLoading ? (
            <div className="h-6 w-full animate-pulse" />
          ) : (
            <div className="flex w-full items-center gap-4">
              <a
                className="link"
                download={`${userDocument.filename}`}
                href={data}
              >{`${userDocument.filename}`}</a>
              {userDocument.key && (
                <button
                  className={clsx(
                    "btn-ghost btn h-auto min-h-fit p-1",
                    isDeleting && "loading"
                  )}
                  disabled={isDeleting}
                  onClick={handleClickDeleteButton}
                >
                  <TrashIcon width={20} stroke="red" />
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CurriculumFileInput;