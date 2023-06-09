import { prisma } from "../src/server/db";
import bcrypt from "bcrypt";
import { env } from "@/env.mjs";
import { type Prisma } from "@prisma/client";

const researchLines: Prisma.ResearchLineCreateInput[] = [
  {
    name: "Engenharia de Software",
    TutorResearchLine: {
      createMany: {
        data: [
          { name: "Marcos Vinicius" },
          {
            name: "Jullia Maria",
          },
          {
            name: "Maria Julia",
          },
          {
            name: "Endrick Gabriel",
          },
          {
            name: "Arthur Vinicius",
          },
        ],
      },
    },
  },
  {
    name: "Ciência de Dados",
    TutorResearchLine: {
      createMany: {
        data: [
          { name: "Juliana Cardoso" },
          { name: "José Souza" },
          { name: "Amanda Alves" },
          { name: "Leonardo Martins" },
          { name: "Bruna Barbosa" },
          { name: "Paulo Silva" },
          { name: "Giovanna Nunes" },
          { name: "Rodrigo Pereira" },
          { name: "Larissa Ferreira" },
        ],
      },
    },
  },
  {
    name: "Inteligência Arficial",
    TutorResearchLine: {
      createMany: {
        data: [
          { name: "Marcelo Pereira" },
          { name: "Sofia Costa" },
          { name: "Gabriel Carvalho" },
          { name: "Laura Rodrigues" },
          { name: "Carlos Gomes" },
          { name: "Beatriz Barbosa" },
          { name: "Matheus Lima" },
        ],
      },
    },
  },
  {
    name: "Sistemas de Computação",
    TutorResearchLine: {
      createMany: {
        data: [
          { name: "Luana Castro" },
          { name: "André Rocha" },
          { name: "Camila Fernandes" },
          { name: "Rafael Santos" },
          { name: "Letícia Ribeiro" },
          { name: "Thiago Ferreira" },
          { name: "Fernanda Costa" },
          { name: "Eduardo Oliveira" },
        ],
      },
    },
  },
];

