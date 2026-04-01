import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { fetchEndUsers, EndUserResponse } from "@/services/adminApi";
import { apiPut } from "@/utils/api";

const emptyForm = {
  name: "",
  email: "",
};

const AdminUpdateClient = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [client, setClient] = useState<EndUserResponse | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const usersData = await fetchEndUsers();
        const foundClient = usersData.find((item) => item.end_user_id === Number(id));
        
        if (!foundClient) {
          toast({
            title: "Not Found",
            description: "Client not found",
            variant: "destructive",
          });
          navigate("/admin/clients");
          return;
        }

        setClient(foundClient);
        setFormData({
          name: foundClient.name || "",
          email: foundClient.email || "",
        });
        setBlocked(foundClient.is_blocked);
        setIsLoaded(true);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to load client";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        navigate("/admin/clients");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, toast, navigate]);

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Loading client details...</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="space-y-4 max-w-3xl">
        <Button variant="outline" onClick={() => navigate("/admin/clients")}>Go Back</Button>
        <Card>
          <CardContent className="p-6">
            <p className="font-medium">Client not found.</p>
            <p className="text-sm text-muted-foreground">This client may have already been erased.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.name) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in the client name.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Note: There's no general PUT endpoint for end-users, only for blocking
      // For now, just show a success message. Actual name/email updates would need a dedicated endpoint.
      
      toast({
        title: "Note",
        description: "Name/email updates are read-only. Use the block toggle to manage client status.",
        variant: "default"
      });

      navigate("/admin/clients");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update client",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleBlock = async (checked: boolean) => {
    setBlocked(!checked);
    
    try {
      const response = await apiPut(`/end-users/${id}/block`, {
        is_blocked: !checked,
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to update client status");
      }

      toast({
        title: "Client Status Updated",
        description: !checked ? "Client has been blocked." : "Client has been unblocked.",
      });
    } catch (error) {
      setBlocked(checked);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update client status",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className={`flex items-center gap-4 ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`}>
        <Button variant="outline" size="icon" onClick={() => navigate("/admin/clients")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Update Client Info</h1>
          <p className="text-muted-foreground">Edit details for {client.name || "this guest"}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className={`${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "100ms" }}>
          <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={formData.email} disabled className="cursor-not-allowed opacity-60" />
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Limited fields available from backend. Full profile editing requires additional API endpoints.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className={`${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "180ms" }}>
          <CardHeader><CardTitle>Account Status</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/30 p-4">
              <div>
                <p className="font-medium">{blocked ? "User is blocked" : "User is active"}</p>
                <p className="text-sm text-muted-foreground">Toggle access for this consumer account.</p>
              </div>
              <Switch checked={!blocked} onCheckedChange={toggleBlock} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate("/admin/clients")}>Cancel</Button>
          <Button type="submit" variant="hero" disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" /> {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminUpdateClient;
