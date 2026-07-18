"use client";
export const dynamic = "force-dynamic";
import AnnouncementInbox from "@/features/announcements/AnnouncementInbox";

export default function ParentAnnouncementsPage() {
  return <AnnouncementInbox roleLabel="Announcements" />;
}
