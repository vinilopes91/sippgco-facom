import { prisma } from "@/server/db";
import { type NextApiRequest, type NextApiResponse } from "next";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const applications = await prisma.application.updateMany({
    where: {
      active: true,
      applicationFilled: false,
      process: {
        applicationEndDate: {
          lt: new Date(),
        },
      },
    },
    data: {
      applicationFilled: true,
      status: "REJECTED",
      reasonForRejection:
        "Inscrição não foi preenchida dentro do prazo estipulado pelo processo",
    },
  });

  response.status(200).json({
    job: "Indeferir inscrições não preenchidas dentro do prazo",
    total: applications.count,
  });
}
