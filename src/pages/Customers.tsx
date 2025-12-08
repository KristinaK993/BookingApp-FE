// src/pages/Customers.tsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCustomers } from "@/api/customers";
import type { Customer } from "@/types";

interface PagedCustomersResponse {
  data: Customer[];
  totalPages: number;
  totalCount: number;
}

export default function CustomersPage() {
  const [page] = useState(1);

  const { data, isLoading } = useQuery({
  queryKey: ["customers", page],
  queryFn: () => getCustomers(page, 20),
});


  if (isLoading) {
    return <p>Laddar kunder…</p>;
  }

  const customers = (data as PagedCustomersResponse | undefined)?.data ?? [];


  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Kunder</h1>

      <ul className="space-y-2">
        {customers.map((c) => (
          <li key={c.id} className="border p-3 rounded">
            {c.firstName} {c.lastName} – {c.email}
          </li>
        ))}
      </ul>
    </div>
  );
}
