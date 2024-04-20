'use client';

import { useModal } from '@/providers/modal-provider';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Search } from 'lucide-react';

import CustomModal from '@/components/global/custom-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterValue: string;
  actionButtonText?: React.ReactNode;
  modalChildren?: React.ReactNode;
  teamMembersData: any;
  subscription?: boolean;
  addOns?: boolean;
}

export default function DataTable<TData, TValue>({
  columns,
  data,
  filterValue,
  actionButtonText,
  modalChildren,
  teamMembersData,
  subscription,
  addOns,
}: DataTableProps<TData, TValue>) {
  const { setOpen } = useModal();
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const checkSubscriptionStatus =
    (teamMembersData.length >= 3 && !subscription) || (teamMembersData.length >= 3 && !addOns);

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center py-4 gap-2">
          <Search />
          <Input
            placeholder="Search Name..."
            value={(table.getColumn(filterValue)?.getFilterValue() as string) ?? ''}
            onChange={(event) => {
              table.getColumn(filterValue)?.setFilterValue(event.target.value);
            }}
            className="h-12"
          />
        </div>
        <Button
          disabled={checkSubscriptionStatus}
          className="flex gap-2 text-white"
          onClick={() => {
            if (modalChildren) {
              setOpen(
                <CustomModal title="Add a Team Member" subheading="Send an invitation">
                  {modalChildren}
                </CustomModal>,
              );
            }
          }}
        >
          {actionButtonText}
        </Button>
      </div>
      {checkSubscriptionStatus ? (
        <p className="text-xs text-muted-foreground mb-2 flex justify-end">
          You have reached the limit. Consider upgrade your subscription.
        </p>
      ) : null}
      <div className="border bg-background rounded-lg">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={headerGroup.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No Results Found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
