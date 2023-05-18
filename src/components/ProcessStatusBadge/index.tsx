import { type ProcessStatus } from "@prisma/client";
import clsx from "clsx";

type ProcessStatusBadgeProps = {
  status: keyof typeof ProcessStatus;
};

const ProcessStatusBadge = ({ status }: ProcessStatusBadgeProps) => {
  const processStatusMapper = {
    DRAFT: "Rascunho",
    ACTIVE: "Ativo",
    FINISHED: "Finalizado",
  };
  const processBadgeClasses = (status: ProcessStatusBadgeProps["status"]) =>
    clsx("rounded-full px-2 py-1", {
      badge: status === "DRAFT",
      "badge-info badge": status === "ACTIVE",
      "badge-success badge text-white": status === "FINISHED",
    });
  return (
    <span className={processBadgeClasses(status)}>
      {processStatusMapper[status]}
    </span>
  );
};

export default ProcessStatusBadge;
