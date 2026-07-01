import NewModuleForm from "@/components/admin/NewModuleForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function NewModulePage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Add New Module</h1>
        <p className="text-neutral-500 text-sm">
          Create a week/module for this course — group videos, slides, notes, assignments and more
        </p>
      </div>
      <NewModuleForm courseId={id} />
    </div>
  );
}