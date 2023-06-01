import { type RouterOutputs, api } from "@/utils/api";

const FileLink = ({
  userDocument,
}: {
  userDocument: RouterOutputs["application"]["get"]["UserDocumentApplication"][number];
}) => {
  const { data: preSignedUrl, isLoading } =
    api.userDocument.getUserDocumentPreSignedUrl.useQuery({
      id: userDocument.id,
      userId: userDocument.userId,
    });

  return isLoading ? (
    <div className="h-6 w-80 animate-pulse bg-slate-300" />
  ) : (
    <div className="flex items-center gap-1">
      <span className="font-medium">{userDocument.document.name}:</span>
      <a
        className="link"
        download={`${userDocument.filename}`}
        href={preSignedUrl}
      >{`${userDocument.filename}`}</a>
    </div>
  );
};

export default FileLink;
