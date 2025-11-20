import React from "react";
import { Edit2, Trash2, Repeat2Icon } from "lucide-react";
import { TableProps } from "@/app/types/types";
import { MobileAccordionView } from "./AccordionItem";

const Table = <T extends { _id: string }>({
  data,
  loading,
  columns,
  onEdit,
  onDelete,
  handleMove = () => {},
  hasMove = false,
  hasEdit = true,
}: TableProps<T>) => {
  if (loading) {
    return (
      <div className="w-full flex justify-center items-center min-h-[400px]">
        <span className="text-gray-500">Cargando...</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="overflow-x-auto hidden sm:block">
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead className="bg-[#003C71] text-white">
            <tr>
              {columns.map((col, index) => (
                <th key={index} className="py-3 px-6 text-left">
                  {col.header}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="py-3 px-6 text-center">Acciones</th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr
                key={row._id}
                className="border-b hover:bg-gray-50 border-b-gray-300 transition-colors"
              >
                {columns.map((col, index) => (
                  <td key={index} className="py-4 px-6 text-gray-700">
                    {typeof col.accessor === "function"
                      ? col.accessor(row)
                      : (row[col.accessor] as React.ReactNode)}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="py-4 px-6 text-center">
                    <div className="flex flex-row gap-3 justify-center">
                      {hasEdit && onEdit && (
                        <button
                          type="button"
                          className="
                            flex items-center justify-center
                            w-10 h-10
                            bg-white border border-[#003C71]/30
                            text-[#003C71]
                            rounded-xl shadow-sm
                            hover:bg-[#003C71]
                            hover:text-white
                            hover:shadow
                            transition-all
                            focus:outline-none
                          "
                          onClick={() => onEdit(row)}
                          aria-label="Editar"
                        >
                          <Edit2 size={20} />
                        </button>
                      )}

                      {onDelete && (
                        <button
                          type="button"
                          className="
                            flex items-center justify-center
                            w-10 h-10
                            bg-white border border-red-400/40
                            text-red-600
                            rounded-xl shadow-sm
                            hover:bg-red-600
                            hover:text-white
                            hover:shadow
                            transition-all
                            focus:outline-none
                          "
                          onClick={() => onDelete(row._id)}
                          aria-label="Eliminar"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}

                      {hasMove && (
                        <button
                          type="button"
                          className="
                            flex items-center justify-center
                            w-10 h-10
                            bg-white border border-yellow-400/40
                            text-yellow-600
                            rounded-xl shadow-sm
                            hover:bg-yellow-500
                            hover:text-white
                            hover:shadow
                            transition-all
                            focus:outline-none
                          "
                          onClick={() => handleMove(row)}
                          aria-label="Mover"
                        >
                          <Repeat2Icon size={20} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <MobileAccordionView
        data={data}
        columns={columns}
        onEdit={onEdit}
        onDelete={onDelete}
        hasEdit={hasEdit}
        hasMove={hasMove}
        handleMove={handleMove}
      />
    </div>
  );
};

export default Table;
