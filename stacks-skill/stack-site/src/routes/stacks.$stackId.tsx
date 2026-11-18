import { createFileRoute, notFound } from "@tanstack/react-router";
import { DocPage, parseView } from "../features/catalog/components/DocPage";
import { findStack } from "../features/catalog/source";

export const Route = createFileRoute("/stacks/$stackId")({
  validateSearch: parseView,
  loader: ({ params }) => {
    const stack = findStack(params.stackId);
    if (!stack) throw notFound();
    return stack;
  },
  component: StackPage,
});

function StackPage() {
  const stack = Route.useLoaderData();
  const view = Route.useSearch().view ?? "rendered";
  return <DocPage stack={stack} view={view} from="/stacks/$stackId" />;
}
