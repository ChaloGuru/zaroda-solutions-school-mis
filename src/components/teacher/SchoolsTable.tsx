import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ExternalLink } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface School {
  id: string;
  name: string;
  location: string;
  students: number;
  staff: number;
  status: "active" | "pending" | "suspended";
  subscription: string;
}

const schools: School[] = [
  {
    id: "1",
    name: "Greenwood Academy",
    location: "Nairobi, Kenya",
    students: 1250,
    staff: 85,
    status: "active",
    subscription: "Enterprise",
  },
  {
    id: "2",
    name: "St. Mary's High School",
    location: "Mombasa, Kenya",
    students: 890,
    staff: 62,
    status: "active",
    subscription: "Professional",
  },
  {
    id: "3",
    name: "Sunrise Primary School",
    location: "Kisumu, Kenya",
    students: 456,
    staff: 34,
    status: "pending",
    subscription: "Starter",
  },
  {
    id: "4",
    name: "Excellence Preparatory",
    location: "Nakuru, Kenya",
    students: 678,
    staff: 48,
    status: "active",
    subscription: "Professional",
  },
  {
    id: "5",
    name: "Bright Future Academy",
    location: "Eldoret, Kenya",
    students: 234,
    staff: 22,
    status: "suspended",
    subscription: "Starter",
  },
];

const statusStyles = {
  active: "bg-success/10 text-success border-success/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  suspended: "bg-destructive/10 text-destructive border-destructive/20",
};

export function SchoolsTable() {
  return (
    <div className="glass-card rounded-xl overflow-hidden opacity-0 animate-fade-in-up" style={{ animationDelay: "400ms" }}>
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold font-heading text-foreground">
              School Overview
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Manage all school instances across the platform
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            View All
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-border/50">
            <TableHead className="text-muted-foreground font-medium">School Name</TableHead>
            <TableHead className="text-muted-foreground font-medium">Location</TableHead>
            <TableHead className="text-muted-foreground font-medium text-center">Students</TableHead>
            <TableHead className="text-muted-foreground font-medium text-center">Staff</TableHead>
            <TableHead className="text-muted-foreground font-medium">Status</TableHead>
            <TableHead className="text-muted-foreground font-medium">Plan</TableHead>
            <TableHead className="text-muted-foreground font-medium w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schools.map((school) => (
            <TableRow
              key={school.id}
              className="table-row-hover border-border/50"
            >
              <TableCell className="font-medium text-foreground">
                {school.name}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {school.location}
              </TableCell>
              <TableCell className="text-center text-foreground">
                {school.students.toLocaleString()}
              </TableCell>
              <TableCell className="text-center text-foreground">
                {school.staff}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={statusStyles[school.status]}
                >
                  {school.status.charAt(0).toUpperCase() + school.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="bg-maroon-light text-primary border-0">
                  {school.subscription}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-card border-border">
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Edit School</DropdownMenuItem>
                    <DropdownMenuItem>Manage Users</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      Suspend Access
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
