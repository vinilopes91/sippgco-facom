import { type Process, type Application } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { isAfter, isBefore } from "date-fns";

export const validateApplicationRequest = (
  application: (Application & { process: Process }) | null
) => {
  if (!application) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Não existe inscrição com esse id",
    });
  }

  const { applicationStartDate, applicationEndDate } = application.process;

  const isValidDate =
    isBefore(new Date(), new Date(applicationEndDate)) &&
    isAfter(new Date(), new Date(applicationStartDate));

  if (!isValidDate) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Período de inscrição encerrado",
    });
  }
  if (application.process.status !== "ACTIVE") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Processo seletivo não está ativo",
    });
  }
};
