import { type AppRouter } from "@/server/api/root";
import { type TRPCClientError } from "@trpc/client";
import { toast } from "react-hot-toast";

export const isTRPCError = (
  error: unknown
): error is TRPCClientError<AppRouter> => {
  return (error as TRPCClientError<AppRouter>).data?.zodError !== undefined;
};

export const handleTRPCError = (
  error: unknown,
  defaultMessage = "Ocorreu um erro inesperado, tente novamente mais tarde!"
) => {
  if (isTRPCError(error)) {
    const fieldErrors = error.data?.zodError?.fieldErrors;
    if (fieldErrors && Object.keys(fieldErrors).length > 0) {
      const key = Object.keys(fieldErrors)[0];
      const errorMessage = fieldErrors[key as string];
      errorMessage && errorMessage[0] && toast.error(errorMessage[0]);
    } else {
      toast.error(defaultMessage);
    }
    return;
  }
  if (error instanceof Error) {
    toast.error(defaultMessage);
  }
};

// TODO: adicionar handler em todas as chamadas
