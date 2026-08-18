import { listKanbanBoard, listClientOptions } from "@/lib/data";
import { PageHeader } from "@/components/PageHeaderContext";
import KanbanBoard from "@/components/KanbanBoard";
import AddVideosButton from "@/components/AddVideosButton";

export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  const [columns, clientOptions] = await Promise.all([listKanbanBoard(), listClientOptions()]);

  return (
    <div>
      <PageHeader title="Video Production Pipeline" subtitle="Post-production board across all active clients" />
      <KanbanBoard columns={columns}>
        <AddVideosButton clientOptions={clientOptions} />
      </KanbanBoard>
    </div>
  );
}
