import { isValidPeriod } from "@/utils/application";
import { type Process, type Application } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export const validateApplicationPeriodRequest = (
  application: (Application & { process: Process }) | null
) => {
  if (!application) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Inscrição não encontrada",
    });
  }

  const { applicationStartDate, applicationEndDate } = application.process;

  const isValidDate = isValidPeriod({
    applicationStartDate,
    applicationEndDate,
  });

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
