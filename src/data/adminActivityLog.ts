// Dummy System Admin activity log (client-only, read-only page).
export interface ActivityLogEntry {
  id: string;
  at: string;
  admin: string;
  action: string;
  target: string;
  targetType: "hotel" | "draft" | "room" | "user" | "settings" | "auth";
  description: string;
}

const H = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();

export const ACTIVITY_LOG: ActivityLogEntry[] = [
  { id: "L-1201", at: H(0.2), admin: "John Doe", action: "Approved Draft", target: "CASE-2037", targetType: "draft", description: "Approved bank change for Pan Pacific Sonargaon." },
  { id: "L-1200", at: H(1), admin: "Priya Ahmed", action: "Rejected Gallery", target: "CASE-2035", targetType: "draft", description: "Rejected 2 gallery images for Long Beach Suites." },
  { id: "L-1199", at: H(2.4), admin: "John Doe", action: "Updated Contact", target: "Sea Pearl Beach Resort", targetType: "hotel", description: "Updated reception phone to +880-1811-778899." },
  { id: "L-1198", at: H(4), admin: "Priya Ahmed", action: "Blocked Hotel Admin", target: "Green Hills Lodge", targetType: "user", description: "Temporarily blocked hotel admin for compliance review." },
  { id: "L-1197", at: H(6), admin: "John Doe", action: "Created Hotel", target: "Amari Dhaka", targetType: "hotel", description: "Onboarded new property with 84 rooms." },
  { id: "L-1196", at: H(12), admin: "System", action: "Reset Password", target: "shafiq@longbeach.bd", targetType: "auth", description: "Reset link emailed to hotel admin." },
  { id: "L-1195", at: H(20), admin: "John Doe", action: "Deleted Room", target: "Hotel Agrabad · Room 214", targetType: "room", description: "Removed decommissioned room." },
  { id: "L-1194", at: H(28), admin: "Priya Ahmed", action: "Updated Settings", target: "Booking Rules", targetType: "settings", description: "Reservation hold duration changed to 30 minutes." },
  { id: "L-1193", at: H(48), admin: "John Doe", action: "Approved Registration", target: "CASE-2034", targetType: "draft", description: "Approved new hotel registration." },
  { id: "L-1192", at: H(72), admin: "Priya Ahmed", action: "Suspended Hotel", target: "Green Hills Lodge", targetType: "hotel", description: "Suspended pending document verification." },
];
