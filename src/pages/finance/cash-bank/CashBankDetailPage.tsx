import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import PageHeader from "@/components/cards/PageHeader";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { Input } from "@/components/ui/input";

import { getCashAccountById, updateCashAccount } from "@/services/cash-account.service";

export default function CashBankDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [account, setAccount] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const data = await getCashAccountById(id!);

    setAccount(data);
  }

  async function handleSave() {
    await updateCashAccount(id!, {
      code: account.code,
      name: account.name,
      account_type: account.account_type,
    });

    navigate("/finance/cash-bank");
  }

  if (!account) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Cash Account" description="Update account information" />

      <div className="rounded-xl border bg-white p-6">
        <div className="grid gap-4">
          <Input
            value={account.code}
            onChange={(e) =>
              setAccount({
                ...account,
                code: e.target.value,
              })
            }
          />

          <Input
            value={account.name}
            onChange={(e) =>
              setAccount({
                ...account,
                name: e.target.value,
              })
            }
          />

          <select
            value={account.account_type}
            onChange={(e) =>
              setAccount({
                ...account,
                account_type: e.target.value,
              })
            }
            className="rounded-md border p-2"
          >
            <option value="BANK">BANK</option>
            <option value="CASH">CASH</option>
          </select>

          <div className="flex justify-end">
            <PrimaryButton onClick={handleSave}>Save Changes</PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
