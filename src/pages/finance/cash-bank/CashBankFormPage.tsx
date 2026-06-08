import { useState } from "react";
import { useNavigate } from "react-router-dom";

import PageHeader from "@/components/cards/PageHeader";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { Input } from "@/components/ui/input";

import { useCompanyStore } from "@/stores/companyStore";

import { createCashAccount } from "@/services/cash-account.service";

export default function CashBankFormPage() {
  const navigate = useNavigate();

  const companyId = useCompanyStore((state) => state.currentCompany?.id);

  const [saving, setSaving] = useState(false);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [accountType, setAccountType] = useState("BANK");
  const [balance, setBalance] = useState("0");

  async function handleSave() {
    try {
      if (!companyId) return;

      if (!code.trim()) {
        alert("Code wajib diisi");
        return;
      }

      if (!name.trim()) {
        alert("Name wajib diisi");
        return;
      }

      setSaving(true);

      await createCashAccount({
        company_id: companyId,
        code,
        name,
        account_type: accountType,
        balance: Number(balance),
        is_active: true,
      });

      navigate("/finance/cash-bank");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Create Cash Account" description="Create new cash or bank account" />

      <div className="rounded-xl border bg-white p-6">
        <div className="grid gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Account Code</label>

            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="BANK-002" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Account Name</label>

            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Mandiri Payroll" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Account Type</label>

            <select value={accountType} onChange={(e) => setAccountType(e.target.value)} className="w-full rounded-md border p-2">
              <option value="BANK">BANK</option>
              <option value="CASH">CASH</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Opening Balance</label>

            <Input type="number" value={balance} onChange={(e) => setBalance(e.target.value)} />
          </div>

          <div className="flex justify-end gap-2">
            <PrimaryButton onClick={() => navigate("/finance/cash-bank")}>Cancel</PrimaryButton>

            <PrimaryButton onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
