import { redirect } from "next/navigation";
import { TEAM_MEMBERS } from "@/lib/business";

export default function TeamIndexPage() {
  redirect(`/team/${TEAM_MEMBERS[0].toLowerCase()}`);
}
