/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { api, type RouterOutputs } from "@/utils/api";
import { type Document } from "@prisma/client";
import FileInput from "../FileInput";
import { useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { handleTRPCError } from "@/utils/errors";

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
  const { data: preSignedUrl, isLoading } =
    api.userDocument.getUserDocumentPreSignedUrl.useQuery(
      {
        id: userDocument?.id as string,
      },
      {
        enabled: isUploaded,
      }
    );

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

  return (
    <div className="loading flex flex-col gap-2" key={documentId}>
      <FileInput
        showRequiredMessage={document.required}
        label={document.name}
        accept="application/pdf"
        disabled={isUploading}
        onChange={onFileChange}
        required={!isUploaded && document.required}
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
                download={`${userDocument.filename}`}
                href={preSignedUrl}
              >{`${userDocument.filename}`}</a>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StepFileInput;
