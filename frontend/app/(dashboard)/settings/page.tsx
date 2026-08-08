'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user } = useAuth();
  const isOwner = user?.role === 'Owner';

  // Business Settings State
  const [businessName, setBusinessName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [currency, setCurrency] = useState('NPR');
  const [assignmentStrategy, setAssignmentStrategy] = useState('LowestOccupancy');
  const [savingBusiness, setSavingBusiness] = useState(false);
  const [savingStrategy, setSavingStrategy] = useState(false);

  // Credential Templates State
  const [templates, setTemplates] = useState<any[]>([]);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateText, setNewTemplateText] = useState('');
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);

  // Users State
  const [users, setUsers] = useState<any[]>([]);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'Owner' | 'Admin'>('Admin');
  const [userDialogOpen, setUserDialogOpen] = useState(false);

  useEffect(() => {
    loadSettings();
    loadTemplates();
    if (isOwner) loadUsers();
  }, [isOwner]);

  const loadSettings = async () => {
    try {
      const data = await apiClient<any>('/settings');
      setBusinessName(data.businessName || '');
      setContactEmail(data.businessContactEmail || '');
      setContactPhone(data.businessContactPhone || '');
      setCurrency(data.currency || 'NPR');
      setAssignmentStrategy(data.assignmentStrategy || 'LowestOccupancy');
    } catch (err: any) {
      toast.error('Failed to load settings');
    }
  };

  const loadTemplates = async () => {
    try {
      const data = await apiClient<any[]>('/credential-templates');
      setTemplates(data);
    } catch (err: any) {
      toast.error('Failed to load templates');
    }
  };

  const loadUsers = async () => {
    try {
      const data = await apiClient<any[]>('/users');
      setUsers(data);
    } catch (err: any) {
      toast.error('Failed to load users');
    }
  };

  const saveBusinessInfo = async () => {
    setSavingBusiness(true);
    try {
      await apiClient('/settings', {
        method: 'PUT',
        body: JSON.stringify({ businessName, businessContactEmail: contactEmail, businessContactPhone: contactPhone, currency }),
      });
      toast.success('Business info updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update settings');
    } finally {
      setSavingBusiness(false);
    }
  };

  const saveStrategy = async () => {
    setSavingStrategy(true);
    try {
      await apiClient('/settings', {
        method: 'PUT',
        body: JSON.stringify({ assignmentStrategy }),
      });
      toast.success('Assignment strategy updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update strategy');
    } finally {
      setSavingStrategy(false);
    }
  };

  const createTemplate = async () => {
    try {
      await apiClient('/credential-templates', {
        method: 'POST',
        body: JSON.stringify({ name: newTemplateName, templateText: newTemplateText }),
      });
      toast.success('Template created');
      setTemplateDialogOpen(false);
      setNewTemplateName('');
      setNewTemplateText('');
      loadTemplates();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create template');
    }
  };

  const createUser = async () => {
    try {
      await apiClient('/users', {
        method: 'POST',
        body: JSON.stringify({ fullName: newUserName, email: newUserEmail, password: newUserPassword, role: newUserRole }),
      });
      toast.success('User created');
      setUserDialogOpen(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      loadUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create user');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">System Settings</h1>

      <Tabs defaultValue={isOwner ? "business" : "templates"} className="w-full">
        <TabsList>
          {isOwner && <TabsTrigger value="business">Business Info</TabsTrigger>}
          <TabsTrigger value="products">Products</TabsTrigger>
          {isOwner && <TabsTrigger value="strategy">Assignment Strategy</TabsTrigger>}
          <TabsTrigger value="templates">Templates</TabsTrigger>
          {isOwner && <TabsTrigger value="users">User Management</TabsTrigger>}
        </TabsList>

        {isOwner && (
          <TabsContent value="business">
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>Configure core organization details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 max-w-xl">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Business Name</label>
                  <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Contact Email</label>
                  <Input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Contact Phone</label>
                  <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
                </div>
                <Button onClick={saveBusinessInfo} disabled={savingBusiness}>
                  {savingBusiness ? 'Saving...' : 'Save Business Info'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Products Configuration</CardTitle>
              <CardDescription>Shortcut to product catalog configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Manage products under the Products tab in the main navigation.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {isOwner && (
          <TabsContent value="strategy">
            <Card>
              <CardHeader>
                <CardTitle>Assignment Strategy</CardTitle>
                <CardDescription>Configure how auto-assignment allocates profiles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 max-w-xl">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Strategy Model</label>
                  <Select value={assignmentStrategy} onValueChange={(val) => val && setAssignmentStrategy(val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LowestOccupancy">Lowest Occupancy (Distribute evenly)</SelectItem>
                      <SelectItem value="FillFirst">Fill First (Pack capacity sequentially)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={saveStrategy} disabled={savingStrategy}>
                  {savingStrategy ? 'Saving...' : 'Save Strategy'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="templates">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Credential Templates</CardTitle>
                <CardDescription>Manage text templates for dispatching credentials</CardDescription>
              </div>
              <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
                <DialogTrigger>
                  <Button>Add Template</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>New Template</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <Input placeholder="Template Name" value={newTemplateName} onChange={(e) => setNewTemplateName(e.target.value)} />
                    <Textarea placeholder="Template Text with tokens like {CustomerName}, {PIN}" value={newTemplateText} onChange={(e) => setNewTemplateText(e.target.value)} rows={6} />
                    <Button onClick={createTemplate} className="w-full">Create Template</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Default</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono">{t.id}</TableCell>
                      <TableCell>{t.name}</TableCell>
                      <TableCell>{t.isDefault ? 'Yes' : 'No'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {isOwner && (
          <TabsContent value="users">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage admin accounts and permissions</CardDescription>
                </div>
                <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
                  <DialogTrigger>
                    <Button>Add User</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create System User</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <Input placeholder="Full Name" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} />
                      <Input type="email" placeholder="Email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} />
                      <Input type="password" placeholder="Password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} />
                      <Select value={newUserRole} onValueChange={(val: any) => val && setNewUserRole(val)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Admin">Admin</SelectItem>
                          <SelectItem value="Owner">Owner</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={createUser} className="w-full">Create User</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-mono">{u.id}</TableCell>
                        <TableCell>{u.fullName}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>{u.role}</TableCell>
                        <TableCell>{u.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
