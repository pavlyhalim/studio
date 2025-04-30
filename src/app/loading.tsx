
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return (
     <div className="flex flex-col min-h-screen">
      {/* Skeleton Navbar */}
      <div className="bg-background shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Skeleton className="h-8 w-32 rounded" />
          <div className="flex items-center space-x-4">
            <Skeleton className="h-8 w-24 rounded-md" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
      </div>

      {/* Skeleton Main Content Area */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-1/3 mb-6 rounded" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </main>

       {/* Skeleton Footer */}
      <div className="bg-background border-t py-8">
         <div className="container mx-auto px-4 text-center">
             <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <Skeleton className="h-4 w-1/4 rounded" />
                 <div className="flex space-x-6">
                    <Skeleton className="h-4 w-20 rounded" />
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-4 w-16 rounded" />
                 </div>
             </div>
         </div>
      </div>
    </div>
  );
}
