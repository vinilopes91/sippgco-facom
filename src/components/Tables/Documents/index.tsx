import { type RouterOutputs } from "@/utils/api";
import { stepMapper } from "@/utils/mapper";
import { getModalities, getVacancyTypes } from "./utils";

type DocumentsTableProps = {
  data: RouterOutputs["document"]["list"];
  handleClickDocumentRow: (
    _event: React.MouseEvent<unknown>,
    id: string
  ) => void;
  handleSelectAllDocumentsClick: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  documentsSelected: string[];
  errorMessage?: string;
};

const DocumentsTable = ({
  data,
  documentsSelected,
  handleClickDocumentRow,
  handleSelectAllDocumentsClick,
  errorMessage,
}: DocumentsTableProps) => {
  const isSelected = (id: string) => documentsSelected.indexOf(id) !== -1;

  return (
    <table className="table w-full">
      <thead>
        <tr>
          <th>
            {data.length !== 0 && (
              <label>
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={
                    data.length > 0 && documentsSelected.length === data.length
                  }
                  onChange={handleSelectAllDocumentsClick}
                />
              </label>
            )}
          </th>
          <th>Nome</th>
          <th>Etapa</th>
          <th>Modalidade</th>
          <th>Tipo de vaga</th>
          <th>Obrigatoriedade</th>
          <th>Pontuação por quantidade</th>
          <th>Pontuação máxima</th>
        </tr>
      </thead>
      <tbody>
        {data.length === 0 && (
          <tr>
            <td className="text-center font-medium" colSpan={8}>
              Nenhum documento cadastrado
            </td>
          </tr>
        )}
        {data.map((document) => (
          <tr
            key={document.id}
            onClick={(event) => handleClickDocumentRow(event, document.id)}
          >
            <td>
              <label>
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={isSelected(document.id)}
                />
              </label>
            </td>
            <td>{document.name}</td>
            <td>{stepMapper[document.step]}</td>
            <td>{getModalities(document)}</td>
            <td>{getVacancyTypes(document)}</td>
            <td>{document.required ? "Sim" : "Não"}</td>
            <td>{document.score || "-"}</td>
            <td>{document.maximumScore || "-"}</td>
          </tr>
        ))}
      </tbody>
      {errorMessage && (
        <tfoot>
          <tr>
            <td colSpan={8} className="text-red-500">
              Selecione ao menos um documento
            </td>
          </tr>
        </tfoot>
      )}
    </table>
  );
};

export default DocumentsTable;
