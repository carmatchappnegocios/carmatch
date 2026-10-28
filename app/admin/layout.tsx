
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Admin Panel - CarMatch",
};

export const maxDuration = 60; // Extended timeout for all admin actions (AI generation)
export const dynamic = 'force-dynamic';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
