import {
  type Application,
  type ProcessDocument,
  type Document,
  type UserDocumentApplication,
} from "@prisma/client";
import { TRPCError } from "@trpc/server";

type Arguments = {
  application:
    | (Application & { UserDocumentApplication: UserDocumentApplication[] })
    | null;
  userDocuments: (ProcessDocument & { document: Document })[];
};

export const validateStepRequiredDocuments = ({
  userDocuments,
  application,
}: Arguments) => {
  const requiredProcessStepDocuments = userDocuments.filter(
    (processDocument) => processDocument.document.required
  );

  const hasRequiredDocuments = requiredProcessStepDocuments.every(
    (requiredDocument) =>
      !!application?.UserDocumentApplication.find(
        (userUploadedDocument) =>
          userUploadedDocument.documentId === requiredDocument.documentId
      )
  );

  if (!hasRequiredDocuments) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Não foram enviados todos os documentos obrigatórios",
    });
  }
};
