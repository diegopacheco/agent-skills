import { createFileRoute } from "@tanstack/react-router";
import { DocPage, parseView } from "../features/catalog/components/DocPage";
import { skill } from "../features/catalog/source";

export const Route = createFileRoute("/rules")({
  validateSearch: parseView,
  component: RulesPage,
});

function RulesPage() {
  const view = Route.useSearch().view ?? "rendered";
  return <DocPage stack={skill} view={view} from="/rules" />;
}
