/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { api, type RouterOutputs } from "@/utils/api";
import { TrashIcon } from "@heroicons/react/24/outline";
import { type Document } from "@prisma/client";
import FileInput from "../FileInput";
import clsx from "clsx";
import { useRef, useState } from "react";
import { toast } from "react-hot-toast";

const StepFileInput = ({
  document,
  documentId,
  applicationData,
}: {
  document: Document;
  documentId: string;
  applicationData: RouterOutputs["application"]["getUserApplication"];
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const userDocument = applicationData.UserDocumentApplication.find(
    (userDocument) => userDocument.documentId === documentId
  );

  const isUploaded = !!userDocument?.id;

  const ctx = api.useContext();

  const { mutateAsync: createPreSignedUrl } =
    api.userDocument.createPresignedPdfUrl.useMutation();
  const { mutateAsync: createUserDocumentApplication } =
    api.userDocument.create.useMutation();
  const { mutateAsync: updateUserDocumentApplication } =
    api.userDocument.update.useMutation();
  const { data, isLoading } =
    api.userDocument.getUserDocumentPreSignedUrl.useQuery(
      {
        id: userDocument?.id as string,
      },
      {
        enabled: isUploaded,
      }
    );
  const { mutateAsync: deleteFile, isLoading: isDeleting } =
    api.userDocument.delete.useMutation({
      onSuccess: () => {
        void ctx.userDocument.invalidate();
      },
    });

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

    if (isUploaded) {
      await updateUserDocumentApplication({
        id: userDocument.id,
        key,
      });
      await ctx.application.invalidate();
      if (fileInputRef.current) fileInputRef.current.value = "";
    } else {
      await createUserDocumentApplication({
        step: document.step,
        applicationId: applicationData.id,
        documentId,
        key,
      });
      await ctx.application.invalidate();
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
    setIsUploading(false);
  };

  const handleClickDeleteButton = async (id: string) => {
    await deleteFile({ id });
    await ctx.application.invalidate();
  };

  return (
    <div className="loading flex flex-col gap-2" key={documentId}>
      <FileInput
        label={document.name}
        accept="application/pdf"
        disabled={isUploaded || isUploading}
        onChange={onFileChange}
        ref={fileInputRef}
      />
      {isUploaded && (
        <>
          {isLoading ? (
            <div className="h-6 w-full animate-pulse" />
          ) : (
            <div className="flex w-full items-center gap-4">
              <a
                className="link"
                download={`${document.name}.pdf`}
                href={data}
              >{`${document.name}.pdf`}</a>
              <button
                type="button"
                onClick={() => handleClickDeleteButton(userDocument.id)}
                disabled={isDeleting}
                className={clsx(
                  "btn-ghost btn h-auto min-h-0 p-0",
                  isDeleting && "loading"
                )}
              >
                <TrashIcon title="Remover" width={20} stroke="red" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StepFileInput;
