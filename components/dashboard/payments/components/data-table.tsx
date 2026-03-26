'use client';

import { flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { Transaction } from '@paddle/paddle-node-sdk';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { columns } from '@/components/dashboard/payments/components/columns';
import { Status } from '@/components/shared/status/status';
import { getPaymentReason } from '@/utils/paddle/data-helpers';
import { parseMoney } from '@/utils/paddle/parse-money';

interface DataTableProps {
  data: Transaction[];
  hasMore?: boolean;
  totalRecords?: number;
  goToNextPage: (cursor: string) => void;
  goToPrevPage: () => void;
  hasPrev: boolean;
}

export function DataTable({
  data,
  totalRecords,
  hasMore,
  goToNextPage,
  goToPrevPage,
  hasPrev,
}: DataTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalRecords ? Math.ceil(totalRecords / data.length) : 1,
    rowCount: data.length,
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="relative rounded-2xl bg-background/40">
      <div className="space-y-3 p-3 md:hidden">
        {data.length > 0 ? (
          data.map((transaction) => (
            <section key={transaction.id} className="space-y-3 rounded-2xl border border-border/60 bg-background/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Date</p>
                  <p className="text-sm font-medium text-foreground">{formatTransactionDate(transaction.billedAt)}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Amount</p>
                  <p className="text-sm font-semibold text-foreground">{formatTransactionAmount(transaction)}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Status</p>
                <Status status={transaction.status} />
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Description</p>
                <p className="text-sm leading-5 text-muted-foreground">{getTransactionDescription(transaction)}</p>
              </div>
            </section>
          ))
        ) : (
          <div className="rounded-2xl border border-border/60 bg-background/60 p-4 text-sm leading-6 text-muted-foreground">
            No payments found yet. If you just checked out, give Paddle a moment to sync your customer and transaction
            records.
          </div>
        )}
      </div>

      <div className="hidden w-full overflow-x-auto md:block">
        <Table className="min-w-[760px]">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{
                        minWidth: header.column.columnDef.size,
                        maxWidth: header.column.columnDef.size,
                      }}
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{
                        minWidth: cell.column.columnDef.size,
                        maxWidth: cell.column.columnDef.size,
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No payments found yet. If you just checked out, give Paddle a moment to sync your customer and
                  transaction records.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end gap-2 border-t border-border/60 px-4 py-4 md:px-6">
        <Button
          size={'sm'}
          variant={'outline'}
          className={'flex gap-2 text-sm rounded-sm border-border'}
          onClick={() => goToPrevPage()}
          disabled={!hasPrev}
        >
          Previous
        </Button>
        <Button
          size={'sm'}
          variant={'outline'}
          className={'flex gap-2 text-sm rounded-sm border-border'}
          onClick={() => goToNextPage((data[data.length - 1] as Transaction).id)}
          disabled={!hasMore}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

function formatTransactionDate(billedAt?: string | null): string {
  return billedAt ? dayjs(billedAt).format('MMM DD, YYYY [at] h:mma') : '-';
}

function formatTransactionAmount(transaction: Transaction): string {
  return parseMoney(transaction.details?.totals?.total, transaction.currencyCode);
}

function getTransactionDescription(transaction: Transaction): string {
  const productName = transaction.details?.lineItems[0]?.product?.name;
  const extraItems =
    transaction.details?.lineItems && transaction.details.lineItems.length > 1
      ? ` +${transaction.details.lineItems.length - 1} more`
      : '';

  return [getPaymentReason(transaction.origin), productName ? `${productName}${extraItems}` : null].filter(Boolean).join(' ');
}
