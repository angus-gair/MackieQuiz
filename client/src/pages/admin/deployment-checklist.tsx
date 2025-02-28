import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { AdminLayout } from "@/components/admin-layout";
import { DeploymentChecklist } from "@/components/admin/deployment-checklist";

export default function DeploymentChecklistPage() {
  return (
    <AdminLayout>
      <div className="mb-6 flex items-center">
        <Link href="/admin">
          <Button variant="ghost" size="sm" className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Deployment Checklist</h1>
      </div>
      
      <DeploymentChecklist />
    </AdminLayout>
  );
}