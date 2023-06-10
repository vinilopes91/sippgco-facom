import { prisma } from "@/server/db";
import { NextResponse } from "next/server";

export default async function handler() {
  try {
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

    return new NextResponse(
      JSON.stringify({
        job: "Indeferir inscrições não preenchidas dentro do prazo",
        total: applications.count,
      }),
      {
        status: 200,
      }
    );
  } catch (error) {
    return new NextResponse(JSON.stringify(error), {
      status: 400,
    });
  }
}
