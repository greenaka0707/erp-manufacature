import { useEffect, useMemo, useState } from "react";

import PageHeader from "@/components/cards/PageHeader";

import Modal from "@/components/dialogs/Modal";
import ConfirmDialog from "@/components/dialogs/ConfirmDialog";

import SearchInput from "@/components/forms/SearchInput";
import StatusFilter from "@/components/forms/StatusFilter";

import PrimaryButton from "@/components/ui/PrimaryButton";
import Loading from "@/components/ui/loading";
import EmptyState from "@/components/ui/empty-state";

import { getProducts, deleteProduct } from "@/services/product.service";

import { exportToExcel } from "../../../utils/exportExcel";

import ProductForm from "./ProductForm";
import ProductTable from "./ProductTable";

const COMPANY_ID = "90f378b0-4ac3-44ac-8d5c-ba318b7e1536";

export default function ProductsPage() {
  const [open, setOpen] = useState(false);

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);

      const data = await getProducts(COMPANY_ID);

      console.log("PRODUCTS =>", data);

      setProducts(data ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function handleAddProduct() {
    setSelectedProduct(null);
    setOpen(true);
  }

  function handleEdit(product: any) {
    setSelectedProduct(product);
    setOpen(true);
  }

  function handleDelete(product: any) {
    setProductToDelete(product);
    setDeleteOpen(true);
  }

  async function confirmDelete() {
    try {
      if (!productToDelete) return;

      await deleteProduct(COMPANY_ID, productToDelete.id);

      await loadProducts();

      setDeleteOpen(false);
      setProductToDelete(null);
    } catch (error) {
      console.error(error);
    }
  }

  function handleExport() {
    exportToExcel(
      filteredProducts.map((product) => ({
        SKU: product.sku,
        Name: product.name,
        Category: product.category_name,
        Unit: product.unit_name,
        MinStock: product.min_stock,
        Status: product.is_active ? "Active" : "Inactive",
      })),
      "products",
    );
  }

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchSearch = product.name?.toLowerCase().includes(search.toLowerCase()) || product.sku?.toLowerCase().includes(search.toLowerCase());

      const matchStatus = status === "all" ? true : status === "active" ? product.is_active : !product.is_active;

      return matchSearch && matchStatus;
    });
  }, [products, search, status]);

  return (
    <div className="space-y-6">
      <PageHeader title="Products" description="Manage product master data" />

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3 md:flex-row">
          <SearchInput value={search} onChange={setSearch} placeholder="Search product..." />

          <StatusFilter value={status} onChange={setStatus} options={["all", "active", "inactive"]} />
        </div>

        <div className="flex gap-2">
          <PrimaryButton variant="outline" onClick={handleExport}>
            Export Excel
          </PrimaryButton>

          <PrimaryButton onClick={handleAddProduct}>Add Product</PrimaryButton>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : filteredProducts.length === 0 ? (
        <EmptyState title="No Products Found" description="Try changing your search criteria." />
      ) : (
        <ProductTable products={filteredProducts} onEdit={handleEdit} onDelete={handleDelete} />
      )}

      <Modal
        open={open}
        title={selectedProduct ? "Edit Product" : "Add Product"}
        onClose={() => {
          setOpen(false);
          setSelectedProduct(null);
        }}
      >
        <ProductForm
          product={selectedProduct}
          onSuccess={loadProducts}
          onClose={() => {
            setOpen(false);
            setSelectedProduct(null);
          }}
        />
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete Product"
        message={`Delete ${productToDelete?.name}?`}
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteOpen(false);
          setProductToDelete(null);
        }}
      />
    </div>
  );
}
