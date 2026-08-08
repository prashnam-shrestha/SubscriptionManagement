'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Search, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductsPage() {
  const { user } = useAuth();
  const canManage = user?.role === 'Owner' || user?.role === 'Admin';

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [productName, setProductName] = useState('');
  const [productCode, setProductCode] = useState('');
  const [serviceTypeId, setServiceTypeId] = useState('SVCT001');
  const [price, setPrice] = useState('');
  const [durationDays, setDurationDays] = useState('30');
  const [submitting, setSubmitting] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await apiClient<any[]>('/products');
      setProducts(data);
    } catch (err: any) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient('/products', {
        method: 'POST',
        body: JSON.stringify({
          productName,
          productCode: productCode.trim() || undefined,
          serviceTypeId,
          price: parseFloat(price) || 0,
          durationDays: parseInt(durationDays, 10) || 30,
        }),
      });
      toast.success('Product created successfully');
      setIsCreateOpen(false);
      setProductName('');
      setProductCode('');
      setPrice('');
      setDurationDays('30');
      loadProducts();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (productId: string) => {
    try {
      await apiClient(`/products/${productId}/status`, { method: 'PATCH' });
      toast.success('Product status updated');
      loadProducts();
    } catch (err: any) {
      toast.error('Failed to update status');
    }
  };

  const filteredProducts = products.filter((p) => {
    const name = p.productName || '';
    const code = p.productCode || '';
    const svctype = p.serviceType?.name || p.serviceTypeId || '';
    const q = searchQuery.toLowerCase();
    return name.toLowerCase().includes(q) || code.toLowerCase().includes(q) || svctype.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground text-sm">
            Manage product offerings, pricing, and subscription durations.
          </p>
        </div>

        {canManage && (
          <div>
            <Button
              className="flex items-center gap-2"
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus className="h-4 w-4" />
              <span>Add Product</span>
            </Button>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Product</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateProduct} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Product Name</label>
                    <Input
                      placeholder="e.g. Netflix Premium (1 Month)"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Product Code (Optional)</label>
                      <Input
                        placeholder="e.g. NFLX-1M"
                        value={productCode}
                        onChange={(e) => setProductCode(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Service Type ID</label>
                      <Input
                        placeholder="e.g. SVCT001"
                        value={serviceTypeId}
                        onChange={(e) => setServiceTypeId(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Price (NPR)</label>
                      <Input
                        type="number"
                        placeholder="350"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Duration (Days)</label>
                      <Input
                        type="number"
                        placeholder="30"
                        value={durationDays}
                        onChange={(e) => setDurationDays(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? 'Creating...' : 'Save Product'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="relative w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter products..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" onClick={loadProducts}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">Loading products...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No products found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product ID</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Service Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Price (NPR)</TableHead>
                  <TableHead>Status</TableHead>
                  {canManage && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((p) => (
                  <TableRow key={p.productId}>
                    <TableCell className="font-mono text-xs">{p.productId}</TableCell>
                    <TableCell className="font-mono text-xs">{p.productCode || '-'}</TableCell>
                    <TableCell className="font-medium">{p.productName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {p.serviceType?.name || p.serviceTypeId}
                      </Badge>
                    </TableCell>
                    <TableCell>{p.durationDays} Days</TableCell>
                    <TableCell className="font-semibold">NPR {Number(p.price).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant={p.status === 'Active' ? 'default' : 'destructive'}
                        className="flex items-center gap-1 w-fit"
                      >
                        {p.status === 'Active' ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        <span>{p.status}</span>
                      </Badge>
                    </TableCell>
                    {canManage && (
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(p.productId)}
                        >
                          {p.status === 'Active' ? 'Archive' : 'Activate'}
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
