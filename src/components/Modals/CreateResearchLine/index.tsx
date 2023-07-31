import {
  createResearchLineSchema,
  type CreateResearchLineSchema,
} from "@/common/validation/researchLine";
import ControlledInput from "@/components/ControlledInput";
import Input from "@/components/Input";
import BaseModal, { type BaseModalProps } from "@/components/Modals/BaseModal";
import { api } from "@/utils/api";
import { handleTRPCError } from "@/utils/errors";
import { PlusIcon, XCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

const CreateResearchLineModal = (
  props: Omit<BaseModalProps, "children" | "disableClickOutside">
) => {
  const { onClose, open } = props;

  const [tutorName, setTutorName] = useState("");
  const [tutorList, setTutorList] = useState<{ name: string; id: string }[]>(
    []
  );

  const { register, handleSubmit, formState, reset, setValue, clearErrors } =
    useForm<CreateResearchLineSchema>({
      resolver: zodResolver(createResearchLineSchema),
      defaultValues: {
        name: "",
        tutors: [],
      },
    });

  const handleTutorInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTutorName(e.target.value);
  };

  const handleAddTutor = () => {
    if (tutorName === "") return;
    const newTutor = { name: tutorName, id: crypto.randomUUID() };
    const updatedTutorList = [...tutorList, newTutor];
    setTutorList(updatedTutorList);
    setValue(
      "tutors",
      updatedTutorList.map((tutor) => tutor.name) as [string, ...string[]]
    );
    clearErrors("tutors");
    setTutorName("");
  };

  const handleRemoveTutor = (tutorId: string) => {
    const updatedTutorList = [...tutorList];
    const index = updatedTutorList.findIndex((tutor) => tutor.id === tutorId);
    if (index > -1) {
      updatedTutorList.splice(index, 1);
    }
    setTutorList(updatedTutorList);
    if (updatedTutorList.length === 0) {
      setValue("tutors", [] as unknown as [string, ...string[]]);
    } else {
      setValue(
        "tutors",
        updatedTutorList.map((tutor) => tutor.name) as [string, ...string[]]
      );
    }
  };

  const ctx = api.useContext();

  const { errors } = formState;

  const { mutate, isLoading } = api.researchLine.create.useMutation({
    onSuccess: () => {
      void ctx.researchLine.list.invalidate();
      toast.success("Linha de pesquisa criada com sucesso!");
      setTutorList([]);
      setTutorName("");
      reset();
      handleCloseModal();
    },
    onError: (e) => {
      handleTRPCError(
        e,
        "Falha ao criar linha de pesquisa! Tente novamente mais tarde."
      );
    },
  });

  const onSubmit = (data: CreateResearchLineSchema) => {
    return mutate(data);
  };

  const handleCloseModal = () => {
    reset();
    setTutorList([]);
    setTutorName("");
    onClose();
  };

  return (
    <BaseModal onClose={handleCloseModal} open={open} disableClickOutside>
      <h3 className="text-lg font-bold">Adicionar linha de pesquisa</h3>
      <button
        className="btn-ghost btn-sm btn-circle btn absolute right-2 top-2"
        onClick={handleCloseModal}
      >
        <XCircleIcon />
      </button>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-4 flex w-full flex-col justify-center"
      >
        <div className="flex flex-col space-y-2">
          <Input
            name="name"
            label="Nome"
            placeholder="Nome da linha de pesquisa"
            register={register}
            error={errors.name}
            maxLength={30}
          />
          <div className="flex w-full items-end gap-1">
            <ControlledInput
              name="tutor"
              label="Nome do Docente"
              placeholder="Docente"
              value={tutorName}
              onChange={handleTutorInput}
              errorMessage={errors.tutors?.message}
              maxLength={45}
            />
            <button
              type="button"
              className={clsx(
                "btn-ghost btn",
                errors.tutors?.message && "mb-6"
              )}
              onClick={handleAddTutor}
            >
              <PlusIcon width={30} />
            </button>
          </div>
        </div>

        <p className="mt-4 font-medium">Docentes:</p>
        {tutorList.length === 0 && <p>Nenhum docente adicionado</p>}

        {tutorList.map((tutor) => (
          <div key={tutor.id} className="flex items-center gap-1">
            <span>&#x2713; {tutor.name}</span>
            <button
              type="button"
              className="btn-ghost rounded-md"
              onClick={() => handleRemoveTutor(tutor.id)}
            >
              <XMarkIcon width={20} stroke="red" />
            </button>
          </div>
        ))}

        <div className="modal-action">
          <button
            type="submit"
            className={clsx("btn-primary btn", isLoading && "loading")}
            disabled={isLoading}
          >
            Adicionar
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default CreateResearchLineModal;
