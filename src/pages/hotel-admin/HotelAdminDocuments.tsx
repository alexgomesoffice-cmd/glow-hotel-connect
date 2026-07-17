import { Eye, Download, FileText, ShieldCheck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusPill } from "@/components/hotel-admin/primitives";
import { toast } from "@/hooks/use-toast";
import { useHotelStore, formatDate, DocStatus } from "@/data/hotelAdminStore";

const statusTone = (s: DocStatus) =>
  s === "verified" ? "green" : s === "pending" ? "amber" : s === "expired" ? "red" : "red";

const HotelAdminDocuments = () => {
  const documents = useHotelStore((s) => s.documents);

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl sm:text-3xl font-bold">Documents</h1>
        <p className="text-muted-foreground text-sm">Verified property and business documents. Updates require a request.</p>
      </div>

      <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-4 flex items-start gap-3 text-sm">
        <ShieldCheck className="h-5 w-5 text-purple-600 shrink-0" />
        <div>
          <p className="font-medium text-purple-700">Documents are protected</p>
          <p className="text-xs text-muted-foreground">You cannot edit documents directly. Use "Request Update" and system admin will re-verify.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {documents.map((d) => {
          const expiringSoon = d.expiryDate && new Date(d.expiryDate).getTime() - Date.now() < 30 * 86400000;
          return (
            <Card key={d.id} className="hover-lift">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
                      <FileText className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold">{d.label}</p>
                      <p className="text-xs text-muted-foreground">{d.kind.replace(/_/g, " ")}</p>
                    </div>
                  </div>
                  <StatusPill label={d.status} tone={statusTone(d.status)} />
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground">
                  {d.expiryDate && (
                    <div className="flex items-center justify-between">
                      <span>Expiry</span>
                      <span className={expiringSoon ? "text-amber-600 font-medium flex items-center gap-1" : "text-foreground"}>
                        {expiringSoon && <AlertTriangle className="h-3 w-3" />} {formatDate(d.expiryDate)}
                      </span>
                    </div>
                  )}
                  {d.lastVerifiedAt && (
                    <div className="flex items-center justify-between">
                      <span>Last verified</span>
                      <span className="text-foreground">{formatDate(d.lastVerifiedAt)}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  <Button variant="outline" size="sm" className="flex-1"><Eye className="h-3 w-3 mr-1" /> View</Button>
                  <Button variant="outline" size="sm"><Download className="h-3 w-3" /></Button>
                  <Button variant="outline" size="sm" onClick={() => toast({ title: "Update request sent", description: `${d.label} update queued for review.` })}>
                    Request
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default HotelAdminDocuments;
