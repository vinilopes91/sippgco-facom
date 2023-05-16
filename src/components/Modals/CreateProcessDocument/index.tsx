import {
  createDocumentSchema,
  type CreateDocumentSchema,
} from "@/common/validation/document";
import Input from "@/components/Input";
import Select from "@/components/Select";
import TextArea from "@/components/TextArea";
import BaseModal, { type BaseModalProps } from "@/components/Modals/BaseModal";
import { api } from "@/utils/api";
import { XCircleIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { modalityMapper, stepMapper, vacancyTypeMapper } from "@/utils/mapper";
import { Modality, Step, VacancyType } from "@prisma/client";

const CreateProcessDocumentModal = (
  props: Omit<BaseModalProps, "children" | "disableClickOutside">
) => {
  const { onClose, open } = props;
  const { register, handleSubmit, formState, reset } =
    useForm<CreateDocumentSchema>({
      resolver: zodResolver(createDocumentSchema),
      defaultValues: {
        required: false,
      },
    });

  const ctx = api.useContext();

  const { errors } = formState;

  const { mutateAsync, isLoading } = api.document.create.useMutation({
    onSuccess: () => {
      void ctx.document.list.invalidate();
      toast.success("Documento criado com sucesso!");
      reset();
      handleCloseModal();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Falha ao criar documento! Tente novamente mais tarde.");
      }
    },
  });

  const onSubmit = async (data: CreateDocumentSchema) => {
    return mutateAsync(data);
  };

  const handleCloseModal = () => {
    reset();
    onClose();
  };

  return (
    <BaseModal
      onClose={handleCloseModal}
      open={open}
      disableClickOutside
      smSize="sm:max-w-2xl"
    >
      <h3 className="text-lg font-bold">Adicionar novo documento</h3>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-2">
          <Input
            name="name"
            label="Nome"
            placeholder="Nome"
            register={register}
            error={errors.name}
            maxLength={40}
          />

          <Select
            name="step"
            label="Etapa"
            placeholder="Etapa"
            register={register}
            error={errors.step}
            required
          >
            {Object.keys(Step).map((step) => (
              <option key={step} value={step}>
                {stepMapper[step as keyof typeof Step]}
              </option>
            ))}
          </Select>

          <Select
            name="modality"
            label="Modalidade"
            register={register}
            multiple
            required
          >
            {Object.keys(Modality).map((modality) => (
              <option key={modality} value={modality}>
                {modalityMapper[modality as keyof typeof Modality]}
              </option>
            ))}
          </Select>

          <Select
            name="vacancyType"
            label="Tipo de vaga"
            register={register}
            multiple
            required
          >
            {Object.keys(VacancyType).map((vacancyType) => (
              <option key={vacancyType} value={vacancyType}>
                {vacancyTypeMapper[vacancyType as keyof typeof VacancyType]}
              </option>
            ))}
          </Select>

          <Input
            name="score"
            label="Pontuação por quantidade"
            placeholder="Pontuação por quantidade"
            register={register}
            error={errors.score}
            type="number"
            registerOptions={{
              setValueAs: (v: string) =>
                v === "" ? undefined : parseInt(v, 10),
            }}
            positiveIntegerInput
          />
          <Input
            name="maximumScore"
            label="Pontuação máxima"
            placeholder="Pontuação máxima"
            register={register}
            error={errors.maximumScore}
            type="number"
            registerOptions={{
              setValueAs: (v: string) =>
                v === "" ? undefined : parseInt(v, 10),
            }}
            positiveIntegerInput
          />
        </div>
        <div className="w-full">
          <TextArea
            name="description"
            label="Descrição"
            placeholder="Descrição"
            register={register}
            error={errors.description}
            maxLength={255}
          />
        </div>

        <div className="mt-4 flex items-center gap-2">
          <input
            className="checkbox"
            type="checkbox"
            id="required"
            {...register("required")}
          />
          <label htmlFor="required">Documento obrigatório</label>
        </div>

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

export default CreateProcessDocumentModal;
