"use client";

import { useParams } from "next/navigation";
import CreateExamPage from "../../create/page";

export default function EditExamPage() {
  const params = useParams();
  const examId = params.id as string;
  
  return <CreateExamPage examId={examId} />;
}
