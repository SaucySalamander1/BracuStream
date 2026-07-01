import NewCourseForm from "@/components/admin/NewCourseForm";

export default function NewCoursePage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Add New Course</h1>
        <p className="text-neutral-500 text-sm">
          Create a BRACU course or an external course
        </p>
      </div>
      <NewCourseForm />
    </div>
  );
}