const documents: Prisma.DocumentCreateInput[] = [
  {
    name: "CPF",
    description: "Foto do documento de CPF",
    modality: "MASTER,DOCTORATE",
    required: true,
    step: "PERSONAL_DATA",
    vacancyType:
      "BROAD_COMPETITION,RACIAL_QUOTA,DEFICIENT_QUOTA,HUMANITARIAN_POLICES",
  },
  {
    name: "Documento de identidade",
    description: "Foto frente e verso do documento de identidade",
    modality: "MASTER,DOCTORATE",
    required: true,
    step: "PERSONAL_DATA",
    vacancyType:
      "BROAD_COMPETITION,RACIAL_QUOTA,DEFICIENT_QUOTA,HUMANITARIAN_POLICES",
  },
  {
    name: "Comprovante de quitação eleitoral",
    description: "Comprovante atualizado de quitação eleitoral",
    modality: "MASTER,DOCTORATE",
    required: true,
    step: "PERSONAL_DATA",
    vacancyType:
      "BROAD_COMPETITION,RACIAL_QUOTA,DEFICIENT_QUOTA,HUMANITARIAN_POLICES",
  },
  {
    name: "Registr Civil",
    description: "Certidão de nascimento ou casamento",
    modality: "MASTER,DOCTORATE",
    required: true,
    step: "PERSONAL_DATA",
    vacancyType:
      "BROAD_COMPETITION,RACIAL_QUOTA,DEFICIENT_QUOTA,HUMANITARIAN_POLICES",
  },
  {
    name: "Certificado de reservista",
    description: "Foto do certificado de reservista",
    modality: "MASTER,DOCTORATE",
    required: false,
    step: "PERSONAL_DATA",
    vacancyType:
      "BROAD_COMPETITION,RACIAL_QUOTA,DEFICIENT_QUOTA,HUMANITARIAN_POLICES",
  },
  {
    name: "Passaporte",
    description: "Foto do passaporte caso não naturalizado",
    modality: "MASTER,DOCTORATE",
    required: false,
    step: "PERSONAL_DATA",
    vacancyType:
      "BROAD_COMPETITION,RACIAL_QUOTA,DEFICIENT_QUOTA,HUMANITARIAN_POLICES",
  },
  {
    name: "RANI",
    description:
      "Cópia do Registro Administravo de Nascimento e Óbito de Índios (RANI) ou declaração de pertencimento emida pelo grupo indígena assinada por liderança específica do grupo indígena",
    modality: "MASTER,DOCTORATE",
    required: false,
    step: "REGISTRATION_DATA",
    vacancyType: "RACIAL_QUOTA",
  },
  {
    name: "Auto declaração",
    description:
      "Autodeclaração pela Comissão de Heteroidenficação da UFU seguindo as “DIRETRIZES OPERACIONAIS PARA CANDIDATOS PPI (PRETOS, PARDOS E INDÍGENAS) AOS PROGRAMAS DE PÓS-GRADUAÇÃO STRICTO SENSU DA UFU.” Da Diretoria de Estudos e Pesquisas Afrorraciais (DEPAFRO), Comissão de Heteroidenfificação",
    modality: "MASTER,DOCTORATE",
    required: true,
    step: "REGISTRATION_DATA",
    vacancyType: "RACIAL_QUOTA",
  },
  {
    name: "Atestado da condição caracterísca",
    description:
      "Atestado da condição caracterísca, emido por médico ou junta médica",
    modality: "MASTER,DOCTORATE",
    required: true,
    step: "REGISTRATION_DATA",
    vacancyType: "DEFICIENT_QUOTA",
  },
  {
    name: "POSCOMP",
    description: "Bolem de Desempenho do exame POSCOMP (qualquer edição)",
    modality: "MASTER,DOCTORATE",
    required: false,
    step: "ACADEMIC_DATA",
    vacancyType:
      "BROAD_COMPETITION,RACIAL_QUOTA,DEFICIENT_QUOTA,HUMANITARIAN_POLICES",
  },
  {
    name: "Histórico Escolar completo da graduação",
    description: "Histórico escolar completo da graduação com assinatura",
    modality: "MASTER,DOCTORATE",
    required: true,
    step: "ACADEMIC_DATA",
    vacancyType:
      "BROAD_COMPETITION,RACIAL_QUOTA,DEFICIENT_QUOTA,HUMANITARIAN_POLICES",
  },
  {
    name: "Diploma de Graduação",
    description: "Diploma de Graduação frente e verso",
    modality: "MASTER,DOCTORATE",
    required: true,
    step: "ACADEMIC_DATA",
    vacancyType:
      "BROAD_COMPETITION,RACIAL_QUOTA,DEFICIENT_QUOTA,HUMANITARIAN_POLICES",
  },
  {
    name: "Cerficado de Proficiência em língua portuguesa",
    description:
      "Cerficado de Proficiência em língua portuguesa, se estrangeiro ou não naturalizado, não lusófono",
    modality: "MASTER,DOCTORATE",
    required: false,
    step: "ACADEMIC_DATA",
    vacancyType:
      "BROAD_COMPETITION,RACIAL_QUOTA,DEFICIENT_QUOTA,HUMANITARIAN_POLICES",
  },
  {
    name: "Diploma de Mestrado Stricto Sensu (frente e verso) ou declaração de conclusão do curso de Mestrado.",
    description:
      "A declaração, emida pela respecva coordenação de Pós-graduação, deve informar que a defesa se deu, ou dar-se-á, até o dia anterior à data designada para matrícula no PPGCO. A data de expedição da declaração deve ser de no máximo 24 meses anteriores à data de inscrição.",
    modality: "DOCTORATE",
    required: true,
    step: "ACADEMIC_DATA",
    vacancyType:
      "BROAD_COMPETITION,RACIAL_QUOTA,DEFICIENT_QUOTA,HUMANITARIAN_POLICES",
  },
  {
    name: "Histórico Escolar completo de Curso de Mestrado concluído",
    description:
      "Histórico Escolar completo de Curso de Mestrado concluído com assinatura",
    modality: "DOCTORATE",
    required: true,
    step: "ACADEMIC_DATA",
    vacancyType:
      "BROAD_COMPETITION,RACIAL_QUOTA,DEFICIENT_QUOTA,HUMANITARIAN_POLICES",
  },
  {
    name: "Carta de referência",
    description:
      "Uma carta de referência preenchida pelo orientador de Mestrado do candidato, salvo em caso de impossibilidade do mesmo, devidamente comprovada.",
    modality: "DOCTORATE",
    required: true,
    step: "ACADEMIC_DATA",
    vacancyType:
      "BROAD_COMPETITION,RACIAL_QUOTA,DEFICIENT_QUOTA,HUMANITARIAN_POLICES",
  },
  {
    name: "Monitoria em curso de Graduação",
    description: "10 pontos por semestre letivo",
    modality: "MASTER",
    required: false,
    step: "CURRICULUM",
    vacancyType:
      "BROAD_COMPETITION,RACIAL_QUOTA,DEFICIENT_QUOTA,HUMANITARIAN_POLICES",
    score: 10,
    maximumScore: 10,
  },
  {
    name: "Iniciação cienfica concluída (com ou sem bolsa)",
    description: "50 pontos por iniciação",
    modality: "MASTER",
    required: false,
    step: "CURRICULUM",
    vacancyType:
      "BROAD_COMPETITION,RACIAL_QUOTA,DEFICIENT_QUOTA,HUMANITARIAN_POLICES",
    score: 50,
    maximumScore: 50,
  },
  {
    name: "Parcipação no PET (Programa de Educação Tutorial)",
    description: "10 pontos por semestre letivo",
    modality: "MASTER",
    required: false,
    step: "CURRICULUM",
    vacancyType:
      "BROAD_COMPETITION,RACIAL_QUOTA,DEFICIENT_QUOTA,HUMANITARIAN_POLICES",
    score: 10,
    maximumScore: 10,
  },
  {
    name: "Experiência Profissional (Industrial) em nível superior, na área de informática",
    description:
      "10 pontos para cada seis meses completos. A pontuação total deste item está limitada a 20 pontos",
    modality: "MASTER",
    required: false,
    step: "CURRICULUM",
    vacancyType:
      "BROAD_COMPETITION,RACIAL_QUOTA,DEFICIENT_QUOTA,HUMANITARIAN_POLICES",
    score: 10,
    maximumScore: 20,
  },
  {
    name: "Publicação em evento qualificado na categoria 1",
    description: "Publicação em evento qualificado na categoria 1",
    modality: "DOCTORATE",
    required: false,
    step: "CURRICULUM",
    vacancyType:
      "BROAD_COMPETITION,RACIAL_QUOTA,DEFICIENT_QUOTA,HUMANITARIAN_POLICES",
    score: 70,
    maximumScore: 70,
  },
  {
    name: "Publicação em evento qualificado na categoria 2",
    description: "Publicação em evento qualificado na categoria 2",
    modality: "DOCTORATE",
    required: false,
    step: "CURRICULUM",
    vacancyType:
      "BROAD_COMPETITION,RACIAL_QUOTA,DEFICIENT_QUOTA,HUMANITARIAN_POLICES",
    score: 30,
    maximumScore: 30,
  },
  {
    name: "Publicação em periódico qualificado na categoria 1",
    description: "Publicação em periódico qualificado na categoria 1",
    modality: "DOCTORATE",
    required: false,
    step: "CURRICULUM",
    vacancyType:
      "BROAD_COMPETITION,RACIAL_QUOTA,DEFICIENT_QUOTA,HUMANITARIAN_POLICES",
    score: 100,
    maximumScore: 100,
  },
];

async function main() {
  const hashedPassword = await bcrypt.hash(env.ADMIN_SECRET, 10);

  await prisma.user.upsert({
    where: {
      email: "secretario@email.com",
    },
    update: {},
    create: {
      name: "Secretario",
      email: "secretario@email.com",
      password: hashedPassword,
      username: "secretario",
      role: "ADMIN",
    },
  });

  Promise.all(researchLines.map((n) => prisma.researchLine.create({ data: n })))
    .then(() => console.info("[SEED] Succussfully create researchLines"))
    .catch((e) => console.error("[SEED] Failed to create researchLines", e));

  Promise.all(documents.map((n) => prisma.document.create({ data: n })))
    .then(() => console.info("[SEED] Succussfully create documents"))
    .catch((e) => console.error("[SEED] Failed to create documents", e));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
