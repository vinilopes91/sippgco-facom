import { type RouterOutputs } from "@/utils/api";

type ResearchLineTableProps = {
  data: RouterOutputs["researchLine"]["list"];
  handleClickResearchLineRow: (
    _event: React.MouseEvent<unknown>,
    id: string
  ) => void;
  handleSelectAllResearchLineClick: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  researchLinesSelected: string[];
};

const ResearchLineTable = ({
  data,
  researchLinesSelected,
  handleClickResearchLineRow,
  handleSelectAllResearchLineClick,
}: ResearchLineTableProps) => {
  const isSelected = (id: string) => researchLinesSelected.indexOf(id) !== -1;

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
                    data.length > 0 &&
                    researchLinesSelected.length === data.length
                  }
                  onChange={handleSelectAllResearchLineClick}
                />
              </label>
            )}
          </th>
          <th>Nome</th>
          <th className="w-10/12">Tutores</th>
        </tr>
      </thead>
      <tbody>
        {data.length === 0 && (
          <tr>
            <td className="text-center font-medium" colSpan={3}>
              Nenhuma linha de pesquisa cadastrada
            </td>
          </tr>
        )}
        {data.map((researchLine) => (
          <tr
            key={researchLine.id}
            onClick={(event) =>
              handleClickResearchLineRow(event, researchLine.id)
            }
          >
            <td>
              <label>
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={isSelected(researchLine.id)}
                />
              </label>
            </td>
            <td>{researchLine.name}</td>
            <td>
              {researchLine.TutorResearchLine.map((tutor) => tutor.name).join(
                ", "
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ResearchLineTable;
