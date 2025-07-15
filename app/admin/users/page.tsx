"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Search, Users, Mail, Calendar, Shield, UserCheck } from "lucide-react"
import { toast } from "sonner"

interface User {
  _id: string
  name: string
  email: string
  role: "admin" | "team"
  createdAt: string
  clientCount?: number
  submissionCount?: number
}

interface CreateUserData {
  name: string
  email: string
  password: string
  role: "admin" | "team"
}

export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [createUserData, setCreateUserData] = useState<CreateUserData>({
    name: "",
    email: "",
    password: "",
    role: "team",
  })
  const [editUserData, setEditUserData] = useState<CreateUserData>({
    name: "",
    email: "",
    password: "",
    role: "team",
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("auth-token")
      const response = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      } else {
        toast.error("Failed to fetch users")
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error("Error fetching users")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async () => {
    try {
      const token = localStorage.getItem("auth-token")
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createUserData),
      })

      if (response.ok) {
        toast.success("User created successfully")
        setIsCreateDialogOpen(false)
        setCreateUserData({ name: "", email: "", password: "", role: "team" })
        fetchUsers()
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to create user")
      }
    } catch (error) {
      console.error("Error creating user:", error)
      toast.error("Error creating user")
    }
  }

  const handleEditUser = async () => {
    if (!selectedUser) return

    try {
      const token = localStorage.getItem("auth-token")
      const response = await fetch(`/api/admin/users/${selectedUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editUserData),
      })

      if (response.ok) {
        toast.success("User updated successfully")
        setIsEditDialogOpen(false)
        setSelectedUser(null)
        setEditUserData({ name: "", email: "", password: "", role: "team" })
        fetchUsers()
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to update user")
      }
    } catch (error) {
      console.error("Error updating user:", error)
      toast.error("Error updating user")
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      const token = localStorage.getItem("auth-token")
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast.success("User deleted successfully")
        fetchUsers()
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to delete user")
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      toast.error("Error deleting user")
    }
  }

  const openEditDialog = (user: User) => {
    setSelectedUser(user)
    setEditUserData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    })
    setIsEditDialogOpen(true)
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    totalUsers: users.length,
    adminUsers: users.filter(u => u.role === "admin").length,
    teamUsers: users.filter(u => u.role === "team").length,
    activeUsers: users.length // Assuming all users are active
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50/50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-8">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>
              <p className="text-gray-600 mt-2">Create, edit, and manage team members and administrators</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold">Create New User</DialogTitle>
                  <DialogDescription>Add a new team member or administrator to the system</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">Name</Label>
                    <Input
                      id="name"
                      value={createUserData.name}
                      onChange={(e) => setCreateUserData({ ...createUserData, name: e.target.value })}
                      placeholder="Enter full name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={createUserData.email}
                      onChange={(e) => setCreateUserData({ ...createUserData, email: e.target.value })}
                      placeholder="Enter email address"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={createUserData.password}
                      onChange={(e) => setCreateUserData({ ...createUserData, password: e.target.value })}
                      placeholder="Enter password"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role" className="text-sm font-medium text-gray-700">Role</Label>
                    <Select value={createUserData.role} onValueChange={(value: "admin" | "team") => setCreateUserData({ ...createUserData, role: value })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="team">Team Member</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateUser} className="bg-blue-600 hover:bg-blue-700">
                    Create User
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
                  <p className="text-xs text-gray-500 mt-1">All registered users</p>
                </div>
                <div className="p-3 rounded-full bg-blue-50 text-blue-600">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Administrators</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.adminUsers}</p>
                  <p className="text-xs text-gray-500 mt-1">Admin users</p>
                </div>
                <div className="p-3 rounded-full bg-red-50 text-red-600">
                  <Shield className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Team Members</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.teamUsers}</p>
                  <p className="text-xs text-gray-500 mt-1">Team users</p>
                </div>
                <div className="p-3 rounded-full bg-green-50 text-green-600">
                  <UserCheck className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeUsers}</p>
                  <p className="text-xs text-gray-500 mt-1">Currently active</p>
                </div>
                <div className="p-3 rounded-full bg-purple-50 text-purple-600">
                  <UserCheck className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">All Users</CardTitle>
                <CardDescription className="text-gray-600">Manage user accounts and permissions</CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-medium text-gray-700">Name</TableHead>
                    <TableHead className="font-medium text-gray-700">Email</TableHead>
                    <TableHead className="font-medium text-gray-700">Role</TableHead>
                    <TableHead className="font-medium text-gray-700">Created</TableHead>
                    <TableHead className="font-medium text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user._id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-gray-600">{user.email}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={user.role === "admin" ? "destructive" : "secondary"}
                          className={user.role === "admin" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}
                        >
                          {user.role === "admin" ? "Administrator" : "Team Member"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(user)}
                            className="h-8 w-8 p-0 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4 text-blue-600" />
                          </Button>
                          {user.role !== "admin" && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete User</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {user.name}? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteUser(user._id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Edit User</DialogTitle>
              <DialogDescription>Update user information and permissions</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name" className="text-sm font-medium text-gray-700">Name</Label>
                <Input
                  id="edit-name"
                  value={editUserData.name}
                  onChange={(e) => setEditUserData({ ...editUserData, name: e.target.value })}
                  placeholder="Enter full name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-email" className="text-sm font-medium text-gray-700">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editUserData.email}
                  onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
                  placeholder="Enter email address"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-password" className="text-sm font-medium text-gray-700">Password (leave blank to keep current)</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={editUserData.password}
                  onChange={(e) => setEditUserData({ ...editUserData, password: e.target.value })}
                  placeholder="Enter new password"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-role" className="text-sm font-medium text-gray-700">Role</Label>
                <Select value={editUserData.role} onValueChange={(value: "admin" | "team") => setEditUserData({ ...editUserData, role: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="team">Team Member</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditUser} className="bg-blue-600 hover:bg-blue-700">
                Update User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 