import { createFileRoute } from "@tanstack/react-router";
import { CampaignWorkspace } from "./studio.c.$id";

export const Route = createFileRoute("/studio/c/$id/")({
  component: CampaignWorkspace,
});