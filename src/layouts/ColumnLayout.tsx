import type { ReactNode } from "react";

type ColumnLayoutProps = {
  children: ReactNode;
  secondaryChildren?: ReactNode;
  // title?: string;
  description?: string;
  secondaryTitle?: string;
  secondaryDescription?: string;
  number?: number;
};

export default function ColumnLayout({
  children,
  secondaryChildren,
  // title,
  description,
  number,
}: ColumnLayoutProps) {
  return (
    <div className="">
      {/* <div className="rounded-lg flex bg-blue-50/50 border border-gray-300 px-6 py-2 gap-3 items-center shadow-sm">
        {number && (
          <span className="number border border-gray-300 bg-white rounded-full w-8 h-8 flex items-center justify-center">
            {number}
          </span>
        )}

        {title && <h1>{title}</h1>}
      </div> */}

      {secondaryChildren && (
        <div >

          {secondaryChildren}
        </div>
      )}

      <div className="column-layout-content bg-blue-50/50 rounded-lg border border-gray-300 p-7 mt-4 max-h-[70vh] shadow-sm overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 scrollbar-thumb-rounded">
        {description && number && <h2 className="mb-4">{number}. {description}</h2>}
        {children}
      </div>
    </div>
  );
}