"use client"

import { useState } from "react"
import Link from "next/link"
import { useAgentProperties } from "@/lib/api/agent"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useDeleteProperty } from "@/lib/api/agent"
import { FadeIn, SlideUp } from "@/components/animations"
import { PlusCircle, Search, MoreHorizontal, Edit, Trash2, Eye, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function AgentPropertiesPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const { data: propertiesData, isLoading } = useAgentProperties()
  const deletePropertyMutation = useDeleteProperty()

  const handleDeleteClick = (id: string) => {
    setDeleteId(id)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (deleteId) {
      deletePropertyMutation.mutate(deleteId, {
        onSuccess: () => {
          toast({
            title: "Property deleted",
            description: "The property has been deleted successfully",
          })
          setIsDeleteDialogOpen(false)
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message || "Failed to delete property",
            variant: "destructive",
          })
        },
      })
    }
  }

  const filteredProperties = propertiesData?.data
    ? propertiesData.data.filter(
        (property) =>
          property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          property.location.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : []

  return (
    <DashboardLayout requireAgent>
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Properties</h1>
            <p className="mt-1 text-muted-foreground">Manage your property listings</p>
          </div>
          <Button asChild>
            <Link href="/agent/properties/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Property
            </Link>
          </Button>
        </div>
      </FadeIn>

      <SlideUp delay={0.1} className="mt-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Properties</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search properties..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <CardDescription>{filteredProperties.length} properties found</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-60 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="flex h-60 flex-col items-center justify-center">
                <p className="text-center text-muted-foreground">No properties found</p>
                <Button asChild className="mt-4">
                  <Link href="/agent/properties/new">Add Your First Property</Link>
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProperties.map((property) => (
                      <TableRow key={property.id}>
                        <TableCell className="font-medium">{property.title}</TableCell>
                        <TableCell>{property.location}</TableCell>
                        <TableCell>${property.pricePerNight}/night</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              property.status === "active"
                                ? "default"
                                : property.status === "pending"
                                  ? "outline"
                                  : "secondary"
                            }
                          >
                            {property.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link href={`/villas/${property.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/agent/properties/${property.id}/edit`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleDeleteClick(property.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </SlideUp>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the property and remove it from our servers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deletePropertyMutation.isPending}>
              {deletePropertyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
