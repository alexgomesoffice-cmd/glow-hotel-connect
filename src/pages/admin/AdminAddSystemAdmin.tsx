import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiPost } from "@/utils/api";

const AdminAddSystemAdmin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    return {
      "Content-Type": "application/json",
      ...(token && { "Authorization": `Bearer ${token}` }),
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiPost("/system-admin/create", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (response.success === false) {
        throw new Error(response.message || "Failed to create system admin");
      }

      toast({
        title: "System Admin Created Successfully",
        description: `${formData.name} has been created as a system admin.`,
      });

      navigate("/admin");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create system admin",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className={`flex items-center gap-4 ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`}>
        <Button variant="outline" size="icon" onClick={() => navigate("/admin")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Add System Admin</h1>
          <p className="text-muted-foreground">Create another platform administrator with full admin access.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className={`${isLoaded ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "100ms" }}>
          <CardHeader>
            <CardTitle>Admin Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Admin Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Full name of the admin"
              />
            </div>

            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="admin@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label>Password *</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Secure password"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate("/admin")}>
            Cancel
          </Button>
          <Button type="submit" variant="hero" disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Creating..." : "Create System Admin"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminAddSystemAdmin;
